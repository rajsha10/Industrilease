'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  ArrowRight,
  AlertTriangle,
  Activity,
  DollarSign,
  Clock,
  TrendingUp,
  Zap,
  Thermometer,
  Layers,
  ToggleLeft,
  ToggleRight,
  ExternalLink,
  Download,
  Plus,
  Settings,
  Shield,
  Power,
  Eye,
  ChevronRight,
  Cpu,
  Radio,
  Terminal,
  RefreshCw,
} from 'lucide-react';

// ─── Types ──────────────────────────────────────────────────────────
type MachineStatus = 'IDLE' | 'RUNNING' | 'OFFLINE';

interface Machine {
  id: string;
  name: string;
  type: string;
  process: string;
  status: MachineStatus;
  batchHash: string;
  powerDraw: number;
  chamberTemp: number;
  layerProgress: number;
  currentJob?: string;
  agentEnabled: boolean;
  hourlyRate: number;
  totalJobs: number;
}

interface SettlementRecord {
  slotId: string;
  machine: string;
  borrowerAddress: string;
  layersCompleted: number;
  totalLayers: number;
  payout: number;
  status: 'SETTLED' | 'PARTIAL' | 'PENDING' | 'LOCKED';
  txHash: string;
  timestamp: string;
}

// ─── Mock Data ──────────────────────────────────────────────────────
const MOCK_FLEET: Machine[] = [
  {
    id: 'M001',
    name: 'EOS M 290',
    type: 'Metal SLS',
    process: 'Selective Laser Sintering',
    status: 'RUNNING',
    batchHash: '0x4a2f...d891',
    powerDraw: 8.4,
    chamberTemp: 187,
    layerProgress: 67,
    currentJob: 'Aerospace bracket — Ti6Al4V',
    agentEnabled: true,
    hourlyRate: 200,
    totalJobs: 142,
  },
  {
    id: 'M002',
    name: 'DMG MORI NMV 5000',
    type: '5-Axis CNC',
    process: 'Multi-Axis Milling',
    status: 'IDLE',
    batchHash: '0x7c1a...2e04',
    powerDraw: 2.1,
    chamberTemp: 24,
    layerProgress: 0,
    agentEnabled: true,
    hourlyRate: 150,
    totalJobs: 89,
  },
  {
    id: 'M003',
    name: 'Stratasys F900',
    type: 'Industrial FDM',
    process: 'Fused Deposition Modeling',
    status: 'RUNNING',
    batchHash: '0x3b8d...f712',
    powerDraw: 4.2,
    chamberTemp: 73,
    layerProgress: 34,
    currentJob: 'Prototype housing — Ultem 9085',
    agentEnabled: true,
    hourlyRate: 45,
    totalJobs: 317,
  },
  {
    id: 'M004',
    name: 'Trumpf TruPrint 5000',
    type: 'Metal SLM',
    process: 'Selective Laser Melting',
    status: 'OFFLINE',
    batchHash: '0x9f4e...a234',
    powerDraw: 0,
    chamberTemp: 21,
    layerProgress: 0,
    agentEnabled: false,
    hourlyRate: 320,
    totalJobs: 56,
  },
  {
    id: 'M005',
    name: 'Haas VF-4SS',
    type: '3-Axis CNC',
    process: 'Vertical Milling',
    status: 'IDLE',
    batchHash: '0x1d7b...c590',
    powerDraw: 1.8,
    chamberTemp: 22,
    layerProgress: 0,
    agentEnabled: true,
    hourlyRate: 80,
    totalJobs: 204,
  },
  {
    id: 'M006',
    name: 'SLM Solutions 800',
    type: 'Metal SLM',
    process: 'Multi-Laser Melting',
    status: 'IDLE',
    batchHash: '0x6e2c...b147',
    powerDraw: 3.3,
    chamberTemp: 26,
    layerProgress: 0,
    agentEnabled: false,
    hourlyRate: 280,
    totalJobs: 28,
  },
];

const MOCK_SETTLEMENTS: SettlementRecord[] = [
  {
    slotId: 'SLT-7842',
    machine: 'EOS M 290',
    borrowerAddress: '0x3fA2...8B91',
    layersCompleted: 1200,
    totalLayers: 1200,
    payout: 840.0,
    status: 'SETTLED',
    txHash: '0xabc1...d234',
    timestamp: '2 hours ago',
  },
  {
    slotId: 'SLT-7839',
    machine: 'Stratasys F900',
    borrowerAddress: '0x9e1C...4D72',
    layersCompleted: 450,
    totalLayers: 900,
    payout: 135.0,
    status: 'PARTIAL',
    txHash: '0xdef5...6789',
    timestamp: '5 hours ago',
  },
  {
    slotId: 'SLT-7835',
    machine: 'DMG MORI NMV',
    borrowerAddress: '0x2b4A...F103',
    layersCompleted: 0,
    totalLayers: 0,
    payout: 300.0,
    status: 'LOCKED',
    txHash: '0xfed9...abc1',
    timestamp: '8 hours ago',
  },
  {
    slotId: 'SLT-7831',
    machine: 'Haas VF-4SS',
    borrowerAddress: '0x8d7E...2C44',
    layersCompleted: 0,
    totalLayers: 0,
    payout: 240.0,
    status: 'PENDING',
    txHash: '0x123a...4567',
    timestamp: '12 hours ago',
  },
  {
    slotId: 'SLT-7824',
    machine: 'EOS M 290',
    borrowerAddress: '0x5c9B...7A28',
    layersCompleted: 860,
    totalLayers: 860,
    payout: 1200.0,
    status: 'SETTLED',
    txHash: '0x789b...cdef',
    timestamp: '1 day ago',
  },
];

