'use client';

import { platformContent } from '../config/content';
import { Search, Menu } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Header() {
  const { logo, ctaBorrow, ctaLend } = platformContent.header;
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0,
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 40px',
        height: '64px',
        background: scrolled ? 'rgba(255,255,255,0.92)' : 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: scrolled ? '1.5px solid #e4e4e7' : '1.5px solid transparent',
        transition: 'all 0.3s ease',
      }}
    >
      {/* Left nav */}
      <nav style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
        <a
          href="#"
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '14px',
            fontWeight: 500,
            color: '#52525b',
            textDecoration: 'none',
            transition: 'color 0.2s',
          }}
          onMouseEnter={e => (e.currentTarget.style.color = '#0a0a0a')}
          onMouseLeave={e => (e.currentTarget.style.color = '#52525b')}
        >
          Equipment
        </a>
        <a
          href="#"
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '14px',
            fontWeight: 500,
            color: '#52525b',
            textDecoration: 'none',
            transition: 'color 0.2s',
          }}
          onMouseEnter={e => (e.currentTarget.style.color = '#0a0a0a')}
          onMouseLeave={e => (e.currentTarget.style.color = '#52525b')}
        >
          How It Works
        </a>
        <a
          href="#"
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '14px',
            fontWeight: 500,
            color: '#52525b',
            textDecoration: 'none',
            transition: 'color 0.2s',
          }}
          onMouseEnter={e => (e.currentTarget.style.color = '#0a0a0a')}
          onMouseLeave={e => (e.currentTarget.style.color = '#52525b')}
        >
          Docs
        </a>
      </nav>

      {/* Center logo */}
      <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
        <span
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '20px',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            color: '#0a0a0a',
          }}
        >
          ⬡ {logo}
        </span>
      </div>

      {/* Right actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button
          aria-label="Search"
          style={{
            width: '36px', height: '36px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'transparent',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            color: '#52525b',
            transition: 'background 0.2s',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = '#f4f4f5')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
        >
          <Search size={18} />
        </button>

        <button className="btn-outline" style={{ padding: '8px 20px', fontSize: '13px' }}>
          {ctaLend}
        </button>
        <button className="btn-dark" style={{ padding: '8px 20px', fontSize: '13px' }}>
          {ctaBorrow}
        </button>
      </div>
    </header>
  );
}
