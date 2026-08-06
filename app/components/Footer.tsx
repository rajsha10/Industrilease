'use client';

import { motion } from 'framer-motion';
import { platformContent } from '../config/content';
import { Reveal, StaggerReveal, StaggerItem, ease, fadeUp } from './animations';

export default function Footer() {
  const { logo } = platformContent.header;
  const { description, links } = platformContent.footer;

  return (
    <footer style={{ background: '#0a0a0a', color: '#fff', padding: '48px 40px 32px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

        {/* Top row */}
        <div style={{
          display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
          gap: '40px', flexWrap: 'wrap',
          paddingBottom: '36px', borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: '24px',
        }}>
          {/* Brand */}
          <Reveal variants={fadeUp} style={{ maxWidth: '280px' }}>
            <motion.span
              style={{
                fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 800,
                letterSpacing: '-0.03em', color: '#fff', display: 'block', marginBottom: '10px',
              }}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: ease.snappy }}
              viewport={{ once: true }}
            >
              ⬡ {logo}
            </motion.span>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'rgba(255,255,255,0.4)', lineHeight: 1.7 }}>
              {description} Powered by autonomous AI agents, parametric escrow, and cryptographic telemetry.
            </p>
          </Reveal>

          {/* Links — staggered */}
          <StaggerReveal stagger={0.06} delay={0.1} style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
            {links.map((link, i) => (
              <StaggerItem key={i}>
                <motion.a
                  href="#"
                  style={{ fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 500, color: 'rgba(255,255,255,0.45)', textDecoration: 'none' }}
                  whileHover={{ color: 'rgba(255,255,255,0.9)', x: 2 }}
                  transition={{ duration: 0.18 }}
                >
                  {link}
                </motion.a>
              </StaggerItem>
            ))}
          </StaggerReveal>
        </div>

        {/* Bottom row */}
        <Reveal delay={0.3} style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px',
        }}>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'rgba(255,255,255,0.3)' }}>
            © {new Date().getFullYear()} {logo}. All rights reserved. Industrial 5.0 DePIN Marketplace.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#22c55e', display: 'inline-block', animation: 'ping-dot 2s ease-in-out infinite' }} />
            <span style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>
              All Systems Operational
            </span>
          </div>
        </Reveal>
      </div>
    </footer>
  );
}
