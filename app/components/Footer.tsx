'use client';

import { platformContent } from '../config/content';

export default function Footer() {
  const { logo } = platformContent.header;
  const { description, links } = platformContent.footer;

  return (
    <footer className="bg-slate-50 border-t border-slate-200 py-12 px-6">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col items-center md:items-start gap-2">
          <span className="text-2xl font-bold text-slate-900 tracking-tight">{logo}</span>
          <p className="text-sm text-slate-500 font-medium">{description}</p>
        </div>
        
        <div className="flex flex-wrap justify-center gap-6">
          {links.map((link, idx) => (
            <a 
              key={idx} 
              href="#" 
              className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors duration-300"
            >
              {link}
            </a>
          ))}
        </div>
      </div>
      
      <div className="max-w-6xl mx-auto mt-12 pt-8 border-t border-slate-200 text-center">
        <p className="text-sm text-slate-400">
          © {new Date().getFullYear()} {logo}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
