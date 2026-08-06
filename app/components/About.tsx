'use client';

import { platformContent } from '../config/content';

export default function About() {
  const { title, description } = platformContent.about;

  return (
    <section className="py-24 px-6 bg-white border-y border-slate-200">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight mb-6">
          {title}
        </h2>
        <p className="text-lg md:text-xl text-slate-600 leading-relaxed">
          {description}
        </p>
      </div>
    </section>
  );
}
