import { NextRequest, NextResponse } from 'next/server';
import { getCachedSlots, addCachedSlot, Slot } from '@/lib/db';
import { getOnChainSlots } from '@/lib/web3';

export async function GET(req: NextRequest) {
  try {
    // 1. Fetch slots from blockchain
    const onChainSlots = await getOnChainSlots();

    // 2. Fetch slots from database cache
    const cachedSlots = getCachedSlots();

    // 3. Merge them using slotId as primary key (on-chain takes precedence)
    const slotMap = new Map<number, Slot>();

    // Add cached slots first
    cachedSlots.forEach((slot) => {
      slotMap.set(slot.slotId, slot);
    });

    // Overwrite or append with on-chain slots (trusting on-chain state)
    onChainSlots.forEach((slot) => {
      slotMap.set(slot.slotId, slot);
    });

    const mergedSlots = Array.from(slotMap.values()).sort((a, b) => a.slotId - b.slotId);

    return NextResponse.json({
      status: 'success',
      count: mergedSlots.length,
      slots: mergedSlots,
    });
  } catch (error) {
    console.error('Failed to list slots:', error);
    return NextResponse.json(
      { error: 'Internal server error while retrieving slots' },
      { status: 500 }
    );
  }
}

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

    const { machineId, startTime, endTime, pricePerHour, factory, status } = body;

    // Validate inputs
    if (!machineId || typeof machineId !== 'string') {
      return NextResponse.json(
        { error: 'machineId is required and must be a string' },
        { status: 400 }
      );
    }
    if (!startTime || typeof startTime !== 'number') {
      return NextResponse.json(
        { error: 'startTime is required and must be a unix timestamp (number)' },
        { status: 400 }
      );
    }
    if (!endTime || typeof endTime !== 'number') {
      return NextResponse.json(
        { error: 'endTime is required and must be a unix timestamp (number)' },
        { status: 400 }
      );
    }
    if (endTime <= startTime) {
      return NextResponse.json(
        { error: 'endTime must be strictly greater than startTime' },
        { status: 400 }
      );
    }
    if (!pricePerHour || typeof pricePerHour !== 'string') {
      return NextResponse.json(
        { error: 'pricePerHour is required and must be a string representing wei/value' },
        { status: 400 }
      );
    }
    if (!factory || typeof factory !== 'string' || !factory.startsWith('0x')) {
      return NextResponse.json(
        { error: 'factory address is required and must be a valid hex address starting with 0x' },
        { status: 400 }
      );
    }

    const validStatuses = ['AVAILABLE', 'BOOKED', 'EXECUTING', 'COMPLETED', 'CANCELLED', 'REFUNDED'];
    const slotStatus = status && validStatuses.includes(status) ? status : 'AVAILABLE';

    const newSlot = addCachedSlot({
      machineId,
      startTime,
      endTime,
      pricePerHour,
      factory,
      status: slotStatus as Slot['status'],
    });

    return NextResponse.json(
      {
        status: 'success',
        message: 'Slot successfully registered in local cache',
        slot: newSlot,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Failed to create cached slot:', error);
    return NextResponse.json(
      { error: 'Internal server error while creating slot' },
      { status: 500 }
    );
  }
}
