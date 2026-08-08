'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  ChevronRight,
  Cpu,
  Layers,
  DollarSign,
  Shield,
  Key,
  CheckCircle,
  AlertTriangle,
  Upload,
  Zap,
  Thermometer,
  Wind,
  Box,
  Activity,
  Lock,
  Unlock,
  Copy,
  RefreshCw,
  ToggleLeft,
  ToggleRight,
  Star,
  FileCheck,
  Link,
  Server,
  Hash,
  Clock,
  TrendingDown,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
interface MachineOnboardingState {
  name: string;
  brand: string;
  serialId: string;
  category: string;
  dimensions: { x: number; y: number; z: number };
  safetyBounds: {
    maxTemp: number;
    maxBedTemp: number;
    maxFeedRate: number;
    maxPower: number;
  };
  materialName: string;
  supplierVcHash: string;
  attestationVerified: boolean;
  materialBatchHash: string;
  setupFee: number;
  minHourlyRate: number;
  securityDeposit: number;
  maxDiscount: number;
  machinePublicKey: string;
  machinePrivateKeyHint: string;
  isKeyGenerated: boolean;
  agentAuthorized: boolean;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const ease = {
  snappy: [0.22, 1, 0.36, 1] as const,
  smooth: [0.25, 0.46, 0.45, 0.94] as const,
};

const CATEGORIES = [
  'Industrial FDM',
  '5-Axis CNC',
  'Metal SLS',
  'Metal SLM',
  'Laser Cutter',
  'Robotic Arm',
  'Wire EDM',
  'Waterjet',
];

const MATERIALS = [
  'Titanium Ti-6Al-4V Grade 23',
  'Aerospace Aluminum 7075',
  'Carbon Fiber PEEK',
  'Inconel 718',
  'Stainless Steel 316L',
  'Ultem 9085',
  'Nylon PA12 (MJF)',
  'Maraging Steel MS1',
];

const STEP_LABELS = [
  { step: 1, label: 'Hardware Profile', icon: Cpu },
  { step: 2, label: 'Material Attestation', icon: Layers },
  { step: 3, label: 'Pricing Rules', icon: DollarSign },
  { step: 4, label: 'TPM Keys', icon: Key },
];

// ─── Helper: Random hex generator ─────────────────────────────────────────────
function randomHex(bytes: number) {
  const arr = new Uint8Array(bytes);
  if (typeof window !== 'undefined' && window.crypto) {
    window.crypto.getRandomValues(arr);
  } else {
    for (let i = 0; i < bytes; i++) arr[i] = Math.floor(Math.random() * 256);
  }
  return '0x' + Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join('');
}

function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return '0x' + Math.abs(hash).toString(16).padStart(8, '0') + randomHex(12).slice(2, 18);
}

// ─── Reusable UI Atoms ────────────────────────────────────────────────────────

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

function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label style={{
      display: 'block',
      fontFamily: 'var(--font-body)',
      fontSize: '12px',
      fontWeight: 600,
      color: '#52525b',
      marginBottom: '7px',
      letterSpacing: '0.01em',
    }}>
      {children}
      {required && <span style={{ color: '#6366f1', marginLeft: '3px' }}>*</span>}
    </label>
  );
}

function InputField({
  value, onChange, placeholder, type = 'text', readOnly, suffix, prefix,
}: {
  value: string | number;
  onChange?: (v: string) => void;
  placeholder?: string;
  type?: string;
  readOnly?: boolean;
  suffix?: string;
  prefix?: string;
}) {
  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
      {prefix && (
        <span style={{
          position: 'absolute', left: '12px',
          fontFamily: 'var(--font-body)', fontSize: '13px',
          fontWeight: 600, color: '#a1a1aa', pointerEvents: 'none',
        }}>{prefix}</span>
      )}
      <input
        type={type}
        value={value}
        onChange={e => onChange?.(e.target.value)}
        placeholder={placeholder}
        readOnly={readOnly}
        style={{
          width: '100%',
          padding: `10px ${suffix ? '50px' : '12px'} 10px ${prefix ? '28px' : '12px'}`,
          borderRadius: '10px',
          border: '1.5px solid #e4e4e7',
          background: readOnly ? '#fafafa' : '#fff',
          fontFamily: 'var(--font-body)',
          fontSize: '13px',
          fontWeight: 500,
          color: readOnly ? '#71717a' : '#0a0a0a',
          outline: 'none',
          transition: 'border-color 0.2s',
          boxSizing: 'border-box',
          cursor: readOnly ? 'default' : 'text',
        }}
        onFocus={e => { if (!readOnly) e.currentTarget.style.borderColor = '#6366f1'; }}
        onBlur={e => { e.currentTarget.style.borderColor = '#e4e4e7'; }}
      />
      {suffix && (
        <span style={{
          position: 'absolute', right: '12px',
          fontFamily: 'var(--font-body)', fontSize: '12px',
          fontWeight: 600, color: '#a1a1aa', pointerEvents: 'none',
        }}>{suffix}</span>
      )}
    </div>
  );
}

function SelectField({
  value, onChange, options, placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder?: string;
}) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      style={{
        width: '100%',
        padding: '10px 12px',
        borderRadius: '10px',
        border: '1.5px solid #e4e4e7',
        background: '#fff',
        fontFamily: 'var(--font-body)',
        fontSize: '13px',
        fontWeight: 500,
        color: value ? '#0a0a0a' : '#a1a1aa',
        outline: 'none',
        cursor: 'pointer',
        appearance: 'none',
        WebkitAppearance: 'none',
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23a1a1aa' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right 12px center',
        paddingRight: '36px',
        transition: 'border-color 0.2s',
        boxSizing: 'border-box',
      }}
      onFocus={e => { e.currentTarget.style.borderColor = '#6366f1'; }}
      onBlur={e => { e.currentTarget.style.borderColor = '#e4e4e7'; }}
    >
      {placeholder && <option value="" disabled>{placeholder}</option>}
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

function SectionHeader({ children, icon: Icon }: { children: React.ReactNode; icon?: React.ElementType }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '8px',
      marginBottom: '18px', paddingBottom: '12px',
      borderBottom: '1px solid #f4f4f5',
    }}>
      {Icon && (
        <div style={{
          width: '28px', height: '28px', borderRadius: '8px',
          background: '#f4f4f5', border: '1px solid #e4e4e7',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon size={14} color="#52525b" />
        </div>
      )}
      <span style={{
        fontFamily: 'var(--font-display)',
        fontSize: '14px', fontWeight: 700,
        color: '#0a0a0a', letterSpacing: '-0.01em',
      }}>{children}</span>
    </div>
  );
}

function FormGroup({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ marginBottom: '16px', ...style }}>{children}</div>
  );
}

function Grid2({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
      {children}
    </div>
  );
}

