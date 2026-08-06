'use client';

import { motion } from 'framer-motion';
import { platformContent } from '../config/content';
import { ShieldCheck, Lock, Cpu } from 'lucide-react';
import { AnimatedHeading, Reveal, StaggerReveal, StaggerItem, RevealBadge, ease, scaleUp } from './animations';

const iconMap = { ShieldCheck, Lock, Cpu };

function Sparkle({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0 L13.8 10.2 L24 12 L13.8 13.8 L12 24 L10.2 13.8 L0 12 L10.2 10.2 Z" />
    </svg>
  );
}

const DISCOVER_TABS = ['Music', 'Sport', 'Art', 'Photography', 'Metaverse', 'Trading Card', 'Virtual World'];

export default function Offers() {
  const { title, items } = platformContent.offers;

  return (
    <section style={{ background: '#fff', padding: '64px 40px', borderTop: '1.5px solid #e4e4e7' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

        {/* Header */}
        <Reveal style={{ marginBottom: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <motion.span animate={{ rotate: 360 }} transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}>
              <Sparkle size={16} />
            </motion.span>
            <AnimatedHeading
              text={title}
              as="h2"
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(1.5rem, 3vw, 2rem)',
                fontWeight: 800, color: '#0a0a0a',
                letterSpacing: '-0.025em', margin: 0,
              }}
              stagger={0.08}
            />
          </div>

          {/* Filter tabs */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '16px' }}>
            {DISCOVER_TABS.map((tab, i) => (
              <motion.button
                key={i}
                className="pill"
                initial={{ opacity: 0, scale: 0.85 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.05 * i, duration: 0.4, ease: ease.snappy }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.06 }}
                style={i === 2 ? { background: '#0a0a0a', color: '#fff', borderColor: 'transparent' } : {}}
              >
                {tab}
              </motion.button>
            ))}
          </div>
        </Reveal>

        {/* Feature cards — staggered scale-up */}
        <StaggerReveal stagger={0.12} delay={0.1} style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px',
        }}>
          {items.map((prop, index) => {
            const Icon = iconMap[prop.icon as keyof typeof iconMap];
            return (
              <StaggerItem key={index} variants={scaleUp}>
                <motion.div
                  style={{
                    background: '#fafafa', border: '1.5px solid #e4e4e7',
                    borderRadius: '16px', padding: '28px',
                    height: '100%',
                  }}
                  whileHover={{
                    borderColor: '#a1a1aa',
                    y: -4,
                    boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
                  }}
                  transition={{ duration: 0.25 }}
                >
                  <motion.div
                    style={{
                      width: '44px', height: '44px', borderRadius: '12px',
                      background: '#fff', border: '1.5px solid #e4e4e7',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      marginBottom: '20px',
                    }}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 18 }}
                  >
                    <Icon size={20} color="#0a0a0a" />
                  </motion.div>

                  <h3 style={{
                    fontFamily: 'var(--font-display)', fontSize: '17px', fontWeight: 800,
                    color: '#0a0a0a', letterSpacing: '-0.02em', marginBottom: '10px',
                  }}>
                    {prop.title}
                  </h3>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: '13.5px', color: '#71717a', lineHeight: 1.7 }}>
                    {prop.description}
                  </p>
                </motion.div>
              </StaggerItem>
            );
          })}
        </StaggerReveal>
      </div>
    </section>
  );
}