// ─── Easing ──────────────────────────────────────────────────────────
const ease = {
  snappy: [0.22, 1, 0.36, 1] as const,
  smooth: [0.25, 0.46, 0.45, 0.94] as const,
};

// ─── Helper Components ───────────────────────────────────────────────

function Sparkle({ size = 20, style = {} }: { size?: number; style?: React.CSSProperties }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" style={{ display: 'inline-block', ...style }}>
      <path d="M12 0 L13.8 10.2 L24 12 L13.8 13.8 L12 24 L10.2 13.8 L0 12 L10.2 10.2 Z" />
    </svg>
  );
}

function PulsingDot({ color = '#16a34a', size = 8 }: { color?: string; size?: number }) {
  return (
    <span style={{
      width: size, height: size, borderRadius: '50%',
      background: color, display: 'inline-block',
      animation: 'ping-dot 1.8s ease-in-out infinite',
      flexShrink: 0,
    }} />
  );
}

function StatusPill({ status }: { status: MachineStatus }) {
  const config = {
    IDLE: { bg: 'rgba(20,184,166,0.1)', color: '#0f766e', border: 'rgba(20,184,166,0.3)', dot: '#14b8a6', label: 'IDLE' },
    RUNNING: { bg: 'rgba(99,102,241,0.1)', color: '#4f46e5', border: 'rgba(99,102,241,0.3)', dot: '#6366f1', label: 'RUNNING' },
    OFFLINE: { bg: 'rgba(161,161,170,0.1)', color: '#71717a', border: 'rgba(161,161,170,0.3)', dot: '#a1a1aa', label: 'OFFLINE' },
  }[status];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '5px',
      padding: '3px 10px', borderRadius: '999px',
      background: config.bg, color: config.color,
      border: `1px solid ${config.border}`,
      fontSize: '10px', fontWeight: 700, fontFamily: 'var(--font-body)',
      letterSpacing: '0.06em',
    }}>
      <PulsingDot color={config.dot} size={5} />
      {config.label}
    </span>
  );
}

function SettlementBadge({ status }: { status: SettlementRecord['status'] }) {
  const config = {
    SETTLED: { bg: 'rgba(22,163,74,0.08)', color: '#15803d', border: 'rgba(22,163,74,0.2)', label: '✓ Settled' },
    PARTIAL: { bg: 'rgba(234,179,8,0.08)', color: '#a16207', border: 'rgba(234,179,8,0.25)', label: '◑ Partial' },
    LOCKED: { bg: 'rgba(99,102,241,0.08)', color: '#4f46e5', border: 'rgba(99,102,241,0.2)', label: '⬡ Locked' },
    PENDING: { bg: 'rgba(161,161,170,0.08)', color: '#52525b', border: 'rgba(161,161,170,0.2)', label: '◷ Pending' },
  }[status];
  return (
    <span style={{
      padding: '3px 10px', borderRadius: '999px',
      background: config.bg, color: config.color,
      border: `1px solid ${config.border}`,
      fontSize: '11px', fontWeight: 600, fontFamily: 'var(--font-body)',
      whiteSpace: 'nowrap',
    }}>
      {config.label}
    </span>
  );
}

function ProgressBar({ value, color = '#6366f1' }: { value: number; color?: string }) {
  return (
    <div style={{ width: '100%', height: '4px', background: '#f4f4f5', borderRadius: '999px', overflow: 'hidden' }}>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 1.2, ease: ease.snappy, delay: 0.3 }}
        style={{ height: '100%', background: color, borderRadius: '999px' }}
      />
    </div>
  );
}

