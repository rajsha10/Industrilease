'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, SlidersHorizontal, ChevronDown, ShieldCheck,
  ArrowRight, X, Clock, Zap, Filter, Wallet, Globe,
} from 'lucide-react';
import Link from 'next/link';
import {
  ease,
  Reveal,
  StaggerReveal,
  StaggerItem,
  fadeUp,
} from '../../components/animations';

// ─── Types ──────────────────────────────────────────────────────────
interface SlotListing {
  slotId: number;
  machineId: string;
  machineName: string;
  category: Category;
  material: string;
  startTime: number;
  endTime: number;
  pricePerHour: string;
  setupFee: string;
  totalLayers: number;
  isBooked: boolean;
  verifiedMaterialHash: string;
  image1: string;
  image2: string;
  location: string;
  availableLabel: string;
}

type Category = 'All' | 'Industrial FDM' | '5-Axis CNC' | 'Metal SLS' | 'Laser Cutter' | 'Robotic Arm';

// ─── Static mock data (merged with /api/slots at runtime) ────────────
const MOCK_SLOTS: SlotListing[] = [
  {
    slotId: 1,
    machineId: 'EOS-M290-01',
    machineName: 'EOS M 290 Titanium',
    category: 'Metal SLS',
    material: 'Titanium Ti-6Al-4V',
    startTime: 1788739200,
    endTime: 1788768000,
    pricePerHour: '200 USDC',
    setupFee: '50 USDC',
    totalLayers: 100,
    isBooked: false,
    verifiedMaterialHash: '0xa4f8...b12',
    image1: '/midsection/Metal_SLS_3D_printer.jpeg',
    image2: '/Laser_sintering_titanium_powder.jpeg',
    location: 'Bay Area, CA · Factory #047',
    availableLabel: 'Tonight 10:00 PM – 06:00 AM',
  },
  {
    slotId: 2,
    machineId: 'DMG-5A-007',
    machineName: 'DMG Mori 5-Axis CNC',
    category: '5-Axis CNC',
    material: 'Aerospace Aluminum 7075',
    startTime: 1788768000,
    endTime: 1788796800,
    pricePerHour: '145 USDC',
    setupFee: '75 USDC',
    totalLayers: 0,
    isBooked: false,
    verifiedMaterialHash: '0xb3c1...77f',
    image1: '/midsection/CNC_machining_center_operating.jpeg',
    image2: '/CNC_spindle_carving_titanium.jpeg',
    location: 'Austin, TX · Factory #012',
    availableLabel: 'Tomorrow 06:00 AM – 02:00 PM',
  },
  {
    slotId: 3,
    machineId: 'STRATASYS-F900-03',
    machineName: 'Stratasys F900 ULTEM',
    category: 'Industrial FDM',
    material: 'Carbon Fiber PEEK',
    startTime: 1788710000,
    endTime: 1788739200,
    pricePerHour: '45 USDC',
    setupFee: '20 USDC',
    totalLayers: 320,
    isBooked: false,
    verifiedMaterialHash: '0xd9a2...44c',
    image1: '/midsection/Industrial_3D_printer_render.jpeg',
    image2: '/Industrial_3D_printer.jpeg',
    location: 'Detroit, MI · Factory #091',
    availableLabel: 'Today 02:00 PM – 10:00 PM',
  },
  {
    slotId: 4,
    machineId: 'TRUMPF-TRU5030-01',
    machineName: 'TRUMPF TruLaser 5030',
    category: 'Laser Cutter',
    material: 'Stainless Steel 316L',
    startTime: 1788796800,
    endTime: 1788825600,
    pricePerHour: '85 USDC',
    setupFee: '35 USDC',
    totalLayers: 0,
    isBooked: false,
    verifiedMaterialHash: '0xf1e7...09a',
    image1: '/midsection/Laser_cutting_machine_enclosure.jpeg',
    image2: '/midsection/Laser_cutting_machine_enclosure.jpeg',
    location: 'Chicago, IL · Factory #033',
    availableLabel: 'Thu 08:00 AM – 04:00 PM',
  },
  {
    slotId: 5,
    machineId: 'KUKA-KR500-02',
    machineName: 'KUKA KR 500 Robotic Arm',
    category: 'Robotic Arm',
    material: 'Aerospace Aluminum 7075',
    startTime: 1788710000,
    endTime: 1788753600,
    pricePerHour: '90 USDC',
    setupFee: '40 USDC',
    totalLayers: 0,
    isBooked: false,
    verifiedMaterialHash: '0xe2b3...c88',
    image1: '/midsection/Industrial_robot_arm_isolated.jpeg',
    image2: '/midsection/Industrial_robot_arm_isolated.jpeg',
    location: 'Seattle, WA · Factory #005',
    availableLabel: 'Today 11:00 PM – 11:00 AM',
  },
  {
    slotId: 6,
    machineId: 'EOS-M400-02',
    machineName: 'EOS M 400-4 Quad SLS',
    category: 'Metal SLS',
    material: 'Stainless Steel 316L',
    startTime: 1788825600,
    endTime: 1788854400,
    pricePerHour: '250 USDC',
    setupFee: '80 USDC',
    totalLayers: 200,
    isBooked: false,
    verifiedMaterialHash: '0xc9d4...f21',
    image1: '/midsection/Metal_SLS_3D_printer.jpeg',
    image2: '/Laser_sintering_titanium_powder.jpeg',
    location: 'Houston, TX · Factory #019',
    availableLabel: 'Fri 12:00 AM – 08:00 AM',
  },
];

