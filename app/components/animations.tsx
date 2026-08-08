'use client';

/**
 * ── Animation Utilities ─────────────────────────────────────────
 *
 * Shared hooks and components for scroll-triggered, staggered,
 * and typographic entry animations across the entire landing page.
 */

import { motion, useInView, useAnimation, Variants } from 'framer-motion';
import { useRef, useEffect, useState, ElementType } from 'react';

// ── Easing presets ──────────────────────────────────────────────
export const ease = {
  smooth: [0.25, 0.46, 0.45, 0.94] as const,
  spring: { type: 'spring', stiffness: 80, damping: 18 } as const,
  snappy: [0.22, 1, 0.36, 1] as const,
};

// ── Shared Framer Motion variants ───────────────────────────────

/** A single word/element that slides up + fades in */
export const wordVariant: Variants = {
  hidden: {
    opacity: 0,
    y: 32,
    filter: 'blur(6px)',
  },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 0.55,
      ease: ease.snappy,
    },
  },
};

/** Container that staggers its children */
export function makeStaggerContainer(staggerSec = 0.07, delaySec = 0): Variants {
  return {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: staggerSec,
        delayChildren: delaySec,
      },
    },
  };
}

/** Fade up — generic element reveal */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24, filter: 'blur(4px)' },
  visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.55, ease: ease.snappy } },
};

/** Fade in — no movement, just opacity */
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.7, ease: ease.smooth },
  },
};

/** Slide in from left */
export const slideLeft: Variants = {
  hidden: { opacity: 0, x: -40 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.7, ease: ease.snappy },
  },
};

/** Slide in from right */
export const slideRight: Variants = {
  hidden: { opacity: 0, x: 40 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.7, ease: ease.snappy },
  },
};

/** Scale up from slightly smaller */
export const scaleUp: Variants = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.6, ease: ease.snappy },
  },
};

// ── Word-by-Word Animated Heading ────────────────────────────────

interface AnimatedHeadingProps {
  text: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span';
  style?: React.CSSProperties;
  className?: string;
  stagger?: number;
  delay?: number;
  /** If true, triggers on scroll (whileInView). False = triggers on mount. */
  onScroll?: boolean;
  once?: boolean;
}

export function AnimatedHeading({
  text,
  as: Tag = 'h2',
  style,
  className,
  stagger = 0.08,
  delay = 0,
  onScroll = true,
  once = true,
}: AnimatedHeadingProps) {
  const words = text.split(' ');
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once, amount: 0.4 });

  const container: Variants = {
    hidden: {},
    visible: {
      transition: { staggerChildren: stagger, delayChildren: delay },
    },
  };

  const word: Variants = {
    hidden: { opacity: 0, y: 28, filter: 'blur(5px)' },
    visible: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: { duration: 0.6, ease: ease.snappy },
    },
  };

  const animateState = onScroll ? (isInView ? 'visible' : 'hidden') : 'visible';

  return (
    <motion.div
      ref={containerRef}
      variants={container}
      initial="hidden"
      animate={animateState}
      style={{ overflow: 'hidden' }}
    >
      <Tag style={{ ...style, display: 'flex', flexWrap: 'wrap', gap: '0.22em' }} className={className}>
        {words.map((w, i) => (
          <motion.span
            key={i}
            variants={word}
            style={{ display: 'inline-block', lineHeight: 'inherit' }}
          >
            {w}
          </motion.span>
        ))}
      </Tag>
    </motion.div>
  );
}

// ── Line-by-Line Body Text ───────────────────────────────────────

interface AnimatedBodyProps {
  text: string;
  style?: React.CSSProperties;
  className?: string;
  delay?: number;
  once?: boolean;
}

export function AnimatedBody({
  text,
  style,
  className,
  delay = 0,
  once = true,
}: AnimatedBodyProps) {
  const ref = useRef<HTMLParagraphElement>(null);
  const isInView = useInView(ref, { once, amount: 0.5 });

  return (
    <motion.p
      ref={ref}
      variants={fadeUp}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      transition={{ delay, duration: 0.65, ease: ease.snappy }}
      style={style}
      className={className}
    >
      {text}
    </motion.p>
  );
}