// ─── STEP 1: Hardware Profile ──────────────────────────────────────────────────
function StepHardwareProfile({
  state, setState,
}: {
  state: MachineOnboardingState;
  setState: (s: Partial<MachineOnboardingState>) => void;
}) {
  return (
    <div>
      <SectionHeader icon={Cpu}>Machine Identification</SectionHeader>
      <FormGroup>
        <Label required>Machine Name / Title</Label>
        <InputField
          value={state.name}
          onChange={v => setState({ name: v })}
          placeholder="e.g., EOS M 290 Titanium Unit 2"
        />
      </FormGroup>
      <Grid2>
        <FormGroup>
          <Label required>Manufacturer / Brand</Label>
          <InputField
            value={state.brand}
            onChange={v => setState({ brand: v })}
            placeholder="e.g., EOS, Mazak, Stratasys"
          />
        </FormGroup>
        <FormGroup>
          <Label required>Serial / Hardware ID</Label>
          <InputField
            value={state.serialId}
            onChange={v => setState({ serialId: v })}
            placeholder="e.g., SN-2024-M290-0042"
          />
        </FormGroup>
      </Grid2>

      <FormGroup>
        <Label required>Manufacturing Process Category</Label>
        <SelectField
          value={state.category}
          onChange={v => setState({ category: v })}
          options={CATEGORIES}
          placeholder="Select a process type..."
        />
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '10px' }}>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setState({ category: cat })}
              style={{
                padding: '4px 12px', borderRadius: '999px',
                border: `1.5px solid ${state.category === cat ? '#6366f1' : '#e4e4e7'}`,
                background: state.category === cat ? 'rgba(99,102,241,0.08)' : '#fff',
                color: state.category === cat ? '#4f46e5' : '#71717a',
                fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 600,
                cursor: 'pointer', transition: 'all 0.2s',
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </FormGroup>

      <div style={{ height: '1px', background: '#f4f4f5', margin: '20px 0' }} />
      <SectionHeader icon={Box}>Work Envelope Dimensions (mm)</SectionHeader>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
        {(['x', 'y', 'z'] as const).map(axis => (
          <FormGroup key={axis}>
            <Label>Max Build {axis.toUpperCase()} (mm)</Label>
            <InputField
              type="number"
              value={state.dimensions[axis] || ''}
              onChange={v => setState({ dimensions: { ...state.dimensions, [axis]: Number(v) } })}
              placeholder="0"
              suffix="mm"
            />
          </FormGroup>
        ))}
      </div>

      <div style={{ height: '1px', background: '#f4f4f5', margin: '20px 0' }} />
      <SectionHeader icon={Shield}>Operating Safety Boundaries</SectionHeader>
      <Grid2>
        <FormGroup>
          <Label>Max Extruder/Chamber Temp</Label>
          <InputField
            type="number"
            value={state.safetyBounds.maxTemp || ''}
            onChange={v => setState({ safetyBounds: { ...state.safetyBounds, maxTemp: Number(v) } })}
            placeholder="350"
            suffix="°C"
          />
        </FormGroup>
        <FormGroup>
          <Label>Max Bed Temp</Label>
          <InputField
            type="number"
            value={state.safetyBounds.maxBedTemp || ''}
            onChange={v => setState({ safetyBounds: { ...state.safetyBounds, maxBedTemp: Number(v) } })}
            placeholder="120"
            suffix="°C"
          />
        </FormGroup>
        <FormGroup>
          <Label>Max Feed Rate</Label>
          <InputField
            type="number"
            value={state.safetyBounds.maxFeedRate || ''}
            onChange={v => setState({ safetyBounds: { ...state.safetyBounds, maxFeedRate: Number(v) } })}
            placeholder="5000"
            suffix="mm/min"
          />
        </FormGroup>
        <FormGroup>
          <Label>Max Power Consumption</Label>
          <InputField
            type="number"
            value={state.safetyBounds.maxPower || ''}
            onChange={v => setState({ safetyBounds: { ...state.safetyBounds, maxPower: Number(v) } })}
            placeholder="12"
            suffix="kW"
          />
        </FormGroup>
      </Grid2>
    </div>
  );
}

