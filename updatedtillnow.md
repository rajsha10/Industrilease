# IndustriLease Project Updates

## Phase 2: Layer 1 Hardware Telemetry Simulator
**Location**: `backend-python/`

- **Created Hardware Simulator**: Implemented a standalone Python service (`simulator.py`) to act as the hardware controller.
- **Trigger Endpoint**: Added a FastAPI-based REST API with a `/trigger` endpoint that accepts POST requests to start a simulation in a background task.
- **Simulated Loop**: Created an asynchronous loop that simulates a 3D printing or CNC run over a compressed timeline (e.g., a 10-second loop representing 4 hours).
- **Telemetry Payload Generation**: Configured the simulation to output a structured JSON payload upon job completion, including:
  - `machine_id`
  - `job_id`
  - `layers_completed` (e.g., 100/100)
  - `power_draw_avg`
  - `status` ("COMPLETED_SUCCESS")
- **Cryptographic Signatures**: Integrated Web3 authentication by implementing EIP-712 typed data signatures (using `eth_account`). The payload includes a `signature` generated from a machine wallet and `signature_type: "EIP-712"` to mathematically prove the telemetry data is authentic before submission to smart contracts. 
- **Dependencies Setup**: Added `requirements.txt` containing dependencies like `fastapi`, `uvicorn`, `pydantic`, and `eth-account`. Successfully verified execution in a local demo environment.

## Phase 3: Autonomous Factory AI Agent
**Location**: `backend-python/`

- **Created AI Agent**: Implemented `agent.py` to manage autonomous factory operations acting as an ERC-7579 Scoped Session Key.
- **Downtime Monitor**: Added an asynchronous background task that periodically polls `simulator.py` for a `status == "IDLE"` state to intelligently mint slots.
- **Session Key Manager**: Configured a restricted `eth_account` to act as the machine agent. It builds, signs, and sends `mintSlot()` transactions to the `MachineSlotToken` contract when downtime is detected.
- **Proof Relay Webhook**: Established a `/relay-proof` endpoint to collect the signed layer-completion telemetry payload from `simulator.py` and submit it securely via `releaseFunds()` on the `IndustriLeaseEscrow` contract.
- **Simulator Integrations**: Updated `simulator.py` to maintain a global `machine_status`, introduced a `/status` GET endpoint, and added HTTP POST functionality to automatically forward cryptographic proofs to the AI Agent webhook upon job completion.
- **Configuration & Dependencies**: Added `web3`, `httpx`, and `python-dotenv` to `requirements.txt`. Created an `.env.example` file for defining RPC URLs, private keys, and deployed contract addresses.

## Phase 4: Next.js Backend APIs
**Location**: `app/api/`, `lib/`

- **Database Cache Layer**: Created a simple file-based JSON caching utility (`lib/db.ts`) at `db/slots.json` to store time-slots. Included default seed slots for testing.
- **Web3 Interface & Fallback Bridge**: Configured contract interaction routines in `lib/web3.ts` using `ethers` to query on-chain slots and relay proofs to `IndustriLeaseEscrow.sol`. Built a simulation mock fallback for local environments without blockchain connections.
- **G-code bounds-checker (`POST /api/gcode/sanitize`)**: Implemented a security validation endpoint verifying G-code motion limits (extruder temp <= 275°C, bed temp <= 110°C, feed rate <= 5000 mm/min, X/Y bounds in [0, 220], Z in [0, 250]) line-by-line. Generates a SHA-256 fingerprint upon safety validation.
- **Slot Registry (`GET /api/slots`, `POST /api/slots`)**: Implemented slot listing which retrieves and merges available slots from smart contracts and local database caches, resolved using `slotId` keys.
- **Escrow Relayer (`POST /api/escrow/submit-proof`)**: Implemented an API handler that accepts signed telemetry signatures from Python nodes, relays it on-chain via the Web3 bridge to release locked escrow funds, and transitions cache states to `COMPLETED`.