function Toggle({ enabled, onChange }: { enabled: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      style={{
        display: 'flex', alignItems: 'center', gap: '6px',
        background: 'none', border: 'none', cursor: 'pointer',
        color: enabled ? '#0f766e' : '#a1a1aa',
        fontFamily: 'var(--font-body)', fontSize: '12px', fontWeight: 600,
        padding: '4px 0',
        transition: 'color 0.2s',
      }}
    >
      {enabled ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
      <span>Agent {enabled ? 'ON' : 'OFF'}</span>
    </button>
  );
}

// ─── Animated Counter ────────────────────────────────────────────────
function Counter({ target, prefix = '', suffix = '', duration = 1.8, decimals = 0 }: {
  target: number; prefix?: string; suffix?: string; duration?: number; decimals?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.8 });
  const [count, setCount] = useState(0);
  const hasRun = useRef(false);

  useEffect(() => {
    if (!isInView || hasRun.current) return;
    hasRun.current = true;
    const steps = 60;
    let frame = 0;
    const tick = () => {
      frame++;
      const progress = frame / steps;
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target * Math.pow(10, decimals)) / Math.pow(10, decimals));
      if (frame < steps) setTimeout(tick, (duration * 1000) / steps);
      else setCount(target);
    };
    tick();
  }, [isInView, target, duration, decimals]);

  return (
    <span ref={ref}>{prefix}{decimals > 0 ? count.toFixed(decimals) : count.toLocaleString()}{suffix}</span>
  );
}

// ─── Session key timer ───────────────────────────────────────────────
function SessionTimer() {
  const [seconds, setSeconds] = useState(14 * 3600 + 22 * 60 + 43);
  useEffect(() => {
    const id = setInterval(() => setSeconds(s => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, []);
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  const label = `${h}h ${m.toString().padStart(2, '0')}m ${s.toString().padStart(2, '0')}s`;
  const isLow = seconds < 3600;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '6px',
      padding: '5px 14px', borderRadius: '999px',
      background: isLow ? 'rgba(239,68,68,0.08)' : 'rgba(22,163,74,0.08)',
      border: `1px solid ${isLow ? 'rgba(239,68,68,0.25)' : 'rgba(22,163,74,0.25)'}`,
      color: isLow ? '#dc2626' : '#16a34a',
      fontFamily: 'var(--font-body)', fontSize: '12px', fontWeight: 600,
    }}>
      <Clock size={12} />
      Session Key Active: {label}
    </span>
  );
}