const CATEGORIES: Category[] = ['All', 'Industrial FDM', '5-Axis CNC', 'Metal SLS', 'Laser Cutter', 'Robotic Arm'];

const MATERIALS = [
  'All Materials',
  'Titanium Ti-6Al-4V',
  'Aerospace Aluminum 7075',
  'Carbon Fiber PEEK',
  'Stainless Steel 316L',
];

const CATEGORY_COLORS: Record<string, { dot: string; bg: string; text: string }> = {
  'Industrial FDM': { dot: '#6366f1', bg: '#eef2ff', text: '#4338ca' },
  '5-Axis CNC': { dot: '#0891b2', bg: '#ecfeff', text: '#0e7490' },
  'Metal SLS': { dot: '#7c3aed', bg: '#f5f3ff', text: '#6d28d9' },
  'Laser Cutter': { dot: '#ef4444', bg: '#fef2f2', text: '#dc2626' },
  'Robotic Arm': { dot: '#eab308', bg: '#fefce8', text: '#ca8a04' },
};
const DEFAULT_CAT = { dot: '#374151', bg: '#f9fafb', text: '#374151' };

// ─── Sparkle SVG ─────────────────────────────────────────────────────
function Sparkle({ size = 20, style = {} }: { size?: number; style?: React.CSSProperties }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" style={{ display: 'inline-block', ...style }}>
      <path d="M12 0 L13.8 10.2 L24 12 L13.8 13.8 L12 24 L10.2 13.8 L0 12 L10.2 10.2 Z" />
    </svg>
  );
}

