'use client';

import { platformContent } from '../config/content';
import { ArrowRight } from 'lucide-react';

export default function Hero() {
  const { pillText, title, subtitle, ctaBorrow, ctaLend, telemetry } = platformContent.hero;

  return (
    <section className="relative pt-32 pb-20 px-6 overflow-hidden bg-slate-50">
      
      <div className="max-w-4xl mx-auto flex flex-col items-center text-center">
        {/* Pulsing Pill Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-8 rounded-full border border-indigo-200 bg-white text-indigo-700 text-sm font-medium shadow-sm">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
          </span>
          {pillText}
        </div>

        <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-slate-900 tracking-tight leading-tight mb-6">
          {title}
        </h1>
        
        <p className="max-w-2xl text-lg md:text-xl text-slate-600 mb-10 leading-relaxed">
          {subtitle}
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 mb-16">
          {/* Primary CTA - Solid Color */}
          <button className="group inline-flex items-center justify-center gap-2 px-6 py-3 text-base font-semibold text-white bg-indigo-600 border border-indigo-600 rounded-lg transition-all duration-300 ease-out hover:bg-indigo-700 hover:border-indigo-700 hover:-translate-y-0.5 shadow-sm">
            <span>{ctaBorrow}</span>
            <ArrowRight className="w-4 h-4 transition-transform duration-300 ease-out group-hover:translate-x-1" />
          </button>
          
          {/* Secondary CTA */}
          <button className="px-6 py-3 text-base font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg shadow-sm transition-all duration-300 ease-out hover:bg-slate-50 hover:border-slate-300 hover:-translate-y-0.5">
            {ctaLend}
          </button>
        </div>

        {/* Live Telemetry Ticker */}
        <div className="flex items-center gap-6 px-6 py-3 bg-white border border-slate-200 rounded-full shadow-sm text-sm font-medium text-slate-600">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
            {telemetry.activePrinters}
          </div>
          <div className="w-px h-4 bg-slate-200" />
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
            {telemetry.activeCNCs}
          </div>
          <div className="w-px h-4 bg-slate-200" />
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            {telemetry.networkStatus}
          </div>
        </div>
      </div>
    </section>
  );
}
