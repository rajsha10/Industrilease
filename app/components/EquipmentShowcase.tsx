'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { platformContent } from '../config/content';
import { ArrowRight, ShieldCheck, ChevronLeft, ChevronRight } from 'lucide-react';
import { AnimatedHeading, Reveal, fadeUp } from './animations';
import Link from 'next/link';

const MotionLink = motion(Link);

const CATEGORY_STYLES: Record<string, { dot: string; bg: string }> = {
  'Industrial FDM': { dot: '#6366f1', bg: '#eef2ff' },
  '5-Axis CNC':     { dot: '#0891b2', bg: '#ecfeff' },
  'Metal SLS':      { dot: '#7c3aed', bg: '#f5f3ff' },
  'Robotic Arm':    { dot: '#eab308', bg: '#fefce8' },
  'Laser Cutter':   { dot: '#ef4444', bg: '#fef2f2' },
};
const DEFAULT_STYLE = { dot: '#374151', bg: '#f9fafb' };

export default function EquipmentShowcase() {
  const { sectionTitle, sectionDescription, machines } = platformContent.equipmentShowcase;
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % machines.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + machines.length) % machines.length);
  };

  // Get 3 visible items for the carousel, wrapping around
  const visibleMachines = [
    machines[currentIndex],
    machines[(currentIndex + 1) % machines.length],
    machines[(currentIndex + 2) % machines.length],
  ];

  return (
    <section id="equipment" style={{ background: '#fff', padding: '64px 40px', borderTop: '1.5px solid #e4e4e7', overflow: 'hidden' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

        {/* Section header */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <Reveal>
              <AnimatedHeading
                text={sectionTitle}
                as="h2"
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'clamp(1.5rem, 3vw, 2rem)',
                  fontWeight: 800, color: '#0a0a0a',
                  letterSpacing: '-0.025em', marginBottom: '6px',
                }}
                stagger={0.07}
              />
            </Reveal>
            <Reveal delay={0.2}>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: '#71717a' }}>
                {sectionDescription}
              </p>
            </Reveal>
          </div>

          <Reveal delay={0.25}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MotionLink
                href="/marketplace"
                style={{
                  fontFamily: 'var(--font-body)', fontSize: '14px', fontWeight: 600,
                  color: '#0a0a0a', textDecoration: 'none',
                  display: 'flex', alignItems: 'center', gap: '4px', marginRight: '16px',
                }}
                whileHover={{ opacity: 0.6 }}
              >
                See all <ArrowRight size={14} />
              </MotionLink>
              <motion.button
                onClick={prevSlide}
                style={{
                  width: '36px', height: '36px', borderRadius: '50%',
                  border: '1.5px solid #e4e4e7', background: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', color: '#0a0a0a',
                }}
                whileHover={{ background: '#0a0a0a', color: '#fff', borderColor: '#0a0a0a', scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.18 }}
              >
                <ChevronLeft size={16} />
              </motion.button>
              <motion.button
                onClick={nextSlide}
                style={{
                  width: '36px', height: '36px', borderRadius: '50%',
                  border: '1.5px solid #e4e4e7', background: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', color: '#0a0a0a',
                }}
                whileHover={{ background: '#0a0a0a', color: '#fff', borderColor: '#0a0a0a', scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.18 }}
              >
                <ChevronRight size={16} />
              </motion.button>
            </div>
          </Reveal>
        </div>

        {/* Carousel container */}
        <Reveal delay={0.1}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
            <AnimatePresence mode="popLayout">
              {visibleMachines.map((machine, index) => {
                const catStyle = CATEGORY_STYLES[machine.category] ?? DEFAULT_STYLE;
                return (
                  <motion.div
                    key={`${machine.id}-${currentIndex}-${index}`}
                    layout
                    initial={{ opacity: 0, scale: 0.8, x: 100 }}
                    animate={{ opacity: 1, scale: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.8, x: -100 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                    className="card"
                    whileHover="hover"
                    variants={{
                      hover: { boxShadow: '0 16px 48px rgba(0,0,0,0.12)', borderColor: '#bbb' }
                    }}
                    style={{
                      background: '#fff', border: '1.5px solid #e4e4e7',
                      borderRadius: '16px', overflow: 'hidden'
                    }}
                  >
                    {/* Real Image with Diagonal Hover Effect */}
                    <div style={{ position: 'relative', width: '100%', height: '200px', background: '#f0f0f0', overflow: 'hidden' }}>
                      <motion.img
                        src={machine.imageExterior}
                        alt={machine.title}
                        variants={{ hover: { x: '100%', y: '100%' } }}
                        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                      />
                      <motion.img
                        src={machine.imageExterior}
                        alt={machine.title}
                        variants={{ hover: { x: 0, y: 0 } }}
                        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block', x: '-100%', y: '-100%' }}
                      />
                      <div style={{
                        position: 'absolute', top: '14px', left: '14px',
                        background: 'white', border: '1.5px solid #e4e4e7', borderRadius: '999px',
                        padding: '4px 12px', fontSize: '11px', fontWeight: 700,
                        fontFamily: 'var(--font-body)', color: '#0a0a0a', letterSpacing: '0.04em',
                      }}>
                        {machine.category}
                      </div>
                    </div>

                    <div style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                        <div style={{
                          width: '26px', height: '26px', borderRadius: '50%',
                          background: `linear-gradient(135deg, ${catStyle.dot}60, ${catStyle.dot})`,
                          border: '2px solid #fff', boxShadow: '0 0 0 1.5px #e4e4e7', flexShrink: 0,
                        }} />
                        <span style={{ fontFamily: 'var(--font-body)', fontSize: '12px', fontWeight: 600, color: '#71717a' }}>
                          @industrilease.eth
                        </span>
                      </div>

                      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: 800, color: '#0a0a0a', letterSpacing: '-0.02em', marginBottom: '12px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {machine.title}
                      </h3>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '12px', borderTop: '1.5px solid #f4f4f5' }}>
                        <div>
                          <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: '#a1a1aa', fontWeight: 500, marginBottom: '2px' }}>
                            Hourly Rate
                          </div>
                          <div style={{ fontFamily: 'var(--font-display)', fontSize: '17px', fontWeight: 800, color: '#0a0a0a', letterSpacing: '-0.02em' }}>
                            {machine.hourlyRate}
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {machine.isVerified && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <ShieldCheck size={14} color="#16a34a" />
                              <span style={{ fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 600, color: '#16a34a' }}>
                                Verified
                              </span>
                            </div>
                          )}
                          <MotionLink
                            href="/marketplace"
                            style={{
                              background: '#0a0a0a', color: '#fff', border: 'none',
                              borderRadius: '8px', padding: '7px 14px',
                              fontFamily: 'var(--font-body)', fontSize: '12px', fontWeight: 700, cursor: 'pointer',
                              textDecoration: 'none', display: 'inline-block'
                            }}
                            whileHover={{ scale: 1.05, background: '#333' }}
                            whileTap={{ scale: 0.95 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                          >
                            Rent Now
                          </MotionLink>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </Reveal>

        {/* Pagination dots */}
        <Reveal delay={0.4} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '32px' }}>
          {machines.map((_, i) => (
            <motion.div key={i}
              onClick={() => setCurrentIndex(i)}
              style={{ width: i === currentIndex ? '24px' : '8px', height: '8px', borderRadius: '999px', background: i === currentIndex ? '#0a0a0a' : '#e4e4e7', cursor: 'pointer', transition: 'width 0.3s ease, background 0.3s ease' }}
              whileHover={{ scale: 1.2 }}
            />
          ))}
        </Reveal>
      </div>
    </section>
  );
}