// ─── STEP 2: Material Attestation ─────────────────────────────────────────────
function StepMaterialAttestation({
  state, setState,
}: {
  state: MachineOnboardingState;
  setState: (s: Partial<MachineOnboardingState>) => void;
}) {
  const [isVerifying, setIsVerifying] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);

  const handleVerify = () => {
    if (!state.materialName || !state.supplierVcHash) return;
    setIsVerifying(true);
    setTimeout(() => {
      const hash = hashString(state.materialName + state.supplierVcHash + Date.now());
      setState({ attestationVerified: true, materialBatchHash: hash });
      setIsVerifying(false);
    }, 2200);
  };

  return (
    <div>
      <SectionHeader icon={Layers}>Loaded Material Selection</SectionHeader>
      <FormGroup>
        <Label required>Material Name</Label>
        <SelectField
          value={state.materialName}
          onChange={v => setState({ materialName: v, attestationVerified: false, materialBatchHash: '' })}
          options={MATERIALS}
          placeholder="Select loaded material..."
        />
      </FormGroup>

      <div style={{ height: '1px', background: '#f4f4f5', margin: '20px 0' }} />
      <SectionHeader icon={Link}>Supplier Attestation</SectionHeader>

      <FormGroup>
        <Label>Supplier Verifiable Credential (VC) Hash or Batch QR</Label>
        <InputField
          value={state.supplierVcHash}
          onChange={v => setState({ supplierVcHash: v, attestationVerified: false, materialBatchHash: '' })}
          placeholder="e.g., vc:carpenter:Ti64-23-BATCH-20240301 or QR payload"
        />
        <p style={{
          fontFamily: 'var(--font-body)', fontSize: '11px', color: '#a1a1aa',
          marginTop: '6px', marginBottom: 0,
        }}>
          Accepted from: Carpenter Additive, Höganäs, AP&C, LPW Technology
        </p>
      </FormGroup>

      <FormGroup>
        <Label>Upload Material Certificate (JSON or PDF)</Label>
        <div
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={e => {
            e.preventDefault();
            setDragOver(false);
            const file = e.dataTransfer.files[0];
            if (file) setUploadedFile(file.name);
          }}
          onClick={() => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.json,.pdf';
            input.onchange = (e: any) => {
              const file = e.target.files[0];
              if (file) setUploadedFile(file.name);
            };
            input.click();
          }}
          style={{
            border: `2px dashed ${dragOver ? '#6366f1' : uploadedFile ? '#16a34a' : '#e4e4e7'}`,
            borderRadius: '12px',
            padding: '28px 20px',
            textAlign: 'center',
            background: dragOver ? 'rgba(99,102,241,0.04)' : uploadedFile ? 'rgba(22,163,74,0.04)' : '#fafafa',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          {uploadedFile ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <FileCheck size={28} color="#16a34a" />
              <div style={{ fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 600, color: '#15803d' }}>
                {uploadedFile}
              </div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: '#a1a1aa' }}>
                Click to replace
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <Upload size={28} color="#a1a1aa" />
              <div style={{ fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 600, color: '#52525b' }}>
                Drop certificate file here
              </div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: '#a1a1aa' }}>
                JSON or PDF · Max 10MB
              </div>
            </div>
          )}
        </div>
      </FormGroup>

      <motion.button
        onClick={handleVerify}
        disabled={!state.materialName || !state.supplierVcHash || isVerifying}
        whileHover={{ scale: 1.02, y: -1 }}
        whileTap={{ scale: 0.97 }}
        style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          padding: '11px 20px', borderRadius: '10px',
          background: (!state.materialName || !state.supplierVcHash) ? '#f4f4f5' : '#0a0a0a',
          color: (!state.materialName || !state.supplierVcHash) ? '#a1a1aa' : '#fff',
          fontFamily: 'var(--font-display)', fontSize: '13px', fontWeight: 700,
          border: 'none', cursor: (!state.materialName || !state.supplierVcHash) ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s', width: '100%', justifyContent: 'center',
          marginBottom: '16px',
        }}
      >
        {isVerifying ? (
          <>
            <motion.span
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            >
              <RefreshCw size={14} />
            </motion.span>
            Verifying Attestation...
          </>
        ) : (
          <>
            <Shield size={14} />
            Verify Supplier Attestation
          </>
        )}
      </motion.button>

      <AnimatePresence>
        {state.attestationVerified && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.4, ease: ease.snappy }}
            style={{
              padding: '14px 16px', borderRadius: '12px',
              background: 'rgba(22,163,74,0.06)',
              border: '1.5px solid rgba(22,163,74,0.2)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <CheckCircle size={16} color="#16a34a" />
              <span style={{
                fontFamily: 'var(--font-display)', fontSize: '13px', fontWeight: 700, color: '#15803d',
              }}>
                ✓ Verifiable Material Batch Hash Generated
              </span>
            </div>
            <div style={{
              fontFamily: 'var(--font-body)', fontSize: '11px', color: '#a1a1aa',
              marginBottom: '4px',
            }}>
              Material Batch Hash
            </div>
            <div style={{
              fontFamily: 'var(--font-body)', fontSize: '12px', fontWeight: 600,
              color: '#52525b', wordBreak: 'break-all',
              background: 'rgba(22,163,74,0.06)', padding: '6px 10px',
              borderRadius: '6px', border: '1px solid rgba(22,163,74,0.15)',
            }}>
              {state.materialBatchHash}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── STEP 3: Pricing Rules ─────────────────────────────────────────────────────
function StepPricingRules({
  state, setState,
}: {
  state: MachineOnboardingState;
  setState: (s: Partial<MachineOnboardingState>) => void;
}) {
  return (
    <div>
      <SectionHeader icon={DollarSign}>Base Pricing Configuration</SectionHeader>
      <Grid2>
        <FormGroup>
          <Label required>Base Setup Fee</Label>
          <InputField
            type="number"
            value={state.setupFee || ''}
            onChange={v => setState({ setupFee: Number(v) })}
            placeholder="50"
            prefix="$"
            suffix="USDC"
          />
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: '#a1a1aa', marginTop: '5px', marginBottom: 0 }}>
            One-time calibration & setup cost
          </p>
        </FormGroup>
        <FormGroup>
          <Label required>Minimum Hourly Rate</Label>
          <InputField
            type="number"
            value={state.minHourlyRate || ''}
            onChange={v => setState({ minHourlyRate: Number(v) })}
            placeholder="120"
            prefix="$"
            suffix="USDC/hr"
          />
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: '#a1a1aa', marginTop: '5px', marginBottom: 0 }}>
            AI agent enforced lower bound
          </p>
        </FormGroup>
      </Grid2>

      <div style={{ height: '1px', background: '#f4f4f5', margin: '20px 0' }} />
      <SectionHeader icon={Shield}>SME Security Collateral</SectionHeader>

      <FormGroup>
        <Label required>Security Deposit Requirement</Label>
        <InputField
          type="number"
          value={state.securityDeposit || ''}
          onChange={v => setState({ securityDeposit: Number(v) })}
          placeholder="100"
          prefix="$"
          suffix="USDC"
        />
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: '#a1a1aa', marginTop: '5px', marginBottom: 0 }}>
          Required from borrowers to cover G-code boundary violations or machine damage
        </p>
      </FormGroup>

      <div style={{ height: '1px', background: '#f4f4f5', margin: '20px 0' }} />
      <SectionHeader icon={TrendingDown}>Off-Peak Night Shift Discount</SectionHeader>

      <FormGroup>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <Label>Max AI Discount Cap (10 PM – 6 AM)</Label>
          <span style={{
            fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 800,
            color: '#6366f1', letterSpacing: '-0.03em',
          }}>
            {state.maxDiscount}%
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={50}
          step={5}
          value={state.maxDiscount}
          onChange={e => setState({ maxDiscount: Number(e.target.value) })}
          style={{
            width: '100%',
            height: '6px',
            borderRadius: '999px',
            appearance: 'none',
            WebkitAppearance: 'none',
            outline: 'none',
            cursor: 'pointer',
            background: `linear-gradient(to right, #6366f1 0%, #6366f1 ${state.maxDiscount * 2}%, #e4e4e7 ${state.maxDiscount * 2}%, #e4e4e7 100%)`,
          }}
        />
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          fontFamily: 'var(--font-body)', fontSize: '11px', color: '#a1a1aa',
          marginTop: '6px',
        }}>
          <span>0% (No discount)</span>
          <span>50% (Max discount)</span>
        </div>
      </FormGroup>

      <div style={{
        marginTop: '8px', padding: '16px',
        background: '#fafafa', borderRadius: '12px',
        border: '1.5px solid #f0f0f0',
      }}>
        <div style={{
          fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 700,
          letterSpacing: '0.08em', textTransform: 'uppercase', color: '#a1a1aa',
          marginBottom: '12px',
        }}>
          Pricing Preview
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          {[
            { label: 'Peak Rate', value: state.minHourlyRate ? `$${state.minHourlyRate}/hr` : '—', color: '#0a0a0a' },
            { label: 'Off-Peak Rate', value: state.minHourlyRate ? `$${Math.round(state.minHourlyRate * (1 - state.maxDiscount / 100))}/hr` : '—', color: '#4f46e5' },
            { label: 'Setup Fee', value: state.setupFee ? `$${state.setupFee} USDC` : '—', color: '#0a0a0a' },
            { label: 'Security Deposit', value: state.securityDeposit ? `$${state.securityDeposit} USDC` : '—', color: '#0a0a0a' },
          ].map((item, i) => (
            <div key={i} style={{
              padding: '10px 12px', background: '#fff',
              borderRadius: '8px', border: '1px solid #e4e4e7',
            }}>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: '10px', color: '#a1a1aa', fontWeight: 500 }}>
                {item.label}
              </div>
              <div style={{
                fontFamily: 'var(--font-display)', fontSize: '15px', fontWeight: 800,
                color: item.color, letterSpacing: '-0.02em',
              }}>
                {item.value}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── STEP 4: TPM Key Generation ───────────────────────────────────────────────
function StepTPMKeyGen({
  state, setState,
}: {
  state: MachineOnboardingState;
  setState: (s: Partial<MachineOnboardingState>) => void;
}) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const pk = randomHex(32);
      const pkHint = '0x' + randomHex(16).slice(2, 10) + '...' + randomHex(4).slice(2);
      setState({
        machinePublicKey: pk,
        machinePrivateKeyHint: pkHint,
        isKeyGenerated: true,
      });
      setIsGenerating(false);
    }, 2500);
  };

  const handleCopy = () => {
    if (state.machinePublicKey) {
      navigator.clipboard.writeText(state.machinePublicKey).catch(() => {});
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div>
      <SectionHeader icon={Key}>Asymmetric Enclave Key Generation</SectionHeader>

      <div style={{
        padding: '20px',
        background: 'rgba(99,102,241,0.04)',
        border: '1.5px solid rgba(99,102,241,0.15)',
        borderRadius: '14px',
        marginBottom: '20px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
          <Server size={15} color="#6366f1" />
          <span style={{
            fontFamily: 'var(--font-display)', fontSize: '13px', fontWeight: 700, color: '#4f46e5',
          }}>
            ECDSA Secp256k1 Enclave Keypair
          </span>
        </div>
        <p style={{
          fontFamily: 'var(--font-body)', fontSize: '12px', color: '#71717a',
          lineHeight: 1.7, margin: 0,
        }}>
          Generate an asymmetric keypair representing your machine hardware enclave.
          The <strong style={{ color: '#0a0a0a' }}>Public Key (PK_machine)</strong> is stored on-chain on Sepolia Testnet,
          allowing SMEs to encrypt CAD/G-code files client-side. The <strong style={{ color: '#0a0a0a' }}>Private Key</strong> is
          passed directly to your machine TPM and never stored on any web server.
        </p>
      </div>

      {!state.isKeyGenerated ? (
        <motion.button
          onClick={handleGenerate}
          disabled={isGenerating}
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.97 }}
          style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '14px 24px', borderRadius: '12px',
            background: '#0a0a0a', color: '#fff',
            fontFamily: 'var(--font-display)', fontSize: '14px', fontWeight: 700,
            border: 'none', cursor: isGenerating ? 'wait' : 'pointer',
            width: '100%', justifyContent: 'center',
            marginBottom: '20px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
          }}
        >
          {isGenerating ? (
            <>
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              >
                <RefreshCw size={16} />
              </motion.span>
              Generating Enclave Keypair...
            </>
          ) : (
            <>
              <Key size={16} />
              Generate Machine Enclave Keypair
            </>
          )}
        </motion.button>
      ) : null}

      <AnimatePresence>
        {state.isKeyGenerated && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: ease.snappy }}
          >
            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '10px 14px', borderRadius: '10px',
              background: 'rgba(22,163,74,0.06)',
              border: '1px solid rgba(22,163,74,0.2)',
              marginBottom: '16px',
            }}>
              <CheckCircle size={15} color="#16a34a" />
              <span style={{ fontFamily: 'var(--font-body)', fontSize: '12px', fontWeight: 600, color: '#15803d' }}>
                Keypair generated locally in browser — private key handled securely
              </span>
            </div>

            <FormGroup>
              <Label>Machine Public Key (PK_machine)</Label>
              <div style={{ position: 'relative' }}>
                <div style={{
                  padding: '12px 44px 12px 14px',
                  borderRadius: '10px',
                  border: '1.5px solid rgba(99,102,241,0.25)',
                  background: 'rgba(99,102,241,0.04)',
                  fontFamily: 'monospace',
                  fontSize: '11px',
                  color: '#4f46e5',
                  wordBreak: 'break-all',
                  fontWeight: 600,
                  lineHeight: 1.6,
                }}>
                  {state.machinePublicKey}
                </div>
                <button
                  onClick={handleCopy}
                  style={{
                    position: 'absolute', top: '50%', right: '10px',
                    transform: 'translateY(-50%)',
                    background: copied ? 'rgba(22,163,74,0.1)' : 'rgba(99,102,241,0.1)',
                    border: 'none', borderRadius: '6px',
                    padding: '5px', cursor: 'pointer', color: copied ? '#16a34a' : '#6366f1',
                    transition: 'all 0.2s',
                  }}
                >
                  {copied ? <CheckCircle size={14} /> : <Copy size={14} />}
                </button>
              </div>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: '#a1a1aa', marginTop: '6px', marginBottom: 0 }}>
                Stored on-chain via <code style={{ fontFamily: 'monospace', fontSize: '10px' }}>MachineSlotToken.sol → registerMachine()</code>
              </p>
            </FormGroup>

            <div style={{
              padding: '14px 16px', borderRadius: '12px',
              background: 'rgba(245,158,11,0.06)',
              border: '1.5px solid rgba(245,158,11,0.2)',
              marginBottom: '20px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <AlertTriangle size={14} color="#d97706" />
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '12px', fontWeight: 700, color: '#b45309' }}>
                  Private Key Handling Notice
                </span>
              </div>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '8px 12px', borderRadius: '8px',
                background: 'rgba(245,158,11,0.06)',
                border: '1px solid rgba(245,158,11,0.15)',
                marginBottom: '8px',
              }}>
                <Lock size={12} color="#d97706" />
                <span style={{ fontFamily: 'monospace', fontSize: '11px', color: '#92400e', fontWeight: 600 }}>
                  {state.machinePrivateKeyHint} [PASSED TO HARDWARE TPM]
                </span>
              </div>
              <p style={{
                fontFamily: 'var(--font-body)', fontSize: '11px', color: '#92400e',
                margin: 0, lineHeight: 1.65,
              }}>
                The private key is written to your machine TPM chip and injected into{' '}
                <code style={{ fontFamily: 'monospace', fontSize: '10px' }}>agent.py</code> env config.
                It is <strong>never stored</strong> on any IndustriLease web server.
              </p>
            </div>

            <button
              onClick={() => {
                setState({ isKeyGenerated: false, machinePublicKey: '', machinePrivateKeyHint: '', agentAuthorized: false });
              }}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                background: 'none', border: '1.5px solid #e4e4e7',
                padding: '8px 16px', borderRadius: '8px',
                fontFamily: 'var(--font-body)', fontSize: '12px', fontWeight: 600,
                color: '#71717a', cursor: 'pointer', marginBottom: '20px',
                transition: 'all 0.2s',
              }}
            >
              <RefreshCw size={12} />
              Regenerate Keypair
            </button>

            <div style={{ height: '1px', background: '#f4f4f5', margin: '4px 0 20px' }} />
            <SectionHeader icon={Activity}>Agent Authorization</SectionHeader>

            <div
              style={{
                display: 'flex', alignItems: 'flex-start', gap: '14px',
                padding: '16px',
                background: state.agentAuthorized ? 'rgba(20,184,166,0.04)' : '#fafafa',
                borderRadius: '12px',
                border: `1.5px solid ${state.agentAuthorized ? 'rgba(20,184,166,0.25)' : '#e4e4e7'}`,
                transition: 'all 0.25s',
                cursor: 'pointer',
              }}
              onClick={() => setState({ agentAuthorized: !state.agentAuthorized })}
            >
              <div style={{
                width: '20px', height: '20px', borderRadius: '5px',
                border: `2px solid ${state.agentAuthorized ? '#0f766e' : '#d4d4d8'}`,
                background: state.agentAuthorized ? '#0f766e' : '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, marginTop: '2px', transition: 'all 0.2s',
              }}>
                {state.agentAuthorized && (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
              <div>
                <div style={{
                  fontFamily: 'var(--font-display)', fontSize: '13px', fontWeight: 700,
                  color: '#0a0a0a', marginBottom: '4px',
                }}>
                  Authorize Python AI Agent (<code style={{ fontFamily: 'monospace', fontSize: '11px', color: '#4f46e5' }}>agent.py</code>)
                </div>
                <div style={{
                  fontFamily: 'var(--font-body)', fontSize: '12px', color: '#71717a', lineHeight: 1.6,
                }}>
                  Immediately authorize the AI agent to manage session key listings and idle slot scheduling for this machine upon contract registration.
                </div>
                {state.agentAuthorized && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    style={{
                      marginTop: '10px', display: 'flex', alignItems: 'center', gap: '6px',
                    }}
                  >
                    <PulsingDot color="#0f766e" size={7} />
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 600, color: '#0f766e' }}>
                      Agent will activate immediately upon registration
                    </span>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!state.isKeyGenerated && !isGenerating && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            padding: '16px', borderRadius: '12px',
            background: '#fafafa', border: '1px solid #f0f0f0',
          }}
        >
          <div style={{
            fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 700,
            letterSpacing: '0.08em', textTransform: 'uppercase', color: '#a1a1aa',
            marginBottom: '12px',
          }}>
            On-Chain Registration Flow
          </div>
          {[
            { icon: Hash, label: 'Step A', desc: 'MachineSlotToken.sol → registerMachine(machineId, PK_machine, metadataURI)', color: '#6366f1' },
            { icon: Server, label: 'Step B', desc: 'Local Cache Sync → POST /api/machines → db/slots.json', color: '#0f766e' },
            { icon: Activity, label: 'Step C', desc: 'Agent Config Handshake → { machineId, PK_machine, basePrice, minPrice }', color: '#f59e0b' },
          ].map((step, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'flex-start', gap: '10px',
              marginBottom: i < 2 ? '10px' : 0,
            }}>
              <div style={{
                width: '26px', height: '26px', borderRadius: '7px',
                background: `${step.color}12`, border: `1px solid ${step.color}30`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <step.icon size={12} color={step.color} />
              </div>
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '11px', fontWeight: 700, color: '#52525b' }}>
                  {step.label}
                </div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: '#a1a1aa' }}>
                  {step.desc}
                </div>
              </div>
            </div>
          ))}
        </motion.div>
      )}
    </div>
  );
}

