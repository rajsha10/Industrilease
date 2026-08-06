'use client';

import { platformContent } from '../config/content';

export default function Header() {
  const { logo, networkStatus, ctaBorrow, ctaLend } = platformContent.header;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 backdrop-blur-md bg-white/70 border-b border-slate-200">
      <div className="flex items-center gap-6">
        <span className="text-xl font-bold text-slate-900 tracking-tight">{logo}</span>
        <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-full border border-slate-200">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-xs font-medium text-slate-600">{networkStatus}</span>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors duration-300 ease-out">
          {ctaLend}
        </button>
        <button className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg shadow-sm hover:bg-indigo-500 hover:shadow-indigo-500/20 transition-all duration-300 ease-out">
          {ctaBorrow}
        </button>
      </div>
    </header>
  );
}
