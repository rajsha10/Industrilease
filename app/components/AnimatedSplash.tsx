'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { platformContent } from '../config/content';
import Link from 'next/link';

const MotionLink = motion(Link);
import { AnimatedHeading, Reveal, StaggerReveal, StaggerItem, ease } from './animations';

const TRUST_LOGOS = [
  { name: 'EIP-712', tag: 'Standard' },
  { name: 'ERC-1155', tag: 'Token' },
  { name: 'ERC-7579', tag: 'Session' },
  { name: 'Chainlink', tag: 'Oracle' },
  { name: 'Arbitrum', tag: 'L2' },
];

const CATEGORIES = [
  'Industrial FDM', '5-Axis CNC', 'Metal SLS', 'Laser Cutter',
  'Robotic Arm', 'Injection Mold', 'Wire EDM', 'Waterjet',
  'Electron Beam', 'Plasma Cutter',
];

export default function AnimatedSplash() {
  const { nodes } = platformContent.splash;
  const logosRef = useRef<HTMLDivElement>(null);
  const logosInView = useInView(logosRef, { once: true, amount: 0.4 });

  return (
    <section style={{ background: '#fff', borderTop: '1.5px solid #e4e4e7' }}>

      {/* ── Trust logos — staggered fade in ── */}
      <div
        ref={logosRef}
        style={{
          maxWidth: '1200px', margin: '0 auto',
          padding: '28px 40px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: '48px', flexWrap: 'wrap',
          borderBottom: '1.5px solid #e4e4e7',
        }}
      >
        {TRUST_LOGOS.map((logo, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 14, filter: 'blur(4px)' }}
            animate={logosInView ? { opacity: 0.35, y: 0, filter: 'blur(0px)' } : {}}
            transition={{ delay: i * 0.1, duration: 0.6, ease: ease.snappy }}
            whileHover={{ opacity: 0.65, scale: 1.05 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'default' }}
          >
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: 800, color: '#0a0a0a', letterSpacing: '-0.02em' }}>
              {logo.name}
            </span>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: '10px', fontWeight: 600, color: '#71717a', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              {logo.tag}
            </span>
          </motion.div>
        ))}
      </div>

      {/* ── Equipment Categories — title reveal ── */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 40px 20px' }}>
        <Reveal style={{ textAlign: 'center' }}>
          <AnimatedHeading
            text="Equipment Categories"
            as="h2"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '22px', fontWeight: 800, color: '#0a0a0a',
              letterSpacing: '-0.02em', margin: 0, justifyContent: 'center',
            }}
          />
        </Reveal>
      </div>

      {/* ── Marquee pill rows ── */}
      <Reveal delay={0.2} style={{ overflow: 'hidden', paddingBottom: '16px' }}>
        {/* Top row — left scroll */}
        <div style={{ display: 'flex', gap: '12px', overflow: 'hidden', marginBottom: '12px' }}>
          <div className="marquee-track">
            {[...CATEGORIES, ...CATEGORIES].map((cat, i) => (
              <div key={i} className={`pill ${i === 0 || i === CATEGORIES.length ? 'active' : ''}`}>
                <span style={{
                  width: '6px', height: '6px', borderRadius: '50%',
                  background: (i === 0 || i === CATEGORIES.length) ? '#fff' : '#a1a1aa',
                  display: 'inline-block', flexShrink: 0,
                }} />
                {cat}
              </div>
            ))}
          </div>
        </div>
        {/* Bottom row — right scroll */}
        <div style={{ display: 'flex', gap: '12px', overflow: 'hidden' }}>
          <div className="marquee-track" style={{ animationDirection: 'reverse', animationDuration: '22s' }}>
            {[...CATEGORIES.slice(5), ...CATEGORIES.slice(0, 5), ...CATEGORIES.slice(5), ...CATEGORIES.slice(0, 5)].map((cat, i) => (
              <div key={i} className="pill" style={{ background: '#f9f9f9' }}>{cat}</div>
            ))}
          </div>
        </div>
      </Reveal>

      {/* ── Node/verification badges — staggered reveal ── */}
      <StaggerReveal
        stagger={0.1}
        delay={0.1}
        style={{
          display: 'flex', justifyContent: 'center', gap: '12px',
          flexWrap: 'wrap', padding: '20px 40px 40px',
          borderTop: '1.5px solid #f4f4f5', marginTop: '8px',
        }}
      >
        {nodes.map((node, i) => (
          <StaggerItem key={i}>
            <motion.div
              className="pill"
              style={{ background: '#0a0a0a', color: '#fff', borderColor: 'transparent' }}
              whileHover={{ scale: 1.05, y: -2 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              ✓ {node}
            </motion.div>
          </StaggerItem>
        ))}
        <StaggerItem>
          <MotionLink
            href="/marketplace"
            className="pill"
            style={{ background: '#f4f4f5', color: '#0a0a0a', fontWeight: 700, textDecoration: 'none' }}
            whileHover={{ scale: 1.05, y: -2 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            All Categories →
          </MotionLink>
        </StaggerItem>
      </StaggerReveal>
    </section>
  );
}
