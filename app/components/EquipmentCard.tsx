'use client';

// EquipmentCard is now fully integrated into EquipmentShowcase.tsx
// This file is kept for backwards compatibility.
// The actual card rendering logic lives in EquipmentShowcase.tsx

interface EquipmentCardProps {
  category: string;
  title: string;
  hourlyRate: string;
  isVerified: boolean;
  imageExterior?: string;
  imageInterior?: string;
  index?: number;
}

export default function EquipmentCard(_props: EquipmentCardProps) {
  return null;
}
