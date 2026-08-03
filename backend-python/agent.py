import os
import time
import asyncio
import httpx
from dotenv import load_dotenv
from fastapi import FastAPI, BackgroundTasks, Request
import uvicorn
from web3 import Web3
from web3.middleware import construct_sign_and_send_raw_middleware
from eth_account import Account

load_dotenv()

# --- Configuration ---
RPC_URL = os.getenv("RPC_URL", "http://localhost:8545")
AGENT_PRIVATE_KEY = os.getenv("AGENT_PRIVATE_KEY", "0x" + "2" * 64)
MACHINE_SLOT_TOKEN_ADDRESS = os.getenv("MACHINE_SLOT_TOKEN_ADDRESS", "0x0000000000000000000000000000000000000000")
INDUSTRI_LEASE_ESCROW_ADDRESS = os.getenv("INDUSTRI_LEASE_ESCROW_ADDRESS", "0x0000000000000000000000000000000000000000")
MACHINE_ID = os.getenv("MACHINE_ID", "CNC-ALPHA-1")
FACTORY_ADDRESS = os.getenv("FACTORY_ADDRESS", "0x3333333333333333333333333333333333333333")
SIMULATOR_URL = os.getenv("SIMULATOR_URL", "http://localhost:8000")
AGENT_PORT = int(os.getenv("AGENT_PORT", "8001"))

# --- Web3 Setup ---
w3 = Web3(Web3.HTTPProvider(RPC_URL))
agent_account = Account.from_key(AGENT_PRIVATE_KEY)
w3.middleware_onion.add(construct_sign_and_send_raw_middleware(agent_account))
w3.eth.default_account = agent_account.address

# Minimal ABIs
MACHINE_SLOT_ABI = [
    {
        "inputs": [
            {"internalType": "bytes32", "name": "machineId", "type": "bytes32"},
            {"internalType": "uint64", "name": "startTime", "type": "uint64"},
            {"internalType": "uint64", "name": "endTime", "type": "uint64"},
            {"internalType": "uint96", "name": "pricePerHour", "type": "uint96"},
            {"internalType": "address", "name": "factory", "type": "address"}
        ],
        "name": "mintSlot",
        "outputs": [{"internalType": "uint256", "name": "slotId", "type": "uint256"}],
        "stateMutability": "nonpayable",
        "type": "function"
    }
]

ESCROW_ABI = [
    {
        "inputs": [
            {"internalType": "uint256", "name": "slotId", "type": "uint256"},
            {"internalType": "bytes", "name": "telemetrySignature", "type": "bytes"}
        ],
        "name": "releaseFunds",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }
]

slot_contract = w3.eth.contract(address=Web3.to_checksum_address(MACHINE_SLOT_TOKEN_ADDRESS), abi=MACHINE_SLOT_ABI)
escrow_contract = w3.eth.contract(address=Web3.to_checksum_address(INDUSTRI_LEASE_ESCROW_ADDRESS), abi=ESCROW_ABI)

# --- FastAPI App ---
app = FastAPI(title="Phase 3: Autonomous Factory AI Agent")

# State tracking
agent_state = {
    "is_minting": False,
    "last_mint_time": 0,
    "current_slot_id": None
}

def str_to_bytes32(s: str) -> bytes:
    """Pad string to 32 bytes."""
    return s.encode('utf-8').ljust(32, b'\x00')

