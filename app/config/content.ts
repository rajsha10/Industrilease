export const platformContent = {
  header: {
    logo: "IndustriLease",
    networkStatus: "Live Network: IndustriLease",
    ctaBorrow: "Borrow Capacity",
    ctaLend: "Lend Hardware",
  },
  hero: {
    pillText: "Industrial 5.0 DePIN Marketplace",
    title: "Democratizing High-End Industrial Capacity.",
    subtitle: "Unlock excess manufacturing capacity through autonomous AI agents and mathematically secure parametric escrow. Scale your production without the CapEx overhead.",
    ctaBorrow: "Borrow Capacity",
    ctaLend: "Lend Hardware",
    telemetry: {
      activePrinters: "1,204 Active Printers",
      activeCNCs: "348 Active CNCs",
      networkStatus: "All Systems Operational"
    }
  },
  splash: {
    // TODO: Replace this placeholder image with the Spline 3D component in the future
    placeholderImage: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    nodes: [
      "Live Telemetry Stream",
      "EIP-712 Verified",
      "AI Handled Escrow"
    ]
  },
  about: {
    title: "The Future of Manufacturing is Decentralized",
    description: "IndustriLease is an Industrial 5.0 DePIN (Decentralized Physical Infrastructure Network). We bridge the gap between underutilized, high-end factory hardware and SMEs needing immediate manufacturing capacity. By utilizing smart contracts, AI agents, and cryptographic telemetry, we eliminate trust barriers and streamline industrial leasing."
  },
  workflow: {
    title: "How IndustriLease Works",
    steps: [
      {
        number: "01",
        title: "List Idle Time",
        description: "Hardware owners connect their machines. Our AI agent automatically mints available time-slots on-chain as ERC-1155 tokens."
      },
      {
        number: "02",
        title: "AI Job Matching",
        description: "Borrowers upload G-code. The system validates dimensions and securely locks payment into a parametric escrow contract."
      },
      {
        number: "03",
        title: "Cryptographic Proof",
        description: "The machine executes the job and generates an EIP-712 telemetry signature proving successful completion."
      },
      {
        number: "04",
        title: "Automated Settlement",
        description: "The escrow contract verifies the cryptographic proof and instantly releases funds to the hardware owner."
      }
    ]
  },
  offers: {
    title: "What We Offer",
    items: [
      {
        title: "Zero-Trust Security",
        description: "Cryptographic EIP-712 telemetry signatures mathematically prove machine state before any payment is released.",
        icon: "ShieldCheck"
      },
      {
        title: "Parametric Escrow",
        description: "Smart contracts automatically handle SME payment locking, releasing funds upon successful job completion.",
        icon: "Lock"
      },
      {
        title: "Autonomous AI Agents",
        description: "ERC-7579 Scoped Session Keys autonomously list idle time, mint slots, and relay telemetry proofs.",
        icon: "Cpu"
      }
    ]
  },
  equipmentShowcase: {
    sectionTitle: "Available Capacity Network",
    sectionDescription: "High-end industrial machines currently open for capacity borrowing.",
    machines: [
      {
        id: "m1",
        category: "5-Axis CNC",
        title: "CNC Machining Center Operating",
        hourlyRate: "$145/hr",
        isVerified: true,
        imageExterior: "/midsection/CNC_machining_center_operating.jpeg",
      },
      {
        id: "m2",
        category: "Industrial FDM",
        title: "Industrial 3D Printer Render",
        hourlyRate: "$35/hr",
        isVerified: true,
        imageExterior: "/midsection/Industrial_3D_printer_render.jpeg",
      },
      {
        id: "m3",
        category: "Robotic Arm",
        title: "Industrial Robot Arm Isolated",
        hourlyRate: "$90/hr",
        isVerified: true,
        imageExterior: "/midsection/Industrial_robot_arm_isolated.jpeg",
      },
      {
        id: "m4",
        category: "Laser Cutter",
        title: "Laser Cutting Machine Enclosure",
        hourlyRate: "$85/hr",
        isVerified: true,
        imageExterior: "/midsection/Laser_cutting_machine_enclosure.jpeg",
      },
      {
        id: "m5",
        category: "Metal SLS",
        title: "Metal SLS 3D Printer",
        hourlyRate: "$190/hr",
        isVerified: true,
        imageExterior: "/midsection/Metal_SLS_3D_printer.jpeg",
      }
    ]
  },
  users: {
    borrowers: {
      title: "For Borrowers",
      subtitle: "Scale Without CapEx",
      features: [
        "Access enterprise-grade 3D printers and CNCs.",
        "Zero upfront capital expenditure required.",
        "Secure payments held in escrow until job completion."
      ]
    },
    lenders: {
      title: "For Lenders",
      subtitle: "Monetize Idle Time",
      features: [
        "Turn unused factory downtime into revenue.",
        "Autonomous AI handles listing and booking.",
        "Guaranteed payments via cryptographic verification."
      ]
    }
  },
  onboarding: {
    title: "Ready to scale your industrial capacity?",
    ctaLend: "Onboard as Lender",
    ctaBorrow: "Onboard as Borrower"
  },
  footer: {
    description: "Industrial 5.0 DePIN Marketplace.",
    links: ["Documentation", "Terms of Service", "Privacy Policy", "GitHub"]
  }
};
