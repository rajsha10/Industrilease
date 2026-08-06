'use client';

import { platformContent } from '../config/content';
import EquipmentCard from './EquipmentCard';

export default function EquipmentShowcase() {
  const { sectionTitle, sectionDescription, machines } = platformContent.equipmentShowcase;

  return (
    <section className="py-24 px-6 bg-slate-50">
      <div className="max-w-6xl mx-auto">
        <div className="mb-12 text-center md:text-left">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight mb-4">
            {sectionTitle}
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl">
            {sectionDescription}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {machines.map((machine) => (
            <EquipmentCard
              key={machine.id}
              category={machine.category}
              title={machine.title}
              hourlyRate={machine.hourlyRate}
              isVerified={machine.isVerified}
              imageExterior={machine.imageExterior}
              imageInterior={machine.imageInterior}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
