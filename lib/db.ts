import fs from 'fs';
import path from 'path';

export interface Slot {
  slotId: number;
  machineId: string; // "CNC-ALPHA-1" etc.
  startTime: number; // unix timestamp in seconds
  endTime: number;   // unix timestamp in seconds
  pricePerHour: string; // in wei
  setupFee: string;     // in wei
  totalLayers: number;
  factory: string;      // wallet address
  status: 'AVAILABLE' | 'BOOKED' | 'EXECUTING' | 'COMPLETED' | 'CANCELLED' | 'REFUNDED';
}

const DB_DIR = path.join(process.cwd(), 'db');
const DB_FILE = path.join(DB_DIR, 'slots.json');

// Ensure db directory and file exist
function initDb() {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }

  if (!fs.existsSync(DB_FILE)) {
    const now = Math.floor(Date.now() / 1000);
    // Seed some mock slots
    const seedSlots: Slot[] = [
      {
        slotId: 1,
        machineId: 'CNC-ALPHA-1',
        startTime: now,
        endTime: now + 4 * 3600,
        pricePerHour: '10000000000000000', // 0.01 ETH
        setupFee: '50000000000000000', // 0.05 ETH
        totalLayers: 100,
        factory: '0x3333333333333333333333333333333333333333',
        status: 'AVAILABLE',
      },
      {
        slotId: 2,
        machineId: '3D-PRINTER-BETA',
        startTime: now - 3600,
        endTime: now + 3 * 3600,
        pricePerHour: '20000000000000000', // 0.02 ETH
        setupFee: '40000000000000000', // 0.04 ETH
        totalLayers: 150,
        factory: '0x4444444444444444444444444444444444444444',
        status: 'BOOKED',
      },
    ];
    fs.writeFileSync(DB_FILE, JSON.stringify(seedSlots, null, 2), 'utf-8');
  }
}

export function getCachedSlots(): Slot[] {
  initDb();
  try {
    const data = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(data) as Slot[];
  } catch (error) {
    console.error('Failed to read slot cache:', error);
    return [];
  }
}

export function saveCachedSlots(slots: Slot[]): void {
  initDb();
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(slots, null, 2), 'utf-8');
  } catch (error) {
    console.error('Failed to write slot cache:', error);
  }
}

export function addCachedSlot(slot: Omit<Slot, 'slotId'> & { slotId?: number }): Slot {
  const slots = getCachedSlots();
  const nextId = slots.length > 0 ? Math.max(...slots.map((s) => s.slotId)) + 1 : 1;
  const newSlot: Slot = {
    ...slot,
    slotId: slot.slotId || nextId,
  };
  slots.push(newSlot);
  saveCachedSlots(slots);
  return newSlot;
}

export function updateCachedSlotStatus(
  slotId: number,
  newStatus: Slot['status']
): Slot | null {
  const slots = getCachedSlots();
  const index = slots.findIndex((s) => s.slotId === slotId);
  if (index === -1) return null;

  slots[index].status = newStatus;
  saveCachedSlots(slots);
  return slots[index];
}
