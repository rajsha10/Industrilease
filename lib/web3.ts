import { ethers } from 'ethers';
import { Slot } from './db';

// ABIs
const MACHINE_SLOT_TOKEN_ABI = [
  'function nextSlotId() external view returns (uint256)',
  'function slots(uint256 slotId) external view returns (string machineId, uint256 startTime, uint256 endTime, uint256 pricePerHour, uint256 setupFee, uint256 totalLayers, address factory, uint8 status)',
];

const ESCROW_ABI = [
  'function releaseFunds(uint256 slotId, string machineId, string jobId, uint256 layersCompleted, uint256 powerDrawAvg, string status, bytes signature) external',
];

// Configuration
const RPC_URL = process.env.RPC_URL || 'http://localhost:8545';
const MACHINE_SLOT_TOKEN_ADDRESS = process.env.MACHINE_SLOT_TOKEN_ADDRESS || '0x0000000000000000000000000000000000000000';
const INDUSTRI_LEASE_ESCROW_ADDRESS = process.env.INDUSTRI_LEASE_ESCROW_ADDRESS || '0x0000000000000000000000000000000000000000';
// Default to a dummy private key if none provided
const RELAYER_PRIVATE_KEY = process.env.RELAYER_PRIVATE_KEY || '0x2222222222222222222222222222222222222222222222222222222222222222';

// Status mapper
const STATUS_MAP: Record<number, Slot['status']> = {
  0: 'AVAILABLE',
  1: 'BOOKED',
  2: 'EXECUTING',
  3: 'COMPLETED',
  4: 'CANCELLED',
  5: 'REFUNDED',
};

// Safely convert bytes32 hex string to standard text string
function decodeBytes32(bytes32: string): string {
  try {
    return ethers.decodeBytes32String(bytes32);
  } catch {
    let hex = bytes32.replace(/^0x/, '');
    // remove trailing 00s
    hex = hex.replace(/(00)+$/, '');
    let str = '';
    for (let i = 0; i < hex.length; i += 2) {
      const code = parseInt(hex.substring(i, i + 2), 16);
      if (code !== 0) {
        str += String.fromCharCode(code);
      }
    }
    return str.trim();
  }
}

function getProvider(): ethers.JsonRpcProvider | null {
  try {
    if (!process.env.RPC_URL) {
      // Don't log spam, just return null if not explicitly set to a real network
      return null;
    }
    return new ethers.JsonRpcProvider(RPC_URL);
  } catch (err) {
    console.warn('Web3 Provider offline or invalid:', err);
    return null;
  }
}

export async function getOnChainSlots(): Promise<Slot[]> {
  const provider = getProvider();
  if (!provider || MACHINE_SLOT_TOKEN_ADDRESS === ethers.ZeroAddress) {
    console.log('[Web3] RPC not configured or zero address. Using cache/mock fallback.');
    return [];
  }

  try {
    const contract = new ethers.Contract(MACHINE_SLOT_TOKEN_ADDRESS, MACHINE_SLOT_TOKEN_ABI, provider);
    const nextIdVal = await contract.nextSlotId();
    const nextId = Number(nextIdVal);

    const onChainSlots: Slot[] = [];
    // Contract slotIds start from 1
    for (let id = 1; id < nextId; id++) {
      try {
        const slotData = await contract.slots(id);
        onChainSlots.push({
          slotId: id,
          machineId: slotData.machineId,
          startTime: Number(slotData.startTime),
          endTime: Number(slotData.endTime),
          pricePerHour: slotData.pricePerHour.toString(),
          setupFee: slotData.setupFee.toString(),
          totalLayers: Number(slotData.totalLayers),
          factory: slotData.factory,
          status: STATUS_MAP[Number(slotData.status)] || 'AVAILABLE',
        });
      } catch (err) {
        console.error(`Failed to fetch slot ${id} details:`, err);
      }
    }
    return onChainSlots;
  } catch (error) {
    console.warn('[Web3] Error fetching on-chain slots, falling back to cache:', error);
    return [];
  }
}

export async function relayEscrowProof(
  slotId: number,
  machineId: string,
  jobId: string,
  layersCompleted: number,
  powerDrawAvg: number,
  status: string,
  signature: string
): Promise<{ success: boolean; txHash: string; mock: boolean }> {
  const provider = getProvider();
  if (!provider || INDUSTRI_LEASE_ESCROW_ADDRESS === ethers.ZeroAddress) {
    console.log('[Web3] RPC/Escrow not configured. Simulating escrow proof submission.');
    // Generate a mock hash
    const mockHash = '0xmock' + Array.from({ length: 60 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    return { success: true, txHash: mockHash, mock: true };
  }

  try {
    const wallet = new ethers.Wallet(RELAYER_PRIVATE_KEY, provider);
    const escrowContract = new ethers.Contract(INDUSTRI_LEASE_ESCROW_ADDRESS, ESCROW_ABI, wallet);

    // Make sure signature has 0x prefix
    const signatureBytes = signature.startsWith('0x') ? signature : `0x${signature}`;

    console.log(`[Web3] Sending releaseFunds transaction on-chain for slot ${slotId}...`);
    const tx = await escrowContract.releaseFunds(
      slotId,
      machineId,
      jobId,
      layersCompleted,
      powerDrawAvg,
      status,
      signatureBytes
    );
    console.log(`[Web3] Transaction submitted: ${tx.hash}. Waiting for confirmation...`);
    const receipt = await tx.wait();
    console.log(`[Web3] Transaction confirmed in block ${receipt.blockNumber}`);

    return { success: true, txHash: tx.hash, mock: false };
  } catch (error: any) {
    console.error('[Web3] On-chain submit-proof failed:', error);
    throw new Error(error.message || 'On-chain transaction execution failed');
  }
}