// ── Scroll-triggered Reveal Wrapper ─────────────────────────────

interface RevealProps {
  children: React.ReactNode;
  delay?: number;
  variants?: Variants;
  style?: React.CSSProperties;
  className?: string;
  amount?: number;
  once?: boolean;
  as?: ElementType;
}

export function Reveal({
  children,
  delay = 0,
  variants = fadeUp,
  style,
  className,
  amount = 0.3,
  once = true,
  as = 'div',
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref as React.RefObject<Element>, { once, amount });
  const Tag = motion[as as keyof typeof motion] as typeof motion.div;

  return (
    <Tag
      ref={ref as any}
      variants={variants}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      custom={delay}
      style={style}
      className={className}
      transition={{ delay }}
    >
      {children}
    </Tag>
  );
}

// ── Stagger Container ────────────────────────────────────────────

interface StaggerProps {
  children: React.ReactNode;
  stagger?: number;
  delay?: number;
  style?: React.CSSProperties;
  className?: string;
  amount?: number;
  once?: boolean;
}

export function StaggerReveal({
  children,
  stagger = 0.1,
  delay = 0,
  style,
  className,
  amount = 0.2,
  once = true,
}: StaggerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once, amount });

  const container: Variants = {
    hidden: {},
    visible: {
      transition: { staggerChildren: stagger, delayChildren: delay },
    },
  };

  return (
    <motion.div
      ref={ref}
      variants={container}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      style={style}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/** Wrap direct children of StaggerReveal with this */
export function StaggerItem({
  children,
  variants = fadeUp,
  style,
  className,
}: {
  children: React.ReactNode;
  variants?: Variants;
  style?: React.CSSProperties;
  className?: string;
}) {
  return (
    <motion.div variants={variants} style={style} className={className}>
      {children}
    </motion.div>
  );
}

// ── Animated Number Counter ──────────────────────────────────────

interface CounterProps {
  target: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
  style?: React.CSSProperties;
  className?: string;
}

export function AnimatedCounter({
  target,
  suffix = '',
  prefix = '',
  duration = 1.8,
  style,
  className,
}: CounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.8 });
  const [count, setCount] = useState(0);
  const hasRun = useRef(false);

  useEffect(() => {
    if (!isInView || hasRun.current) return;
    hasRun.current = true;

    const steps = 60;
    const increment = target / steps;
    let current = 0;
    let frame = 0;

    const tick = () => {
      frame++;
      // Ease out: decelerate towards end
      const progress = frame / steps;
      const eased = 1 - Math.pow(1 - progress, 3);
      current = Math.round(eased * target);
      setCount(current);
      if (frame < steps) {
        setTimeout(tick, (duration * 1000) / steps);
      } else {
        setCount(target);
      }
    };

    tick();
  }, [isInView, target, duration]);

  return (
    <span ref={ref} style={style} className={className}>
      {prefix}{count.toLocaleString()}{suffix}
    </span>
  );
}

// ── Section Badge reveal ─────────────────────────────────────────

export function RevealBadge({
  children,
  delay = 0,
  style,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  style?: React.CSSProperties;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.6 });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.85, y: 10 }}
      animate={isInView ? { opacity: 1, scale: 1, y: 0 } : {}}
      transition={{ delay, duration: 0.5, ease: ease.snappy }}
      style={style}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ── Scroll Progress Bar ──────────────────────────────────────────

export function ScrollProgressBar() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const update = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(total > 0 ? (window.scrollY / total) * 100 : 0);
    };
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        height: '2px',
        width: `${progress}%`,
        background: 'linear-gradient(90deg, #0a0a0a 0%, #52525b 100%)',
        zIndex: 200,
        transition: 'width 0.1s linear',
        transformOrigin: 'left',
      }}
    />
  );
}