// ─── Machine Card ────────────────────────────────────────────────────
function MachineCard({ machine, onToggleAgent, killActive }: {
  machine: Machine;
  onToggleAgent: (id: string) => void;
  killActive: boolean;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, ease: ease.snappy }}
      style={{
        background: '#fff',
        border: machine.status === 'RUNNING' ? '1.5px solid rgba(99,102,241,0.3)' : '1.5px solid #e4e4e7',
        borderRadius: '16px',
        overflow: 'hidden',
        transition: 'all 0.28s cubic-bezier(.4,0,.2,1)',
        position: 'relative',
      }}
      whileHover={{ translateY: -4, boxShadow: '0 12px 40px rgba(0,0,0,0.09)' }}
    >
      {/* Running glow top border */}
      {machine.status === 'RUNNING' && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: '2px',
          background: 'linear-gradient(90deg, #6366f1, #8b5cf6, #6366f1)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 2.2s linear infinite',
        }} />
      )}

      {/* Card Header */}
      <div style={{ padding: '16px 18px 14px', borderBottom: '1px solid #f4f4f5' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '8px' }}>
          <div>
            <div style={{
              fontFamily: 'var(--font-display)', fontSize: '14px', fontWeight: 700,
              color: '#0a0a0a', letterSpacing: '-0.01em', marginBottom: '2px',
            }}>
              {machine.name}
            </div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: '#71717a', fontWeight: 500 }}>
              {machine.type} · #{machine.id}
            </div>
          </div>
          <StatusPill status={machine.status} />
        </div>

        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '5px',
          padding: '2px 8px', borderRadius: '6px',
          background: '#f4f4f5', fontSize: '10px',
          fontFamily: 'var(--font-body)', color: '#52525b', fontWeight: 500,
        }}>
          <Layers size={9} />
          Batch: {machine.batchHash}
        </div>
      </div>

      {/* Telemetry Snapshot */}
      <div style={{ padding: '14px 18px' }}>
        {machine.status === 'RUNNING' && machine.currentJob && (
          <div style={{
            padding: '8px 12px', borderRadius: '8px',
            background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)',
            marginBottom: '12px',
          }}>
            <div style={{ fontSize: '10px', color: '#6366f1', fontFamily: 'var(--font-body)', fontWeight: 600, marginBottom: '2px' }}>
              ACTIVE JOB
            </div>
            <div style={{ fontSize: '12px', color: '#0a0a0a', fontFamily: 'var(--font-body)', fontWeight: 500 }}>
              {machine.currentJob}
            </div>
          </div>
        )}

        {/* Metrics row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
          <div style={{ padding: '8px 10px', background: '#fafafa', borderRadius: '8px', border: '1px solid #f0f0f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}>
              <Zap size={10} color="#a1a1aa" />
              <span style={{ fontSize: '10px', color: '#a1a1aa', fontFamily: 'var(--font-body)', fontWeight: 500 }}>Power</span>
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '15px', fontWeight: 700, color: '#0a0a0a', letterSpacing: '-0.02em' }}>
              {machine.powerDraw} <span style={{ fontSize: '10px', fontWeight: 500, color: '#71717a' }}>kW</span>
            </div>
          </div>
          <div style={{ padding: '8px 10px', background: '#fafafa', borderRadius: '8px', border: '1px solid #f0f0f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}>
              <Thermometer size={10} color="#a1a1aa" />
              <span style={{ fontSize: '10px', color: '#a1a1aa', fontFamily: 'var(--font-body)', fontWeight: 500 }}>Temp</span>
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '15px', fontWeight: 700, color: '#0a0a0a', letterSpacing: '-0.02em' }}>
              {machine.chamberTemp}° <span style={{ fontSize: '10px', fontWeight: 500, color: '#71717a' }}>C</span>
            </div>
          </div>
        </div>

        {/* Layer progress */}
        {machine.status === 'RUNNING' && (
          <div style={{ marginBottom: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span style={{ fontSize: '11px', color: '#71717a', fontFamily: 'var(--font-body)', fontWeight: 500 }}>Layer Progress</span>
              <span style={{ fontSize: '12px', fontWeight: 700, fontFamily: 'var(--font-display)', color: '#4f46e5' }}>{machine.layerProgress}%</span>
            </div>
            <ProgressBar value={machine.layerProgress} color="#6366f1" />
          </div>
        )}

        {/* Rate & Jobs */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <div>
            <div style={{ fontSize: '10px', color: '#a1a1aa', fontFamily: 'var(--font-body)', fontWeight: 500 }}>Rate</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '14px', fontWeight: 800, color: '#0a0a0a', letterSpacing: '-0.02em' }}>
              ${machine.hourlyRate}/hr
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '10px', color: '#a1a1aa', fontFamily: 'var(--font-body)', fontWeight: 500 }}>Total Jobs</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '14px', fontWeight: 800, color: '#0a0a0a', letterSpacing: '-0.02em' }}>
              {machine.totalJobs}
            </div>
          </div>
        </div>

        {/* Agent toggle */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          paddingTop: '10px', borderTop: '1px solid #f4f4f5',
        }}>
          <Toggle
            enabled={machine.agentEnabled && !killActive}
            onChange={() => onToggleAgent(machine.id)}
          />
          <div style={{ display: 'flex', gap: '6px' }}>
            {[
              { icon: <Eye size={13} />, title: 'View Telemetry Logs' },
              { icon: <Settings size={13} />, title: 'Configure Agent Rules' },
              { icon: <RefreshCw size={13} />, title: 'Register New Batch' },
            ].map((btn, i) => (
              <button
                key={i}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: '28px', height: '28px', borderRadius: '8px',
                  background: '#f4f4f5', border: '1px solid #e4e4e7',
                  cursor: 'pointer', color: '#52525b', transition: 'all 0.2s',
                }}
                title={btn.title}
                onMouseEnter={e => { e.currentTarget.style.background = '#e4e4e7'; e.currentTarget.style.color = '#0a0a0a'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#f4f4f5'; e.currentTarget.style.color = '#52525b'; }}
              >
                {btn.icon}
              </button>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main Page Component ─────────────────────────────────────────────
export default function LenderDashboard() {
  const [fleet, setFleet] = useState<Machine[]>(MOCK_FLEET);
  const [isKillSwitchActive, setIsKillSwitchActive] = useState(false);
  const [killConfirm, setKillConfirm] = useState(false);

  // Simulated live telemetry updates
  useEffect(() => {
    const id = setInterval(() => {
      setFleet(prev => prev.map(m => {
        if (m.status !== 'RUNNING') return m;
        const newProgress = Math.min(100, m.layerProgress + Math.random() * 0.4);
        const newTemp = m.chamberTemp + (Math.random() - 0.5) * 2;
        const newPower = m.powerDraw + (Math.random() - 0.5) * 0.3;
        return {
          ...m,
          layerProgress: Math.round(newProgress),
          chamberTemp: Math.round(newTemp * 10) / 10,
          powerDraw: Math.round(newPower * 10) / 10,
        };
      }));
    }, 2000);
    return () => clearInterval(id);
  }, []);

  const handleKillSwitch = () => {
    if (!killConfirm) { setKillConfirm(true); return; }
    setIsKillSwitchActive(prev => !prev);
    setKillConfirm(false);
  };

  const handleToggleAgent = (id: string) => {
    setFleet(prev => prev.map(m => m.id === id ? { ...m, agentEnabled: !m.agentEnabled } : m));
  };

  const financials = {
    totalSettled: 284200,
    activeEscrow: 18430,
    monetizedHours: 3842,
    avgYield: 148.5,
  };

  const runningCount = fleet.filter(m => m.status === 'RUNNING').length;
  const idleCount = fleet.filter(m => m.status === 'IDLE').length;
  const offlineCount = fleet.filter(m => m.status === 'OFFLINE').length;

  return (
    <div style={{ minHeight: '100vh', background: '#fff', fontFamily: 'var(--font-body)' }}>

      {/* ────────────────────────────────────────────────────────────
          SECTION 1: HEADER & GLOBAL FLEET CONTROL BAR
      ──────────────────────────────────────────────────────────── */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1.5px solid #e4e4e7',
        padding: '0 40px',
      }}>
        <div style={{
          maxWidth: '1320px', margin: '0 auto',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          height: '68px', gap: '20px',
        }}>
          {/* Left: Identity */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <a href="/" style={{
              fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 800,
              letterSpacing: '-0.03em', color: '#0a0a0a', textDecoration: 'none',
            }}>
              ⬡ IndustriLease
            </a>
            <div style={{ width: '1px', height: '24px', background: '#e4e4e7' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '36px', height: '36px', borderRadius: '10px',
                background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Cpu size={16} color="#fff" />
              </div>
              <div>
                <div style={{
                  fontFamily: 'var(--font-display)', fontSize: '14px', fontWeight: 700,
                  color: '#0a0a0a', letterSpacing: '-0.01em', lineHeight: 1.2,
                }}>
                  @factory.eth
                </div>
                <div style={{ fontSize: '11px', color: '#71717a', fontFamily: 'var(--font-body)', fontWeight: 500 }}>
                  {fleet.length} Registered Machines · EU-West Region
                </div>
              </div>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '4px',
                padding: '2px 8px', borderRadius: '6px',
                background: '#f4f4f5', border: '1px solid #e4e4e7',
                fontSize: '10px', fontFamily: 'var(--font-body)', fontWeight: 700,
                color: '#52525b', letterSpacing: '0.04em',
              }}>
                ⬡ ENS
              </span>
            </div>
          </div>

          {/* Center: Network & session */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '5px 12px', borderRadius: '999px',
              background: 'rgba(22,163,74,0.06)', border: '1px solid rgba(22,163,74,0.2)',
            }}>
              <PulsingDot color="#16a34a" size={7} />
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#15803d', fontFamily: 'var(--font-body)' }}>
                Sepolia Testnet
              </span>
            </div>
            <SessionTimer />
          </div>

          {/* Right: Kill Switch */}
          <motion.button
            id="kill-switch-btn"
            onClick={handleKillSwitch}
            animate={isKillSwitchActive ? {
              boxShadow: ['0 0 0 0 rgba(239,68,68,0.4)', '0 0 0 8px rgba(239,68,68,0)', '0 0 0 0 rgba(239,68,68,0.4)'],
            } : {}}
            transition={{ duration: 2, repeat: Infinity }}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '9px 18px', borderRadius: '10px',
              background: isKillSwitchActive ? '#dc2626' : killConfirm ? 'rgba(239,68,68,0.08)' : '#0a0a0a',
              border: killConfirm ? '1.5px solid rgba(239,68,68,0.4)' : '1.5px solid transparent',
              color: isKillSwitchActive ? '#fff' : killConfirm ? '#dc2626' : '#fff',
              fontFamily: 'var(--font-display)', fontSize: '13px', fontWeight: 700,
              cursor: 'pointer', transition: 'all 0.2s ease',
              whiteSpace: 'nowrap',
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
          >
            <Power size={14} />
            {isKillSwitchActive ? 'LISTINGS PAUSED' : killConfirm ? 'CONFIRM PAUSE ALL' : 'Pause All Agent Listings'}
          </motion.button>
        </div>
      </header>

      {/* Kill switch banner */}
      {isKillSwitchActive && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          style={{
            background: 'rgba(239,68,68,0.06)', borderBottom: '1px solid rgba(239,68,68,0.2)',
            padding: '10px 40px',
          }}
        >
          <div style={{
            maxWidth: '1320px', margin: '0 auto',
            display: 'flex', alignItems: 'center', gap: '10px',
          }}>
            <AlertTriangle size={15} color="#dc2626" />
            <span style={{ fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 600, color: '#dc2626' }}>
              Emergency Kill Switch Active — All AI agent listings are suspended. Smart contract flags updated. Click the button again to restore.
            </span>
          </div>
        </motion.div>
      )}

      {/* ── PAGE CONTENT ── */}
      <main style={{ maxWidth: '1320px', margin: '0 auto', padding: '40px 40px 80px' }}>

        {/* Page title row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: ease.snappy }}
          style={{ marginBottom: '32px' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <motion.span
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
            >
              <Sparkle size={16} style={{ color: '#0a0a0a' }} />
            </motion.span>
            <span style={{
              fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 700,
              letterSpacing: '0.09em', textTransform: 'uppercase', color: '#a1a1aa',
            }}>
              Lender Command Center
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <h1 style={{
              fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 3vw, 2.6rem)',
              fontWeight: 800, letterSpacing: '-0.035em', color: '#0a0a0a',
              lineHeight: 1.1, margin: 0,
            }}>
              Fleet Operations
            </h1>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {[
                { count: idleCount, label: 'Idle', color: '#14b8a6', bg: 'rgba(20,184,166,0.08)', border: 'rgba(20,184,166,0.2)', text: '#0f766e' },
                { count: runningCount, label: 'Running', color: '#6366f1', bg: 'rgba(99,102,241,0.08)', border: 'rgba(99,102,241,0.2)', text: '#4f46e5' },
                { count: offlineCount, label: 'Offline', color: '#a1a1aa', bg: '#f4f4f5', border: '#e4e4e7', text: '#71717a' },
              ].map((s, i) => (
                <span key={i} style={{
                  display: 'flex', alignItems: 'center', gap: '5px',
                  padding: '4px 12px', borderRadius: '8px',
                  background: s.bg, border: `1px solid ${s.border}`,
                  fontSize: '12px', fontWeight: 600, color: s.text, fontFamily: 'var(--font-body)',
                }}>
                  <PulsingDot color={s.color} size={6} /> {s.count} {s.label}
                </span>
              ))}
            </div>
          </div>
        </motion.div>

        {/* ────────────────────────────────────────────────────────────
            SECTION 2: FINANCIAL & CAPACITY METRICS BAR
        ──────────────────────────────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '40px' }}>
          {[
            {
              label: 'Total Settled Revenue',
              sublabel: 'From IndustriLeaseEscrow.sol',
              value: financials.totalSettled,
              prefix: '$', suffix: '', decimals: 0,
              icon: <DollarSign size={16} color="#16a34a" />,
              accent: '#16a34a', bg: 'rgba(22,163,74,0.06)', border: 'rgba(22,163,74,0.15)',
            },
            {
              label: 'Active Escrow Locked',
              sublabel: 'In-progress & booked jobs',
              value: financials.activeEscrow,
              prefix: '$', suffix: '', decimals: 0,
              icon: <Shield size={16} color="#6366f1" />,
              accent: '#6366f1', bg: 'rgba(99,102,241,0.06)', border: 'rgba(99,102,241,0.15)',
            },
            {
              label: 'Idle Hours Monetized',
              sublabel: 'Downtime converted to revenue',
              value: financials.monetizedHours,
              prefix: '', suffix: 'h', decimals: 0,
              icon: <Clock size={16} color="#f59e0b" />,
              accent: '#f59e0b', bg: 'rgba(245,158,11,0.06)', border: 'rgba(245,158,11,0.15)',
            },
            {
              label: 'Average Hourly Yield',
              sublabel: 'Across active fleet machines',
              value: financials.avgYield,
              prefix: '$', suffix: '/hr', decimals: 1,
              icon: <TrendingUp size={16} color="#8b5cf6" />,
              accent: '#8b5cf6', bg: 'rgba(139,92,246,0.06)', border: 'rgba(139,92,246,0.15)',
            },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08, duration: 0.5, ease: ease.snappy }}
              style={{
                padding: '20px 22px', background: '#fff',
                border: '1.5px solid #e4e4e7', borderRadius: '14px',
                transition: 'all 0.28s cubic-bezier(.4,0,.2,1)',
              }}
              whileHover={{ translateY: -3, boxShadow: '0 8px 28px rgba(0,0,0,0.07)', borderColor: '#bbb' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <div style={{ fontSize: '12px', color: '#71717a', fontFamily: 'var(--font-body)', fontWeight: 600 }}>
                  {stat.label}
                </div>
                <div style={{
                  width: '32px', height: '32px', borderRadius: '8px',
                  background: stat.bg, border: `1px solid ${stat.border}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {stat.icon}
                </div>
              </div>
              <div style={{
                fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 800,
                color: '#0a0a0a', letterSpacing: '-0.035em', lineHeight: 1, marginBottom: '4px',
              }}>
                <Counter target={stat.value} prefix={stat.prefix} suffix={stat.suffix} decimals={stat.decimals} />
              </div>
              <div style={{ fontSize: '11px', color: '#a1a1aa', fontFamily: 'var(--font-body)', fontWeight: 500 }}>
                {stat.sublabel}
              </div>
            </motion.div>
          ))}
        </div>

        {/* ────────────────────────────────────────────────────────────
            SECTION 3: FLEET COMMAND GRID
        ──────────────────────────────────────────────────────────── */}
        <div style={{ marginBottom: '48px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div>
              <div style={{
                fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 700,
                letterSpacing: '0.08em', textTransform: 'uppercase', color: '#a1a1aa', marginBottom: '4px',
              }}>
                Fleet Command Grid
              </div>
              <h2 style={{
                fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 700,
                color: '#0a0a0a', letterSpacing: '-0.02em', margin: 0,
              }}>
                Machine Fleet Management
              </h2>
            </div>
            <a
              href="/machines/new"
              id="register-machine-btn"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                padding: '9px 18px', borderRadius: '10px',
                background: '#0a0a0a', color: '#fff',
                fontFamily: 'var(--font-display)', fontSize: '13px', fontWeight: 700,
                textDecoration: 'none', transition: 'all 0.2s',
                border: '1.5px solid #0a0a0a',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#222'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#0a0a0a'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              <Plus size={14} /> Register Machine
            </a>
          </div>

          {isKillSwitchActive && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{
                padding: '12px 16px', borderRadius: '10px',
                background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)',
                marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px',
              }}
            >
              <AlertTriangle size={14} color="#dc2626" />
              <span style={{ fontSize: '12px', color: '#dc2626', fontWeight: 600, fontFamily: 'var(--font-body)' }}>
                Kill switch active — all agent toggles suspended across fleet
              </span>
            </motion.div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
            {fleet.map(machine => (
              <MachineCard
                key={machine.id}
                machine={machine}
                onToggleAgent={handleToggleAgent}
                killActive={isKillSwitchActive}
              />
            ))}
          </div>
        </div>

        {/* ────────────────────────────────────────────────────────────
            SECTION 4: REVENUE & ESCROW SETTLEMENT TABLE
        ──────────────────────────────────────────────────────────── */}
        <div style={{ marginBottom: '48px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div>
              <div style={{
                fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 700,
                letterSpacing: '0.08em', textTransform: 'uppercase', color: '#a1a1aa', marginBottom: '4px',
              }}>
                Blockchain Settlement
              </div>
              <h2 style={{
                fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 700,
                color: '#0a0a0a', letterSpacing: '-0.02em', margin: 0,
              }}>
                Revenue & Escrow History
              </h2>
            </div>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '5px',
              padding: '5px 12px', borderRadius: '8px',
              background: '#f4f4f5', border: '1px solid #e4e4e7',
              fontSize: '12px', color: '#52525b', fontWeight: 600, fontFamily: 'var(--font-body)',
            }}>
              <Activity size={12} /> Live Syncing
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            style={{ background: '#fff', border: '1.5px solid #e4e4e7', borderRadius: '16px', overflow: 'hidden' }}
          >
            {/* Table header */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '100px 140px 1fr 160px 110px 120px 100px',
              gap: '12px',
              padding: '12px 20px',
              background: '#fafafa', borderBottom: '1px solid #e4e4e7',
            }}>
              {['Slot ID', 'Machine', 'Borrower Address', 'Layers (Done/Total)', 'Payout', 'Status', 'Receipt'].map((h, i) => (
                <div key={i} style={{
                  fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 700,
                  color: '#a1a1aa', letterSpacing: '0.05em', textTransform: 'uppercase',
                }}>
                  {h}
                </div>
              ))}
            </div>

            {/* Table rows */}
            {MOCK_SETTLEMENTS.map((record, i) => (
              <motion.div
                key={record.slotId}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 * i + 0.3, duration: 0.4 }}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '100px 140px 1fr 160px 110px 120px 100px',
                  gap: '12px',
                  padding: '14px 20px',
                  borderBottom: i < MOCK_SETTLEMENTS.length - 1 ? '1px solid #f4f4f5' : 'none',
                  alignItems: 'center',
                  transition: 'background 0.15s',
                }}
                whileHover={{ backgroundColor: '#fafafa' }}
              >
                <div style={{ fontFamily: 'var(--font-body)', fontSize: '12px', fontWeight: 700, color: '#0a0a0a', letterSpacing: '0.02em' }}>
                  {record.slotId}
                </div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: '12px', fontWeight: 500, color: '#52525b' }}>
                  {record.machine}
                </div>
                <div style={{ fontFamily: 'monospace', fontSize: '12px', fontWeight: 500, color: '#71717a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {record.borrowerAddress}
                  <a
                    href={`https://sepolia.etherscan.io/tx/${record.txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: '#a1a1aa', textDecoration: 'none', transition: 'color 0.2s' }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#0a0a0a')}
                    onMouseLeave={e => (e.currentTarget.style.color = '#a1a1aa')}
                  >
                    <ExternalLink size={11} />
                  </a>
                </div>
                <div>
                  {record.totalLayers > 0 ? (
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: '#52525b', fontWeight: 500 }}>
                          {record.layersCompleted.toLocaleString()} / {record.totalLayers.toLocaleString()}
                        </span>
                        <span style={{ fontSize: '10px', color: '#a1a1aa', fontFamily: 'var(--font-body)' }}>
                          {Math.round((record.layersCompleted / record.totalLayers) * 100)}%
                        </span>
                      </div>
                      <ProgressBar
                        value={(record.layersCompleted / record.totalLayers) * 100}
                        color={record.status === 'SETTLED' ? '#16a34a' : '#6366f1'}
                      />
                    </div>
                  ) : (
                    <span style={{ fontSize: '11px', color: '#a1a1aa', fontFamily: 'var(--font-body)' }}>—</span>
                  )}
                </div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '14px', fontWeight: 800, color: '#0a0a0a', letterSpacing: '-0.02em' }}>
                  ${record.payout.toFixed(2)}
                </div>
                <div>
                  <SettlementBadge status={record.status} />
                </div>
                <div>
                  {record.status === 'SETTLED' && (
                    <button
                      style={{
                        display: 'flex', alignItems: 'center', gap: '5px',
                        padding: '4px 10px', borderRadius: '6px',
                        background: '#f4f4f5', border: '1px solid #e4e4e7',
                        fontSize: '11px', fontFamily: 'var(--font-body)', fontWeight: 600,
                        color: '#52525b', cursor: 'pointer', transition: 'all 0.2s',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = '#0a0a0a'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = '#0a0a0a'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = '#f4f4f5'; e.currentTarget.style.color = '#52525b'; e.currentTarget.style.borderColor = '#e4e4e7'; }}
                    >
                      <Download size={10} /> TPM
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Settlement summary */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px', gap: '24px' }}>
            {[
              { label: 'Total Settled', value: `$${MOCK_SETTLEMENTS.filter(s => s.status === 'SETTLED').reduce((a, s) => a + s.payout, 0).toFixed(2)}`, color: '#15803d' },
              { label: 'Pending Release', value: `$${MOCK_SETTLEMENTS.filter(s => s.status !== 'SETTLED').reduce((a, s) => a + s.payout, 0).toFixed(2)}`, color: '#52525b' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '12px', color: '#a1a1aa', fontFamily: 'var(--font-body)', fontWeight: 500 }}>{item.label}:</span>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '14px', fontWeight: 800, color: item.color, letterSpacing: '-0.02em' }}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ────────────────────────────────────────────────────────────
            SECTION 5: ONBOARDING & AGENT GOVERNANCE QUICK ACTIONS
        ──────────────────────────────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '40px' }}>
          {/* Register new machine */}
          <motion.a
            href="/machines/new"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            style={{
              display: 'flex', alignItems: 'center', gap: '20px',
              padding: '24px 28px', borderRadius: '16px',
              background: '#0a0a0a', textDecoration: 'none',
              border: '1.5px solid #0a0a0a', position: 'relative', overflow: 'hidden',
            }}
            whileHover={{ scale: 1.01, boxShadow: '0 8px 30px rgba(0,0,0,0.18)' }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
              style={{ position: 'absolute', top: '14px', right: '20px', opacity: 0.2 }}
            >
              <Sparkle size={28} style={{ color: '#fff' }} />
            </motion.div>
            <div style={{
              width: '48px', height: '48px', borderRadius: '12px',
              background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <Plus size={22} color="#fff" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{
                fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: 700,
                color: '#fff', letterSpacing: '-0.02em', marginBottom: '4px',
              }}>
                Register New Machine
              </div>
              <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.55)', fontFamily: 'var(--font-body)', fontWeight: 500 }}>
                Onboard equipment to the IndustriLease network and start earning with AI-powered time slots
              </div>
            </div>
            <ChevronRight size={20} color="rgba(255,255,255,0.4)" />
          </motion.a>

          {/* Agent policy */}
          <motion.a
            href="/agent-settings"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18, duration: 0.5 }}
            style={{
              display: 'flex', alignItems: 'center', gap: '20px',
              padding: '24px 28px', borderRadius: '16px',
              background: '#fff', textDecoration: 'none',
              border: '1.5px solid #e4e4e7', position: 'relative', overflow: 'hidden',
            }}
            whileHover={{ scale: 1.01, boxShadow: '0 8px 28px rgba(0,0,0,0.07)', borderColor: '#bbb' }}
          >
            <div style={{
              width: '48px', height: '48px', borderRadius: '12px',
              background: '#f4f4f5', border: '1px solid #e4e4e7',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <Terminal size={22} color="#0a0a0a" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{
                fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: 700,
                color: '#0a0a0a', letterSpacing: '-0.02em', marginBottom: '4px',
              }}>
                Manage AI Agent Policy
              </div>
              <div style={{ fontSize: '13px', color: '#71717a', fontFamily: 'var(--font-body)', fontWeight: 500 }}>
                Configure discount limits, off-peak hours, session keys, and ERC-7579 authorization rules
              </div>
            </div>
            <ChevronRight size={20} color="#a1a1aa" />
          </motion.a>
        </div>

        {/* Data Source Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          style={{
            padding: '16px 20px', borderRadius: '10px',
            background: '#fafafa', border: '1px solid #e4e4e7',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
            {[
              { icon: <Radio size={11} color="#16a34a" />, label: 'Live telemetry via', bold: 'simulator.py WebSocket' },
              { icon: <Activity size={11} color="#6366f1" />, label: 'Escrow data from', bold: 'IndustriLeaseEscrow.sol' },
              { icon: <Shield size={11} color="#a1a1aa" />, label: 'Session:', bold: 'ERC-7579 Session Key' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                {item.icon}
                <span style={{ fontSize: '11px', color: '#71717a', fontFamily: 'var(--font-body)', fontWeight: 500 }}>
                  {item.label} <strong style={{ color: '#52525b' }}>{item.bold}</strong>
                </span>
              </div>
            ))}
          </div>
          <span style={{ fontSize: '11px', color: '#a1a1aa', fontFamily: 'var(--font-body)', fontWeight: 500 }}>
            Last sync: just now · Auto-refresh every 2s
          </span>
        </motion.div>

      </main>
    </div>
  );
}