async def mint_slot_on_chain():
    """Session Key Manager: Mints a slot for the machine."""
    if agent_state["is_minting"]:
        return
    
    agent_state["is_minting"] = True
    print(f"\n[AI Agent] Machine {MACHINE_ID} is IDLE. Minting new slot...")
    
    # 4 hour slot starting now
    start_time = int(time.time())
    end_time = start_time + (4 * 3600)
    price_per_hour = Web3.to_wei(0.01, 'ether') # 0.01 ETH per hour
    
    machine_id_bytes = str_to_bytes32(MACHINE_ID)
    
    try:
        # In a real environment with a properly deployed contract, we'd send the tx.
        # For this phase, we'll try to build it to verify structure.
        # If the local node doesn't have the contract, it will fail.
        # We will wrap it in try-except so the agent doesn't crash if contracts aren't deployed.
        tx = slot_contract.functions.mintSlot(
            machine_id_bytes,
            start_time,
            end_time,
            price_per_hour,
            Web3.to_checksum_address(FACTORY_ADDRESS)
        ).build_transaction({
            'from': agent_account.address,
            'nonce': w3.eth.get_transaction_count(agent_account.address),
            'gas': 500000,
            'gasPrice': w3.eth.gas_price
        })
        
        signed_tx = agent_account.sign_transaction(tx)
        tx_hash = w3.eth.send_raw_transaction(signed_tx.rawTransaction)
        print(f"[AI Agent] Mint Transaction Sent! Hash: {tx_hash.hex()}")
        
        # We'll just mock a slot_id for demo purposes
        agent_state["current_slot_id"] = 1
        
    except Exception as e:
        print(f"[AI Agent] (Dry-run / Contract error): {e}")
        # Fallback for demo purposes
        agent_state["current_slot_id"] = 1
        print("[AI Agent] Mocking successful minting. slotId = 1")
    
    agent_state["last_mint_time"] = time.time()
    agent_state["is_minting"] = False

async def monitor_downtime():
    """Downtime Monitor: Polls the simulator to check for IDLE status."""
    print("[AI Agent] Downtime Monitor started. Polling simulator...")
    while True:
        try:
            async with httpx.AsyncClient() as client:
                resp = await client.get(f"{SIMULATOR_URL}/status")
                if resp.status_code == 200:
                    data = resp.json()
                    status = data.get("status")
                    
                    if status == "IDLE":
                        # Only mint if we haven't minted recently (e.g. cooldown of 30s)
                        if time.time() - agent_state["last_mint_time"] > 30:
                            await mint_slot_on_chain()
        except Exception as e:
            # Simulator might be offline
            pass
            
        await asyncio.sleep(5)

@app.on_event("startup")
async def startup_event():
    # Start the background monitor loop
    asyncio.create_task(monitor_downtime())

@app.post("/relay-proof")
async def relay_proof(payload: dict):
    """Proof Relay: Receives payload from simulator and submits it to Escrow."""
    print(f"\n[AI Agent] Received Telemetry Proof from Simulator:\n{payload}")
    
    slot_id = agent_state.get("current_slot_id", 1)
    signature_hex = payload.get("signature", "")
    
    if not signature_hex or payload.get("signature_type") != "EIP-712":
        print("[AI Agent] Invalid signature type for Escrow submission. Skipping.")
        return {"status": "error", "message": "Requires EIP-712 signature"}
        
    if signature_hex.startswith("0x"):
        signature_bytes = Web3.to_bytes(hexstr=signature_hex)
    else:
        signature_bytes = Web3.to_bytes(hexstr="0x" + signature_hex)
        
    print(f"[AI Agent] Session Key Manager: Relaying proof to IndustriLeaseEscrow (slotId: {slot_id})...")
    
    try:
        tx = escrow_contract.functions.releaseFunds(
            slot_id,
            signature_bytes
        ).build_transaction({
            'from': agent_account.address,
            'nonce': w3.eth.get_transaction_count(agent_account.address),
            'gas': 500000,
            'gasPrice': w3.eth.gas_price
        })
        
        signed_tx = agent_account.sign_transaction(tx)
        tx_hash = w3.eth.send_raw_transaction(signed_tx.rawTransaction)
        print(f"[AI Agent] Proof Relayed! ReleaseFunds Tx Hash: {tx_hash.hex()}")
        
    except Exception as e:
        print(f"[AI Agent] (Dry-run / Contract error): {e}")
        print("[AI Agent] Escrow interaction complete (simulated).")
        
    return {"status": "success", "message": "Proof relayed"}

@app.get("/")
def health_check():
    return {"status": "AI Agent is running.", "address": agent_account.address}

if __name__ == "__main__":
    print(f"Starting AI Agent on port {AGENT_PORT}...")
    print(f"Agent Address: {agent_account.address}")
    uvicorn.run("agent:app", host="0.0.0.0", port=AGENT_PORT, reload=True)
