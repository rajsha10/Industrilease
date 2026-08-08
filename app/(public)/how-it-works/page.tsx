'use client';

import { useState, useEffect } from 'react';
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import { 
  AnimatedHeading, 
  Reveal, 
  StaggerReveal, 
  StaggerItem, 
  ease, 
  fadeUp 
} from "@/app/components/animations";
import { 
  Cpu, 
  Lock, 
  Layers, 
  Activity, 
  Terminal, 
  ShieldAlert, 
  ShieldCheck, 
  ArrowRight, 
  ArrowDown, 
  FileCode, 
  Check, 
  AlertTriangle,
  Play,
  RotateCcw,
  Zap,
  Settings,
  Globe
} from 'lucide-react';
import Link from 'next/link';

export default function HowItWorksPage() {
  // States for interactive components
  const [activeLayer, setActiveLayer] = useState(0);
  
  // Layer 1 Simulator State
  const [simRunning, setSimRunning] = useState(false);
  const [simProgress, setSimProgress] = useState(0);
  const [simTemp, setSimTemp] = useState(24.0);
  const [simPower, setSimPower] = useState(0.0);
  const [simHash, setSimHash] = useState("0xe3b0c442...");
  const [simLog, setSimLog] = useState<string[]>(["Simulator initialized. Ready."]);

  // Layer 2 Session Keys State
  const [agentScope, setAgentScope] = useState({
    mintSlot: true,
    submitProof: true,
    transferTreasury: false,
  });

  // Layer 3 Parametric Refund State
  const [totalLayers, setTotalLayers] = useState(250);
  const [completedLayers, setCompletedLayers] = useState(150);

  // Layer 4 G-Code Sanitizer State
  const [gcodeSample, setGcodeSample] = useState("safe");
  const [gcodeResult, setGcodeResult] = useState<{ status: string; color: string; log: string } | null>(null);

  // Flowchart Active Step State
  const [activeStep, setActiveStep] = useState(0);

  // Security Matrix Accordion/Card Expand State
  const [expandedFix, setExpandedFix] = useState<number | null>(null);

  // Simulation runner effect
  useEffect(() => {
    let interval: any;
    if (simRunning) {
      interval = setInterval(() => {
        setSimProgress(prev => {
          if (prev >= 100) {
            setSimRunning(false);
            setSimLog(logs => [...logs, "Execution successful.", "TPM 2.0 enclave signature: 0x8a92f00c5c4db65e0b31648da47662d0b0238330727a7c85ba6e"]);
            return 100;
          }
          const next = prev + 5;
          const currentTemp = (200 + Math.random() * 15).toFixed(1);
          const currentPower = (1.5 + Math.random() * 0.6).toFixed(2);
          const nextHash = Math.random().toString(16).substring(2, 10);
          setSimTemp(parseFloat(currentTemp));
          setSimPower(parseFloat(currentPower));
          setSimHash(`0x${nextHash}...`);
          setSimLog(logs => [
            ...logs,
            `Layer ${Math.round((next / 100) * 120)}: ${currentTemp}°C | ${currentPower} kW | SHA-256: 0x${nextHash}`
          ]);
          return next;
        });
      }, 300);
    }
    return () => clearInterval(interval);
  }, [simRunning]);

  const startSimulation = () => {
    setSimProgress(0);
    setSimTemp(24.0);
    setSimPower(0.0);
    setSimRunning(true);
    setSimLog(["Starting simulator.py physics engine...", "Hardware signature verified.", "Executing layer-by-layer G-Code toolpath..."]);
  };

  const handleGcodeAnalyze = () => {
    if (gcodeSample === "malicious") {
      setGcodeResult({
        status: "BLOCKED",
        color: "#ef4444",
        log: "CRITICAL: Malicious G-code instruction detected at line 42!\nCommand: G1 Z-15.0 F1000\nError: Plunge depth violates safety bounds of the machine bed."
      });
    } else {
      setGcodeResult({
        status: "APPROVED",
        color: "#22c55e",
        log: "Toolpath Analysis: OK\nFeedrate: 1200 mm/min (Within limits)\nChamber thermal envelope safe.\nReady for client TPM encryption."
      });
    }
  };

  const layersInfo = [
    {
      title: "Layer 1: Hardware & Physics Simulation",
      filename: "simulator.py",
      role: "Simulates multi-sensor 3D printing and CNC milling execution in real time.",
      outputs: [
        "Real-time Chamber Temperature (°C)",
        "Instantaneous Power Consumption (kW)",
        "Cryptographic SHA-256 hashes generated per printed layer"
      ],
      security: "Hardware signature generation via TPM 2.0 enclave emulator, preventing replay attacks or physical hardware spoofing.",
      icon: Activity,
    },
    {
      title: "Layer 2: Autonomous AI Agent Engine",
      filename: "backend-python/agent.py",
      role: "Monitors factory downtime, automatically mints capacity slots, and broadcasts real-time execution proofs.",
      outputs: [
        "Automated capacity slot detection and token listing",
        "Continuous telemetry logging & EIP-712 packet packaging",
        "Autonomous blockchain transaction dispatch"
      ],
      security: "Operates using ERC-7579 Scoped Session Keys—giving the AI agent strict permissions to only call list and prove slots, with absolutely zero authority over fund withdrawals.",
      icon: Cpu,
    },
    {
      title: "Layer 3: Smart Contract Infrastructure",
      filename: "Solidity on Sepolia",
      role: "Orchestrates capacity tokenization, validates machine telemetry signatures, and handles parametric escrow.",
      outputs: [
        "MachineSlotToken.sol: Semi-fungible ERC-1155 tokens representing time slot reservations",
        "IndustriLeaseEscrow.sol: Trustless deposit locks & validation logic for hardware telemetry",
        "Partial escrow settlements based on verified layers executed"
      ],
      security: "All payouts require EIP-712 telemetry data signatures matching the machine's registered TPM public key. Automated partial refunds occur if the run aborts mid-way.",
      icon: Lock,
    },
    {
      title: "Layer 4: Client Web Application",
      filename: "Next.js / Viem / Tailwind",
      role: "Sanitizes raw manufacturing designs, initiates escrow transactions, and handles interactive 3D telemetry streaming.",
      outputs: [
        "In-browser Edge AI G-code sanitizer to screen malicious commands",
        "Client-side asymmetric file encryption with target machine's public key",
        "Web3 provider integration (Viem / Ethers) for seamless wallet connectivity"
      ],
      security: "Pre-dispatch sanitization prevents machine bed collisions or structural damage. Client-side encryption ensures CAD privacy remains intact until inside the enclave.",
      icon: Layers,
    }
  ];

  const chronologicalSteps = [
    {
      title: "Downtime Detection",
      pill: "Trigger",
      desc: "The factory hardware goes idle. simulator.py alerts backend-python/agent.py."
    },
    {
      title: "Slot Token Minted",
      pill: "On-Chain Listing",
      desc: "AI agent invokes MachineSlotToken.sol to mint a capacity slot token (ERC-1155) representing the block of time."
    },
    {
      title: "CAD Dispatched",
      pill: "Client Handshake",
      desc: "Borrower rents the slot, encrypts the CAD file with the machine's public key, and uploads the toolpath."
    },
    {
      title: "Escrow Locked",
      pill: "Deposit Secured",
      desc: "Borrower locks funds in IndustriLeaseEscrow.sol. The machine's enclave receives the key to decrypt and run."
    },
    {
      title: "Telemetry Signing",
      pill: "Hardware Execution",
      desc: "As the machine prints, it signs layer-by-layer SHA-256 hashes using its TPM 2.0 enclave private key (EIP-712)."
    },
    {
      title: "Parametric Settlement",
      pill: "Auto Payout / Refund",
      desc: "Smart contracts verify telemetry signature. Payout is released to lender. If aborted mid-run, borrower is refunded proportionally."
    }
  ];

  const securityLoopholeFixes = [
    {
      id: 1,
      title: "Malicious G-Code / Machine Bed Plunging",
      vulnerability: "A malicious borrower uploads a toolpath designed to deliberately drive the print head into the build plate, destroying the physical machine.",
      fix: "Edge AI Sanitizer: The Next.js frontend inspects the G-code line-by-line prior to dispatch, checking feed rates, thermal envelopes, and travel limits. Any bounds violation instantly blocks transmission."
    },
    {
      id: 2,
      title: "CAD Design Intellectual Property Theft",
      vulnerability: "A malicious hardware operator eavesdrops on network traffic to steal sensitive CAD designs or proprietary G-code files from the borrower.",
      fix: "Client-Side TPM Asymmetric Encryption: Files are encrypted in the borrower's browser using the target machine's unique public key (PK_machine). Decryption occurs only in the volatile memory of the machine's hardware enclave."
    },
    {
      id: 3,
      title: "Mid-Run Print Faults / Factory Fraud",
      vulnerability: "A print fails halfway through due to a power cut or material clog, but the lender's contract claims full payment, or the lender cancels the run fraudulently.",
      fix: "Parametric Escrow Auto-Refunds: IndustriLeaseEscrow.sol processes telemetry signatures to evaluate completed layers versus total promised. Funds are released proportionally: the lender gets paid for work done, and the borrower is automatically refunded the remainder."
    },
    {
      id: 4,
      title: "Fake Print Telemetry Simulation",
      vulnerability: "A lender spoofs telemetry packets using a simple script to fake a print run, claiming escrow funds without actually operating their machine.",
      fix: "EIP-712 Hardware Enclave Signatures: Every telemetry packet must be signed in (v, r, s) format by the physical TPM private key inside the machine's enclave. The smart contract validates this EIP-712 signature on-chain."
    },
    {
      id: 5,
      title: "Ghost / Phantom Printing (No Physical Power)",
      vulnerability: "A lender emulates a TPM enclave inside a VM to report fake successful telemetry logs, generating signatures without running any hardware.",
      fix: "zkTLS Power Grid Verification: The Reclaim Protocol is utilized to verify real-world smart meter power draw against the machine's active wattage profile without exposing private factory location data."
    },
    {
      id: 6,
      title: "Rogue AI Agent Wallet Hijacking",
      vulnerability: "The AI agent's server is compromised, and an attacker attempts to call transfer functions to drain the lender's treasury account.",
      fix: "ERC-7579 Modular Session Keys: The agent operates via a strictly scoped smart account session key. It is constrained to only call mintSlot and submitLayerProof with zero permissions to initiate treasury transfers."
    }
  ];

  return (
    <div className="flex flex-col min-h-screen font-body bg-[#fafafa]">
      <Header />
      
      <main className="flex-1 pt-[100px] pb-16">
        {/* HERO SECTION */}
        <section className="px-6 md:px-12 max-w-7xl mx-auto mb-16">
          <div className="text-center md:text-left max-w-4xl">
            {/* Live status badge */}
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white border border-[#e4e4e7] mb-6 shadow-xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-semibold text-neutral-800 tracking-wide">
                Sepolia Testnet Active • Contracts Verified on Etherscan
              </span>
            </div>

            <AnimatedHeading
              text="Autonomous DePIN Capacity Leasing Secured by Cryptographic Proofs."
              as="h1"
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(2.5rem, 5vw, 4rem)",
                fontWeight: 800,
                lineHeight: 1.05,
                color: "#0a0a0a",
                letterSpacing: "-0.03em",
                marginBottom: "20px"
              }}
              stagger={0.08}
            />

            <p className="text-lg text-neutral-600 font-medium max-w-2xl leading-relaxed mb-6">
              IndustriLease bridges high-end manufacturing hardware to capital-light SMEs. 
              Our protocol securely converts idle physical machinery into verifiable, liquid Real-World Assets (RWAs).
            </p>
          </div>
        </section>

        {/* 4-LAYER INTERACTIVE ARCHITECTURE DIAGRAM */}
        <section className="px-6 md:px-12 max-w-7xl mx-auto mb-24">
          <div className="mb-8">
            <h2 className="text-2xl md:text-3xl font-display font-extrabold text-[#0a0a0a] tracking-tight mb-2">
              Platform Architecture
            </h2>
            <p className="text-sm md:text-base text-neutral-500 max-w-xl font-medium">
              Explore the four distinct layers of the IndustriLease physical-to-digital stack. Click on a layer to inspect its components and run the interactive simulator.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left selector col */}
            <div className="lg:col-span-5 flex flex-col gap-3">
              {layersInfo.map((layer, idx) => {
                const IconComponent = layer.icon;
                const isActive = activeLayer === idx;
                return (
                  <button
                    key={idx}
                    onClick={() => setActiveLayer(idx)}
                    className={`w-full text-left p-5 rounded-xl border transition-all duration-300 flex items-start gap-4 ${
                      isActive 
                        ? "bg-white border-[#0a0a0a] shadow-md scale-[1.01]" 
                        : "bg-white/60 hover:bg-white border-[#e4e4e7] hover:border-[#bbb]"
                    }`}
                  >
                    <div className={`p-3 rounded-lg ${isActive ? "bg-black text-white" : "bg-neutral-100 text-neutral-500"}`}>
                      <IconComponent size={20} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">
                          Layer {idx + 1}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 bg-neutral-100 rounded text-neutral-600">
                          {layer.filename}
                        </span>
                      </div>
                      <h3 className="font-display font-extrabold text-sm md:text-base text-neutral-900 leading-tight">
                        {layer.title.split(":")[1]}
                      </h3>
                      <p className="text-xs text-neutral-500 mt-2 line-clamp-2">
                        {layer.role}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Right details / simulator console col */}
            <div className="lg:col-span-7">
              <div className="bg-white border border-[#e4e4e7] rounded-2xl shadow-sm overflow-hidden flex flex-col min-h-[520px]">
                {/* Header bar */}
                <div className="bg-neutral-50 border-b border-[#e4e4e7] px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
                    <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                    <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
                    <span className="text-xs font-mono font-semibold text-neutral-500 ml-2">
                      {layersInfo[activeLayer].filename} — Stack Inspector
                    </span>
                  </div>
                  <div className="flex items-center gap-1 bg-neutral-200/60 px-2.5 py-1 rounded-md text-[10px] font-mono font-bold text-neutral-600">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#0a0a0a] animate-pulse mr-1" />
                    LIVE TELEMETRY
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-lg font-display font-extrabold text-neutral-900 mb-2">
                        {layersInfo[activeLayer].title}
                      </h4>
                      <p className="text-sm text-neutral-600 leading-relaxed font-medium">
                        {layersInfo[activeLayer].role}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-neutral-100">
                      <div>
                        <h5 className="text-[11px] font-bold tracking-wider text-neutral-400 uppercase mb-2">
                          Key Outputs & Actions
                        </h5>
                        <ul className="space-y-2">
                          {layersInfo[activeLayer].outputs.map((out, i) => (
                            <li key={i} className="text-xs text-neutral-700 font-semibold flex items-start gap-2">
                              <span className="text-neutral-900 font-extrabold">•</span>
                              <span>{out}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h5 className="text-[11px] font-bold tracking-wider text-neutral-400 uppercase mb-2">
                          Security binding
                        </h5>
                        <div className="text-xs text-neutral-600 bg-neutral-50 border border-neutral-100 rounded-xl p-3 leading-relaxed font-medium">
                          {layersInfo[activeLayer].security}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* INTERACTIVE WORKSPACE PER TAB */}
                  <div className="mt-8 pt-6 border-t border-neutral-100">
                    <h5 className="text-xs font-bold text-neutral-900 mb-3 flex items-center gap-1.5">
                      <Terminal size={14} /> Interactive Sandbox
                    </h5>

                    {/* Layer 1 Simulator */}
                    {activeLayer === 0 && (
                      <div className="bg-neutral-950 rounded-xl p-4 text-white font-mono text-xs shadow-inner">
                        <div className="flex justify-between items-center mb-3 pb-2 border-b border-neutral-800">
                          <span className="text-[#a1a1aa] font-bold">simulator.py Console</span>
                          <div className="flex gap-2">
                            <button
                              onClick={startSimulation}
                              disabled={simRunning}
                              className="px-3 py-1 bg-white text-black font-bold rounded hover:bg-neutral-200 transition text-[10px] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                            >
                              <Play size={10} fill="black" /> Run Simulation
                            </button>
                            <button
                              onClick={() => {
                                setSimRunning(false);
                                setSimProgress(0);
                                setSimTemp(24.0);
                                setSimPower(0.0);
                                setSimLog(["Simulator reset. Ready."]);
                              }}
                              className="px-3 py-1 bg-neutral-800 text-white font-bold rounded hover:bg-neutral-700 transition text-[10px] flex items-center gap-1"
                            >
                              <RotateCcw size={10} /> Reset
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2 text-center mb-3">
                          <div className="bg-neutral-900 p-2 rounded">
                            <div className="text-[#71717a] text-[9px] font-bold">CHAMBER TEMP</div>
                            <div className="text-sm font-bold text-amber-500">{simTemp.toFixed(1)}°C</div>
                          </div>
                          <div className="bg-neutral-900 p-2 rounded">
                            <div className="text-[#71717a] text-[9px] font-bold">POWER PROFILE</div>
                            <div className="text-sm font-bold text-[#38bdf8]">{simPower.toFixed(2)} kW</div>
                          </div>
                          <div className="bg-neutral-900 p-2 rounded">
                            <div className="text-[#71717a] text-[9px] font-bold">LAYER HASH</div>
                            <div className="text-sm font-bold text-[#a78bfa] overflow-hidden text-ellipsis whitespace-nowrap">{simHash}</div>
                          </div>
                        </div>

                        <div className="bg-neutral-900/60 p-1.5 rounded-lg mb-2">
                          <div className="w-full bg-neutral-800 rounded-full h-1.5">
                            <div 
                              className="bg-white h-1.5 rounded-full transition-all duration-300"
                              style={{ width: `${simProgress}%` }}
                            />
                          </div>
                        </div>

                        <div className="max-h-24 overflow-y-auto space-y-1 font-mono text-[10px] text-neutral-400 border border-neutral-900 p-2 rounded bg-neutral-950/80 animate-pulse">
                          {simLog.map((log, i) => (
                            <div key={i} className={log.includes("TPM") ? "text-emerald-400 font-bold" : log.includes("Error") ? "text-rose-400" : ""}>
                              &gt; {log}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Layer 2 Modular Session Keys */}
                    {activeLayer === 1 && (
                      <div className="bg-neutral-950 rounded-xl p-4 text-white font-mono text-xs shadow-inner">
                        <div className="flex justify-between items-center mb-3 pb-2 border-b border-neutral-800">
                          <span className="text-[#a1a1aa] font-bold">ERC-7579 Session Key Configurator</span>
                          <span className="text-[10px] text-amber-500 font-semibold">Active Session</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                          <label className="flex items-center gap-2 bg-neutral-900 p-2.5 rounded cursor-pointer hover:bg-neutral-800 transition">
                            <input 
                              type="checkbox" 
                              checked={agentScope.mintSlot} 
                              onChange={e => setAgentScope(prev => ({ ...prev, mintSlot: e.target.checked }))}
                              className="rounded border-neutral-700 bg-neutral-800 accent-white"
                            />
                            <div>
                              <span className="text-[11px] font-bold block">mintSlot()</span>
                              <span className="text-[9px] text-[#71717a]">Auto listing time</span>
                            </div>
                          </label>

                          <label className="flex items-center gap-2 bg-neutral-900 p-2.5 rounded cursor-pointer hover:bg-neutral-800 transition">
                            <input 
                              type="checkbox" 
                              checked={agentScope.submitProof} 
                              onChange={e => setAgentScope(prev => ({ ...prev, submitProof: e.target.checked }))}
                              className="rounded border-neutral-700 bg-neutral-800 accent-white"
                            />
                            <div>
                              <span className="text-[11px] font-bold block">submitProof()</span>
                              <span className="text-[9px] text-[#71717a]">Relaying telemetry</span>
                            </div>
                          </label>

                          <label className="flex items-center gap-2 bg-neutral-900 p-2.5 rounded cursor-pointer hover:bg-neutral-800 transition">
                            <input 
                              type="checkbox" 
                              checked={agentScope.transferTreasury} 
                              onChange={e => setAgentScope(prev => ({ ...prev, transferTreasury: e.target.checked }))}
                              className="rounded border-neutral-700 bg-neutral-800 accent-white"
                            />
                            <div>
                              <span className="text-[11px] font-bold block text-rose-450">transfer()</span>
                              <span className="text-[9px] text-rose-450 font-bold">Treasury drain</span>
                            </div>
                          </label>
                        </div>

                        <div className="bg-neutral-900 p-3 rounded text-[10px] text-neutral-300">
                          {agentScope.transferTreasury ? (
                            <div className="text-rose-400 flex items-start gap-2 font-semibold">
                              <AlertTriangle size={14} className="flex-shrink-0 mt-0.5" />
                              <div>
                                SECURITY CONSTRAINT VIOLATION: Modular Session Key configuration restricts transfers. 
                                The transaction will be rejected by the smart account's validation module.
                              </div>
                            </div>
                          ) : (
                            <div className="text-emerald-400 flex items-start gap-2 font-semibold">
                              <Check size={14} className="flex-shrink-0 mt-0.5" />
                              <div>
                                SECURE AGENT PAYLOAD: Session Key restricts functions strictly to capacity management. 
                                The agent is authorized to mint slots and post layer proofs. Risk profile: ZERO.
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Layer 3 Parametric Payout Escrow */}
                    {activeLayer === 2 && (
                      <div className="bg-neutral-50 border border-neutral-250 rounded-xl p-4 text-neutral-800 text-xs shadow-xs">
                        <div className="flex justify-between items-center mb-3 pb-2 border-b border-neutral-200">
                          <span className="text-neutral-500 font-bold font-mono">IndustriLeaseEscrow.sol Calculator</span>
                          <span className="text-[10px] font-mono font-bold text-neutral-900 bg-neutral-200/50 px-2 py-0.5 rounded">Parametric Refund</span>
                        </div>

                        <div className="space-y-4 mb-4">
                          <div>
                            <div className="flex justify-between font-bold text-xs text-neutral-600 mb-1">
                              <span>Total Promised Layers:</span>
                              <span className="font-mono text-neutral-900">{totalLayers}</span>
                            </div>
                            <input 
                              type="range" 
                              min="50" 
                              max="500" 
                              value={totalLayers} 
                              onChange={e => {
                                const val = parseInt(e.target.value);
                                setTotalLayers(val);
                                if (completedLayers > val) setCompletedLayers(val);
                              }}
                              className="w-full accent-black h-1 bg-neutral-200 rounded-lg appearance-none cursor-pointer"
                            />
                          </div>

                          <div>
                            <div className="flex justify-between font-bold text-xs text-neutral-600 mb-1">
                              <span>Completed / Verified Layers:</span>
                              <span className="font-mono text-neutral-900">{completedLayers} of {totalLayers}</span>
                            </div>
                            <input 
                              type="range" 
                              min="0" 
                              max={totalLayers} 
                              value={completedLayers} 
                              onChange={e => setCompletedLayers(parseInt(e.target.value))}
                              className="w-full accent-black h-1 bg-neutral-200 rounded-lg appearance-none cursor-pointer"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 bg-white p-3 border border-neutral-200 rounded-lg">
                          <div className="text-center border-r border-neutral-100">
                            <div className="text-[9px] font-bold text-neutral-400 uppercase">Paid to Lender</div>
                            <div className="text-base font-extrabold text-neutral-900 mt-0.5">
                              {((completedLayers / totalLayers) * 100).toFixed(0)}%
                            </div>
                            <div className="text-[10px] text-neutral-500 mt-0.5 font-mono">
                              (${((completedLayers / totalLayers) * 100).toFixed(1)} / $100 escrow)
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-[9px] font-bold text-neutral-400 uppercase">Refunded to Borrower</div>
                            <div className="text-base font-extrabold text-emerald-600 mt-0.5">
                              {(100 - (completedLayers / totalLayers) * 100).toFixed(0)}%
                            </div>
                            <div className="text-[10px] text-neutral-500 mt-0.5 font-mono">
                              (${(100 - (completedLayers / totalLayers) * 100).toFixed(1)} / $100 escrow)
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Layer 4 Edge AI G-Code Sanitizer */}
                    {activeLayer === 3 && (
                      <div className="bg-neutral-950 rounded-xl p-4 text-white font-mono text-xs shadow-inner">
                        <div className="flex justify-between items-center mb-3 pb-2 border-b border-neutral-800">
                          <span className="text-[#a1a1aa] font-bold">Edge AI G-code Sanitizer Sandbox</span>
                          <span className="text-[10px] text-neutral-500">Client-Side Checking</span>
                        </div>

                        <div className="flex items-center gap-3 mb-3">
                          <div className="flex-1">
                            <select
                              value={gcodeSample}
                              onChange={e => {
                                setGcodeSample(e.target.value);
                                setGcodeResult(null);
                              }}
                              className="w-full bg-neutral-900 border border-neutral-800 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-neutral-600"
                            >
                              <option value="safe">Normal Toolpath (Safe Bounds)</option>
                              <option value="malicious">Malicious G-Code (Z-Axis Plunge)</option>
                            </select>
                          </div>
                          <button
                            onClick={handleGcodeAnalyze}
                            className="px-4 py-1.5 bg-white text-black font-bold rounded hover:bg-neutral-200 transition text-[11px]"
                          >
                            Analyze G-Code
                          </button>
                        </div>

                        {gcodeResult ? (
                          <div className="bg-neutral-900 p-3 rounded-lg border border-neutral-800">
                            <div className="flex items-center gap-1.5 font-bold mb-2">
                              {gcodeResult.status === "APPROVED" ? (
                                <ShieldCheck size={14} className="text-emerald-500" />
                              ) : (
                                <ShieldAlert size={14} className="text-rose-500" />
                              )}
                              <span style={{ color: gcodeResult.color }}>
                                STATUS: {gcodeResult.status}
                              </span>
                            </div>
                            <pre className="text-[9px] text-neutral-400 font-mono whitespace-pre-wrap leading-relaxed">
                              {gcodeResult.log}
                            </pre>
                          </div>
                        ) : (
                          <div className="bg-neutral-900/50 text-neutral-500 text-[10px] text-center py-6 border border-dashed border-neutral-800 rounded">
                            Select G-code profile and click Analyze G-Code to run verification rules.
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ⚡ DATA FLOW VISUALIZATION (CHRONOLOGICAL SEQUENCE) */}
        <section className="bg-neutral-900 text-white py-20 border-y border-neutral-800 mb-24 overflow-hidden">
          <div className="px-6 md:px-12 max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <span className="text-xs uppercase font-extrabold tracking-widest text-neutral-500 mb-2 block">
                Chronological Sequence
              </span>
              <h2 className="text-2xl md:text-3xl font-display font-extrabold tracking-tight text-white mb-2">
                ⚡ End-to-End Execution Flow
              </h2>
              <p className="text-sm text-neutral-400 max-w-xl mx-auto font-medium">
                The lifecycle of an IndustriLease lease reservation, from physical sensor triggers to trustless multi-party cryptographic settlements.
              </p>
            </div>

            {/* Steps interactive layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {chronologicalSteps.map((step, idx) => {
                const isActive = activeStep === idx;
                return (
                  <button
                    key={idx}
                    onClick={() => setActiveStep(idx)}
                    className={`cursor-pointer text-left p-6 rounded-2xl border transition-all duration-300 relative ${
                      isActive 
                        ? "bg-white text-black border-white shadow-xl scale-[1.01]" 
                        : "bg-neutral-950/40 hover:bg-neutral-950/85 border-neutral-850 text-neutral-400 hover:border-neutral-600"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                        isActive ? "bg-black text-white" : "bg-neutral-800 text-neutral-400"
                      }`}>
                        {step.pill}
                      </span>
                      <span className={`font-display font-black text-2xl leading-none ${
                        isActive ? "text-neutral-300" : "text-neutral-800"
                      }`}>
                        0{idx + 1}
                      </span>
                    </div>
                    <h3 className={`font-display font-extrabold text-sm md:text-base leading-tight mb-2 ${
                      isActive ? "text-black" : "text-white"
                    }`}>
                      {step.title}
                    </h3>
                    <p className={`text-xs leading-relaxed font-medium ${
                      isActive ? "text-neutral-600" : "text-neutral-400"
                    }`}>
                      {step.desc}
                    </p>

                    {/* Step connection indicator (dot/glow) */}
                    {isActive && (
                      <span className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 rounded-full bg-black shadow-lg" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Interactive Timeline Visual Board */}
            <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-6 md:p-8">
              <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-6 flex items-center gap-1.5 font-mono">
                <Globe size={12} className="text-neutral-500 animate-spin" /> Chronological Telemetry Signal Path
              </h4>

              {/* Diagrams */}
              <div className="flex flex-col items-center justify-center py-6">
                <div className="flex flex-col md:flex-row items-center gap-4 w-full max-w-4xl justify-between">
                  <div className={`p-4 rounded-xl border font-mono text-center flex-1 transition-all ${
                    activeStep === 0 ? "bg-white text-black border-white shadow" : "bg-neutral-900 border-neutral-800 text-neutral-500"
                  }`}>
                    <div className="text-[10px] uppercase font-bold text-neutral-500">Node A</div>
                    <div className="text-xs font-bold mt-1">FACTORY HARDWARE</div>
                    <div className="text-[8px] mt-1 text-[#71717a]">downtime detected</div>
                  </div>

                  <div className="text-neutral-600 font-bold flex items-center gap-1 md:rotate-0 rotate-90">
                    <ArrowRight size={16} />
                  </div>

                  <div className={`p-4 rounded-xl border font-mono text-center flex-1 transition-all ${
                    activeStep === 1 || activeStep === 2 ? "bg-white text-black border-white shadow" : "bg-neutral-900 border-neutral-800 text-neutral-500"
                  }`}>
                    <div className="text-[10px] uppercase font-bold text-neutral-500">Node B</div>
                    <div className="text-xs font-bold mt-1">AI AGENT ENGINE</div>
                    <div className="text-[8px] mt-1 text-[#71717a]">mints slot token (ERC-1155)</div>
                  </div>

                  <div className="text-neutral-600 font-bold flex items-center gap-1 md:rotate-0 rotate-90">
                    <ArrowRight size={16} />
                  </div>

                  <div className={`p-4 rounded-xl border font-mono text-center flex-1 transition-all ${
                    activeStep === 3 || activeStep === 4 ? "bg-white text-black border-white shadow" : "bg-neutral-900 border-neutral-800 text-neutral-500"
                  }`}>
                    <div className="text-[10px] uppercase font-bold text-neutral-500">Node C</div>
                    <div className="text-xs font-bold mt-1">ESCROW DEPOSIT</div>
                    <div className="text-[8px] mt-1 text-[#71717a]">verify EIP-712 / telemetry</div>
                  </div>

                  <div className="text-neutral-600 font-bold flex items-center gap-1 md:rotate-0 rotate-90">
                    <ArrowRight size={16} />
                  </div>

                  <div className={`p-4 rounded-xl border font-mono text-center flex-1 transition-all ${
                    activeStep === 5 ? "bg-white text-black border-white shadow" : "bg-neutral-900 border-neutral-800 text-neutral-500"
                  }`}>
                    <div className="text-[10px] uppercase font-bold text-neutral-500">Node D</div>
                    <div className="text-xs font-bold mt-1">SETTLEMENT PAYOUT</div>
                    <div className="text-[8px] mt-1 text-[#71717a]">proportional payouts & refunds</div>
                  </div>
                </div>

                <div className="mt-8 text-center text-xs font-mono text-neutral-500 border border-neutral-900 bg-neutral-900/40 p-4 rounded-xl max-w-2xl leading-relaxed">
                  <span className="font-bold text-white block mb-1">Active Step telemetry highlight:</span>
                  {activeStep === 0 && "simulator.py monitors CNC spindle / build envelope. If idle triggers are sensed for > 30 minutes, it outputs hardware-locked status packet."}
                  {activeStep === 1 && "agent.py parses hardware status payload and triggers contract execution to tokenise the machine availability."}
                  {activeStep === 2 && "The renter client-side application requests the Machine public key PK_machine, encrypts CAD binaries, and secures them for target TPM loading."}
                  {activeStep === 3 && "Funds locked into IndustriLeaseEscrow.sol initiate contract state machine. Enclave is notified of locked funds and releases telemetry listening ports."}
                  {activeStep === 4 && "During execution, layer metrics sign directly in hardware memory. Telemetry hashes are signed with the enclave private key."}
                  {activeStep === 5 && "Smart contract validates cryptographic telemetry proof arrays. Escrow contract settles parametrically if a partial execution occurs."}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECURITY MATRIX: THE 6 HARDENED LOOPHOLE FIXES */}
        <section className="px-6 md:px-12 max-w-7xl mx-auto mb-24">
          <div className="text-center mb-12">
            <span className="text-xs uppercase font-extrabold tracking-widest text-neutral-500 mb-2 block">
              Hardened Architecture
            </span>
            <h2 className="text-2xl md:text-3xl font-display font-extrabold tracking-tight text-[#0a0a0a] mb-2">
              The 6 Hardened Loophole Fixes
            </h2>
            <p className="text-sm text-neutral-500 max-w-xl mx-auto font-medium">
              We proactively secure the system against industrial attacks, fake signatures, rogue agents, and IP leaks. Click a card to read the exact attack vector and fix.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {securityLoopholeFixes.map((fix) => {
              const isExpanded = expandedFix === fix.id;
              return (
                <button
                  key={fix.id}
                  onClick={() => setExpandedFix(isExpanded ? null : fix.id)}
                  className={`bg-white border rounded-2xl p-6 text-left transition-all duration-300 cursor-pointer flex flex-col justify-between hover:shadow-md ${
                    isExpanded ? "border-[#0a0a0a] ring-1 ring-[#0a0a0a]" : "border-[#e4e4e7] hover:border-[#bbb]"
                  }`}
                >
                  <div className="w-full">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-[10px] font-mono font-bold bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded">
                        L-{fix.id}
                      </span>
                      <span className="text-neutral-400">
                        {isExpanded ? <ChevronDownIcon /> : <ChevronRightIcon />}
                      </span>
                    </div>
                    <h3 className="font-display font-extrabold text-sm md:text-base text-neutral-900 leading-tight mb-4">
                      {fix.title}
                    </h3>

                    {/* Side-by-side / Expanded logic */}
                    <div className="space-y-4 text-xs">
                      <div>
                        <div className="text-[10px] uppercase font-bold text-rose-505 tracking-wider mb-1 flex items-center gap-1">
                          <ShieldAlert size={10} /> Exploit Scenario / Loophole
                        </div>
                        <p className="text-neutral-500 font-medium leading-relaxed">
                          {fix.vulnerability}
                        </p>
                      </div>

                      {isExpanded && (
                        <div className="pt-3 border-t border-neutral-100 animate-fadeIn">
                          <div className="text-[10px] uppercase font-bold text-emerald-600 tracking-wider mb-1 flex items-center gap-1">
                            <ShieldCheck size={10} /> Cryptographic / Architectural Fix
                          </div>
                          <p className="text-neutral-750 font-bold leading-relaxed">
                            {fix.fix}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {!isExpanded && (
                    <div className="mt-4 pt-3 border-t border-neutral-50 text-[10px] text-neutral-400 font-bold uppercase tracking-wider flex items-center gap-1">
                      <Zap size={10} /> Read Architectural Fix →
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </section>

        {/* PRIMARY CTA BANNER */}
        <section className="px-6 md:px-12 max-w-7xl mx-auto">
          <div className="bg-[#0a0a0a] text-white rounded-3xl p-8 md:p-12 text-center relative overflow-hidden shadow-2xl">
            {/* Background elements */}
            <div className="absolute inset-0 bg-radial-gradient from-neutral-800/30 via-transparent to-transparent opacity-60 pointer-events-none" />
            <div className="relative z-10 max-w-2xl mx-auto">
              <h2 className="text-2xl md:text-4xl font-display font-extrabold tracking-tight mb-4 leading-tight">
                Ready to Deploy Secure Time Capacity?
              </h2>
              <p className="text-neutral-400 text-sm md:text-base mb-8 font-medium leading-relaxed">
                Connect your hardware enclave or start renting verified CNC & 3D printer capacity autonomously today.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/marketplace"
                  className="w-full sm:w-auto px-8 py-3.5 bg-white text-black font-display font-extrabold text-sm rounded-xl hover:bg-neutral-200 transition-all text-center flex items-center justify-center gap-2"
                >
                  Explore Marketplace <ArrowRight size={16} />
                </Link>
                <Link
                  href="#"
                  className="w-full sm:w-auto px-8 py-3.5 bg-neutral-900 border border-neutral-800 text-white font-display font-extrabold text-sm rounded-xl hover:bg-neutral-850 hover:border-neutral-700 transition-all text-center"
                >
                  Read Technical Docs
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

// Chevron Helper Icons
function ChevronRightIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="m9 18 6-6-6-6"/>
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="m6 9 6 6 6-6"/>
    </svg>
  );
}
