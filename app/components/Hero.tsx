'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { platformContent } from '../config/content';
import { ArrowRight } from 'lucide-react';
import { AnimatedHeading, Reveal, StaggerReveal, StaggerItem, AnimatedCounter, ease } from './animations';
import Link from 'next/link';

const MotionLink = motion(Link);

function Sparkle({ size = 24, style = {} }: { size?: number; style?: React.CSSProperties }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" style={{ display: 'inline-block', ...style }}>
      <path d="M12 0 L13.8 10.2 L24 12 L13.8 13.8 L12 24 L10.2 13.8 L0 12 L10.2 10.2 Z" />
    </svg>
  );
}

function MachineCard({
  title, category, rate, imageSrc,
  className = '', style = {},
}: {
  title: string; category: string; rate: string; imageSrc: string;
  className?: string; style?: React.CSSProperties;
}) {
  return (
    <div
      className={className}
      style={{
        width: '220px',
        background: '#fff',
        borderRadius: '16px',
        border: '1.5px solid #e4e4e7',
        boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
        overflow: 'hidden',
        ...style,
      }}
    >
      {/* Real image */}
      <div style={{
        width: '100%', height: '130px',
        position: 'relative', overflow: 'hidden', background: '#f0f0f0',
      }}>
        <img
          src={imageSrc}
          alt={title}
          style={{
            width: '100%', height: '100%',
            objectFit: 'cover',
            display: 'block',
            transition: 'transform 0.4s ease',
          }}
        />
        {/* Live badge */}
        <div style={{
          position: 'absolute', top: '10px', right: '10px',
          display: 'flex', alignItems: 'center', gap: '5px',
          background: 'white', borderRadius: '999px', padding: '3px 8px',
          fontSize: '10px', fontWeight: 700, fontFamily: 'var(--font-body)', color: '#16a34a',
        }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#16a34a', display: 'inline-block', animation: 'ping-dot 1.8s ease-in-out infinite' }} />
          Live
        </div>
      </div>
      <div style={{ padding: '12px 14px' }}>
        <span style={{
          fontSize: '10px', fontWeight: 700, fontFamily: 'var(--font-body)', color: '#71717a',
          background: '#f4f4f5', padding: '2px 8px', borderRadius: '999px',
          letterSpacing: '0.05em', textTransform: 'uppercase' as const,
          display: 'inline-block', marginBottom: '6px',
        }}>
          {category}
        </span>
        <p style={{ fontFamily: 'var(--font-display)', fontSize: '14px', fontWeight: 700, color: '#0a0a0a', margin: '0 0 8px', letterSpacing: '-0.01em' }}>
          {title}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '10px', color: '#a1a1aa', fontFamily: 'var(--font-body)', fontWeight: 500 }}>Rate</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '15px', fontWeight: 800, color: '#0a0a0a', letterSpacing: '-0.02em' }}>
              {rate}
            </div>
          </div>
          <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: '#f4f4f5', border: '1.5px solid #e4e4e7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ArrowRight size={14} color="#0a0a0a" />
          </div>
        </div>
      </div>
    </div>
  );
}

// Word-by-word headline specifically for Hero (mounts, not scroll)
function HeroHeadline({ lines }: { lines: string[] }) {
  const words = lines.flatMap((line, li) => [
    ...line.split(' ').map((w, wi) => ({ word: w, line: li, idx: wi })),
    ...(li < lines.length - 1 ? [{ word: '__break__', line: li, idx: 999 }] : []),
  ]);

  const container = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.07, delayChildren: 0.18 } },
  };
  const word = {
    hidden: { opacity: 0, y: 36, filter: 'blur(8px)' },
    visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.6, ease: ease.snappy } },
  };

  return (
    <motion.h1
      variants={container}
      initial="hidden"
      animate="visible"
      style={{
        fontFamily: 'var(--font-display)',
        fontSize: 'clamp(2.8rem, 5.5vw, 4.8rem)',
        fontWeight: 800,
        letterSpacing: '-0.035em',
        lineHeight: 1.05,
        color: '#0a0a0a',
        marginBottom: '20px',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0 0.22em',
      }}
    >
      {words.map((item, i) =>
        item.word === '__break__' ? (
          <div key={`br-${i}`} style={{ width: '100%', height: 0 }} />
        ) : (
          <motion.span key={i} variants={word} style={{ display: 'inline-block' }}>
            {item.word}
          </motion.span>
        )
      )}
    </motion.h1>
  );
}

