'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Shield,
  Key,
  Activity,
  Clock,
  Zap,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Power,
  Settings,
  TrendingDown,
  Thermometer,
  Moon,
  Sun,
  ToggleLeft,
  ToggleRight,
  Save,
  ExternalLink,
  Copy,
  ChevronRight,
  Lock,
  Unlock,
  Terminal,
  Cpu,
  Radio,
  Database,
  Timer,
  Ban,
  Check,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
type AgentStatus = 'ACTIVE' | 'PAUSED' | 'EXPIRED';

interface AgentGovernanceState {
  agentAddress: string;
  sessionValidUntil: number;
  isSessionActive: boolean;
  authorizedSelectors: string[];
  autoListIdleThresholdMinutes: number;
  defaultSlotDurationHours: number;
  offPeakStartHour: number;
  offPeakEndHour: number;
  maxOffPeakDiscountPercent: number;
  minHourlyPriceFloorUSDC: number;
  maxContinuousRunHours: number;
  cooldownPeriodMinutes: number;
  maxDailyJobCap: number;
}

// ─── Easing ───────────────────────────────────────────────────────────────────
const ease = {
  snappy: [0.22, 1, 0.36, 1] as const,
  smooth: [0.25, 0.46, 0.45, 0.94] as const,
};

// ─── Mock initial state ───────────────────────────────────────────────────────
const INITIAL_STATE: AgentGovernanceState = {
  agentAddress: '0x4a2f8c1d3e9b7f5a2c6d8e1f3a4b5c6d7e8f9a0b',
  sessionValidUntil: Date.now() + 18 * 3600 * 1000 + 42 * 60 * 1000,
  isSessionActive: true,
  authorizedSelectors: ['mintSlot', 'submitLayerProof'],
  autoListIdleThresholdMinutes: 120,
  defaultSlotDurationHours: 6,
  offPeakStartHour: 22,
  offPeakEndHour: 6,
  maxOffPeakDiscountPercent: 25,
  minHourlyPriceFloorUSDC: 80,
  maxContinuousRunHours: 18,
  cooldownPeriodMinutes: 120,
  maxDailyJobCap: 4,
};

// ─── Selectors registry ───────────────────────────────────────────────────────
const FUNCTION_SELECTORS = [
  {
    id: 'mintSlot',
    contract: 'MachineSlotToken',
    fn: 'mintSlot()',
    selector: '0x4e1a3520',
    allowed: true,
    description: 'Agent can publish time-slot NFTs for idle machines',
  },
  {
    id: 'submitLayerProof',
    contract: 'IndustriLeaseEscrow',
    fn: 'submitLayerProof()',
    selector: '0x7c8a9f12',
    allowed: true,
    description: 'Agent can stream signed telemetry proofs on-chain',
  },
  {
    id: 'updateSlotPrice',
    contract: 'MachineSlotToken',
    fn: 'updateSlotPrice()',
    selector: '0x3b1d5e78',
    allowed: true,
    description: 'Agent can adjust dynamic pricing within floor limits',
  },
  {
    id: 'transfer',
    contract: 'ERC20',
    fn: 'transfer()',
    selector: '0xa9059cbb',
    allowed: false,
    description: 'FORBIDDEN — Agent cannot move treasury funds',
  },
  {
    id: 'transferOwnership',
    contract: 'Ownable',
    fn: 'transferOwnership()',
    selector: '0xf2fde38b',
    allowed: false,
    description: 'FORBIDDEN — Prevents contract hijacking',
  },
  {
    id: 'withdrawAll',
    contract: 'IndustriLeaseEscrow',
    fn: 'withdrawAll()',
    selector: '0x853828b6',
    allowed: false,
    description: 'FORBIDDEN — Agent cannot drain escrow balances',
  },
];

// ─── Helper atoms ─────────────────────────────────────────────────────────────

function Sparkle({ size = 18, style = {} }: { size?: number; style?: React.CSSProperties }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" style={{ display: 'inline-block', ...style }}>
      <path d="M12 0 L13.8 10.2 L24 12 L13.8 13.8 L12 24 L10.2 13.8 L0 12 L10.2 10.2 Z" />
    </svg>
  );
}

function PulsingDot({ color = '#16a34a', size = 7 }: { color?: string; size?: number }) {
  return (
    <span style={{
      width: size, height: size, borderRadius: '50%',
      background: color, display: 'inline-block', flexShrink: 0,
      animation: 'ping-dot 1.8s ease-in-out infinite',
    }} />
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 700,
      letterSpacing: '0.09em', textTransform: 'uppercase', color: '#a1a1aa',
      marginBottom: '4px',
    }}>
      {children}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 style={{
      fontFamily: 'var(--font-display)', fontSize: '1.15rem', fontWeight: 800,
      letterSpacing: '-0.025em', color: '#0a0a0a', margin: 0,
    }}>
      {children}
    </h2>
  );
}

function Card({
  children, style, accent,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
  accent?: string;
}) {
  return (
    <div style={{
      background: '#fff',
      border: accent ? `1.5px solid ${accent}` : '1.5px solid #e4e4e7',
      borderRadius: '16px',
      overflow: 'hidden',
      position: 'relative',
      ...style,
    }}>
      {children}
    </div>
  );
}

function CardHeader({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      padding: '16px 20px',
      borderBottom: '1px solid #f4f4f5',
      background: '#fafafa',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      ...style,
    }}>
      {children}
    </div>
  );
}

function CardBody({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ padding: '18px 20px', ...style }}>
      {children}
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label style={{
      display: 'block', fontFamily: 'var(--font-body)',
      fontSize: '12px', fontWeight: 600, color: '#52525b',
      marginBottom: '7px', letterSpacing: '0.01em',
    }}>
      {children}
    </label>
  );
}

