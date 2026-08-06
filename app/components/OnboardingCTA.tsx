'use client';

import { platformContent } from '../config/content';
import { ArrowRight } from 'lucide-react';

export default function OnboardingCTA() {
  const { title, ctaBorrow, ctaLend } = platformContent.onboarding;

  return (
    <section className="py-32 px-6 bg-white">
      <div className="max-w-4xl mx-auto text-center border border-slate-200 rounded-3xl p-12 md:p-20 shadow-sm">
        <h2 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight mb-12">
          {title}
        </h2>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
          <button className="w-full sm:w-auto group inline-flex items-center justify-center gap-2 px-8 py-4 text-lg font-semibold text-white bg-indigo-600 border border-indigo-600 rounded-xl transition-all duration-300 ease-out hover:bg-indigo-700 hover:border-indigo-700 hover:-translate-y-0.5 shadow-sm">
            <span>{ctaBorrow}</span>
            <ArrowRight className="w-5 h-5 transition-transform duration-300 ease-out group-hover:translate-x-1" />
          </button>
          
          <button className="w-full sm:w-auto px-8 py-4 text-lg font-semibold text-slate-700 bg-white border-2 border-slate-200 rounded-xl shadow-sm transition-all duration-300 ease-out hover:bg-slate-50 hover:border-slate-300 hover:-translate-y-0.5">
            {ctaLend}
          </button>
        </div>
      </div>
    </section>
  );
}
