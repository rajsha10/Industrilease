'use client';

import { motion } from 'framer-motion';
import { ShieldCheck } from 'lucide-react';
import Image from 'next/image';

interface EquipmentCardProps {
  category: string;
  title: string;
  hourlyRate: string;
  isVerified: boolean;
  imageExterior: string;
  imageInterior: string;
}

export default function EquipmentCard({
  category,
  title,
  hourlyRate,
  isVerified,
  imageExterior,
  imageInterior,
}: EquipmentCardProps) {
  return (
    <motion.div
      className="group relative bg-white border border-slate-200 rounded-2xl overflow-hidden transition-all duration-300 ease-out hover:border-indigo-500/50 hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-1"
      initial="rest"
      whileHover="hover"
      animate="rest"
    >
      {/* 16:9 Image Viewport */}
      <div className="relative w-full aspect-video overflow-hidden bg-slate-100 border-b border-slate-100">
        
        {/* Interior Chamber Image (Slides in from top-left) */}
        <motion.div
          className="absolute inset-0 z-10"
          variants={{
            rest: { x: '-100%', y: '-100%', opacity: 0 },
            hover: { x: 0, y: 0, opacity: 1 },
          }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          {/* using unoptimized img tag for placeholder urls to avoid next/image domain config issues */}
          <img
            src={imageInterior}
            alt={`${title} Interior`}
            className="w-full h-full object-cover"
          />
        </motion.div>

        {/* Exterior Image (Slides out to bottom-right) */}
        <motion.div
          className="absolute inset-0 z-20"
          variants={{
            rest: { x: 0, y: 0, opacity: 1 },
            hover: { x: '100%', y: '100%', opacity: 0 },
          }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          <img
            src={imageExterior}
            alt={`${title} Exterior`}
            className="w-full h-full object-cover"
          />
        </motion.div>
        
        {/* Category Badge - overlay on top left */}
        <div className="absolute top-4 left-4 z-30">
          <span className="px-3 py-1 text-xs font-semibold text-slate-700 bg-white/90 backdrop-blur-md rounded-full shadow-sm border border-slate-200">
            {category}
          </span>
        </div>
      </div>

      {/* Card Details */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-900 tracking-tight leading-tight">
            {title}
          </h3>
          <div className="text-right">
            <span className="text-lg font-semibold text-indigo-600 block">
              {hourlyRate}
            </span>
          </div>
        </div>

        {isVerified && (
          <div className="flex items-center gap-2 pt-4 mt-2 border-t border-slate-100">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span className="text-xs font-medium text-slate-600">
              Enclave Verified
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
