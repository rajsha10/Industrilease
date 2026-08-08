'use client';

import { useState, useEffect } from 'react';
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import { 
  AnimatedHeading, 
  Reveal, 
  StaggerReveal, 
  StaggerItem 
} from "@/app/components/animations";
import { 
  FileCode, 
  Terminal, 
  Cpu, 
  Lock, 
  Copy, 
  Check, 
  Play, 
  BookOpen, 
  ExternalLink,
  ChevronRight,
  Code,
  Globe,
  Settings,
  Database,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';

export default function DeveloperDocsPage() {
  // Sticky Sidebar Scroll Spying state
  const [activeSection, setActiveSection] = useState("smart-contracts");

  // ABI Explorer state
  const [activeContract, setActiveContract] = useState("slot-token");
  const [abiSearchQuery, setAbiSearchQuery] = useState("");
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // API Tab State
  const [activeApiTab, setActiveApiTab] = useState("get-slots");

  // Contract Addresses from environment with fallbacks
  const slotTokenAddress = process.env.NEXT_PUBLIC_SLOT_TOKEN_ADDRESS || '0x5FbDB2315678afecb367f032d93F642f64180aa3';
  const escrowAddress = process.env.NEXT_PUBLIC_ESCROW_ADDRESS || '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512';

  const sections = [
    { id: "smart-contracts", label: "Smart Contracts" },
    { id: "api-routes", label: "API Schemas & Webhooks" },
    { id: "eip712-spec", label: "EIP-712 Telemetry Struct" },
    { id: "local-dev", label: "Local Development Setup" }
  ];

  // Monitor scroll to update active sidebar section
  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY + 160;
      
      for (const section of sections) {
        const element = document.getElementById(section.id);
        if (element) {
          const top = element.offsetTop;
          const height = element.offsetHeight;
          if (scrollPos >= top && scrollPos < top + height) {
            setActiveSection(section.id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAddress(id);
    setTimeout(() => setCopiedAddress(null), 2000);
  };

  const handleCopyCode = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const contractRegistry = [
    {
      id: "slot-token",
      name: "MachineSlotToken.sol",
      role: "Semi-fungible capacity token representing specific machine time windows (ERC-1155 derivative).",
      address: slotTokenAddress,
      methods: [
        {
          name: "mintSlot",
          signature: "mintSlot(string machineId, uint256 startTime, uint256 endTime, uint256 pricePerHour, uint256 setupFee, uint256 totalLayers)",
          desc: "Mints a new capacity slot. Only hardware owners or authorized AI agents can call this.",
          inputs: [
            { name: "machineId", type: "string" },
            { name: "startTime", type: "uint256" },
            { name: "endTime", type: "uint256" },
            { name: "pricePerHour", type: "uint256" },
            { name: "setupFee", type: "uint256" },
            { name: "totalLayers", type: "uint256" }
          ]
        },
        {
          name: "setAgentAuthorization",
          signature: "setAgentAuthorization(address agent, bool authorized)",
          desc: "Grants or revokes authorization for an autonomous AI agent to manage time slot token listings.",
          inputs: [
            { name: "agent", type: "address" },
            { name: "authorized", type: "bool" }
          ]
        },
        {
          name: "slots",
          signature: "slots(uint256 slotId) view returns (string machineId, uint256 startTime, uint256 endTime, uint256 pricePerHour, uint256 setupFee, uint256 totalLayers, address factory, uint8 status)",
          desc: "Returns detailed configuration, time limits, fees, and status logs of a minted time slot.",
          inputs: [
            { name: "slotId", type: "uint256" }
          ]
        }
      ]
    },
    {
      id: "escrow",
      name: "IndustriLeaseEscrow.sol",
      role: "Escrow clearinghouse that holds borrower payments and settles parametrically based on telemetry validation.",
      address: escrowAddress,
      methods: [
        {
          name: "lockFunds",
          signature: "lockFunds(uint256 slotId, uint256 totalLayers) payable",
          desc: "Locks rental payment in escrow. Borrower calls this to lock capacity.",
          inputs: [
            { name: "slotId", type: "uint256" },
            { name: "totalLayers", type: "uint256" }
          ]
        },
        {
          name: "releaseFunds",
          signature: "releaseFunds(uint256 slotId, string machineId, string jobId, uint256 layersCompleted, uint256 powerDrawAvg, string status, bytes signature)",
          desc: "Validates EIP-712 telemetry proof signatures and releases funds to the lender. If incomplete layers are verified, triggers a partial refund.",
          inputs: [
            { name: "slotId", type: "uint256" },
            { name: "machineId", type: "string" },
            { name: "jobId", type: "string" },
            { name: "layersCompleted", type: "uint256" },
            { name: "powerDrawAvg", type: "uint256" },
            { name: "status", type: "string" },
            { name: "signature", type: "bytes" }
          ]
        }
      ]
    }
  ];

  // API specs helper
  const apiRoutes = {
    "get-slots": {
      method: "GET",
      path: "/api/slots",
      desc: "Retrieve capacity listings merged from Sepolia events and local database cache.",
      query: [
        { name: "category", type: "string", desc: "Filter by machine type (e.g. '5-Axis CNC')" },
        { name: "material", type: "string", desc: "Filter by supported printing/milling materials" },
        { name: "maxRate", type: "number", desc: "Maximum hourly rate in USD" },
        { name: "search", type: "string", desc: "Text search within machine title or description" }
      ],
      response: `{
  "success": true,
  "slots": [
    {
      "slotId": "42",
      "machineId": "m1-cnc",
      "startTime": 1791244800,
      "endTime": 1791252000,
      "pricePerHour": "145000000000000000000",
      "setupFee": "15000000000000000000",
      "totalLayers": 250,
      "status": "AVAILABLE",
      "factoryAddress": "0x4a2f8c1d3e9b7f5a2c6d8e1f3a4b5c6d7e8f9a0b"
    }
  ]
}`
    },
    "post-sanitize": {
      method: "POST",
      path: "/api/gcode/sanitize",
      desc: "Validates uploaded manufacturing G-code line-by-line prior to hardware dispatch.",
      payload: `{
  "gcodeContent": "G21\\nG90\\nG0 Z5.0\\nG1 X10 Y20 F1200\\nG1 Z-0.5 F200...",
  "machineLimits": {
    "minZ": 0.0,
    "maxTemp": 280,
    "maxFeedrate": 3000
  }
}`,
      response: `{
  "safe": true,
  "fingerprint": "0x7f4e92a10b42f63e8a1d5c2e9b04f7a6e12d5b6a78c9",
  "checks": {
    "totalLines": 1420,
    "boundsZ": "Safe (Min: 0.0mm)",
    "maxFeedrateChecked": "Safe (1200 mm/min)"
  },
  "violations": []
}`
    },
    "post-telemetry": {
      method: "POST",
      path: "/api/telemetry/stream",
      desc: "Ingests raw signed EIP-712 layer telemetry packets emitted by the simulator.",
      payload: `{
  "slotId": 42,
  "machineId": "m1-cnc",
  "jobId": "job-8921",
  "layersCompleted": 250,
  "powerDrawAvg": 184,
  "status": "COMPLETED",
  "signature": "0x8a92f00c5c4db65e0b31648da47662d0b0238330727a7c85ba6e7192f15a3bb..."
}`,
      response: `{
  "success": true,
  "message": "Telemetry packet received and validated.",
  "escrowSettled": true,
  "payoutTx": "0xbc18a4a50d27c62b9a1e8f3b4c5d6e7f8a9b0c1d2e3f"
}`
    }
  };

  const activeRoute = apiRoutes[activeApiTab as keyof typeof apiRoutes] as any;

  const eip712Code = `// Javascript/Typescript EIP-712 Signing Example via Viem
import { createWalletClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { sepolia } from 'viem/chains';

const account = privateKeyToAccount(process.env.TPM_ENCLAVE_KEY);
const client = createWalletClient({
  account,
  chain: sepolia,
  transport: http()
});

const domain = {
  name: 'IndustriLease',
  version: '1',
  chainId: 11155111, // Sepolia
  verifyingContract: '${escrowAddress}'
};

const types = {
  TelemetryProof: [
    { name: 'slotId', type: 'uint256' },
    { name: 'machineId', type: 'string' },
    { name: 'jobId', type: 'string' },
    { name: 'layersCompleted', type: 'uint256' },
    { name: 'powerDrawAvg', type: 'uint256' },
    { name: 'status', type: 'string' }
  ]
};

const signature = await client.signTypedData({
  domain,
  types,
  primaryType: 'TelemetryProof',
  message: {
    slotId: 42n,
    machineId: 'm1-cnc',
    jobId: 'job-8921',
    layersCompleted: 250n,
    powerDrawAvg: 184n,
    status: 'COMPLETED'
  }
});`;

  return (
    <div className="flex flex-col min-h-screen bg-[#fafafa]">
      <Header />
      
      <main className="flex-1 pt-[100px] pb-20">
        {/* HERO */}
        <section className="px-6 md:px-12 max-w-7xl mx-auto mb-12">
          <div className="border-b border-[#e4e4e7] pb-8">
            <span className="text-xs uppercase font-extrabold tracking-wider text-neutral-400 mb-2 block">
              Developer Portal
            </span>
            <AnimatedHeading
              text="Developer Documentation"
              as="h1"
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(2rem, 4vw, 3rem)",
                fontWeight: 800,
                color: "#0a0a0a",
                letterSpacing: "-0.02em",
                margin: 0
              }}
            />
            <p className="text-base text-neutral-500 font-medium mt-2 max-w-2xl">
              Integrate with the IndustriLease DePIN protocol. Explore contract ABIs, test endpoints, EIP-712 payload shapes, and local enclaves.
            </p>
          </div>
        </section>

        {/* CONTAINER GRID */}
        <section className="px-6 md:px-12 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            
            {/* STICKY SIDEBAR NAVIGATION */}
            <aside className="lg:col-span-3 sticky top-[100px] hidden lg:block">
              <nav className="flex flex-col gap-1 border-l border-[#e4e4e7] pl-4">
                {sections.map((sec) => (
                  <a
                    key={sec.id}
                    href={`#${sec.id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      document.getElementById(sec.id)?.scrollIntoView({ behavior: 'smooth' });
                      setActiveSection(sec.id);
                    }}
                    className={`text-xs font-semibold py-2 transition-all block ${
                      activeSection === sec.id
                        ? "text-black border-l-2 border-black pl-3 -ml-[17px] font-bold"
                        : "text-neutral-450 hover:text-neutral-900"
                    }`}
                  >
                    {sec.label}
                  </a>
                ))}
              </nav>
            </aside>

            {/* MAIN CONTENT BLOCK */}
            <div className="lg:col-span-9 space-y-20">
              
              {/* SMART CONTRACTS REGISTRY */}
              <section id="smart-contracts" className="scroll-mt-24 space-y-6">
                <div>
                  <h2 className="text-xl md:text-2xl font-display font-extrabold text-[#0a0a0a] tracking-tight mb-2">
                    Deployed Sepolia Contracts
                  </h2>
                  <p className="text-xs md:text-sm text-neutral-550 leading-relaxed font-medium">
                    The protocol contracts deployed on Sepolia testnet. Make calls using Ethers.js or Viem.
                  </p>
                </div>

                {/* Contract address list */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {contractRegistry.map((contract) => (
                    <div key={contract.id} className="bg-white border border-[#e4e4e7] rounded-xl p-5 shadow-xs relative overflow-hidden flex flex-col justify-between min-h-[220px]">
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <div className="p-2 rounded bg-neutral-100 text-neutral-800">
                            {contract.id === "slot-token" ? <Cpu size={16} /> : <Lock size={16} />}
                          </div>
                          <h3 className="font-display font-bold text-sm text-neutral-900 leading-tight">
                            {contract.name}
                          </h3>
                        </div>
                        <p className="text-xs text-neutral-500 mb-4 leading-relaxed font-medium">
                          {contract.role}
                        </p>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between bg-neutral-50 border border-neutral-100 rounded-lg p-2.5 font-mono text-[10px] text-neutral-600">
                          <span className="truncate pr-2">{contract.address}</span>
                          <button
                            onClick={() => handleCopy(contract.address, contract.id)}
                            className="text-neutral-400 hover:text-neutral-900 transition flex-shrink-0"
                            aria-label="Copy Address"
                          >
                            {copiedAddress === contract.id ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                          </button>
                        </div>

                        <div className="flex gap-2">
                          <a
                            href={`https://sepolia.etherscan.io/address/${contract.address}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 text-center py-2 border border-neutral-200 rounded-lg text-[10px] font-bold text-neutral-700 hover:border-black hover:bg-neutral-50 transition flex items-center justify-center gap-1"
                          >
                            View on Etherscan <ExternalLink size={10} />
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* INTERACTIVE ABI EXPLORER */}
                <div className="bg-white border border-[#e4e4e7] rounded-2xl shadow-sm overflow-hidden mt-8">
                  <div className="bg-neutral-50 border-b border-[#e4e4e7] px-6 py-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Code size={16} className="text-neutral-500" />
                      <span className="text-xs font-mono font-bold text-neutral-900">Contract ABI Explorer</span>
                    </div>
                    <div className="flex bg-neutral-200/60 p-0.5 rounded-lg">
                      <button
                        onClick={() => {
                          setActiveContract("slot-token");
                          setAbiSearchQuery("");
                        }}
                        className={`px-3 py-1.5 rounded-md text-[10px] font-bold transition-all ${
                          activeContract === "slot-token" 
                            ? "bg-white text-black shadow-xs" 
                            : "text-neutral-500 hover:text-neutral-900"
                        }`}
                      >
                        MachineSlotToken
                      </button>
                      <button
                        onClick={() => {
                          setActiveContract("escrow");
                          setAbiSearchQuery("");
                        }}
                        className={`px-3 py-1.5 rounded-md text-[10px] font-bold transition-all ${
                          activeContract === "escrow" 
                            ? "bg-white text-black shadow-xs" 
                            : "text-neutral-500 hover:text-neutral-900"
                        }`}
                      >
                        IndustriLeaseEscrow
                      </button>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="mb-4">
                      <input
                        type="text"
                        placeholder="Search contract methods..."
                        value={abiSearchQuery}
                        onChange={e => setAbiSearchQuery(e.target.value)}
                        className="w-full bg-white border border-neutral-200 rounded-xl px-4 py-2 text-xs placeholder-neutral-400 focus:outline-none focus:border-black"
                      />
                    </div>

                    <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                      {contractRegistry
                        .find(c => c.id === activeContract)
                        ?.methods.filter(m => m.name.toLowerCase().includes(abiSearchQuery.toLowerCase()))
                        .map((method, idx) => (
                          <div key={idx} className="bg-neutral-50/60 border border-neutral-100 rounded-xl p-4 font-mono text-xs">
                            <div className="flex justify-between items-start gap-2 mb-2">
                              <span className="text-black font-bold font-mono">{method.name}()</span>
                              <span className="text-[10px] text-neutral-400 font-bold bg-neutral-100 px-2 py-0.5 rounded">method</span>
                            </div>
                            <p className="text-[11px] text-neutral-500 font-sans mb-3 leading-relaxed">
                              {method.desc}
                            </p>
                            <div className="bg-neutral-950 text-neutral-300 p-2.5 rounded-lg text-[10px] flex justify-between items-center gap-4 overflow-x-auto">
                              <span className="whitespace-nowrap">{method.signature}</span>
                              <button
                                onClick={() => handleCopyCode(method.signature, `${method.name}-${idx}`)}
                                className="text-neutral-500 hover:text-white transition flex-shrink-0"
                                aria-label="Copy Signature"
                              >
                                {copiedCode === `${method.name}-${idx}` ? <Check size={10} className="text-emerald-400" /> : <Copy size={10} />}
                              </button>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </section>

              {/* API ROUTE SCHEMAS & WEBHOOKS */}
              <section id="api-routes" className="scroll-mt-24 space-y-6">
                <div>
                  <h2 className="text-xl md:text-2xl font-display font-extrabold text-[#0a0a0a] tracking-tight mb-2">
                    API Schemas & Webhooks
                  </h2>
                  <p className="text-xs md:text-sm text-neutral-550 leading-relaxed font-medium">
                    The platform exposes serverless routes and webhooks to synchronize off-chain telemetry enclaves with smart contract execution.
                  </p>
                </div>

                <div className="bg-white border border-[#e4e4e7] rounded-2xl overflow-hidden shadow-sm">
                  {/* Tabs bar */}
                  <div className="flex border-b border-[#e4e4e7] bg-neutral-50 overflow-x-auto">
                    {Object.keys(apiRoutes).map((key) => {
                      const route = apiRoutes[key as keyof typeof apiRoutes];
                      return (
                        <button
                          key={key}
                          onClick={() => setActiveApiTab(key)}
                          className={`px-5 py-4 text-xs font-bold font-mono transition-all border-b-2 whitespace-nowrap ${
                            activeApiTab === key
                              ? "border-black text-black bg-white"
                              : "border-transparent text-neutral-400 hover:text-neutral-800"
                          }`}
                        >
                          <span className={`text-[10px] font-bold mr-1.5 px-1.5 py-0.5 rounded ${
                            route.method === "GET" ? "bg-emerald-50 text-emerald-600" : "bg-neutral-200 text-neutral-700"
                          }`}>
                            {route.method}
                          </span>
                          {route.path}
                        </button>
                      );
                    })}
                  </div>

                  {/* Schema body */}
                  <div className="p-6 space-y-6">
                    <div>
                      <p className="text-xs md:text-sm text-neutral-600 font-medium">
                        {activeRoute.desc}
                      </p>
                    </div>

                    {/* Query parameters for GET */}
                    {activeRoute.query && (
                      <div>
                        <h4 className="text-[10px] uppercase font-bold tracking-wider text-neutral-400 mb-2">
                          Query parameters
                        </h4>
                        <div className="border border-neutral-100 rounded-xl overflow-hidden text-xs">
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="bg-neutral-50 border-b border-neutral-100 font-bold text-neutral-500">
                                <th className="p-3">Parameter</th>
                                <th className="p-3">Type</th>
                                <th className="p-3">Description</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100 font-medium">
                              {activeRoute.query?.map((q: any, idx: number) => (
                                <tr key={idx}>
                                  <td className="p-3 font-mono text-black font-semibold">{q.name}</td>
                                  <td className="p-3 font-mono text-neutral-500">{q.type}</td>
                                  <td className="p-3 text-neutral-600">{q.desc}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* Request Payload for POST */}
                    {activeRoute.payload && (
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="text-[10px] uppercase font-bold tracking-wider text-neutral-400">
                            Request payload (JSON)
                          </h4>
                          <button
                            onClick={() => handleCopyCode(activeRoute.payload || "", 'payload')}
                            className="text-neutral-400 hover:text-neutral-900 transition text-[10px] flex items-center gap-1 font-bold"
                          >
                            {copiedCode === 'payload' ? <Check size={10} className="text-emerald-500" /> : <Copy size={10} />} Copy
                          </button>
                        </div>
                        <pre className="bg-neutral-950 text-neutral-300 rounded-xl p-4 font-mono text-[10px] overflow-x-auto whitespace-pre leading-relaxed">
                          {activeRoute.payload}
                        </pre>
                      </div>
                    )}

                    {/* Response Schema */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="text-[10px] uppercase font-bold tracking-wider text-neutral-400">
                          Response shape (JSON)
                        </h4>
                        <button
                          onClick={() => handleCopyCode(activeRoute.response || "", 'response')}
                          className="text-neutral-400 hover:text-neutral-900 transition text-[10px] flex items-center gap-1 font-bold"
                        >
                          {copiedCode === 'response' ? <Check size={10} className="text-emerald-500" /> : <Copy size={10} />} Copy
                        </button>
                      </div>
                      <pre className="bg-neutral-950 text-neutral-300 rounded-xl p-4 font-mono text-[10px] overflow-x-auto whitespace-pre leading-relaxed">
                        {activeRoute.response}
                      </pre>
                    </div>
                  </div>
                </div>
              </section>

              {/* EIP-712 TELEMETRY SPECIFICATION */}
              <section id="eip712-spec" className="scroll-mt-24 space-y-6">
                <div>
                  <h2 className="text-xl md:text-2xl font-display font-extrabold text-[#0a0a0a] tracking-tight mb-2">
                    EIP-712 Telemetry Struct & Signature
                  </h2>
                  <p className="text-xs md:text-sm text-neutral-555 leading-relaxed font-medium">
                    To eliminate fake execution reporting, the hardware enclave emits cryptographically signed telemetry payloads verifying real execution metrics.
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  
                  {/* Left Solidity struct */}
                  <div className="lg:col-span-5 space-y-4">
                    <div className="bg-white border border-[#e4e4e7] rounded-xl p-5 shadow-xs">
                      <h4 className="text-[10px] uppercase font-bold tracking-wider text-neutral-400 mb-3">
                        Solidity Struct Definition
                      </h4>
                      <pre className="bg-neutral-50 text-black border border-neutral-100 rounded-lg p-3 font-mono text-[9px] overflow-x-auto whitespace-pre leading-relaxed">
{`struct TelemetryProof {
    uint256 slotId;
    string machineId;
    string jobId;
    uint256 layersCompleted;
    uint256 powerDrawAvg;
    string status; // "COMPLETED" | "FAILED"
}`}
                      </pre>
                    </div>

                    <div className="bg-white border border-[#e4e4e7] rounded-xl p-5 shadow-xs">
                      <h4 className="text-[10px] uppercase font-bold tracking-wider text-neutral-400 mb-3">
                        Domain Hash
                      </h4>
                      <pre className="bg-neutral-50 text-black border border-neutral-100 rounded-lg p-3 font-mono text-[9px] overflow-x-auto whitespace-pre-wrap leading-normal">
{`bytes32 public constant TELEMETRY_TYPEHASH = 
  keccak256("TelemetryProof(uint256 slotId,string machineId,string jobId,uint256 layersCompleted,uint256 powerDrawAvg,string status)");`}
                      </pre>
                    </div>
                  </div>

                  {/* Right client code snippet */}
                  <div className="lg:col-span-7 bg-neutral-950 text-neutral-300 rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between shadow-lg min-h-[380px]">
                    <div>
                      <div className="flex justify-between items-center mb-4 pb-2 border-b border-neutral-800">
                        <span className="text-xs font-mono font-bold text-white">signTelemetryPayload.ts</span>
                        <button
                          onClick={() => handleCopyCode(eip712Code, 'eip712')}
                          className="text-neutral-500 hover:text-white transition text-[10px] flex items-center gap-1 font-bold font-mono"
                        >
                          {copiedCode === 'eip712' ? <Check size={10} className="text-emerald-400" /> : <Copy size={10} />} Copy code
                        </button>
                      </div>
                      <pre className="font-mono text-[9px] overflow-x-auto whitespace-pre leading-relaxed text-neutral-450">
                        {eip712Code}
                      </pre>
                    </div>
                  </div>
                </div>
              </section>

              {/* LOCAL DEVELOPMENT SETUP */}
              <section id="local-dev" className="scroll-mt-24 space-y-6">
                <div>
                  <h2 className="text-xl md:text-2xl font-display font-extrabold text-[#0a0a0a] tracking-tight mb-2">
                    Local Development & Testing
                  </h2>
                  <p className="text-xs md:text-sm text-neutral-550 leading-relaxed font-medium">
                    Run the complete physical-to-digital loop locally on your machine for debugging.
                  </p>
                </div>

                <div className="bg-white border border-[#e4e4e7] rounded-2xl p-6 md:p-8 shadow-xs space-y-6">
                  {/* Step 1 */}
                  <div className="flex items-start gap-4">
                    <span className="w-6 h-6 rounded-full bg-neutral-100 border border-neutral-200 text-neutral-700 font-bold text-[10px] flex items-center justify-center flex-shrink-0 font-mono">
                      1
                    </span>
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-neutral-900 uppercase tracking-wide">
                        Install Dependencies & Virtualenv
                      </h4>
                      <p className="text-xs text-neutral-550 leading-relaxed font-medium">
                        Setup the frontend node packages and Python virtual environments for the simulation scripts.
                      </p>
                      <pre className="bg-neutral-950 text-neutral-300 rounded-lg p-2.5 font-mono text-[10px] overflow-x-auto max-w-xl">
{`# Install UI components
npm install

# Setup simulator virtualenv
cd backend-python
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt`}
                      </pre>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="flex items-start gap-4">
                    <span className="w-6 h-6 rounded-full bg-neutral-100 border border-neutral-200 text-neutral-700 font-bold text-[10px] flex items-center justify-center flex-shrink-0 font-mono">
                      2
                    </span>
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-neutral-900 uppercase tracking-wide">
                        Configure Local Environment
                      </h4>
                      <p className="text-xs text-neutral-550 leading-relaxed font-medium">
                        Create a `.env` configuration file in the project root folder.
                      </p>
                      <pre className="bg-neutral-950 text-neutral-300 rounded-lg p-2.5 font-mono text-[10px] overflow-x-auto max-w-xl">
{`# Root config (.env)
NEXT_PUBLIC_SLOT_TOKEN_ADDRESS=${slotTokenAddress}
NEXT_PUBLIC_ESCROW_ADDRESS=${escrowAddress}
RPC_URL=http://localhost:8545`}
                      </pre>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="flex items-start gap-4">
                    <span className="w-6 h-6 rounded-full bg-neutral-100 border border-neutral-200 text-neutral-700 font-bold text-[10px] flex items-center justify-center flex-shrink-0 font-mono">
                      3
                    </span>
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-neutral-900 uppercase tracking-wide">
                        Run Node & Deploy Contracts
                      </h4>
                      <p className="text-xs text-neutral-550 leading-relaxed font-medium">
                        Spin up your local hardhat/anvil development node and run deployment scripts.
                      </p>
                      <pre className="bg-neutral-950 text-neutral-300 rounded-lg p-2.5 font-mono text-[10px] overflow-x-auto max-w-xl">
{`# Start local RPC network
npx hardhat node

# Deploy smart contracts locally
npx hardhat run scripts/deploy.js --network localhost`}
                      </pre>
                    </div>
                  </div>

                  {/* Step 4 */}
                  <div className="flex items-start gap-4">
                    <span className="w-6 h-6 rounded-full bg-neutral-100 border border-neutral-200 text-neutral-700 font-bold text-[10px] flex items-center justify-center flex-shrink-0 font-mono">
                      4
                    </span>
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-neutral-900 uppercase tracking-wide">
                        Start Simulation & Frontend
                      </h4>
                      <p className="text-xs text-neutral-550 leading-relaxed font-medium">
                        Execute the hardware simulation daemon and launch the Next.js development server.
                      </p>
                      <pre className="bg-neutral-950 text-neutral-300 rounded-lg p-2.5 font-mono text-[10px] overflow-x-auto max-w-xl">
{`# Execute physical simulator.py in backend-python folder
python simulator.py

# Launch local app server
npm run dev`}
                      </pre>
                    </div>
                  </div>
                </div>
              </section>

            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