function NumberInput({
  value, onChange, min = 0, max, suffix, prefix,
}: {
  value: number; onChange: (v: number) => void;
  min?: number; max?: number; suffix?: string; prefix?: string;
}) {
  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
      {prefix && (
        <span style={{
          position: 'absolute', left: '12px',
          fontFamily: 'var(--font-body)', fontSize: '13px',
          fontWeight: 600, color: '#a1a1aa', pointerEvents: 'none', zIndex: 1,
        }}>{prefix}</span>
      )}
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        onChange={e => onChange(Number(e.target.value))}
        style={{
          width: '100%', padding: `10px ${suffix ? '52px' : '12px'} 10px ${prefix ? '28px' : '12px'}`,
          borderRadius: '10px', border: '1.5px solid #e4e4e7',
          background: '#fff', fontFamily: 'var(--font-body)',
          fontSize: '13px', fontWeight: 600, color: '#0a0a0a',
          outline: 'none', transition: 'border-color 0.2s', boxSizing: 'border-box',
        }}
        onFocus={e => { e.currentTarget.style.borderColor = '#6366f1'; }}
        onBlur={e => { e.currentTarget.style.borderColor = '#e4e4e7'; }}
      />
      {suffix && (
        <span style={{
          position: 'absolute', right: '12px',
          fontFamily: 'var(--font-body)', fontSize: '11px',
          fontWeight: 600, color: '#a1a1aa', pointerEvents: 'none',
        }}>{suffix}</span>
      )}
    </div>
  );
}

function FormGroup({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <div style={{ marginBottom: '14px', ...style }}>{children}</div>;
}

function Grid2({ children, gap = 12 }: { children: React.ReactNode; gap?: number }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap }}>{children}</div>
  );
}

function Divider({ style }: { style?: React.CSSProperties }) {
  return <div style={{ height: '1px', background: '#f4f4f5', margin: '18px 0', ...style }} />;
}

// ─── Countdown Timer ──────────────────────────────────────────────────────────
function CountdownTimer({ validUntil, maxMs }: { validUntil: number; maxMs: number }) {
  const [remaining, setRemaining] = useState(Math.max(0, validUntil - Date.now()));

  useEffect(() => {
    const id = setInterval(() => {
      setRemaining(Math.max(0, validUntil - Date.now()));
    }, 1000);
    return () => clearInterval(id);
  }, [validUntil]);

  const h = Math.floor(remaining / 3600000);
  const m = Math.floor((remaining % 3600000) / 60000);
  const s = Math.floor((remaining % 60000) / 1000);
  const pct = Math.min(100, (remaining / maxMs) * 100);
  const isLow = remaining < 3600000 * 2; // < 2 hours
  const isCritical = remaining < 3600000; // < 1 hour

  const color = isCritical ? '#dc2626' : isLow ? '#d97706' : '#0f766e';
  const bgColor = isCritical ? 'rgba(239,68,68,0.08)' : isLow ? 'rgba(245,158,11,0.08)' : 'rgba(20,184,166,0.08)';
  const borderColor = isCritical ? 'rgba(239,68,68,0.25)' : isLow ? 'rgba(245,158,11,0.25)' : 'rgba(20,184,166,0.25)';

  return (
    <div>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: '12px',
      }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          {[
            { val: h, unit: 'HRS' },
            { val: m, unit: 'MIN' },
            { val: s, unit: 'SEC' },
          ].map((seg, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{
                fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 800,
                letterSpacing: '-0.05em', color, lineHeight: 1,
                minWidth: '56px',
                background: bgColor, border: `1.5px solid ${borderColor}`,
                borderRadius: '10px', padding: '8px 10px',
              }}>
                {String(seg.val).padStart(2, '0')}
              </div>
              <div style={{
                fontFamily: 'var(--font-body)', fontSize: '9px', fontWeight: 700,
                letterSpacing: '0.1em', color: '#a1a1aa', marginTop: '4px',
              }}>
                {seg.unit}
              </div>
            </div>
          ))}
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: '#a1a1aa', fontWeight: 500 }}>
            Session Window
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '14px', fontWeight: 700, color: '#0a0a0a' }}>
            24-hour rolling
          </div>
        </div>
      </div>
      {/* Progress bar */}
      <div style={{ width: '100%', height: '6px', background: '#f4f4f5', borderRadius: '999px', overflow: 'hidden' }}>
        <motion.div
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.5 }}
          style={{
            height: '100%', borderRadius: '999px',
            background: isCritical
              ? 'linear-gradient(90deg, #ef4444, #dc2626)'
              : isLow
                ? 'linear-gradient(90deg, #f59e0b, #d97706)'
                : 'linear-gradient(90deg, #14b8a6, #0f766e)',
          }}
        />
      </div>
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        fontFamily: 'var(--font-body)', fontSize: '10px', color: '#a1a1aa',
        marginTop: '5px',
      }}>
        <span>{pct.toFixed(1)}% remaining</span>
        <span>Renew before expiry</span>
      </div>
      {isLow && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            marginTop: '10px', padding: '8px 12px', borderRadius: '8px',
            background: isCritical ? 'rgba(239,68,68,0.06)' : 'rgba(245,158,11,0.06)',
            border: `1px solid ${isCritical ? 'rgba(239,68,68,0.2)' : 'rgba(245,158,11,0.2)'}`,
            display: 'flex', alignItems: 'center', gap: '7px',
          }}
        >
          <AlertTriangle size={13} color={isCritical ? '#dc2626' : '#d97706'} />
          <span style={{
            fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 600,
            color: isCritical ? '#dc2626' : '#b45309',
          }}>
            {isCritical ? 'Session key critically low — renew immediately' : 'Session expiring soon — renew to maintain automation'}
          </span>
        </motion.div>
      )}
    </div>
  );
}

