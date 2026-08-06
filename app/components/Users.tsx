'use client';

import { motion } from 'framer-motion';
import { platformContent } from '../config/content';
import { CheckCircle2 } from 'lucide-react';
import { AnimatedHeading, Reveal, StaggerReveal, StaggerItem, RevealBadge, ease, fadeUp, slideLeft, slideRight } from './animations';

export default function Users() {
  const { borrowers, lenders } = platformContent.users;

  return (
    <section style={{ background: '#fff', padding: '64px 40px', borderTop: '1.5px solid #e4e4e7' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <RevealBadge style={{ marginBottom: '12px' }}>
            <span className="section-label">Who It&apos;s For</span>
          </RevealBadge>
          <AnimatedHeading
            text="Built for Both Sides of Manufacturing"
            as="h2"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(1.5rem, 3vw, 2.2rem)',
              fontWeight: 800, color: '#0a0a0a',
              letterSpacing: '-0.025em', margin: 0,
              justifyContent: 'center',
            }}
            stagger={0.055}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>

          {/* Borrowers — slide from left */}
          <Reveal variants={slideLeft}>
            <motion.div
              style={{
                background: '#0a0a0a', borderRadius: '20px', padding: '36px', color: '#fff',
                height: '100%',
              }}
              whileHover={{ y: -4, boxShadow: '0 20px 60px rgba(0,0,0,0.25)' }}
              transition={{ type: 'spring', stiffness: 200, damping: 22 }}
            >
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                background: 'rgba(255,255,255,0.1)', borderRadius: '999px',
                padding: '5px 14px', marginBottom: '24px',
              }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#fff', display: 'inline-block' }} />
                <span style={{ fontFamily: 'var(--font-body)', fontSize: '12px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' as const }}>
                  Borrowers
                </span>
              </div>

              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.025em', marginBottom: '6px' }}>
                {borrowers.title}
              </h3>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px', fontWeight: 600, color: 'rgba(255,255,255,0.5)', marginBottom: '28px' }}>
                {borrowers.subtitle}
              </p>

              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {borrowers.features.map((f, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -16 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + i * 0.12, duration: 0.5, ease: ease.snappy }}
                    viewport={{ once: true }}
                    style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}
                  >
                    <CheckCircle2 size={17} style={{ color: 'rgba(255,255,255,0.6)', flexShrink: 0, marginTop: '1px' }} />
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'rgba(255,255,255,0.75)', lineHeight: 1.6 }}>
                      {f}
                    </span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          </Reveal>

          {/* Lenders — slide from right */}
          <Reveal variants={slideRight}>
            <motion.div
              style={{
                background: '#fafafa', border: '1.5px solid #e4e4e7',
                borderRadius: '20px', padding: '36px', height: '100%',
              }}
              whileHover={{ y: -4, boxShadow: '0 20px 60px rgba(0,0,0,0.08)', borderColor: '#a1a1aa' }}
              transition={{ type: 'spring', stiffness: 200, damping: 22 }}
            >
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                background: '#fff', border: '1.5px solid #e4e4e7',
                borderRadius: '999px', padding: '5px 14px', marginBottom: '24px',
              }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#0a0a0a', display: 'inline-block' }} />
                <span style={{ fontFamily: 'var(--font-body)', fontSize: '12px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' as const, color: '#0a0a0a' }}>
                  Lenders
                </span>
              </div>

              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 800, color: '#0a0a0a', letterSpacing: '-0.025em', marginBottom: '6px' }}>
                {lenders.title}
              </h3>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px', fontWeight: 600, color: '#71717a', marginBottom: '28px' }}>
                {lenders.subtitle}
              </p>

              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {lenders.features.map((f, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: 16 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + i * 0.12, duration: 0.5, ease: ease.snappy }}
                    viewport={{ once: true }}
                    style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}
                  >
                    <CheckCircle2 size={17} style={{ color: '#0a0a0a', flexShrink: 0, marginTop: '1px' }} />
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: '#52525b', lineHeight: 1.6 }}>
                      {f}
                    </span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          </Reveal>

        </div>
      </div>
    </section>
  );
}
