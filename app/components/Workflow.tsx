'use client';

import { platformContent } from '../config/content';

export default function Workflow() {
  const { title, steps } = platformContent.workflow;

  return (
    <section className="py-24 px-6 bg-slate-50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
            {title}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              {/* Connector Line for lg screens */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-8 left-[60%] w-full h-px bg-slate-200" />
              )}
              
              <div className="relative z-10 bg-white border border-slate-200 p-6 rounded-xl shadow-sm h-full flex flex-col">
                <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-700 font-bold mb-6">
                  {step.number}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3 tracking-tight">
                  {step.title}
                </h3>
                <p className="text-slate-600 leading-relaxed text-sm">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
