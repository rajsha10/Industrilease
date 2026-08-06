'use client';

import { platformContent } from '../config/content';
import { ShieldCheck, Lock, Cpu } from 'lucide-react';

const iconMap = {
  ShieldCheck: ShieldCheck,
  Lock: Lock,
  Cpu: Cpu,
};

export default function Offers() {
  const { title, items } = platformContent.offers;

  return (
    <section className="py-24 px-6 bg-white border-t border-slate-200">
      <div className="max-w-6xl mx-auto">
        <div className="text-center md:text-left mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
            {title}
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {items.map((prop, index) => {
            const Icon = iconMap[prop.icon as keyof typeof iconMap];
            
            return (
              <div 
                key={index}
                className="group p-10 bg-white border border-slate-200 rounded-2xl transition-all duration-300 ease-out hover:border-indigo-500/50 hover:-translate-y-1 shadow-sm"
              >
                <div className="w-12 h-12 mb-6 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-200 group-hover:bg-indigo-50 group-hover:border-indigo-200 transition-colors duration-300 ease-out">
                  <Icon className="w-6 h-6 text-slate-700 group-hover:text-indigo-600 transition-colors duration-300 ease-out" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3 tracking-tight">
                  {prop.title}
                </h3>
                <p className="text-slate-600 leading-relaxed font-medium">
                  {prop.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
