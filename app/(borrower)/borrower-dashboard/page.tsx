'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Shield,
  Activity,
  Clock,
  Zap,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Power,
  Lock,
  Unlock,
  Terminal,
  Cpu,
  Radio,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import Link from 'next/link';

// ─── Easing ───────────────────────────────────────────────────────────────────
const ease = {
  snappy: [0.22, 1, 0.36, 1] as const,
  smooth: [0.25, 0.46, 0.45, 0.94] as const,
};

// ─── Sparkle Component ────────────────────────────────────────────────────────
function Sparkle({ size = 20, style = {} }: { size?: number; style?: React.CSSProperties }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" style={{ display: 'inline-block', ...style }}>
      <path d="M12 0 L13.8 10.2 L24 12 L13.8 13.8 L12 24 L10.2 13.8 L0 12 L10.2 10.2 Z" />
    </svg>
  );
}

// ─── Pulsing Dot Component ────────────────────────────────────────────────────
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

// ─── Types & Mock Data ────────────────────────────────────────────────────────
interface RunningJob {
  slotId: number;
  machineId: string;
  machineName: string;
  category: string;
  material: string;
  pricePerHour: string;
  setupFee: string;
  totalLayers: number;
  escrowTx: string;
  factory: string;
}

const MOCK_JOBS: Record<number, RunningJob> = {
  1: {
    slotId: 1,
    machineId: 'EOS-M290-01',
    machineName: 'EOS M 290 Titanium',
    category: 'Metal SLS',
    material: 'Titanium Ti-6Al-4V',
    pricePerHour: '200 USDC',
    setupFee: '50 USDC',
    totalLayers: 100,
    escrowTx: '0x32c8b8f2d1e0a8b9c7a6e5d4c3b2a1a0f9e8d7c6b5a4',
    factory: '0x3333333333333333333333333333333333333333',
  },
  2: {
    slotId: 2,
    machineId: 'DMG-5A-007',
    machineName: 'DMG Mori 5-Axis CNC',
    category: '5-Axis CNC',
    material: 'Aerospace Aluminum 7075',
    pricePerHour: '145 USDC',
    setupFee: '75 USDC',
    totalLayers: 200,
    escrowTx: '0x8f2d1e0a8b9c7a6e5d4c3b2a1a0f9e8d7c6b5a432c8b',
    factory: '0x1212121212121212121212121212121212121212',
  },
  3: {
    slotId: 3,
    machineId: 'STRATASYS-F900-03',
    machineName: 'Stratasys F900 ULTEM',
    category: 'Industrial FDM',
    material: 'Carbon Fiber PEEK',
    pricePerHour: '45 USDC',
    setupFee: '20 USDC',
    totalLayers: 320,
    escrowTx: '0xa6e5d4c3b2a1a0f9e8d7c6b5a432c8b8f2d1e0a8b9c7',
    factory: '0x0909090909090909090909090909090909090909',
  },
};

const DEFAULT_JOB: RunningJob = {
  slotId: 4,
  machineId: 'CUSTOM-DEPIN-NODE',
  machineName: 'Generic DePIN CNC Center',
  category: '5-Axis CNC',
  material: 'Stainless Steel 316L',
  pricePerHour: '120 USDC',
  setupFee: '40 USDC',
  totalLayers: 150,
  escrowTx: '0xabcdef0123456789abcdef0123456789abcdef012345',
  factory: '0x5555555555555555555555555555555555555555',
};

export default function BorrowerDashboard() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fafafa', fontFamily: 'var(--font-body)' }}>
        <p style={{ color: '#71717a' }}>Loading Borrower Portal...</p>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}