// ─── Function Selector Row ────────────────────────────────────────────────────
function SelectorRow({ sel }: { sel: typeof FUNCTION_SELECTORS[0] }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.35, ease: ease.snappy }}
      style={{
        display: 'flex', alignItems: 'flex-start', gap: '12px',
        padding: '12px 14px', borderRadius: '10px',
        background: sel.allowed ? 'rgba(20,184,166,0.04)' : 'rgba(239,68,68,0.03)',
        border: `1px solid ${sel.allowed ? 'rgba(20,184,166,0.15)' : 'rgba(239,68,68,0.12)'}`,
        marginBottom: '8px',
      }}
    >
      <div style={{
        width: '28px', height: '28px', borderRadius: '8px', flexShrink: 0,
        background: sel.allowed ? 'rgba(20,184,166,0.12)' : 'rgba(239,68,68,0.10)',
        border: `1.5px solid ${sel.allowed ? 'rgba(20,184,166,0.3)' : 'rgba(239,68,68,0.25)'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {sel.allowed
          ? <Check size={14} color="#0f766e" strokeWidth={2.5} />
          : <Ban size={13} color="#dc2626" strokeWidth={2.5} />
        }
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px', flexWrap: 'wrap' }}>
          <span style={{
            fontFamily: 'monospace', fontSize: '12px', fontWeight: 700,
            color: sel.allowed ? '#0f766e' : '#dc2626',
          }}>
            {sel.contract}.{sel.fn}
          </span>
          <span style={{
            fontFamily: 'monospace', fontSize: '10px', fontWeight: 500,
            color: '#a1a1aa', background: '#f4f4f5', padding: '1px 7px',
            borderRadius: '4px',
          }}>
            {sel.selector}
          </span>
        </div>
        <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: '#71717a' }}>
          {sel.description}
        </div>
      </div>
      <span style={{
        flexShrink: 0,
        fontFamily: 'var(--font-body)', fontSize: '9px', fontWeight: 700,
        letterSpacing: '0.08em', textTransform: 'uppercase',
        padding: '3px 8px', borderRadius: '999px',
        background: sel.allowed ? 'rgba(20,184,166,0.1)' : 'rgba(239,68,68,0.08)',
        color: sel.allowed ? '#0f766e' : '#dc2626',
        border: `1px solid ${sel.allowed ? 'rgba(20,184,166,0.25)' : 'rgba(239,68,68,0.2)'}`,
      }}>
        {sel.allowed ? 'ALLOWED' : 'FORBIDDEN'}
      </span>
    </motion.div>
  );
}

// ─── Slider Control ───────────────────────────────────────────────────────────
function SliderControl({
  value, onChange, min = 0, max = 100, step = 1, label, display, color = '#6366f1',
}: {
  value: number; onChange: (v: number) => void;
  min?: number; max?: number; step?: number;
  label: string; display: string; color?: string;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <Label>{label}</Label>
        <span style={{
          fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 800,
          color, letterSpacing: '-0.03em',
        }}>
          {display}
        </span>
      </div>
      <input
        type="range"
        min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        style={{
          width: '100%', height: '6px', borderRadius: '999px',
          appearance: 'none', WebkitAppearance: 'none', outline: 'none', cursor: 'pointer',
          background: `linear-gradient(to right, ${color} 0%, ${color} ${pct}%, #e4e4e7 ${pct}%, #e4e4e7 100%)`,
        }}
      />
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        fontFamily: 'var(--font-body)', fontSize: '10px', color: '#a1a1aa', marginTop: '5px',
      }}>
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
}

