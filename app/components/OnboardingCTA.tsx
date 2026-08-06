'use client';

import { motion } from 'framer-motion';
import { platformContent } from '../config/content';
import { ArrowRight } from 'lucide-react';
import { AnimatedHeading, AnimatedBody, Reveal, RevealBadge, ease } from './animations';

function Sparkle({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0 L13.8 10.2 L24 12 L13.8 13.8 L12 24 L10.2 13.8 L0 12 L10.2 10.2 Z" />
    </svg>
  );
}

export default function OnboardingCTA() {
  const { title, ctaBorrow, ctaLend } = platformContent.onboarding;

  return (
    <section style={{
      background: '#fafafa', padding: '80px 40px',
      borderTop: '1.5px solid #e4e4e7',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Decorative sparkles — appear on scroll */}
      {[
        { top: '20%', left: '6%', size: 40, dur: 10, delay: 0.3, opacity: 0.15 },
        { bottom: '18%', right: '8%', size: 28, dur: 7, delay: 0.5, opacity: 0.1, reverse: true },
        { top: '55%', right: '15%', size: 18, dur: 12, delay: 0.7, opacity: 0.08 },
      ].map((s, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0.5 }}
          whileInView={{ opacity: s.opacity, scale: 1 }}
          transition={{ delay: s.delay, duration: 0.6 }}
          viewport={{ once: true }}
          style={{
            position: 'absolute',
            top: (s as any).top, left: (s as any).left,
            bottom: (s as any).bottom, right: (s as any).right,
            color: '#0a0a0a',
            animation: `sparkle-spin ${s.dur}s linear infinite${(s as any).reverse ? ' reverse' : ''}`,
            pointerEvents: 'none',
          }}
        >
          <Sparkle size={s.size} />
        </motion.div>
      ))}

      <div style={{ maxWidth: '720px', margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>

        {/* Decorative lines + badge */}
        <Reveal>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', marginBottom: '24px' }}>
            <motion.div
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              transition={{ duration: 0.6, ease: ease.snappy }}
              viewport={{ once: true }}
              style={{ height: '1px', width: '60px', background: '#e4e4e7', transformOrigin: 'right' }}
            />
            <span className="section-label">Get Started Today</span>
            <motion.div
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              transition={{ duration: 0.6, ease: ease.snappy }}
              viewport={{ once: true }}
              style={{ height: '1px', width: '60px', background: '#e4e4e7', transformOrigin: 'left' }}
            />
          </div>
        </Reveal>

        {/* Heading — word by word */}
        <AnimatedHeading
          text={title}
          as="h2"
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(2rem, 5vw, 3.8rem)',
            fontWeight: 800, color: '#0a0a0a',
            letterSpacing: '-0.035em', lineHeight: 1.08,
            marginBottom: '20px', justifyContent: 'center',
          }}
          stagger={0.065}
          delay={0.1}
        />

        {/* Body */}
        <AnimatedBody
          text="Join thousands of manufacturers already running on the IndustriLease network. Zero CapEx, instant access."
          delay={0.35}
          style={{
            fontFamily: 'var(--font-body)', fontSize: '15px', color: '#71717a',
            lineHeight: 1.75, marginBottom: '40px',
            maxWidth: '520px', margin: '0 auto 40px',
          }}
        />

        {/* CTAs */}
        <Reveal delay={0.5} style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <motion.button
            className="btn-dark"
            style={{ fontSize: '15px', padding: '14px 32px' }}
            whileHover={{ scale: 1.04, y: -2 }}
            whileTap={{ scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            {ctaBorrow} <ArrowRight size={16} />
          </motion.button>
          <motion.button
            className="btn-outline"
            style={{ fontSize: '15px', padding: '14px 32px' }}
            whileHover={{ scale: 1.04, y: -2 }}
            whileTap={{ scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            {ctaLend}
          </motion.button>
        </Reveal>
      </div>
    </section>
  );
}