function DashboardContent() {
  const searchParams = useSearchParams();
  const slotIdParam = searchParams.get('slotId');
  const txParam = searchParams.get('tx');

  const slotId = slotIdParam ? parseInt(slotIdParam) : 1;
  const job = MOCK_JOBS[slotId] || {
    ...DEFAULT_JOB,
    slotId,
    escrowTx: txParam || DEFAULT_JOB.escrowTx,
  };

  // Telemetry simulation state
  const [status, setStatus] = useState<'INITIALIZING' | 'RUNNING' | 'VERIFYING' | 'SETTLED'>('INITIALIZING');
  const [layer, setLayer] = useState(0);
  const [chamberTemp, setChamberTemp] = useState(25);
  const [powerDraw, setPowerDraw] = useState(0);
  const [timeLeft, setTimeLeft] = useState(45); // simulated minutes remaining
  const [consoleLogs, setConsoleLogs] = useState<string[]>([]);
  const [signature, setSignature] = useState<string>('');
  const logContainerRef = useRef<HTMLDivElement>(null);

  // Add line to simulated console
  const addLog = (msg: string) => {
    const time = new Date().toLocaleTimeString();
    setConsoleLogs(prev => [...prev, `[${time}] ${msg}`]);
  };

  // Autoscroll logs
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [consoleLogs]);

  // Telemetry Loop Simulation
  useEffect(() => {
    addLog(`System initialized. Fetching Escrow contract parameters for Slot #${job.slotId}...`);
    addLog(`Escrow Verification: Deposit found. Tx: ${job.escrowTx.substring(0, 14)}...`);
    addLog(`Connecting securely to DePIN Node: ${job.machineId}...`);

    const initTimeout = setTimeout(() => {
      setStatus('RUNNING');
      addLog(`Secure SSH session established with AI Agent Key relay.`);
      addLog(`Verification Signature Handshake: SUCCESS.`);
      addLog(`Job execution initiated. Uploaded G-code fingerprint match: OK.`);
      setPowerDraw(4.8);
      setChamberTemp(job.category === 'Metal SLS' ? 85 : 55);
    }, 2000);

    return () => clearTimeout(initTimeout);
  }, [job.slotId]);

  // Simulation running loop
  useEffect(() => {
    if (status !== 'RUNNING') return;

    const interval = setInterval(() => {
      setLayer(prev => {
        const next = prev + Math.ceil(job.totalLayers / 20);
        if (next >= job.totalLayers) {
          clearInterval(interval);
          setStatus('VERIFYING');
          setPowerDraw(1.2);
          setTimeLeft(0);
          return job.totalLayers;
        }

        // Random adjustments to telemetry values
        setChamberTemp(c => +(c + (Math.random() * 4 - 2)).toFixed(1));
        setPowerDraw(p => +(p + (Math.random() * 1 - 0.5)).toFixed(2));
        setTimeLeft(t => Math.max(1, t - 3));

        addLog(`Executing G-code block. Render layer ${next}/${job.totalLayers} (X/Y limits within bounds)`);
        return next;
      });
    }, 1500);

    return () => clearInterval(interval);
  }, [status, job.totalLayers]);

  // Telemetry complete & verification transition
  useEffect(() => {
    if (status !== 'VERIFYING') return;

    addLog(`Job execution completed. Cooling down chamber temperature...`);
    addLog(`Generating EIP-712 cryptographic hardware telemetry package...`);

    const verTimeout = setTimeout(() => {
      const mockSig = '0x' + Array.from({ length: 130 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
      setSignature(mockSig);
      addLog(`Cryptographic Telemetry Package successfully signed by Machine Wallet!`);
      addLog(`Telemetry Signature: ${mockSig.substring(0, 30)}...`);
      addLog(`Relaying Telemetry Proof payload to Escrow contract /relay-proof endpoint...`);
      
      const settlementTimeout = setTimeout(() => {
        setStatus('SETTLED');
        addLog(`Escrow contract releaseFunds execution: CONFIRMED.`);
        addLog(`Payout released to Factory: ${job.factory.substring(0, 16)}...`);
        addLog(`Job status: SETTLED. Connection closed gracefully.`);
      }, 2500);

      return () => clearTimeout(settlementTimeout);
    }, 3000);

    return () => clearTimeout(verTimeout);
  }, [status]);

  // Status-specific variables
  const statusLabel = {
    INITIALIZING: 'INITIALIZING escrow',
    RUNNING: 'PRINTING / RUNNING',
    VERIFYING: 'VERIFYING TELEMETRY',
    SETTLED: 'COMPLETED & SETTLED',
  }[status];

  const progressPercentage = Math.min(100, Math.round((layer / job.totalLayers) * 100));

  return (
    <div style={{ minHeight: '100vh', background: '#fafafa', color: '#0a0a0a', paddingBottom: '60px' }}>
      {/* ── Header ── */}
      <header style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 40px', background: 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1.5px solid #e4e4e7',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link href="/marketplace" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', borderRadius: '50%', border: '1.5px solid #e4e4e7', background: '#fff', color: '#0a0a0a', cursor: 'pointer', transition: 'all 0.2s' }}>
            <ArrowLeft size={16} />
          </Link>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 800, letterSpacing: '-0.02em' }}>
            Borrower Capacity Portal
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#16a34a', display: 'inline-block', animation: 'ping-dot 1.8s ease-in-out infinite' }} />
          <span style={{ fontFamily: 'var(--font-body)', fontSize: '12px', fontWeight: 600, color: '#52525b' }}>
            Secure Escrow Client
          </span>
        </div>
      </header>

      {/* Main Grid */}
      <main style={{ maxWidth: '1200px', margin: '100px auto 0', padding: '0 24px', display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '30px' }}>
        
        {/* Left Column: Job Info & Console */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          
          {/* Card: Active Job Status */}
          <div style={{ background: '#fff', border: '1.5px solid #e4e4e7', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1.5px solid #f4f4f5', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#71717a', background: '#f4f4f5', padding: '2px 8px', borderRadius: '999px', display: 'inline-block', marginBottom: '4px' }}>
                  {job.category}
                </span>
                <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 800, color: '#0a0a0a', margin: 0 }}>
                  {job.machineName}
                </h1>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '11px', color: '#a1a1aa', fontWeight: 600, display: 'block', textTransform: 'uppercase' }}>Current State</span>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                  padding: '4px 12px', borderRadius: '999px',
                  fontSize: '11px', fontWeight: 800, letterSpacing: '0.04em',
                  background: status === 'SETTLED' ? '#dcfce7' : status === 'VERIFYING' ? '#fef9c3' : '#dbeafe',
                  color: status === 'SETTLED' ? '#16a34a' : status === 'VERIFYING' ? '#854d0e' : '#2563eb',
                  border: `1.5px solid ${status === 'SETTLED' ? '#bbf7d0' : status === 'VERIFYING' ? '#fef08a' : '#bfdbfe'}`,
                }}>
                  <PulsingDot color={status === 'SETTLED' ? '#16a34a' : status === 'VERIFYING' ? '#eab308' : '#3b82f6'} size={6} />
                  {statusLabel}
                </span>
              </div>
            </div>

            <div style={{ padding: '24px' }}>
              {/* Progress Bar */}
              <div style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px', fontWeight: 700 }}>
                  <span style={{ color: '#52525b' }}>Job Completion Progress</span>
                  <span style={{ color: '#0a0a0a' }}>{progressPercentage}%</span>
                </div>
                <div style={{ height: '8px', background: '#f4f4f5', borderRadius: '999px', overflow: 'hidden', border: '1px solid #e4e4e7' }}>
                  <motion.div
                    initial={{ width: '0%' }}
                    animate={{ width: `${progressPercentage}%` }}
                    transition={{ duration: 0.5 }}
                    style={{ height: '100%', background: '#0a0a0a', borderRadius: '999px' }}
                  />
                </div>
              </div>

              {/* Status parameters */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                <div style={{ background: '#fafafa', border: '1.5px solid #e4e4e7', borderRadius: '12px', padding: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#71717a', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>
                    <Layers size={13} />
                    Layers Rendered
                  </div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 800, color: '#0a0a0a' }}>
                    {layer} <span style={{ fontSize: '13px', color: '#a1a1aa', fontWeight: 500 }}>/ {job.totalLayers}</span>
                  </div>
                </div>

                <div style={{ background: '#fafafa', border: '1.5px solid #e4e4e7', borderRadius: '12px', padding: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#71717a', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>
                    <Activity size={13} />
                    Chamber Temp
                  </div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 800, color: '#0a0a0a' }}>
                    {chamberTemp}°C
                  </div>
                </div>

                <div style={{ background: '#fafafa', border: '1.5px solid #e4e4e7', borderRadius: '12px', padding: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#71717a', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>
                    <Zap size={13} />
                    Power Draw
                  </div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 800, color: '#0a0a0a' }}>
                    {powerDraw} kW
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Console / Agent logs */}
          <div style={{ background: '#0a0a0a', border: '1.5px solid #27272a', borderRadius: '16px', overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '350px' }}>
            <div style={{ background: '#18181b', padding: '10px 16px', borderBottom: '1.5px solid #27272a', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#a1a1aa' }}>
                <Terminal size={14} />
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '12px', fontWeight: 700, letterSpacing: '0.05em' }}>AI Agent Console Logs</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ef4444' }} />
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#eab308' }} />
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e' }} />
              </div>
            </div>

            <div ref={logContainerRef} style={{ flex: 1, padding: '16px', overflowY: 'auto', fontFamily: 'monospace', fontSize: '12px', color: '#3f3f46', display: 'flex', flexDirection: 'column', gap: '6px', lineHeight: 1.5 }}>
              {consoleLogs.map((log, index) => (
                <div key={index} style={{ color: log.includes('SUCCESS') || log.includes('CONFIRMED') || log.includes('OK') ? '#22c55e' : log.includes('Signature') || log.includes('EIP-712') ? '#a855f7' : log.includes('Executing') ? '#a1a1aa' : '#e4e4e7' }}>
                  {log}
                </div>
              ))}
              {status === 'RUNNING' && (
                <div style={{ color: '#3f3f46', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <RefreshCw size={12} className="animate-spin" style={{ animation: 'spin 1.5s linear infinite' }} />
                  Running CNC toolpaths...
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Escrow Security State */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          
          {/* Card: Escrow Control Card */}
          <div style={{ background: '#fff', border: '1.5px solid #e4e4e7', borderRadius: '16px', overflow: 'hidden', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                <Shield size={18} />
              </div>
              <div>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: 800, color: '#0a0a0a', margin: 0 }}>
                  Parametric Escrow State
                </h2>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: '#a1a1aa', margin: 0 }}>
                  Escrow automatically locked & verified on-chain
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {/* Step 1: Locked Escrow */}
              <div style={{ display: 'flex', gap: '14px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                    <Lock size={12} />
                  </div>
                  <div style={{ width: '2px', height: '32px', background: '#0a0a0a' }} />
                </div>
                <div style={{ flex: 1, paddingBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#0a0a0a' }}>1. Funds Deposited & Locked</span>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#16a34a' }}>SECURED</span>
                  </div>
                  <p style={{ fontSize: '11.5px', color: '#71717a', margin: '4px 0 0' }}>
                    {job.pricePerHour} hourly + {job.setupFee} setup fee is securely locked in the smart contract escrow.
                  </p>
                </div>
              </div>

              {/* Step 2: Proof Generation */}
              <div style={{ display: 'flex', gap: '14px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{
                    width: '24px', height: '24px', borderRadius: '50%',
                    background: status === 'VERIFYING' || status === 'SETTLED' ? '#0a0a0a' : '#f4f4f5',
                    border: `1.5px solid ${status === 'VERIFYING' || status === 'SETTLED' ? '#0a0a0a' : '#e4e4e7'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: status === 'VERIFYING' || status === 'SETTLED' ? '#fff' : '#a1a1aa'
                  }}>
                    <Cpu size={12} />
                  </div>
                  <div style={{ width: '2px', height: '32px', background: status === 'SETTLED' ? '#0a0a0a' : '#e4e4e7' }} />
                </div>
                <div style={{ flex: 1, paddingBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: status === 'VERIFYING' || status === 'SETTLED' ? '#0a0a0a' : '#a1a1aa' }}>
                      2. Cryptographic Telemetry Signature
                    </span>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: status === 'VERIFYING' ? '#eab308' : status === 'SETTLED' ? '#16a34a' : '#a1a1aa' }}>
                      {status === 'INITIALIZING' || status === 'RUNNING' ? 'WAITING' : status === 'VERIFYING' ? 'SIGNING' : 'SIGNED'}
                    </span>
                  </div>
                  <p style={{ fontSize: '11.5px', color: '#71717a', margin: '4px 0 0' }}>
                    Upon job completion, the machine signs telemetry packets with its secure hardware EIP-712 key.
                  </p>
                </div>
              </div>

              {/* Step 3: Payout Settlement */}
              <div style={{ display: 'flex', gap: '14px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{
                    width: '24px', height: '24px', borderRadius: '50%',
                    background: status === 'SETTLED' ? '#0a0a0a' : '#f4f4f5',
                    border: `1.5px solid ${status === 'SETTLED' ? '#0a0a0a' : '#e4e4e7'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: status === 'SETTLED' ? '#fff' : '#a1a1aa'
                  }}>
                    <Unlock size={12} />
                  </div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: status === 'SETTLED' ? '#0a0a0a' : '#a1a1aa' }}>
                      3. Escrow Settlement Released
                    </span>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: status === 'SETTLED' ? '#16a34a' : '#a1a1aa' }}>
                      {status === 'SETTLED' ? 'SETTLED' : 'LOCKED'}
                    </span>
                  </div>
                  <p style={{ fontSize: '11.5px', color: '#71717a', margin: '4px 0 0' }}>
                    Escrow contract verifies the cryptographic telemetry signature and automatically releases funds.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Card: Node Properties */}
          <div style={{ background: '#fff', border: '1.5px solid #e4e4e7', borderRadius: '16px', overflow: 'hidden', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '15px', fontWeight: 800, color: '#0a0a0a', margin: '0 0 16px' }}>
              DePIN Node Profile
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', borderBottom: '1px solid #f4f4f5', paddingBottom: '8px' }}>
                <span style={{ color: '#71717a' }}>Hardware ID</span>
                <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{job.machineId}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', borderBottom: '1px solid #f4f4f5', paddingBottom: '8px' }}>
                <span style={{ color: '#71717a' }}>Build Material</span>
                <span style={{ fontWeight: 600 }}>{job.material}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', borderBottom: '1px solid #f4f4f5', paddingBottom: '8px' }}>
                <span style={{ color: '#71717a' }}>Factory Address</span>
                <span style={{ fontFamily: 'monospace', fontWeight: 600, color: '#2563eb' }}>
                  {job.factory.substring(0, 10)}...{job.factory.substring(34)}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', borderBottom: '1px solid #f4f4f5', paddingBottom: '8px' }}>
                <span style={{ color: '#71717a' }}>Verification Standard</span>
                <span style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', color: '#16a34a' }}>
                  <CheckCircle size={12} />
                  EIP-712 Telemetry
                </span>
              </div>
            </div>
            
            {status === 'SETTLED' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ marginTop: '20px', padding: '12px', background: '#f4f4f5', borderRadius: '12px', border: '1.5px solid #e4e4e7' }}
              >
                <div style={{ display: 'flex', justifyItems: 'center', gap: '8px', color: '#16a34a', fontWeight: 700, fontSize: '12px', marginBottom: '6px' }}>
                  <CheckCircle size={14} /> Verified Settlement Release
                </div>
                <div style={{ fontSize: '11px', color: '#71717a', wordBreak: 'break-all', fontFamily: 'monospace', lineHeight: 1.4 }}>
                  <strong>Sig:</strong> {signature.substring(0, 48)}...
                </div>
              </motion.div>
            )}
          </div>
        </div>

      </main>
    </div>
  );
}

// ─── Dummy Icons ──────────────────────────────────────────────────────────────
function Layers({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 3-10 5 10 5 10-5-10-5Z" />
      <path d="m2 17 10 5 10-5" />
      <path d="m2 12 10 5 10-5" />
    </svg>
  );
}
