'use client';

import { platformContent } from '../config/content';
import { AnimatedHeading, AnimatedBody, Reveal, RevealBadge } from './animations';

export default function About() {
  const { title, description } = platformContent.about;

  return (
    <section style={{
      background: '#fafafa', padding: '72px 40px',
      borderTop: '1.5px solid #e4e4e7',
    }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>

        <RevealBadge style={{ marginBottom: '16px' }}>
          <span className="section-label">About IndustriLease</span>
        </RevealBadge>

        <AnimatedHeading
          text={title}
          as="h2"
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(1.6rem, 3.5vw, 2.4rem)',
            fontWeight: 800, color: '#0a0a0a',
            letterSpacing: '-0.025em', marginBottom: '20px',
            justifyContent: 'center',
          }}
          stagger={0.06}
          delay={0.05}
        />

        <AnimatedBody
          text={description}
          delay={0.25}
          style={{
            fontFamily: 'var(--font-body)', fontSize: '15px',
            color: '#52525b', lineHeight: 1.8,
            maxWidth: '660px', margin: '0 auto',
          }}
        />
      </div>
    </section>
  );
}