// ─── Hour Select Pill ─────────────────────────────────────────────────────────
function HourPicker({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const fmt = (h: number) => {
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hh = h % 12 === 0 ? 12 : h % 12;
    return `${hh}:00 ${ampm}`;
  };
  return (
    <div>
      <Label>{label}</Label>
      <select
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        style={{
          width: '100%', padding: '10px 36px 10px 12px',
          borderRadius: '10px', border: '1.5px solid #e4e4e7',
          background: '#fff', fontFamily: 'var(--font-body)',
          fontSize: '13px', fontWeight: 600, color: '#0a0a0a',
          outline: 'none', cursor: 'pointer',
          appearance: 'none', WebkitAppearance: 'none',
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23a1a1aa' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
          backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center',
          boxSizing: 'border-box', transition: 'border-color 0.2s',
        }}
        onFocus={e => { e.currentTarget.style.borderColor = '#6366f1'; }}
        onBlur={e => { e.currentTarget.style.borderColor = '#e4e4e7'; }}
      >
        {hours.map(h => (
          <option key={h} value={h}>{fmt(h)}</option>
        ))}
      </select>
    </div>
  );
}

// ─── Live Agent Log ───────────────────────────────────────────────────────────
const LOG_LINES = [
  { t: '03:22:14', msg: 'mintSlot() → M001 · 6h block from 04:00 — 1 USDC discount applied', ok: true },
  { t: '03:18:07', msg: 'submitLayerProof() → Job SLT-7842 layer 1204/1204 — ✓ proof accepted', ok: true },
  { t: '03:11:52', msg: 'Off-peak pricing active: M003 rate adjusted to $36/hr (−20%)', ok: true },
  { t: '02:58:31', msg: 'Idle threshold hit for M002 (142 min) — minting slot...', ok: true },
  { t: '02:44:10', msg: 'Safety check: M001 at 18.0hr continuous run — cooldown triggered', ok: false },
  { t: '02:40:03', msg: 'transfer() blocked by ERC-7579 scope guard — unauthorized selector', ok: false },
  { t: '02:31:45', msg: 'Session key validated: 0x4a2f...0b — validUntil 2026-08-08T21:22:00Z', ok: true },
];

function AgentLogFeed() {
  return (
    <div style={{
      background: '#0a0a0a', borderRadius: '12px',
      padding: '14px', fontFamily: 'monospace',
      maxHeight: '200px', overflowY: 'auto',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
        <Terminal size={12} color="#71717a" />
        <span style={{ fontFamily: 'var(--font-body)', fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em', color: '#71717a', textTransform: 'uppercase' }}>
          agent.py live output
        </span>
        <PulsingDot color="#16a34a" size={6} />
      </div>
      {LOG_LINES.map((line, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.05, duration: 0.3, ease: ease.snappy }}
          style={{
            display: 'flex', gap: '10px', marginBottom: '6px',
            fontSize: '11px', lineHeight: 1.5,
          }}
        >
          <span style={{ color: '#52525b', flexShrink: 0 }}>{line.t}</span>
          <span style={{ color: line.ok ? '#86efac' : '#fca5a5' }}>{line.msg}</span>
        </motion.div>
      ))}
    </div>
  );
}

// ─── Policy stat mini card ─────────────────────────────────────────────────────
function PolicyStat({
  icon: Icon, label, value, color = '#6366f1', bg = 'rgba(99,102,241,0.08)', border = 'rgba(99,102,241,0.2)',
}: {
  icon: React.ElementType; label: string; value: string;
  color?: string; bg?: string; border?: string;
}) {
  return (
    <div style={{
      padding: '12px 14px', borderRadius: '10px',
      background: bg, border: `1px solid ${border}`,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '6px' }}>
        <Icon size={12} color={color} />
        <span style={{ fontFamily: 'var(--font-body)', fontSize: '10px', fontWeight: 600, color: '#a1a1aa' }}>
          {label}
        </span>
      </div>
      <div style={{
        fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: 800,
        color: '#0a0a0a', letterSpacing: '-0.025em',
      }}>
        {value}
      </div>
    </div>
  );
}

// ─── Save Toast ───────────────────────────────────────────────────────────────
function SaveToast({ show }: { show: boolean }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          transition={{ duration: 0.35, ease: ease.snappy }}
          style={{
            position: 'fixed', bottom: '28px', left: '50%', transform: 'translateX(-50%)',
            zIndex: 200, display: 'flex', alignItems: 'center', gap: '10px',
            padding: '12px 20px', borderRadius: '12px',
            background: '#0a0a0a', color: '#fff',
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
            fontFamily: 'var(--font-display)', fontSize: '13px', fontWeight: 700,
          }}
        >
          <CheckCircle size={15} color="#4ade80" />
          Policy rules saved & agent.py config updated
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function AgentSettingsPage() {
  const [state, setStateRaw] = useState<AgentGovernanceState>(INITIAL_STATE);
  const [agentStatus, setAgentStatus] = useState<AgentStatus>('ACTIVE');
  const [isRenewing, setIsRenewing] = useState(false);
  const [isRevoking, setIsRevoking] = useState(false);
  const [revokeConfirm, setRevokeConfirm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSaveToast, setShowSaveToast] = useState(false);
  const [copied, setCopied] = useState(false);
  const [sessionValidity, setSessionValidity] = useState(state.sessionValidUntil);

  const setState = useCallback((patch: Partial<AgentGovernanceState>) => {
    setStateRaw(prev => ({ ...prev, ...patch }));
  }, []);

  const handleRenew = () => {
    setIsRenewing(true);
    setTimeout(() => {
      const newExpiry = Date.now() + 24 * 3600 * 1000;
      setSessionValidity(newExpiry);
      setState({ sessionValidUntil: newExpiry, isSessionActive: true });
      setAgentStatus('ACTIVE');
      setIsRenewing(false);
    }, 2500);
  };

  const handleRevoke = () => {
    if (!revokeConfirm) { setRevokeConfirm(true); return; }
    setIsRevoking(true);
    setTimeout(() => {
      setState({ isSessionActive: false });
      setAgentStatus('EXPIRED');
      setIsRevoking(false);
      setRevokeConfirm(false);
    }, 1800);
  };

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setShowSaveToast(true);
      setTimeout(() => setShowSaveToast(false), 3500);
    }, 1600);
  };

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(state.agentAddress).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const statusConfig = {
    ACTIVE: { bg: 'rgba(20,184,166,0.08)', color: '#0f766e', border: 'rgba(20,184,166,0.25)', dot: '#14b8a6', label: 'ACTIVE' },
    PAUSED: { bg: 'rgba(245,158,11,0.08)', color: '#b45309', border: 'rgba(245,158,11,0.25)', dot: '#f59e0b', label: 'PAUSED' },
    EXPIRED: { bg: 'rgba(161,161,170,0.08)', color: '#52525b', border: 'rgba(161,161,170,0.25)', dot: '#a1a1aa', label: 'EXPIRED' },
  }[agentStatus];

  const SESSION_MAX_MS = 24 * 3600 * 1000;
  const fmt24h = (h: number) => {
    const ap = h >= 12 ? 'PM' : 'AM';
    const hh = h % 12 === 0 ? 12 : h % 12;
    return `${hh}:00 ${ap}`;
  };

  return (
    <div style={{ minHeight: '100vh', background: '#fff', fontFamily: 'var(--font-body)' }}>

      {/* ── HEADER ── */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1.5px solid #e4e4e7', padding: '0 40px',
      }}>
        <div style={{
          maxWidth: '1320px', margin: '0 auto',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          height: '68px', gap: '20px',
        }}>
          {/* Left */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexShrink: 0 }}>
            <a href="/lender-dashboard" style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              fontFamily: 'var(--font-body)', fontSize: '12px', fontWeight: 600,
              color: '#71717a', textDecoration: 'none', transition: 'color 0.2s',
            }}
              onMouseEnter={e => { e.currentTarget.style.color = '#0a0a0a'; }}
              onMouseLeave={e => { e.currentTarget.style.color = '#71717a'; }}
            >
              <ArrowLeft size={13} />
              Fleet Dashboard
            </a>
            <div style={{ width: '1px', height: '20px', background: '#e4e4e7' }} />
            <a href="/" style={{
              fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: 800,
              letterSpacing: '-0.03em', color: '#0a0a0a', textDecoration: 'none',
            }}>
              ⬡ IndustriLease
            </a>
          </div>

          {/* Center: Agent identity */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '6px 12px', borderRadius: '10px',
              background: '#f4f4f5', border: '1.5px solid #e4e4e7',
            }}>
              <div style={{
                width: '28px', height: '28px', borderRadius: '8px',
                background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Cpu size={14} color="#fff" />
              </div>
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '12px', fontWeight: 700, color: '#0a0a0a', letterSpacing: '-0.01em' }}>
                  @factory.eth
                </div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: '10px', color: '#71717a' }}>
                  {state.agentAddress.slice(0, 10)}...{state.agentAddress.slice(-6)}
                </div>
              </div>
              <ChevronRight size={13} color="#a1a1aa" />
              <div style={{
                display: 'flex', alignItems: 'center', gap: '5px',
                padding: '3px 8px', borderRadius: '6px',
                background: '#fff', border: '1px solid #e4e4e7',
              }}>
                <Radio size={10} color="#6366f1" />
                <span style={{ fontFamily: 'var(--font-body)', fontSize: '10px', fontWeight: 700, color: '#4f46e5' }}>
                  agent.py
                </span>
              </div>
            </div>

            {/* ERC-7579 badge */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '5px',
              padding: '5px 10px', borderRadius: '8px',
              background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)',
            }}>
              <Shield size={11} color="#6366f1" />
              <span style={{ fontFamily: 'var(--font-body)', fontSize: '10px', fontWeight: 700, color: '#4f46e5' }}>
                ERC-7579 Smart Session Active
              </span>
            </div>
          </div>

          {/* Right: Status */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              padding: '6px 14px', borderRadius: '999px',
              background: statusConfig.bg, color: statusConfig.color,
              border: `1.5px solid ${statusConfig.border}`,
              fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 700,
              letterSpacing: '0.08em',
            }}>
              <PulsingDot color={statusConfig.dot} size={7} />
              AGENT {statusConfig.label}
            </span>

            <button
              onClick={() => setAgentStatus(s => s === 'ACTIVE' ? 'PAUSED' : 'ACTIVE')}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '7px 14px', borderRadius: '8px',
                background: agentStatus === 'ACTIVE' ? 'rgba(245,158,11,0.08)' : '#0a0a0a',
                border: agentStatus === 'ACTIVE' ? '1.5px solid rgba(245,158,11,0.25)' : '1.5px solid #0a0a0a',
                color: agentStatus === 'ACTIVE' ? '#b45309' : '#fff',
                fontFamily: 'var(--font-body)', fontSize: '12px', fontWeight: 700,
                cursor: 'pointer', transition: 'all 0.2s',
              }}
            >
              {agentStatus === 'ACTIVE' ? <><ToggleRight size={14} /> Pause Agent</> : <><ToggleLeft size={14} /> Resume Agent</>}
            </button>
          </div>
        </div>
      </header>

      {/* ── MAIN ── */}
      <main style={{ maxWidth: '1320px', margin: '0 auto', padding: '40px 40px 120px' }}>

        {/* Page title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: ease.snappy }}
          style={{ marginBottom: '36px' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <motion.span
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
            >
              <Sparkle size={15} style={{ color: '#0a0a0a' }} />
            </motion.span>
            <span style={{
              fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 700,
              letterSpacing: '0.09em', textTransform: 'uppercase', color: '#a1a1aa',
            }}>
              AI Agent & Governance Settings
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h1 style={{
                fontFamily: 'var(--font-display)', fontSize: 'clamp(1.6rem, 3vw, 2.2rem)',
                fontWeight: 800, letterSpacing: '-0.035em', color: '#0a0a0a',
                lineHeight: 1.1, margin: 0,
              }}>
                Agent Security & Policy Rules
              </h1>
              <p style={{
                fontFamily: 'var(--font-body)', fontSize: '14px', color: '#71717a',
                marginTop: '8px', marginBottom: 0, lineHeight: 1.6, maxWidth: '580px',
              }}>
                Establish ERC-7579 session key guardrails and configure autonomous pricing & scheduling policies for your AI agent.
              </p>
            </div>
            {/* Agent address copy */}
            <button
              onClick={handleCopyAddress}
              style={{
                display: 'flex', alignItems: 'center', gap: '7px',
                padding: '9px 16px', borderRadius: '10px',
                background: '#f4f4f5', border: '1.5px solid #e4e4e7',
                fontFamily: 'var(--font-body)', fontSize: '12px', fontWeight: 600,
                color: '#52525b', cursor: 'pointer', transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#e4e4e7'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#f4f4f5'; }}
            >
              {copied ? <CheckCircle size={13} color="#16a34a" /> : <Copy size={13} />}
              {copied ? 'Copied!' : `${state.agentAddress.slice(0, 14)}...`}
            </button>
          </div>
        </motion.div>

        {/* ── GRID LAYOUT ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
          gap: '24px',
          alignItems: 'start',
        }}>

          {/* ═══════════════════════════════════════════
              LEFT COLUMN — ERC-7579 Session Key Panel
          ═══════════════════════════════════════════ */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* ── Session Expiration Card ── */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.05, ease: ease.snappy }}
            >
              <Card accent={agentStatus === 'ACTIVE' ? 'rgba(20,184,166,0.25)' : 'rgba(239,68,68,0.2)'}>
                {/* Shimmer top bar */}
                {agentStatus === 'ACTIVE' && (
                  <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0, height: '2.5px',
                    background: 'linear-gradient(90deg, #14b8a6, #6366f1, #8b5cf6, #14b8a6)',
                    backgroundSize: '200% 100%', animation: 'shimmer 2.4s linear infinite',
                  }} />
                )}
                <CardHeader>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      width: '30px', height: '30px', borderRadius: '8px',
                      background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Key size={14} color="#fff" />
                    </div>
                    <div>
                      <SectionLabel>ERC-7579 Module</SectionLabel>
                      <SectionTitle>Session Key Countdown</SectionTitle>
                    </div>
                  </div>
                  <span style={{
                    padding: '3px 10px', borderRadius: '6px',
                    background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)',
                    fontFamily: 'var(--font-body)', fontSize: '10px', fontWeight: 700, color: '#4f46e5',
                  }}>
                    RHINESTONE VALIDATOR
                  </span>
                </CardHeader>
                <CardBody>
                  <CountdownTimer validUntil={sessionValidity} maxMs={SESSION_MAX_MS} />

                  <Divider />

                  {/* Renewal controls */}
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <motion.button
                      onClick={handleRenew}
                      disabled={isRenewing}
                      whileHover={{ scale: isRenewing ? 1 : 1.02, y: isRenewing ? 0 : -1 }}
                      whileTap={{ scale: isRenewing ? 1 : 0.97 }}
                      style={{
                        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px',
                        padding: '10px 0', borderRadius: '10px',
                        background: '#0a0a0a', color: '#fff',
                        fontFamily: 'var(--font-display)', fontSize: '13px', fontWeight: 700,
                        border: 'none', cursor: isRenewing ? 'wait' : 'pointer',
                        boxShadow: '0 4px 14px rgba(0,0,0,0.12)',
                      }}
                    >
                      {isRenewing ? (
                        <><motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}><RefreshCw size={13} /></motion.span> Renewing...</>
                      ) : (
                        <><RefreshCw size={13} /> Extend Session (24h)</>
                      )}
                    </motion.button>

                    <motion.button
                      onClick={handleRevoke}
                      disabled={isRevoking}
                      whileHover={{ scale: isRevoking ? 1 : 1.02 }}
                      whileTap={{ scale: isRevoking ? 1 : 0.97 }}
                      style={{
                        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px',
                        padding: '10px 0', borderRadius: '10px',
                        background: revokeConfirm ? 'rgba(239,68,68,0.08)' : 'transparent',
                        color: revokeConfirm ? '#dc2626' : '#71717a',
                        fontFamily: 'var(--font-display)', fontSize: '13px', fontWeight: 700,
                        border: `1.5px solid ${revokeConfirm ? 'rgba(239,68,68,0.3)' : '#e4e4e7'}`,
                        cursor: isRevoking ? 'wait' : 'pointer', transition: 'all 0.2s',
                      }}
                    >
                      {isRevoking ? (
                        <><motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}><RefreshCw size={13} /></motion.span> Revoking...</>
                      ) : revokeConfirm ? (
                        <><AlertTriangle size={13} /> Confirm Revoke</>
                      ) : (
                        <><Lock size={13} /> Revoke Session</>
                      )}
                    </motion.button>
                  </div>
                  {revokeConfirm && (
                    <motion.p
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      style={{
                        fontFamily: 'var(--font-body)', fontSize: '11px', color: '#dc2626',
                        marginTop: '8px', marginBottom: 0, textAlign: 'center',
                      }}
                    >
                      This will immediately halt all agent automation. Click Confirm to proceed.
                    </motion.p>
                  )}
                </CardBody>
              </Card>
            </motion.div>

            {/* ── Function Selector Matrix ── */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.12, ease: ease.snappy }}
            >
              <Card>
                <CardHeader>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      width: '30px', height: '30px', borderRadius: '8px',
                      background: '#f4f4f5', border: '1px solid #e4e4e7',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Shield size={14} color="#52525b" />
                    </div>
                    <div>
                      <SectionLabel>Smart Contract Scope</SectionLabel>
                      <SectionTitle>Authorized Function Selectors</SectionTitle>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <span style={{
                      padding: '3px 10px', borderRadius: '999px',
                      background: 'rgba(20,184,166,0.08)', border: '1px solid rgba(20,184,166,0.2)',
                      fontFamily: 'var(--font-body)', fontSize: '10px', fontWeight: 700, color: '#0f766e',
                    }}>
                      3 Allowed
                    </span>
                    <span style={{
                      padding: '3px 10px', borderRadius: '999px',
                      background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
                      fontFamily: 'var(--font-body)', fontSize: '10px', fontWeight: 700, color: '#dc2626',
                    }}>
                      3 Forbidden
                    </span>
                  </div>
                </CardHeader>
                <CardBody>
                  {FUNCTION_SELECTORS.map(sel => (
                    <SelectorRow key={sel.id} sel={sel} />
                  ))}
                  <div style={{
                    marginTop: '12px', padding: '10px 14px', borderRadius: '10px',
                    background: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.15)',
                    display: 'flex', alignItems: 'center', gap: '8px',
                  }}>
                    <Lock size={12} color="#6366f1" />
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: '#4f46e5', fontWeight: 500, lineHeight: 1.5 }}>
                      Selector restrictions are enforced at the ERC-7579 scope guard level — the agent's session key is cryptographically constrained and cannot bypass these rules.
                    </span>
                  </div>
                </CardBody>
              </Card>
            </motion.div>

            {/* ── Live Agent Log ── */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.18, ease: ease.snappy }}
            >
              <Card>
                <CardHeader>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      width: '30px', height: '30px', borderRadius: '8px',
                      background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Terminal size={14} color="#fff" />
                    </div>
                    <div>
                      <SectionLabel>Live Feed</SectionLabel>
                      <SectionTitle>Agent.py Output</SectionTitle>
                    </div>
                  </div>
                  <PulsingDot color="#16a34a" size={8} />
                </CardHeader>
                <CardBody>
                  <AgentLogFeed />
                </CardBody>
              </Card>
            </motion.div>
          </div>

          {/* ═══════════════════════════════════════════
              RIGHT COLUMN — Automation Policy Rules
          ═══════════════════════════════════════════ */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* ── Policy Stats Strip ── */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.08, ease: ease.snappy }}
              style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}
            >
              <PolicyStat
                icon={Timer}
                label="Idle Threshold"
                value={`${state.autoListIdleThresholdMinutes}m`}
                color="#6366f1" bg="rgba(99,102,241,0.08)" border="rgba(99,102,241,0.2)"
              />
              <PolicyStat
                icon={TrendingDown}
                label="Max Discount"
                value={`${state.maxOffPeakDiscountPercent}%`}
                color="#8b5cf6" bg="rgba(139,92,246,0.08)" border="rgba(139,92,246,0.2)"
              />
              <PolicyStat
                icon={Shield}
                label="Price Floor"
                value={`$${state.minHourlyPriceFloorUSDC}/hr`}
                color="#0f766e" bg="rgba(20,184,166,0.08)" border="rgba(20,184,166,0.2)"
              />
            </motion.div>

            {/* ── Auto-Listing Policy ── */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.14, ease: ease.snappy }}
            >
              <Card>
                <CardHeader>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      width: '30px', height: '30px', borderRadius: '8px',
                      background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Activity size={14} color="#6366f1" />
                    </div>
                    <div>
                      <SectionLabel>Automation Policy</SectionLabel>
                      <SectionTitle>Auto-Listing Downtime Rules</SectionTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardBody>
                  <FormGroup>
                    <SliderControl
                      label="Idle Window Trigger"
                      value={state.autoListIdleThresholdMinutes}
                      onChange={v => setState({ autoListIdleThresholdMinutes: v })}
                      min={15} max={480} step={15}
                      display={`${state.autoListIdleThresholdMinutes} min`}
                      color="#6366f1"
                    />
                    <p style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: '#a1a1aa', marginTop: '6px', marginBottom: 0 }}>
                      Auto-list if machine sits idle for longer than this window
                    </p>
                  </FormGroup>

                  <Divider />

                  <Grid2>
                    <FormGroup>
                      <Label>Target Slot Duration</Label>
                      <NumberInput
                        value={state.defaultSlotDurationHours}
                        onChange={v => setState({ defaultSlotDurationHours: v })}
                        min={1} max={24}
                        suffix="hours"
                      />
                      <p style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: '#a1a1aa', marginTop: '5px', marginBottom: 0 }}>
                        Default time-slot block size minted on-chain
                      </p>
                    </FormGroup>
                    <FormGroup>
                      <Label>Max Daily Job Cap</Label>
                      <NumberInput
                        value={state.maxDailyJobCap}
                        onChange={v => setState({ maxDailyJobCap: v })}
                        min={1} max={20}
                        suffix="jobs/day"
                      />
                      <p style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: '#a1a1aa', marginTop: '5px', marginBottom: 0 }}>
                        Limits automated listings per machine per 24h cycle
                      </p>
                    </FormGroup>
                  </Grid2>
                </CardBody>
              </Card>
            </motion.div>

            {/* ── Night Shift Pricing ── */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.2, ease: ease.snappy }}
            >
              <Card>
                <CardHeader>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      width: '30px', height: '30px', borderRadius: '8px',
                      background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Moon size={14} color="#7c3aed" />
                    </div>
                    <div>
                      <SectionLabel>Dynamic Pricing</SectionLabel>
                      <SectionTitle>Off-Peak Night Shift Rules</SectionTitle>
                    </div>
                  </div>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '5px',
                    padding: '4px 10px', borderRadius: '8px',
                    background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)',
                  }}>
                    <Moon size={10} color="#7c3aed" />
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 700, color: '#6d28d9' }}>
                      {fmt24h(state.offPeakStartHour)} – {fmt24h(state.offPeakEndHour)}
                    </span>
                  </div>
                </CardHeader>
                <CardBody>
                  <Grid2 gap={12}>
                    <FormGroup>
                      <HourPicker
                        label="Night Shift Start"
                        value={state.offPeakStartHour}
                        onChange={v => setState({ offPeakStartHour: v })}
                      />
                    </FormGroup>
                    <FormGroup>
                      <HourPicker
                        label="Night Shift End"
                        value={state.offPeakEndHour}
                        onChange={v => setState({ offPeakEndHour: v })}
                      />
                    </FormGroup>
                  </Grid2>

                  <Divider />

                  <FormGroup>
                    <SliderControl
                      label="Maximum Discount Cap"
                      value={state.maxOffPeakDiscountPercent}
                      onChange={v => setState({ maxOffPeakDiscountPercent: v })}
                      min={0} max={50} step={5}
                      display={`${state.maxOffPeakDiscountPercent}%`}
                      color="#8b5cf6"
                    />
                    <p style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: '#a1a1aa', marginTop: '6px', marginBottom: 0 }}>
                      Max reduction the AI agent can apply during off-peak hours to fill idle capacity
                    </p>
                  </FormGroup>

                  <Divider />

                  <FormGroup style={{ marginBottom: 0 }}>
                    <Label>Minimum Price Floor</Label>
                    <NumberInput
                      value={state.minHourlyPriceFloorUSDC}
                      onChange={v => setState({ minHourlyPriceFloorUSDC: v })}
                      min={0}
                      prefix="$"
                      suffix="USDC/hr"
                    />
                    <div style={{
                      marginTop: '10px', padding: '10px 12px', borderRadius: '8px',
                      background: 'rgba(20,184,166,0.06)', border: '1px solid rgba(20,184,166,0.15)',
                      display: 'flex', alignItems: 'center', gap: '8px',
                    }}>
                      <Lock size={11} color="#0f766e" />
                      <span style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: '#0f766e', fontWeight: 500 }}>
                        Hard lower bound enforced at contract level — agent cannot undercut this floor under any circumstance
                      </span>
                    </div>
                  </FormGroup>

                  {/* Live preview */}
                  {state.minHourlyPriceFloorUSDC > 0 && (
                    <div style={{
                      marginTop: '14px', padding: '14px',
                      background: '#fafafa', borderRadius: '10px', border: '1px solid #f0f0f0',
                    }}>
                      <div style={{
                        fontFamily: 'var(--font-body)', fontSize: '10px', fontWeight: 700,
                        letterSpacing: '0.08em', textTransform: 'uppercase', color: '#a1a1aa',
                        marginBottom: '10px',
                      }}>
                        Effective Rate Preview
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                        {[
                          { label: 'Peak Rate (min)', value: `$${state.minHourlyPriceFloorUSDC}/hr`, color: '#0a0a0a' },
                          {
                            label: 'Off-Peak Rate (min)',
                            value: `$${Math.round(state.minHourlyPriceFloorUSDC * (1 - state.maxOffPeakDiscountPercent / 100))}/hr`,
                            color: '#7c3aed',
                          },
                        ].map((item, i) => (
                          <div key={i} style={{
                            padding: '8px 12px', background: '#fff',
                            borderRadius: '8px', border: '1px solid #e4e4e7',
                          }}>
                            <div style={{ fontFamily: 'var(--font-body)', fontSize: '10px', color: '#a1a1aa', fontWeight: 500 }}>
                              {item.label}
                            </div>
                            <div style={{
                              fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: 800,
                              color: item.color, letterSpacing: '-0.025em',
                            }}>
                              {item.value}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardBody>
              </Card>
            </motion.div>

            {/* ── Safety & Utilization Cutoffs ── */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.26, ease: ease.snappy }}
            >
              <Card>
                <CardHeader>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      width: '30px', height: '30px', borderRadius: '8px',
                      background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Thermometer size={14} color="#dc2626" />
                    </div>
                    <div>
                      <SectionLabel>Hardware Safety</SectionLabel>
                      <SectionTitle>Utilization Cutoff Guardrails</SectionTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardBody>
                  <Grid2 gap={12}>
                    <FormGroup>
                      <Label>Max Continuous Run Hours</Label>
                      <NumberInput
                        value={state.maxContinuousRunHours}
                        onChange={v => setState({ maxContinuousRunHours: v })}
                        min={1} max={72}
                        suffix="hrs"
                      />
                      <p style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: '#a1a1aa', marginTop: '5px', marginBottom: 0 }}>
                        Triggers forced cooldown after N consecutive hours
                      </p>
                    </FormGroup>
                    <FormGroup>
                      <Label>Mandatory Cooldown Period</Label>
                      <NumberInput
                        value={state.cooldownPeriodMinutes}
                        onChange={v => setState({ cooldownPeriodMinutes: v })}
                        min={15} max={480}
                        suffix="min"
                      />
                      <p style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: '#a1a1aa', marginTop: '5px', marginBottom: 0 }}>
                        Forced idle buffer after max run time reached
                      </p>
                    </FormGroup>
                  </Grid2>

                  {/* Guardrail summary */}
                  <div style={{
                    marginTop: '4px', padding: '14px', borderRadius: '10px',
                    background: 'rgba(239,68,68,0.04)', border: '1.5px solid rgba(239,68,68,0.15)',
                  }}>
                    <div style={{
                      fontFamily: 'var(--font-body)', fontSize: '10px', fontWeight: 700,
                      letterSpacing: '0.08em', textTransform: 'uppercase', color: '#dc2626',
                      marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '5px',
                    }}>
                      <AlertTriangle size={11} color="#dc2626" />
                      Active Safety Rules
                    </div>
                    {[
                      {
                        label: 'Thermal Overload Guard',
                        desc: `Force ${state.cooldownPeriodMinutes}min cooldown after ${state.maxContinuousRunHours}h continuous run`,
                      },
                      {
                        label: 'Daily Job Ceiling',
                        desc: `No more than ${state.maxDailyJobCap} automated slots per machine per 24h`,
                      },
                      {
                        label: 'Price Floor Lock',
                        desc: `Agent cannot list below $${state.minHourlyPriceFloorUSDC}/hr under any discount scenario`,
                      },
                    ].map((rule, i) => (
                      <div key={i} style={{
                        display: 'flex', alignItems: 'flex-start', gap: '8px',
                        marginBottom: i < 2 ? '8px' : 0,
                      }}>
                        <div style={{
                          width: '16px', height: '16px', borderRadius: '50%',
                          background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '1px',
                        }}>
                          <Ban size={9} color="#dc2626" />
                        </div>
                        <div>
                          <div style={{ fontFamily: 'var(--font-display)', fontSize: '12px', fontWeight: 700, color: '#0a0a0a' }}>
                            {rule.label}
                          </div>
                          <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: '#71717a' }}>
                            {rule.desc}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardBody>
              </Card>
            </motion.div>
          </div>
        </div>
      </main>

      {/* ── GOVERNANCE ACTION FOOTER ── */}
      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5, ease: ease.snappy }}
        style={{
          position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50,
          background: 'rgba(255,255,255,0.97)',
          backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
          borderTop: '1.5px solid #e4e4e7',
          padding: '14px 40px',
        }}
      >
        <div style={{
          maxWidth: '1320px', margin: '0 auto',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: '20px', flexWrap: 'wrap',
        }}>
          {/* Left: info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '5px 12px', borderRadius: '8px',
              background: 'rgba(22,163,74,0.06)', border: '1px solid rgba(22,163,74,0.2)',
            }}>
              <PulsingDot color="#16a34a" size={6} />
              <span style={{ fontFamily: 'var(--font-body)', fontSize: '12px', fontWeight: 600, color: '#15803d' }}>
                Sepolia Testnet
              </span>
            </div>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: '#a1a1aa' }}>
              Changes saved locally — apply to agent.py config via Save Rules
            </span>
          </div>

          {/* Right: actions */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {/* Renew shortcut */}
            <motion.button
              onClick={handleRenew}
              disabled={isRenewing}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              style={{
                display: 'flex', alignItems: 'center', gap: '7px',
                padding: '10px 18px', borderRadius: '10px',
                background: 'transparent', border: '1.5px solid #e4e4e7',
                color: '#52525b', fontFamily: 'var(--font-display)', fontSize: '13px', fontWeight: 700,
                cursor: 'pointer', transition: 'all 0.2s',
              }}
            >
              <RefreshCw size={13} />
              Renew Session Key
            </motion.button>

            {/* Emergency revoke */}
            <motion.button
              onClick={handleRevoke}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              style={{
                display: 'flex', alignItems: 'center', gap: '7px',
                padding: '10px 18px', borderRadius: '10px',
                background: revokeConfirm ? 'rgba(239,68,68,0.08)' : 'transparent',
                border: `1.5px solid ${revokeConfirm ? 'rgba(239,68,68,0.35)' : '#e4e4e7'}`,
                color: revokeConfirm ? '#dc2626' : '#71717a',
                fontFamily: 'var(--font-display)', fontSize: '13px', fontWeight: 700,
                cursor: 'pointer', transition: 'all 0.2s',
              }}
            >
              <Power size={13} />
              {revokeConfirm ? 'Confirm Emergency Revoke' : 'Emergency Revoke'}
            </motion.button>

            {/* Save Rules */}
            <motion.button
              id="save-policy-btn"
              onClick={handleSave}
              disabled={isSaving}
              whileHover={{ scale: isSaving ? 1 : 1.02, y: isSaving ? 0 : -1 }}
              whileTap={{ scale: isSaving ? 1 : 0.97 }}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '10px 22px', borderRadius: '10px',
                background: '#0a0a0a', color: '#fff',
                fontFamily: 'var(--font-display)', fontSize: '13px', fontWeight: 700,
                border: 'none', cursor: isSaving ? 'wait' : 'pointer',
                boxShadow: '0 4px 16px rgba(0,0,0,0.14)',
                transition: 'all 0.2s',
              }}
            >
              {isSaving ? (
                <>
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  >
                    <RefreshCw size={13} />
                  </motion.span>
                  Saving Rules...
                </>
              ) : (
                <>
                  <Save size={13} />
                  Save Policy Rules
                </>
              )}
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* ── Save Toast ── */}
      <SaveToast show={showSaveToast} />

      {/* ── CSS Keyframes ── */}
      <style>{`
        @keyframes shimmer {
          0% { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }
        @keyframes ping-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.85); }
        }
        input[type='range']::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 18px; height: 18px; border-radius: 50%;
          background: #fff; border: 2.5px solid #6366f1;
          box-shadow: 0 2px 8px rgba(99,102,241,0.3); cursor: pointer;
        }
        input[type='range']::-moz-range-thumb {
          width: 18px; height: 18px; border-radius: 50%;
          background: #fff; border: 2.5px solid #6366f1; cursor: pointer;
        }
      `}</style>
    </div>
  );
}
