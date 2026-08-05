import time
import json
import hmac
import hashlib
import random
import asyncio
import httpx
from typing import Optional

try:
    from eth_account import Account
    from eth_account.messages import encode_typed_data
    ETH_ACCOUNT_AVAILABLE = True
except ImportError:
    ETH_ACCOUNT_AVAILABLE = False

from fastapi import FastAPI, BackgroundTasks, HTTPException
from pydantic import BaseModel
import uvicorn

app = FastAPI(title="Phase 2: Layer 1 Hardware Telemetry Simulator")

# Dummy machine wallet for EIP-712 signing
# In a real hardware controller, this private key would be securely provisioned and stored in a TPM/Secure Enclave.
DUMMY_PRIVATE_KEY = "0x" + "1" * 64
if ETH_ACCOUNT_AVAILABLE:
    machine_account = Account.from_key(DUMMY_PRIVATE_KEY)

# Fallback HMAC Secret key
HMAC_SECRET = b"industrilease_secret_key"

# Global machine status
machine_status = "IDLE"

class SimulationRequest(BaseModel):
    machine_id: str
    job_id: str
    duration_seconds: int = 10
    total_layers: int = 100

def generate_hmac_signature(payload: dict) -> str:
    """Generates an HMAC SHA-256 signature for the payload."""
    payload_str = json.dumps(payload, sort_keys=True)
    return hmac.new(HMAC_SECRET, payload_str.encode('utf-8'), hashlib.sha256).hexdigest()

def generate_eip712_signature(payload: dict) -> str:
    """Generates an EIP-712 typed data signature for Web3 verification."""
    if not ETH_ACCOUNT_AVAILABLE:
        return "ETH_ACCOUNT_NOT_INSTALLED"
        
    domain = {
        "name": "IndustriLeaseTelemetry",
        "version": "1",
        "chainId": 1,
    }
    types = {
        "Telemetry": [
            {"name": "machineId", "type": "string"},
            {"name": "jobId", "type": "string"},
            {"name": "layersCompleted", "type": "uint256"},
            {"name": "powerDrawAvg", "type": "uint256"},
            {"name": "status", "type": "string"},
        ]
    }
    
    message = {
        "machineId": payload["machineId"],
        "jobId": payload["jobId"],
        "layersCompleted": int(payload["layersCompleted"]),
        "powerDrawAvg": int(payload["powerDrawAvg"]),
        "status": payload["status"]
    }

    typed_data = {
        "domain": domain,
        "types": types,
        "primaryType": "Telemetry",
        "message": message
    }
    
    signable_message = encode_typed_data(full_message=typed_data)
    signed_message = machine_account.sign_message(signable_message)
    return signed_message.signature.hex()

async def run_simulation(machine_id: str, job_id: str, duration: int, total_layers: int):
    """Simulates a 3D printing or CNC run over a compressed timeline."""
    global machine_status
    machine_status = "RUNNING"
    print(f"\n[Hardware Controller] Starting simulated run for Job {job_id} on Machine {machine_id}...")
    
    # Simulate the hardware loop over the compressed timeline (e.g., 10 seconds)
    for step in range(duration):
        await asyncio.sleep(1)
        current_layer = int((step + 1) / duration * total_layers)
        print(f"[{machine_id}] Printing layer {current_layer}/{total_layers}...")
        
    # Run completed, generate the payload
    avg_power = random.randint(150, 250) # Simulated Watts
    
    payload = {
        "machineId": machine_id,
        "jobId": job_id,
        "layersCompleted": total_layers,
        "powerDrawAvg": avg_power,
        "status": "COMPLETED_SUCCESS"
    }
    
    # Attach cryptographic signature
    if ETH_ACCOUNT_AVAILABLE:
        payload["signature"] = generate_eip712_signature(payload)
        payload["signature_type"] = "EIP-712"
    else:
        payload["signature"] = generate_hmac_signature(payload)
        payload["signature_type"] = "HMAC"
        
    print(f"\n[Hardware Controller] Run Completed. Final Payload:\n{json.dumps(payload, indent=2)}\n")
    
    # POST this payload to the Agent backend webhook
    agent_url = "http://localhost:8001/relay-proof"
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.post(agent_url, json=payload)
            print(f"[Hardware Controller] Payload relayed to {agent_url}, status code: {resp.status_code}")
    except Exception as e:
        print(f"[Hardware Controller] Failed to relay payload to agent: {e}")
        
    machine_status = "IDLE"

@app.post("/trigger")
async def trigger_simulation(req: SimulationRequest, background_tasks: BackgroundTasks):
    """Trigger a simulated hardware run."""
    background_tasks.add_task(
        run_simulation, 
        req.machine_id, 
        req.job_id, 
        req.duration_seconds, 
        req.total_layers
    )
    return {
        "status": "Simulation started", 
        "message": f"Simulating job {req.job_id} on machine {req.machine_id} for {req.duration_seconds} seconds.",
        "job_id": req.job_id, 
        "machine_id": req.machine_id
    }

@app.get("/status")
def get_status():
    """Return the current machine status."""
    return {"status": machine_status}

@app.get("/")
def health_check():
    return {"status": "Hardware Simulator is running. Send a POST request to /trigger to start a job."}

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="Run the Hardware Telemetry Simulator")
    parser.add_argument("--demo", action="store_true", help="Run a single demonstration loop without starting the web server")
    args = parser.parse_args()

    if args.demo:
        print("Running in CLI Demo mode...")
        asyncio.run(run_simulation("CNC-ALPHA-1", "JOB-12345", 10, 100))
    else:
        print("Starting FastAPI server...")
        uvicorn.run("simulator:app", host="0.0.0.0", port=8000, reload=True)
