'use client';

import { platformContent } from '../config/content';
import { CheckCircle2 } from 'lucide-react';

export default function Users() {
  const { borrowers, lenders } = platformContent.users;

  return (
    <section className="py-24 px-6 bg-slate-50 border-t border-slate-200">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Borrowers Card */}
          <div className="bg-white border border-slate-200 p-10 rounded-2xl shadow-sm hover:border-indigo-500/50 transition-colors duration-300 ease-out">
            <h3 className="text-2xl font-bold text-slate-900 tracking-tight mb-2">
              {borrowers.title}
            </h3>
            <p className="text-lg font-medium text-indigo-600 mb-8">
              {borrowers.subtitle}
            </p>
            <ul className="space-y-4">
              {borrowers.features.map((feature, idx) => (
                <li key={idx} className="flex items-start gap-3 text-slate-600">
                  <CheckCircle2 className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Lenders Card */}
          <div className="bg-white border border-slate-200 p-10 rounded-2xl shadow-sm hover:border-cyan-500/50 transition-colors duration-300 ease-out">
            <h3 className="text-2xl font-bold text-slate-900 tracking-tight mb-2">
              {lenders.title}
            </h3>
            <p className="text-lg font-medium text-cyan-600 mb-8">
              {lenders.subtitle}
            </p>
            <ul className="space-y-4">
              {lenders.features.map((feature, idx) => (
                <li key={idx} className="flex items-start gap-3 text-slate-600">
                  <CheckCircle2 className="w-5 h-5 text-cyan-500 shrink-0 mt-0.5" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>

        </div>
      </div>
    </section>
  );
}