// ─── Header ──────────────────────────────────────────────────────────
function MarketplaceHeader({
  walletConnected,
  walletAddress,
  onConnectWallet,
}: {
  walletConnected: boolean;
  walletAddress: string;
  onConnectWallet: () => void;
}) {
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
      <nav style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
        {['Equipment', 'How It Works', 'Docs'].map((label, i) => (
          <Link
            key={i}
            href="/"
            style={{ fontFamily: 'var(--font-body)', fontSize: '14px', fontWeight: 500, color: '#52525b', textDecoration: 'none', transition: 'color 0.2s' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#0a0a0a')}
            onMouseLeave={e => (e.currentTarget.style.color = '#52525b')}
          >
            {label}
          </Link>
        ))}
      </nav>

      <Link href="/" style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', textDecoration: 'none' }}>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 800, letterSpacing: '-0.03em', color: '#0a0a0a' }}>
          ⬡ IndustriLease
        </span>
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          background: '#f4f4f5', borderRadius: '999px', padding: '5px 12px',
          border: '1.5px solid #e4e4e7',
        }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#f59e0b', display: 'inline-block' }} />
          <span style={{ fontFamily: 'var(--font-body)', fontSize: '12px', fontWeight: 600, color: '#71717a' }}>Sepolia Testnet</span>
        </div>

        <motion.button
          onClick={onConnectWallet}
          className={walletConnected ? 'btn-outline' : 'btn-dark'}
          style={{ padding: '8px 18px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
          whileHover={{ scale: 1.02, y: -1 }}
          whileTap={{ scale: 0.97 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
          <Wallet size={14} />
          {walletConnected && walletAddress
            ? `${walletAddress.substring(0, 6)}...${walletAddress.substring(walletAddress.length - 4)}`
            : 'Connect Wallet'}
        </motion.button>
      </div>
    </header>
  );
}

// ─── Slot Card ───────────────────────────────────────────────────────
function SlotCard({ slot, index, onReserve }: { slot: SlotListing; index: number; onReserve: (slot: SlotListing) => void }) {
  const [hovered, setHovered] = useState(false);
  const catStyle = CATEGORY_COLORS[slot.category] ?? DEFAULT_CAT;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 24, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95, y: -10 }}
      transition={{ duration: 0.45, delay: index * 0.06, ease: ease.snappy }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      className="card"
      style={{ background: '#fff', border: '1.5px solid #e4e4e7', borderRadius: '20px', overflow: 'hidden', cursor: 'default' }}
      whileHover={{ borderColor: '#bbb', y: -5, boxShadow: '0 16px 48px rgba(0,0,0,0.1)' }}
    >
      {/* Image with corner-slide hover effect */}
      <div style={{ position: 'relative', width: '100%', height: '200px', background: '#f0f0f0', overflow: 'hidden' }}>
        <motion.img
          src={slot.image1}
          alt={slot.machineName}
          animate={hovered ? { x: '100%', y: '100%' } : { x: 0, y: 0 }}
          transition={{ duration: 0.6, ease: ease.snappy }}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
        <motion.img
          src={slot.image2}
          alt={`${slot.machineName} chamber`}
          initial={{ x: '-100%', y: '-100%' }}
          animate={hovered ? { x: 0, y: 0 } : { x: '-100%', y: '-100%' }}
          transition={{ duration: 0.6, ease: ease.snappy }}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />

        {/* Live pill */}
        <div style={{
          position: 'absolute', top: '12px', left: '12px',
          display: 'flex', alignItems: 'center', gap: '5px',
          background: 'white', borderRadius: '999px', padding: '4px 10px',
          fontSize: '11px', fontWeight: 700, fontFamily: 'var(--font-body)', color: '#16a34a',
          border: '1.5px solid #e4e4e7',
        }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#16a34a', display: 'inline-block', animation: 'ping-dot 1.8s ease-in-out infinite' }} />
          ● Live
        </div>

        {/* Category badge */}
        <div style={{
          position: 'absolute', top: '12px', right: '12px',
          background: catStyle.bg, color: catStyle.text,
          borderRadius: '999px', padding: '4px 10px',
          fontSize: '11px', fontWeight: 700, fontFamily: 'var(--font-body)',
        }}>
          {slot.category}
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: '16px' }}>
        {/* Verified badge */}
        <div style={{ marginBottom: '10px' }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '4px',
            background: '#f0fdf4', border: '1px solid #bbf7d0',
            borderRadius: '999px', padding: '3px 10px',
            fontSize: '11px', fontWeight: 600, fontFamily: 'var(--font-body)', color: '#16a34a',
          }}>
            <ShieldCheck size={11} />
            ✓ Verified Material Batch
          </span>
        </div>

        <h3 style={{
          fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: 800,
          color: '#0a0a0a', letterSpacing: '-0.02em', marginBottom: '4px',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {slot.machineName}
        </h3>

        <p style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: '#71717a', marginBottom: '12px', fontWeight: 500 }}>
          {slot.material}
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Globe size={12} color="#a1a1aa" />
            <span style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: '#a1a1aa', fontWeight: 500 }}>{slot.location}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Clock size={12} color="#a1a1aa" />
            <span style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: '#52525b', fontWeight: 600 }}>{slot.availableLabel}</span>
          </div>
        </div>

        <div style={{ borderTop: '1.5px solid #f4f4f5', paddingTop: '14px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: '#a1a1aa', fontWeight: 500, marginBottom: '2px' }}>Hourly Rate</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 800, color: '#0a0a0a', letterSpacing: '-0.02em' }}>{slot.pricePerHour}</div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: '#a1a1aa' }}>+ {slot.setupFee} setup</div>
          </div>

          <motion.button
            id={`reserve-slot-${slot.slotId}`}
            onClick={() => onReserve(slot)}
            style={{
              background: '#0a0a0a', color: '#fff', border: 'none',
              borderRadius: '10px', padding: '9px 16px',
              fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 700,
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
            }}
            whileHover={{ scale: 1.05, background: '#222' }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            Reserve Slot <ArrowRight size={13} />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Reserve Modal ───────────────────────────────────────────────────
function ReserveModal({ slot, onClose, walletConnected, onConnectWallet }: {
  slot: SlotListing;
  onClose: () => void;
  walletConnected: boolean;
  onConnectWallet: () => void;
}) {
  const catStyle = CATEGORY_COLORS[slot.category] ?? DEFAULT_CAT;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 500,
        background: 'rgba(10,10,10,0.55)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '24px',
        backdropFilter: 'blur(4px)',
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 12 }}
        transition={{ duration: 0.35, ease: ease.snappy }}
        onClick={e => e.stopPropagation()}
        style={{
          background: '#fff', borderRadius: '24px', width: '100%', maxWidth: '480px',
          border: '1.5px solid #e4e4e7', overflow: 'hidden',
          boxShadow: '0 24px 80px rgba(0,0,0,0.2)',
        }}
      >
        <div style={{ position: 'relative', height: '180px', background: '#f0f0f0', overflow: 'hidden' }}>
          <img src={slot.image1} alt={slot.machineName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(transparent 50%, rgba(10,10,10,0.25))' }} />
          <button
            onClick={onClose}
            style={{
              position: 'absolute', top: '12px', right: '12px',
              width: '32px', height: '32px', borderRadius: '50%',
              background: 'rgba(255,255,255,0.9)', border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <X size={16} color="#0a0a0a" />
          </button>
        </div>

        <div style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
            <span style={{ background: catStyle.bg, color: catStyle.text, borderRadius: '999px', padding: '3px 10px', fontSize: '11px', fontWeight: 700, fontFamily: 'var(--font-body)' }}>
              {slot.category}
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: 600, fontFamily: 'var(--font-body)', color: '#16a34a' }}>
              <ShieldCheck size={11} /> ✓ Verified Material
            </span>
          </div>

          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 800, color: '#0a0a0a', letterSpacing: '-0.025em', marginBottom: '4px' }}>
            {slot.machineName}
          </h2>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: '#71717a', marginBottom: '20px' }}>
            {slot.material} · {slot.location}
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px', background: '#fafafa', borderRadius: '14px', padding: '16px', border: '1.5px solid #e4e4e7' }}>
            {[
              { label: 'Hourly Rate', value: slot.pricePerHour },
              { label: 'Setup Fee', value: slot.setupFee },
              { label: 'Available', value: slot.availableLabel },
              { label: 'Slot ID', value: `#${slot.slotId}` },
            ].map((item, i) => (
              <div key={i}>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: '#a1a1aa', fontWeight: 500, marginBottom: '3px' }}>{item.label}</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '14px', fontWeight: 700, color: '#0a0a0a', letterSpacing: '-0.01em' }}>{item.value}</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', background: '#f4f4f5', borderRadius: '10px', padding: '10px 14px' }}>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: '#71717a', fontWeight: 500 }}>Material Hash:</span>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: '#0a0a0a', fontWeight: 600 }}>{slot.verifiedMaterialHash}</span>
          </div>

          {walletConnected ? (
            <Link href={`/upload?slotId=${slot.slotId}`} style={{ display: 'block', textDecoration: 'none' }}>
              <motion.button
                id={`modal-proceed-${slot.slotId}`}
                className="btn-dark"
                style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                Proceed to G-Code Upload <ArrowRight size={15} />
              </motion.button>
            </Link>
          ) : (
            <motion.button
              id={`modal-connect-wallet-${slot.slotId}`}
              onClick={onConnectWallet}
              className="btn-dark"
              style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              <Wallet size={15} /> Connect Wallet to Reserve
            </motion.button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Material Dropdown ───────────────────────────────────────────────
function MaterialDropdown({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <motion.button
        id="material-dropdown-btn"
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          padding: '9px 16px', borderRadius: '10px',
          background: '#fff', border: '1.5px solid #e4e4e7',
          fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 600,
          color: '#0a0a0a', cursor: 'pointer', whiteSpace: 'nowrap',
        }}
        whileHover={{ borderColor: '#bbb', background: '#fafafa' }}
        transition={{ duration: 0.18 }}
      >
        <SlidersHorizontal size={14} color="#71717a" />
        {value === 'All Materials' ? 'Material' : value.split(' ').slice(0, 2).join(' ')}
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown size={14} color="#71717a" />
        </motion.span>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.18, ease: ease.snappy }}
            style={{
              position: 'absolute', top: 'calc(100% + 8px)', left: 0,
              background: '#fff', border: '1.5px solid #e4e4e7', borderRadius: '14px',
              boxShadow: '0 12px 40px rgba(0,0,0,0.12)', zIndex: 50,
              minWidth: '220px', overflow: 'hidden', padding: '6px',
            }}
          >
            {MATERIALS.map((mat, i) => (
              <motion.button
                key={i}
                onClick={() => { onChange(mat); setOpen(false); }}
                style={{
                  display: 'block', width: '100%', textAlign: 'left',
                  padding: '9px 14px', borderRadius: '8px', border: 'none',
                  background: value === mat ? '#f4f4f5' : 'transparent',
                  fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: value === mat ? 700 : 500,
                  color: '#0a0a0a', cursor: 'pointer',
                }}
                whileHover={{ background: '#f4f4f5' }}
                transition={{ duration: 0.15 }}
              >
                {mat}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────
export default function MarketplacePage() {
  const [slots] = useState<SlotListing[]>(MOCK_SLOTS);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<Category>('All');
  const [selectedMaterial, setSelectedMaterial] = useState('All Materials');
  const [maxPrice, setMaxPrice] = useState(300);
  const [searchQuery, setSearchQuery] = useState('');
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [reserveTarget, setReserveTarget] = useState<SlotListing | null>(null);

  useEffect(() => {
    // Check if already connected on mount
    const checkConnection = async () => {
      if (typeof window !== 'undefined' && (window as any).ethereum) {
        try {
          const accounts = await (window as any).ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            setWalletAddress(accounts[0]);
            setWalletConnected(true);
          }
        } catch (err) {
          console.error("Error checking connection:", err);
        }
      }
    };
    checkConnection();

    const timer = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  const handleConnectWallet = async () => {
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      try {
        const accounts = await (window as any).ethereum.request({ method: 'eth_requestAccounts' });
        if (accounts.length > 0) {
          setWalletAddress(accounts[0]);
          setWalletConnected(true);
        }
      } catch (err) {
        console.error("Wallet connection failed:", err);
      }
    } else {
      alert("MetaMask is not installed!");
    }
  };

  // Active filter count
  const activeFiltersCount = [
    selectedCategory !== 'All',
    selectedMaterial !== 'All Materials',
    maxPrice < 300,
    searchQuery.trim().length > 0,
  ].filter(Boolean).length;

  // Filter
  const filtered = slots.filter(slot => {
    if (slot.isBooked) return false;
    if (selectedCategory !== 'All' && slot.category !== selectedCategory) return false;
    if (selectedMaterial !== 'All Materials' && slot.material !== selectedMaterial) return false;
    const price = parseInt(slot.pricePerHour.replace(/[^0-9]/g, ''), 10);
    if (price > maxPrice) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      if (!slot.machineName.toLowerCase().includes(q) && !slot.location.toLowerCase().includes(q) && !slot.machineId.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const clearFilters = () => {
    setSelectedCategory('All');
    setSelectedMaterial('All Materials');
    setMaxPrice(300);
    setSearchQuery('');
  };

  return (
    <div style={{ minHeight: '100vh', background: '#fff' }}>
      <MarketplaceHeader
        walletConnected={walletConnected}
        walletAddress={walletAddress}
        onConnectWallet={handleConnectWallet}
      />

      {/* ── Hero Banner ── */}
      <section style={{ paddingTop: '100px', borderBottom: '1.5px solid #e4e4e7', background: '#fff' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 40px 0' }}>

          {/* Pill badge */}
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, ease: ease.snappy }}
            style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}
          >
            <motion.span animate={{ rotate: 360 }} transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}>
              <Sparkle size={18} style={{ color: '#0a0a0a' }} />
            </motion.span>
            <span style={{
              fontFamily: 'var(--font-body)', fontSize: '12px', fontWeight: 700,
              letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: '#52525b',
              background: '#f4f4f5', padding: '5px 14px', borderRadius: '999px',
              border: '1.5px solid #e4e4e7',
            }}>
              Live Capacity Marketplace
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6, ease: ease.snappy }}
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(2rem, 4vw, 3.2rem)',
              fontWeight: 800, letterSpacing: '-0.035em',
              color: '#0a0a0a', lineHeight: 1.1,
              marginBottom: '12px',
            }}
          >
            Available Machine Slots
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6, ease: ease.snappy }}
            style={{ fontFamily: 'var(--font-body)', fontSize: '15px', color: '#71717a', marginBottom: '32px', maxWidth: '540px', lineHeight: 1.75 }}
          >
            Browse verified industrial machine slots. AI-minted on-chain, instantly bookable via parametric escrow.
          </motion.p>

          {/* Live stats bar */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            style={{ display: 'flex', gap: '0', paddingBottom: '32px', flexWrap: 'wrap' }}
          >
            {[
              { value: `${filtered.length}`, label: 'Available Slots', live: true },
              { value: '6', label: 'Machine Types', live: false },
              { value: '$45–$250/hr', label: 'Rate Range', live: false },
            ].map((stat, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: i < 2 ? '32px' : '0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {stat.live && (
                    <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#16a34a', display: 'inline-block', animation: 'ping-dot 1.8s ease-in-out infinite' }} />
                  )}
                  <div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 800, color: '#0a0a0a', letterSpacing: '-0.03em', lineHeight: 1 }}>{stat.value}</div>
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: '#a1a1aa', fontWeight: 500 }}>{stat.label}</div>
                  </div>
                </div>
                {i < 2 && <div style={{ width: '1px', height: '32px', background: '#e4e4e7', margin: '0 16px' }} />}
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Sticky Filter / Search Control Panel ── */}
      <section style={{
        position: 'sticky', top: '64px', zIndex: 90,
        background: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1.5px solid #e4e4e7',
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '14px 40px' }}>

          {/* Row 1: Search + Material + Slider + Clear */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>

            {/* Search bar */}
            <div style={{ position: 'relative', flex: '1', minWidth: '200px', maxWidth: '300px' }}>
              <Search size={15} color="#a1a1aa" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
              <input
                id="marketplace-search"
                type="text"
                placeholder="Machine name or location..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{
                  width: '100%', paddingLeft: '36px', paddingRight: '32px',
                  paddingTop: '9px', paddingBottom: '9px',
                  borderRadius: '10px', border: '1.5px solid #e4e4e7',
                  background: '#fff', fontFamily: 'var(--font-body)',
                  fontSize: '13px', color: '#0a0a0a', outline: 'none',
                  transition: 'border-color 0.2s',
                }}
                onFocus={e => (e.target.style.borderColor = '#0a0a0a')}
                onBlur={e => (e.target.style.borderColor = '#e4e4e7')}
              />
              <AnimatePresence>
                {searchQuery && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    onClick={() => setSearchQuery('')}
                    style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}
                  >
                    <X size={13} color="#a1a1aa" />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>

            {/* Material dropdown */}
            <MaterialDropdown value={selectedMaterial} onChange={setSelectedMaterial} />

            {/* Max rate slider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Zap size={14} color="#71717a" />
              <span style={{ fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 600, color: '#52525b', whiteSpace: 'nowrap', minWidth: '90px' }}>
                Max: ${maxPrice}/hr
              </span>
              <input
                id="price-slider"
                type="range"
                min={0} max={300} step={10}
                value={maxPrice}
                onChange={e => setMaxPrice(Number(e.target.value))}
                style={{ width: '100px', accentColor: '#0a0a0a', cursor: 'pointer' }}
              />
            </div>

            {/* Clear filters button */}
            <AnimatePresence>
              {activeFiltersCount > 0 && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.85 }}
                  transition={{ duration: 0.2 }}
                  onClick={clearFilters}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    padding: '7px 14px', borderRadius: '999px',
                    background: '#0a0a0a', border: 'none',
                    fontFamily: 'var(--font-body)', fontSize: '12px', fontWeight: 700,
                    color: '#fff', cursor: 'pointer',
                  }}
                  whileHover={{ background: '#333' }}
                >
                  <Filter size={12} />
                  {activeFiltersCount} filter{activeFiltersCount > 1 ? 's' : ''} active · Clear
                  <X size={11} />
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          {/* Row 2: Category pills */}
          <div style={{ display: 'flex', gap: '8px', marginTop: '12px', flexWrap: 'wrap' }}>
            {CATEGORIES.map((cat) => (
              <motion.button
                key={cat}
                id={`cat-pill-${cat.replace(/[\s-]+/g, '-').toLowerCase()}`}
                onClick={() => setSelectedCategory(cat)}
                className={`pill ${selectedCategory === cat ? 'active' : ''}`}
                style={{ fontSize: '13px', padding: '6px 16px' }}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              >
                {cat !== 'All' && (
                  <span style={{
                    width: '6px', height: '6px', borderRadius: '50%',
                    background: selectedCategory === cat ? '#fff' : (CATEGORY_COLORS[cat]?.dot ?? '#a1a1aa'),
                    display: 'inline-block', flexShrink: 0,
                  }} />
                )}
                {cat}
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Card Grid ── */}
      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 40px 80px' }}>
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(330px, 1fr))', gap: '20px' }}
            >
              {Array.from({ length: 6 }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="mock-image"
                  style={{ height: '380px', borderRadius: '20px', border: '1.5px solid #e4e4e7' }}
                />
              ))}
            </motion.div>
          ) : filtered.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              style={{ textAlign: 'center', padding: '80px 20px' }}
            >
              <motion.div
                animate={{ rotate: [0, 15, -15, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                style={{ fontSize: '52px', marginBottom: '16px', display: 'inline-block' }}
              >
                ⬡
              </motion.div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 800, color: '#0a0a0a', letterSpacing: '-0.02em', marginBottom: '10px' }}>
                No slots match your filters
              </h3>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: '#71717a', marginBottom: '28px' }}>
                Try adjusting your filters or search query to find available machines.
              </p>
              <motion.button onClick={clearFilters} className="btn-dark" style={{ padding: '10px 24px', fontSize: '14px' }} whileHover={{ scale: 1.03, y: -1 }} whileTap={{ scale: 0.97 }}>
                Clear all filters
              </motion.button>
            </motion.div>
          ) : (
            <motion.div key="grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
              {/* Results count */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
              >
                <span style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: '#71717a', fontWeight: 500 }}>
                  Showing <strong style={{ color: '#0a0a0a', fontWeight: 700 }}>{filtered.length}</strong> available slots
                </span>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: '#a1a1aa', fontWeight: 500 }}>
                  Updated live · Sepolia Testnet
                </span>
              </motion.div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(330px, 1fr))', gap: '20px' }}>
                <AnimatePresence mode="popLayout">
                  {filtered.map((slot, i) => (
                    <SlotCard key={slot.slotId} slot={slot} index={i} onReserve={setReserveTarget} />
                  ))}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* ── Reserve Modal ── */}
      <AnimatePresence>
        {reserveTarget && (
          <ReserveModal
            slot={reserveTarget}
            onClose={() => setReserveTarget(null)}
            walletConnected={walletConnected}
            onConnectWallet={handleConnectWallet}
          />
        )}
      </AnimatePresence>

      {/* ── Footer ── */}
      <footer style={{ background: '#0a0a0a', color: '#fff', padding: '48px 40px 32px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{
            display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
            gap: '40px', flexWrap: 'wrap',
            paddingBottom: '36px', borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: '24px',
          }}>
            <div style={{ maxWidth: '280px' }}>
              <Link href="/" style={{ textDecoration: 'none' }}>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 800, letterSpacing: '-0.03em', color: '#fff', display: 'block', marginBottom: '10px' }}>
                  ⬡ IndustriLease
                </span>
              </Link>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'rgba(255,255,255,0.4)', lineHeight: 1.7 }}>
                Industrial 5.0 DePIN Marketplace. Powered by autonomous AI agents, parametric escrow, and cryptographic telemetry.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
              {['Documentation', 'Terms of Service', 'Privacy Policy', 'GitHub'].map((link, i) => (
                <a
                  key={i} href="#"
                  style={{ fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 500, color: 'rgba(255,255,255,0.45)', textDecoration: 'none', transition: 'color 0.2s' }}
                  onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.9)')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.45)')}
                >
                  {link}
                </a>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'rgba(255,255,255,0.3)' }}>
              © {new Date().getFullYear()} IndustriLease. All rights reserved. Industrial 5.0 DePIN Marketplace.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#22c55e', display: 'inline-block', animation: 'ping-dot 2s ease-in-out infinite' }} />
              <span style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>All Systems Operational</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