// ─── Live Preview Card ─────────────────────────────────────────────────────────
function LivePreviewCard({ state }: { state: MachineOnboardingState }) {
  const categoryColor: Record<string, { bg: string; color: string; border: string }> = {
    'Metal SLS': { bg: 'rgba(99,102,241,0.08)', color: '#4f46e5', border: 'rgba(99,102,241,0.2)' },
    'Metal SLM': { bg: 'rgba(139,92,246,0.08)', color: '#7c3aed', border: 'rgba(139,92,246,0.2)' },
    '5-Axis CNC': { bg: 'rgba(20,184,166,0.08)', color: '#0f766e', border: 'rgba(20,184,166,0.2)' },
    '3-Axis CNC': { bg: 'rgba(20,184,166,0.08)', color: '#0f766e', border: 'rgba(20,184,166,0.2)' },
    'Industrial FDM': { bg: 'rgba(245,158,11,0.08)', color: '#b45309', border: 'rgba(245,158,11,0.2)' },
    'Laser Cutter': { bg: 'rgba(239,68,68,0.08)', color: '#dc2626', border: 'rgba(239,68,68,0.2)' },
    'Robotic Arm': { bg: 'rgba(22,163,74,0.08)', color: '#15803d', border: 'rgba(22,163,74,0.2)' },
    'Wire EDM': { bg: 'rgba(8,145,178,0.08)', color: '#0e7490', border: 'rgba(8,145,178,0.2)' },
    'Waterjet': { bg: 'rgba(59,130,246,0.08)', color: '#1d4ed8', border: 'rgba(59,130,246,0.2)' },
  };
  const catStyle = state.category
    ? (categoryColor[state.category] ?? { bg: '#f4f4f5', color: '#52525b', border: '#e4e4e7' })
    : { bg: '#f4f4f5', color: '#52525b', border: '#e4e4e7' };

  const completionFields = [
    state.name, state.brand, state.category,
    state.materialName, state.attestationVerified,
    state.setupFee, state.minHourlyRate,
    state.isKeyGenerated,
  ].filter(Boolean).length;
  const completionPct = Math.round((completionFields / 8) * 100);

  return (
    <div style={{ position: 'sticky', top: '100px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '14px' }}>
        <motion.span
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
        >
          <Sparkle size={14} style={{ color: '#0a0a0a' }} />
        </motion.span>
        <span style={{
          fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 700,
          letterSpacing: '0.08em', textTransform: 'uppercase', color: '#a1a1aa',
        }}>
          Live Machine Card Preview
        </span>
      </div>

      <div style={{
        background: '#fff',
        border: state.name ? '1.5px solid rgba(99,102,241,0.25)' : '1.5px solid #e4e4e7',
        borderRadius: '18px',
        overflow: 'hidden',
        boxShadow: state.name ? '0 8px 40px rgba(99,102,241,0.08)' : '0 4px 20px rgba(0,0,0,0.06)',
        transition: 'all 0.4s ease',
        position: 'relative',
      }}>
        {state.name && (
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: '2.5px',
            background: 'linear-gradient(90deg, #6366f1, #8b5cf6, #14b8a6, #6366f1)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 2.2s linear infinite',
          }} />
        )}

        <div style={{ padding: '18px 18px 14px', borderBottom: '1px solid #f4f4f5' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '10px' }}>
            <div style={{ flex: 1, minWidth: 0, marginRight: '10px' }}>
              <div style={{
                fontFamily: 'var(--font-display)', fontSize: '15px', fontWeight: 800,
                color: '#0a0a0a', letterSpacing: '-0.02em', lineHeight: 1.2, marginBottom: '3px',
              }}>
                {state.name || <span style={{ color: '#d4d4d8' }}>Machine Name</span>}
              </div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: '#71717a' }}>
                {state.brand || <span style={{ color: '#e4e4e7' }}>Brand</span>}
                {state.serialId && <span style={{ color: '#d4d4d8' }}> · {state.serialId}</span>}
              </div>
            </div>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '5px',
              padding: '3px 10px', borderRadius: '999px',
              background: 'rgba(20,184,166,0.1)', color: '#0f766e',
              border: '1px solid rgba(20,184,166,0.25)',
              fontSize: '10px', fontWeight: 700, fontFamily: 'var(--font-body)',
              letterSpacing: '0.06em', whiteSpace: 'nowrap',
            }}>
              <PulsingDot color="#14b8a6" size={5} />
              IDLE
            </span>
          </div>

          {state.category && (
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '5px',
              padding: '3px 10px', borderRadius: '999px',
              background: catStyle.bg, color: catStyle.color,
              border: `1px solid ${catStyle.border}`,
              fontSize: '10px', fontWeight: 700, fontFamily: 'var(--font-body)',
              letterSpacing: '0.05em',
            }}>
              {state.category}
            </span>
          )}
        </div>

        <div style={{ padding: '14px 18px 16px' }}>
          {(state.dimensions.x || state.dimensions.y || state.dimensions.z) ? (
            <div style={{
              padding: '10px 12px', borderRadius: '8px',
              background: '#fafafa', border: '1px solid #f0f0f0',
              marginBottom: '12px',
            }}>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: '10px', color: '#a1a1aa', fontWeight: 500, marginBottom: '4px' }}>
                Build Volume
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '13px', fontWeight: 700, color: '#0a0a0a', letterSpacing: '-0.01em' }}>
                {state.dimensions.x || 0} × {state.dimensions.y || 0} × {state.dimensions.z || 0} mm
              </div>
            </div>
          ) : null}

          {state.materialName && (
            <div style={{
              padding: '10px 12px', borderRadius: '8px',
              background: state.attestationVerified ? 'rgba(22,163,74,0.05)' : '#fafafa',
              border: state.attestationVerified ? '1px solid rgba(22,163,74,0.2)' : '1px solid #f0f0f0',
              marginBottom: '12px', transition: 'all 0.3s',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: '10px', color: '#a1a1aa', fontWeight: 500, marginBottom: '2px' }}>
                    Material
                  </div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: '12px', fontWeight: 600, color: '#0a0a0a' }}>
                    {state.materialName}
                  </div>
                </div>
                {state.attestationVerified && <CheckCircle size={14} color="#16a34a" />}
              </div>
            </div>
          )}

          {state.minHourlyRate > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
              <div style={{ padding: '8px 10px', background: '#fafafa', borderRadius: '8px', border: '1px solid #f0f0f0' }}>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: '10px', color: '#a1a1aa', fontWeight: 500 }}>Rate</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '15px', fontWeight: 800, color: '#0a0a0a', letterSpacing: '-0.02em' }}>
                  ${state.minHourlyRate}/hr
                </div>
              </div>
              <div style={{ padding: '8px 10px', background: '#fafafa', borderRadius: '8px', border: '1px solid #f0f0f0' }}>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: '10px', color: '#a1a1aa', fontWeight: 500 }}>Setup Fee</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '15px', fontWeight: 800, color: '#0a0a0a', letterSpacing: '-0.02em' }}>
                  ${state.setupFee}
                </div>
              </div>
            </div>
          )}

          {state.isKeyGenerated && (
            <div style={{
              padding: '10px 12px', borderRadius: '8px',
              background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)',
              marginBottom: '12px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Lock size={11} color="#6366f1" />
                <span style={{ fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 600, color: '#4f46e5' }}>
                  Enclave Key Bound
                </span>
              </div>
              <div style={{ fontFamily: 'monospace', fontSize: '10px', color: '#71717a', marginTop: '4px', wordBreak: 'break-all' }}>
                {state.machinePublicKey.slice(0, 22)}...
              </div>
            </div>
          )}

          <div style={{ marginTop: '4px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: '10px', color: '#a1a1aa', fontWeight: 500 }}>Profile Completion</span>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '12px', fontWeight: 700, color: completionPct === 100 ? '#16a34a' : '#6366f1' }}>
                {completionPct}%
              </span>
            </div>
            <div style={{ width: '100%', height: '4px', background: '#f4f4f5', borderRadius: '999px', overflow: 'hidden' }}>
              <motion.div
                animate={{ width: `${completionPct}%` }}
                transition={{ duration: 0.6, ease: ease.snappy }}
                style={{
                  height: '100%',
                  background: completionPct === 100 ? '#16a34a' : 'linear-gradient(90deg, #6366f1, #8b5cf6)',
                  borderRadius: '999px',
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <div style={{
        marginTop: '16px', padding: '16px',
        background: '#fafafa', borderRadius: '14px',
        border: '1.5px solid #f0f0f0',
      }}>
        <div style={{
          fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 700,
          letterSpacing: '0.07em', textTransform: 'uppercase', color: '#a1a1aa',
          marginBottom: '12px',
        }}>
          Progress Checklist
        </div>
        {[
          { label: 'Hardware Profile', done: !!(state.name && state.brand && state.category) },
          { label: 'Material Attestation', done: state.attestationVerified },
          { label: 'Pricing Rules', done: !!(state.minHourlyRate > 0) },
          { label: 'TPM Keypair', done: state.isKeyGenerated },
        ].map((item, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            marginBottom: i < 3 ? '8px' : 0,
          }}>
            <div style={{
              width: '18px', height: '18px', borderRadius: '50%',
              background: item.done ? 'rgba(22,163,74,0.1)' : '#f4f4f5',
              border: `1.5px solid ${item.done ? 'rgba(22,163,74,0.3)' : '#e4e4e7'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0, transition: 'all 0.3s',
            }}>
              {item.done
                ? <CheckCircle size={11} color="#16a34a" />
                : <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#d4d4d8' }} />
              }
            </div>
            <span style={{
              fontFamily: 'var(--font-body)', fontSize: '12px',
              fontWeight: 500, color: item.done ? '#15803d' : '#71717a',
              transition: 'color 0.3s',
            }}>
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Step Progress Indicator ───────────────────────────────────────────────────
function StepProgress({ currentStep, onStepClick }: { currentStep: number; onStepClick?: (s: number) => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0' }}>
      {STEP_LABELS.map((s, i) => {
        const isActive = currentStep === s.step;
        const isDone = currentStep > s.step;
        const Icon = s.icon;
        return (
          <div key={s.step} style={{ display: 'flex', alignItems: 'center' }}>
            <button
              onClick={() => onStepClick?.(s.step)}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '8px 14px', borderRadius: '10px',
                background: isActive ? '#0a0a0a' : isDone ? 'rgba(22,163,74,0.08)' : 'transparent',
                border: isActive ? '1.5px solid #0a0a0a' : isDone ? '1.5px solid rgba(22,163,74,0.25)' : '1.5px solid #e4e4e7',
                cursor: 'pointer', transition: 'all 0.25s',
              }}
            >
              <div style={{
                width: '22px', height: '22px', borderRadius: '50%',
                background: isActive ? 'rgba(255,255,255,0.15)' : isDone ? 'rgba(22,163,74,0.15)' : '#f4f4f5',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                {isDone
                  ? <CheckCircle size={13} color="#16a34a" />
                  : <Icon size={12} color={isActive ? '#fff' : '#a1a1aa'} />
                }
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '1px' }}>
                <span style={{
                  fontFamily: 'var(--font-body)', fontSize: '10px', fontWeight: 700,
                  letterSpacing: '0.05em', textTransform: 'uppercase',
                  color: isActive ? 'rgba(255,255,255,0.6)' : isDone ? '#16a34a' : '#a1a1aa',
                }}>
                  Step {s.step}
                </span>
                <span style={{
                  fontFamily: 'var(--font-display)', fontSize: '12px', fontWeight: 700,
                  color: isActive ? '#fff' : isDone ? '#15803d' : '#52525b',
                  whiteSpace: 'nowrap',
                }}>
                  {s.label}
                </span>
              </div>
            </button>
            {i < STEP_LABELS.length - 1 && (
              <div style={{
                width: '28px', height: '1.5px',
                background: isDone ? 'rgba(22,163,74,0.4)' : '#e4e4e7',
                transition: 'background 0.3s', flexShrink: 0,
              }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
const INITIAL_STATE: MachineOnboardingState = {
  name: '', brand: '', serialId: '', category: '',
  dimensions: { x: 0, y: 0, z: 0 },
  safetyBounds: { maxTemp: 0, maxBedTemp: 0, maxFeedRate: 0, maxPower: 0 },
  materialName: '', supplierVcHash: '', attestationVerified: false, materialBatchHash: '',
  setupFee: 0, minHourlyRate: 0, securityDeposit: 0, maxDiscount: 20,
  machinePublicKey: '', machinePrivateKeyHint: '', isKeyGenerated: false, agentAuthorized: false,
};

export default function MachineOnboardingWizard() {
  const [step, setStep] = useState(1);
  const [state, setStateRaw] = useState<MachineOnboardingState>(INITIAL_STATE);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [direction, setDirection] = useState(1);

  const setState = useCallback((patch: Partial<MachineOnboardingState>) => {
    setStateRaw(prev => ({ ...prev, ...patch }));
  }, []);

  const goNext = () => { if (step < 4) { setDirection(1); setStep(s => s + 1); } };
  const goBack = () => { if (step > 1) { setDirection(-1); setStep(s => s - 1); } };
  const goToStep = (s: number) => { setDirection(s > step ? 1 : -1); setStep(s); };

  const handleSubmit = () => {
    setIsSubmitting(true);
    setTimeout(() => { setIsSubmitting(false); setIsSubmitted(true); }, 3000);
  };

  const slideVariants = {
    enter: (dir: number) => ({ x: dir * 60, opacity: 0, filter: 'blur(4px)' }),
    center: { x: 0, opacity: 1, filter: 'blur(0px)' },
    exit: (dir: number) => ({ x: dir * -60, opacity: 0, filter: 'blur(4px)' }),
  };

  if (isSubmitted) {
    return (
      <div style={{ minHeight: '100vh', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, ease: ease.snappy }}
          style={{ textAlign: 'center', maxWidth: '520px' }}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 15 }}
            style={{
              width: '80px', height: '80px', borderRadius: '50%',
              background: 'rgba(22,163,74,0.1)', border: '2px solid rgba(22,163,74,0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 24px',
            }}
          >
            <CheckCircle size={36} color="#16a34a" />
          </motion.div>
          <h1 style={{
            fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 800,
            letterSpacing: '-0.035em', color: '#0a0a0a', marginBottom: '12px',
          }}>
            Machine Registered!
          </h1>
          <p style={{
            fontFamily: 'var(--font-body)', fontSize: '15px', color: '#71717a',
            lineHeight: 1.7, marginBottom: '32px',
          }}>
            <strong style={{ color: '#0a0a0a' }}>{state.name || 'Your machine'}</strong> has been registered on Sepolia Testnet.
            Your enclave key is bound on-chain and the AI agent is{' '}
            {state.agentAuthorized ? 'active and monitoring idle slots.' : 'ready to authorize.'}
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="/lender-dashboard" style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '12px 24px', borderRadius: '12px',
              background: '#0a0a0a', color: '#fff',
              fontFamily: 'var(--font-display)', fontSize: '14px', fontWeight: 700,
              textDecoration: 'none',
            }}>
              View Fleet Dashboard <ArrowRight size={14} />
            </a>
            <button
              onClick={() => { setIsSubmitted(false); setStateRaw(INITIAL_STATE); setStep(1); }}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                padding: '12px 24px', borderRadius: '12px',
                background: '#fff', color: '#0a0a0a',
                fontFamily: 'var(--font-display)', fontSize: '14px', fontWeight: 700,
                border: '1.5px solid #e4e4e7', cursor: 'pointer',
              }}
            >
              Register Another
            </button>
          </div>
        </motion.div>
        <style>{`
          @keyframes ping-dot {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.5; transform: scale(0.85); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#fff', fontFamily: 'var(--font-body)' }}>

      {/* ── HEADER ── */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1.5px solid #e4e4e7',
        padding: '0 40px',
      }}>
        <div style={{
          maxWidth: '1320px', margin: '0 auto',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          height: '68px', gap: '16px',
        }}>
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
              Back to Dashboard
            </a>
            <div style={{ width: '1px', height: '20px', background: '#e4e4e7' }} />
            <a href="/" style={{
              fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: 800,
              letterSpacing: '-0.03em', color: '#0a0a0a', textDecoration: 'none',
            }}>
              ⬡ IndustriLease
            </a>
          </div>

          <div style={{ flex: 1, display: 'flex', justifyContent: 'center', overflow: 'hidden' }}>
            <StepProgress currentStep={step} onStepClick={goToStep} />
          </div>

          <div style={{
            display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0,
            padding: '5px 12px', borderRadius: '999px',
            background: 'rgba(22,163,74,0.06)', border: '1px solid rgba(22,163,74,0.2)',
          }}>
            <PulsingDot color="#16a34a" size={7} />
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#15803d', fontFamily: 'var(--font-body)' }}>
              Sepolia Testnet
            </span>
          </div>
        </div>
      </header>

      {/* ── MAIN ── */}
      <main style={{ maxWidth: '1320px', margin: '0 auto', padding: '40px 40px 80px' }}>

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
              Equipment Onboarding Wizard
            </span>
          </div>
          <h1 style={{
            fontFamily: 'var(--font-display)', fontSize: 'clamp(1.6rem, 3vw, 2.2rem)',
            fontWeight: 800, letterSpacing: '-0.035em', color: '#0a0a0a',
            lineHeight: 1.1, margin: 0,
          }}>
            Register New Machinery
          </h1>
          <p style={{
            fontFamily: 'var(--font-body)', fontSize: '14px', color: '#71717a',
            marginTop: '8px', marginBottom: 0, lineHeight: 1.6,
          }}>
            Configure your machine for DePIN protocol listing — hardware profiling, material attestation, pricing automation, and on-chain key binding.
          </p>
        </motion.div>

        {/* Split Layout */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) 320px',
          gap: '32px',
          alignItems: 'start',
        }}>

          {/* Left: Form */}
          <div>
            <div style={{
              background: '#fff',
              border: '1.5px solid #e4e4e7',
              borderRadius: '20px',
              overflow: 'hidden',
              boxShadow: '0 4px 24px rgba(0,0,0,0.05)',
            }}>
              {/* Form Header */}
              <div style={{
                padding: '22px 28px 20px',
                borderBottom: '1.5px solid #f4f4f5',
                background: '#fafafa',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '10px',
                    background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {(() => { const Icon = STEP_LABELS[step - 1].icon; return <Icon size={16} color="#fff" />; })()}
                  </div>
                  <div>
                    <div style={{
                      fontFamily: 'var(--font-body)', fontSize: '10px', fontWeight: 700,
                      letterSpacing: '0.08em', textTransform: 'uppercase', color: '#a1a1aa',
                    }}>
                      Step {step} of 4
                    </div>
                    <div style={{
                      fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: 800,
                      color: '#0a0a0a', letterSpacing: '-0.02em',
                    }}>
                      {STEP_LABELS[step - 1].label}
                    </div>
                  </div>
                  <div style={{ marginLeft: 'auto', display: 'flex', gap: '5px' }}>
                    {[1, 2, 3, 4].map(s => (
                      <div key={s} style={{
                        width: s === step ? '20px' : '7px',
                        height: '7px', borderRadius: '999px',
                        background: s === step ? '#0a0a0a' : s < step ? '#16a34a' : '#e4e4e7',
                        transition: 'all 0.3s ease',
                      }} />
                    ))}
                  </div>
                </div>
              </div>

              {/* Animated Step Content */}
              <div style={{ padding: '28px', minHeight: '480px', position: 'relative', overflow: 'hidden' }}>
                <AnimatePresence mode="wait" custom={direction}>
                  <motion.div
                    key={step}
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.35, ease: ease.snappy }}
                  >
                    {step === 1 && <StepHardwareProfile state={state} setState={setState} />}
                    {step === 2 && <StepMaterialAttestation state={state} setState={setState} />}
                    {step === 3 && <StepPricingRules state={state} setState={setState} />}
                    {step === 4 && <StepTPMKeyGen state={state} setState={setState} />}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Navigation Footer */}
              <div style={{
                padding: '18px 28px',
                borderTop: '1.5px solid #f4f4f5',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                background: '#fafafa',
              }}>
                <motion.button
                  onClick={goBack}
                  disabled={step === 1}
                  whileHover={{ scale: step === 1 ? 1 : 1.02 }}
                  whileTap={{ scale: step === 1 ? 1 : 0.97 }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '7px',
                    padding: '10px 18px', borderRadius: '10px',
                    background: 'transparent', border: '1.5px solid #e4e4e7',
                    color: step === 1 ? '#d4d4d8' : '#52525b',
                    fontFamily: 'var(--font-display)', fontSize: '13px', fontWeight: 700,
                    cursor: step === 1 ? 'not-allowed' : 'pointer', transition: 'all 0.2s',
                  }}
                >
                  <ArrowLeft size={14} />
                  Back
                </motion.button>

                <span style={{ fontFamily: 'var(--font-body)', fontSize: '12px', fontWeight: 600, color: '#a1a1aa' }}>
                  {step} / 4
                </span>

                {step < 4 ? (
                  <motion.button
                    onClick={goNext}
                    whileHover={{ scale: 1.02, y: -1 }}
                    whileTap={{ scale: 0.97 }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '7px',
                      padding: '10px 20px', borderRadius: '10px',
                      background: '#0a0a0a', color: '#fff',
                      fontFamily: 'var(--font-display)', fontSize: '13px', fontWeight: 700,
                      border: 'none', cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
                    }}
                  >
                    Continue
                    <ArrowRight size={14} />
                  </motion.button>
                ) : (
                  <motion.button
                    onClick={handleSubmit}
                    disabled={!state.isKeyGenerated || isSubmitting}
                    whileHover={{ scale: (!state.isKeyGenerated || isSubmitting) ? 1 : 1.02, y: (!state.isKeyGenerated || isSubmitting) ? 0 : -1 }}
                    whileTap={{ scale: (!state.isKeyGenerated || isSubmitting) ? 1 : 0.97 }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '8px',
                      padding: '11px 22px', borderRadius: '10px',
                      background: !state.isKeyGenerated ? '#f4f4f5' : '#0a0a0a',
                      color: !state.isKeyGenerated ? '#a1a1aa' : '#fff',
                      fontFamily: 'var(--font-display)', fontSize: '13px', fontWeight: 700,
                      border: 'none', cursor: !state.isKeyGenerated ? 'not-allowed' : isSubmitting ? 'wait' : 'pointer',
                      boxShadow: state.isKeyGenerated && !isSubmitting ? '0 4px 20px rgba(0,0,0,0.2)' : 'none',
                      transition: 'all 0.3s',
                    }}
                  >
                    {isSubmitting ? (
                      <>
                        <motion.span
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        >
                          <RefreshCw size={14} />
                        </motion.span>
                        Registering On-Chain...
                      </>
                    ) : (
                      <>
                        <Shield size={14} />
                        Submit & Register Machine
                      </>
                    )}
                  </motion.button>
                )}
              </div>
            </div>

            {step === 4 && !state.isKeyGenerated && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  marginTop: '12px', padding: '12px 16px', borderRadius: '10px',
                  background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)',
                  display: 'flex', alignItems: 'center', gap: '8px',
                }}
              >
                <AlertTriangle size={13} color="#d97706" />
                <span style={{ fontFamily: 'var(--font-body)', fontSize: '12px', fontWeight: 600, color: '#92400e' }}>
                  Generate an enclave keypair to enable on-chain registration.
                </span>
              </motion.div>
            )}
          </div>

          {/* Right: Live Preview */}
          <LivePreviewCard state={state} />
        </div>
      </main>

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
          width: 18px; height: 18px;
          border-radius: 50%;
          background: #fff;
          border: 2.5px solid #6366f1;
          box-shadow: 0 2px 8px rgba(99,102,241,0.3);
          cursor: pointer;
        }
        input[type='range']::-moz-range-thumb {
          width: 18px; height: 18px;
          border-radius: 50%;
          background: #fff;
          border: 2.5px solid #6366f1;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}
