import { NextRequest, NextResponse } from 'next/server';
import { updateCachedSlotStatus } from '@/lib/db';
import { relayEscrowProof } from '@/lib/web3';

export async function POST(req: NextRequest) {
  try {
    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON request body' },
        { status: 400 }
      );
    }

    const { slotId, machineId, jobId, layersCompleted, powerDrawAvg, status, signature } = body;

    // Validate parameters
    if (slotId === undefined || typeof slotId !== 'number') {
      return NextResponse.json(
        { error: 'slotId is required and must be a number' },
        { status: 400 }
      );
    }

    if (!signature || typeof signature !== 'string') {
      return NextResponse.json(
        { error: 'signature is required and must be a hex string' },
        { status: 400 }
      );
    }

    console.log(`[Escrow API] Submitting proof for slot ${slotId}...`);

    // Submit the proof to the blockchain escrow contract (or fallback simulation)
    const result = await relayEscrowProof(
      slotId,
      machineId || 'CNC-ALPHA-1',
      jobId || 'JOB-12345',
      layersCompleted !== undefined ? Number(layersCompleted) : 100,
      powerDrawAvg !== undefined ? Number(powerDrawAvg) : 200,
      status || 'COMPLETED_SUCCESS',
      signature
    );

    // Sync database cache state upon successful relay
    if (result.success) {
      updateCachedSlotStatus(slotId, 'COMPLETED');
    }

    return NextResponse.json({
      status: 'success',
      message: result.mock
        ? 'Escrow proof submission simulated successfully (mock)'
        : 'Escrow proof successfully broadcasted on-chain',
      txHash: result.txHash,
      mock: result.mock,
    });
  } catch (error: any) {
    console.error('Escrow submit proof API error:', error);
    return NextResponse.json(
      {
        status: 'error',
        error: 'Failed to submit escrow proof',
        details: error.message || String(error),
      },
      { status: 500 }
    );
  }
}
