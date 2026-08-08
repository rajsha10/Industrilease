'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { platformContent } from '../config/content';
import { AnimatedHeading, Reveal, StaggerReveal, StaggerItem, RevealBadge, ease, fadeUp, scaleUp } from './animations';
import Link from 'next/link';

const MotionLink = motion(Link);

const STEP_DOTS = ['#0a0a0a', '#0a0a0a', '#0a0a0a', '#0a0a0a'];

export default function Workflow() {
  const { title, steps } = platformContent.workflow;

  return (
    <section id="how-it-works" style={{ background: '#fafafa', padding: '64px 40px', borderTop: '1.5px solid #e4e4e7' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

        {/* Header row */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: '28px', flexWrap: 'wrap', gap: '16px',
        }}>
          <Reveal>
            <AnimatedHeading
              text={title}
              as="h2"
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(1.5rem, 3vw, 2rem)',
                fontWeight: 800, color: '#0a0a0a',
                letterSpacing: '-0.025em', margin: 0,
              }}
              stagger={0.07}
            />
          </Reveal>

          <Reveal delay={0.2}>
            <div style={{
              display: 'flex', gap: '4px', background: '#f4f4f5',
              borderRadius: '10px', padding: '4px',
              border: '1.5px solid #e4e4e7',
            }}>
              {['List', 'Verify', 'Execute', 'Settle'].map((label, i) => (
                <button key={i} style={{
                  padding: '6px 14px', borderRadius: '7px',
                  fontFamily: 'var(--font-body)', fontSize: '12px', fontWeight: 700,
                  border: 'none', cursor: 'pointer', transition: 'all 0.18s',
                  background: i === 0 ? '#0a0a0a' : 'transparent',
                  color: i === 0 ? '#fff' : '#71717a',
                }}>
                  {label}
                </button>
              ))}
            </div>
          </Reveal>
        </div>

        {/* Steps grid — each step enters in sequence */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0',
          background: '#fff', border: '1.5px solid #e4e4e7',
          borderRadius: '16px', overflow: 'hidden',
        }}>
          {steps.map((step, index) => (
            <Reveal
              key={index}
              delay={index * 0.14}
              variants={{
                hidden: {
                  opacity: 0,
                  x: index % 2 === 0 ? -30 : 30,
                  y: 10,
                },
                visible: {
                  opacity: 1,
                  x: 0,
                  y: 0,
                  transition: { duration: 0.65, ease: ease.snappy },
                },
              }}
            >
              <motion.div
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: '16px',
                  padding: '20px 24px',
                  borderBottom: index < 2 ? '1.5px solid #f4f4f5' : 'none',
                  borderRight: index % 2 === 0 ? '1.5px solid #f4f4f5' : 'none',
                  background: '#fff',
                  cursor: 'default',
                }}
                whileHover={{ background: '#fafafa' }}
                transition={{ duration: 0.2 }}
              >
                {/* Number */}
                <span style={{
                  fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 800,
                  color: '#e4e4e7', letterSpacing: '-0.02em', lineHeight: 1,
                  flexShrink: 0, marginTop: '2px', width: '32px',
                }}>
                  {step.number}
                </span>

                {/* Content */}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '15px', fontWeight: 800, color: '#0a0a0a', letterSpacing: '-0.01em' }}>
                      {step.title}
                    </h3>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: '13px', fontWeight: 800, color: '#0a0a0a' }}>Step {step.number}</div>
                      <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: '#16a34a', fontWeight: 600 }}>Automated</div>
                    </div>
                  </div>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: '#71717a', lineHeight: 1.65 }}>
                    {step.description}
                  </p>
                </div>
              </motion.div>
            </Reveal>
          ))}
        </div>

        {/* See all link */}
        <Reveal delay={0.5} style={{ textAlign: 'center', marginTop: '20px' }}>
          <MotionLink
            href="/how-it-works"
            style={{
              fontFamily: 'var(--font-body)', fontSize: '14px', fontWeight: 600, color: '#0a0a0a',
              textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px',
              padding: '10px 24px', border: '1.5px solid #e4e4e7', borderRadius: '999px',
            }}
            whileHover={{ background: '#0a0a0a', color: '#fff', borderColor: '#0a0a0a', scale: 1.03 }}
            transition={{ duration: 0.22 }}
          >
            View Full Workflow Documentation →
          </MotionLink>
        </Reveal>
      </div>
    </section>
  );
}