export default function Hero() {
  const { pillText, subtitle, ctaBorrow, ctaLend, telemetry } = platformContent.hero;

  const STATS = [
    { target: 1552, suffix: '+', label: 'Machines' },
    { target: 28400, suffix: '+', label: 'Jobs Done' },
    { prefix: '$', target: 42, suffix: '.2M', label: 'Settled' },
  ];

  return (
    <section style={{
      paddingTop: '100px', paddingBottom: '40px',
      paddingLeft: '40px', paddingRight: '40px',
      minHeight: '92vh', display: 'flex', alignItems: 'center',
      position: 'relative', overflow: 'hidden', background: '#fff',
    }}>
      <div style={{
        maxWidth: '1200px', margin: '0 auto', width: '100%',
        display: 'grid', gridTemplateColumns: '1fr 1fr',
        gap: '60px', alignItems: 'center',
      }}>

        {/* ── LEFT COLUMN ── */}
        <div>
          {/* Pill badge — first to appear */}
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, ease: ease.snappy }}
            style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '28px' }}
          >
            <motion.span
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
            >
              <Sparkle size={20} style={{ color: '#0a0a0a' }} />
            </motion.span>
            <span style={{
              fontFamily: 'var(--font-body)', fontSize: '12px', fontWeight: 700,
              letterSpacing: '0.08em', textTransform: 'uppercase', color: '#52525b',
              background: '#f4f4f5', padding: '5px 14px', borderRadius: '999px',
              border: '1.5px solid #e4e4e7',
            }}>
              {pillText}
            </span>
          </motion.div>

          {/* H1 — word-by-word reveal */}
          <HeroHeadline lines={['Rent High‑End', 'Industrial', 'Machinery.']} />

          {/* Subtitle — slight delay after heading */}
          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.72, duration: 0.65, ease: ease.snappy }}
            style={{
              fontFamily: 'var(--font-body)', fontSize: '15px', color: '#71717a',
              lineHeight: 1.75, maxWidth: '440px', marginBottom: '36px',
            }}
          >
            {subtitle}
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.6, ease: ease.snappy }}
            style={{ display: 'flex', gap: '12px', marginBottom: '52px', flexWrap: 'wrap' }}
          >
            <MotionLink
              href="/marketplace"
              className="btn-dark"
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              {ctaBorrow} <ArrowRight size={15} />
            </MotionLink>
            <MotionLink
              href="/lender-dashboard"
              className="btn-outline"
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              {ctaLend}
            </MotionLink>
          </motion.div>

          {/* Stats — count up on mount */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.05, duration: 0.6 }}
            style={{ display: 'flex', gap: '40px' }}
          >
            {STATS.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.1 + i * 0.12, duration: 0.5 }}
              >
                <div style={{
                  fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 800,
                  color: '#0a0a0a', letterSpacing: '-0.03em', lineHeight: 1,
                }}>
                  {s.prefix ?? ''}
                  <AnimatedCounter target={s.target} suffix={s.suffix} duration={2} />
                </div>
                <div style={{
                  fontFamily: 'var(--font-body)', fontSize: '13px',
                  color: '#a1a1aa', fontWeight: 500, marginTop: '4px',
                }}>
                  {s.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* ── RIGHT COLUMN — floating cards ── */}
        <div style={{ position: 'relative', height: '480px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {/* Sparkles */}
          {[
            { top: '12%', left: '8%', size: 28, delay: 0.6, dur: 8 },
            { bottom: '15%', right: '10%', size: 18, delay: 0.75, dur: 6, reverse: true },
            { top: '60%', left: '0%', size: 14, delay: 0.9, dur: 10, color: '#a1a1aa' },
          ].map((s, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: s.delay, duration: 0.5 }}
              style={{
                position: 'absolute', color: (s as any).color ?? '#0a0a0a',
                top: (s as any).top, left: (s as any).left,
                bottom: (s as any).bottom, right: (s as any).right,
                animation: `sparkle-spin ${s.dur}s linear infinite${(s as any).reverse ? ' reverse' : ''}`,
              }}
            >
              <Sparkle size={s.size} />
            </motion.span>
          ))}

          {/* Decorative curve */}
          <svg style={{ position: 'absolute', bottom: '8%', left: '10%', opacity: 0.15 }}
            width="100" height="40" viewBox="0 0 100 40" fill="none">
            <path d="M 5 35 Q 50 5 95 35" stroke="#0a0a0a" strokeWidth="2" fill="none" strokeLinecap="round" />
          </svg>

          {/* Card: Metal SLS — back left */}
          <motion.div
            initial={{ opacity: 0, scale: 0.75, rotate: -16, x: -30 }}
            animate={{ opacity: 1, scale: 1, rotate: -8, x: 0 }}
            transition={{ delay: 0.4, duration: 1, type: 'spring', stiffness: 80, damping: 16 }}
            className="float-card-a"
            style={{ position: 'absolute', left: '4%', top: '10%', zIndex: 1 }}
          >
            <MachineCard
              title="Laser Sintering Titanium"
              category="Metal SLS"
              rate="$200/hr"
              imageSrc="/Laser_sintering_titanium_powder.jpeg"
            />
          </motion.div>

          {/* Card: 5-Axis CNC — back right */}
          <motion.div
            initial={{ opacity: 0, scale: 0.75, rotate: 14, x: 30 }}
            animate={{ opacity: 1, scale: 1, rotate: 6, x: 0 }}
            transition={{ delay: 0.58, duration: 1, type: 'spring', stiffness: 80, damping: 16 }}
            className="float-card-b"
            style={{ position: 'absolute', right: '4%', top: '20%', zIndex: 2 }}
          >
            <MachineCard
              title="CNC Spindle Carving Titanium"
              category="5-Axis CNC"
              rate="$120/hr"
              imageSrc="/CNC_spindle_carving_titanium.jpeg"
            />
          </motion.div>

          {/* Card: Industrial FDM — front center */}
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.85 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.76, duration: 0.9, type: 'spring', stiffness: 90 }}
            style={{
              position: 'absolute', bottom: '4%', left: '22%', zIndex: 3,
              boxShadow: '0 20px 60px rgba(0,0,0,0.18)', borderRadius: '16px',
            }}
          >
            <MachineCard
              title="Industrial 3D Printer"
              category="Industrial FDM"
              rate="$45/hr"
              imageSrc="/Industrial_3D_printer.jpeg"
            />
          </motion.div>

          {/* Live badge */}
          <motion.div
            initial={{ opacity: 0, x: 30, scale: 0.85 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ delay: 1.0, duration: 0.55, type: 'spring', stiffness: 100 }}
            style={{
              position: 'absolute', top: '8%', right: '0%', zIndex: 4,
              background: '#fff', border: '1.5px solid #e4e4e7', borderRadius: '12px',
              padding: '10px 14px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              display: 'flex', alignItems: 'center', gap: '8px',
            }}
          >
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#16a34a', display: 'inline-block', animation: 'ping-dot 1.8s ease-in-out infinite' }} />
            <span style={{ fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 600, color: '#0a0a0a' }}>
              {telemetry.networkStatus}
            </span>
          </motion.div>

          {/* Telemetry badge */}
          <motion.div
            initial={{ opacity: 0, x: -30, scale: 0.85 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ delay: 1.15, duration: 0.55, type: 'spring', stiffness: 100 }}
            style={{
              position: 'absolute', bottom: '22%', right: '2%', zIndex: 4,
              background: '#0a0a0a', borderRadius: '12px', padding: '10px 16px',
              display: 'flex', flexDirection: 'column', gap: '2px',
            }}
          >
            <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: '#71717a', fontWeight: 500 }}>Active Printers</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>
              <AnimatedCounter target={1204} duration={2.2} />
            </div>
          </motion.div>
        </div>
      </div>

      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: '80px',
        background: 'linear-gradient(transparent, rgba(255,255,255,0.8))',
        pointerEvents: 'none',
      }} />
    </section>
  );
}
