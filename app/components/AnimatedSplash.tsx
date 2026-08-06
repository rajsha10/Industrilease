'use client';

import { motion } from 'framer-motion';
import { platformContent } from '../config/content';

export default function AnimatedSplash() {
  const { placeholderImage, nodes } = platformContent.splash;

  return (
    <section className="py-20 px-6 bg-slate-50 overflow-hidden">
      <div className="max-w-6xl mx-auto relative flex flex-col items-center justify-center min-h-[500px]">
        
        {/* Floating Info Nodes */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="relative w-full max-w-4xl h-full flex items-center justify-center">
            
            {nodes.map((node, i) => {
              // Position nodes around the center
              const positions = [
                { top: '10%', left: '10%' },
                { top: '20%', right: '5%' },
                { bottom: '15%', left: '20%' },
              ];
              
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.2, duration: 0.6, ease: "easeOut" }}
                  viewport={{ once: true }}
                  className="absolute px-4 py-2 bg-white border border-slate-200 rounded-lg shadow-sm text-sm font-semibold text-slate-700 pointer-events-auto"
                  style={positions[i]}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-indigo-500" />
                    {node}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Central 3D Placeholder Image */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true }}
          className="relative z-10 w-full max-w-3xl aspect-[16/9] bg-white border-2 border-slate-200 rounded-2xl overflow-hidden shadow-sm"
        >
          {/* using unoptimized img tag for placeholder urls to avoid next/image domain config issues */}
          <img
            src={placeholderImage}
            alt="Spline 3D Placeholder"
            className="w-full h-full object-cover"
          />
        </motion.div>
        
      </div>
    </section>
  );
}
