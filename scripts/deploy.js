import hre from "hardhat";

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // 1. Deploy MachineSlotToken
  console.log("Deploying MachineSlotToken...");
  const baseURI = ""; // On-chain metadata only
  const MachineSlotToken = await hre.ethers.getContractFactory("MachineSlotToken");
  const slotToken = await MachineSlotToken.deploy(baseURI);
  await slotToken.waitForDeployment();
  const slotTokenAddress = await slotToken.getAddress();
  console.log("MachineSlotToken deployed to:", slotTokenAddress);

  // 2. Deploy IndustriLeaseEscrow
  console.log("Deploying IndustriLeaseEscrow...");
  const protocolTreasury = deployer.address; // Use deployer as protocol treasury for testing/demo
  const IndustriLeaseEscrow = await hre.ethers.getContractFactory("IndustriLeaseEscrow");
  const escrow = await IndustriLeaseEscrow.deploy(slotTokenAddress, protocolTreasury);
  await escrow.waitForDeployment();
  const escrowAddress = await escrow.getAddress();
  console.log("IndustriLeaseEscrow deployed to:", escrowAddress);

  // 3. Connect Escrow Contract to MachineSlotToken
  console.log("Connecting Escrow Contract to MachineSlotToken...");
  const tx1 = await slotToken.setEscrowContract(escrowAddress);
  await tx1.wait();
  console.log("Escrow linked successfully.");

  // 4. Configure Authorizations for Demo
  // AI Agent Wallet Address (from backend-python/agent.py private key: 0x2222222222222222222222222222222222222222222222222222222222222222)
  const agentAddress = hre.ethers.getAddress("0x20f39A3215570B24564c767425164B2902996d92".toLowerCase());
  console.log(`Authorizing AI Agent address (${agentAddress}) to mint slots...`);
  const tx2 = await slotToken.setAgentAuthorization(agentAddress, true);
  await tx2.wait();
  console.log("AI Agent authorized successfully.");

  // Hardware Simulator Wallet Address (from backend-python/simulator.py private key: 0x1111111111111111111111111111111111111111111111111111111111111111)
  const machineSignerAddress = hre.ethers.getAddress("0x7E5F9952f26037362144d2b270fd33e7A7B7Cf3d".toLowerCase());
  const machineId = hre.ethers.encodeBytes32String("CNC-ALPHA-1");
  console.log(`Registering Hardware Simulator wallet signer (${machineSignerAddress}) for machine 'CNC-ALPHA-1'...`);
  const tx3 = await escrow.setMachineSigner(machineId, machineSignerAddress);
  await tx3.wait();
  console.log("Hardware Signer registered successfully.");

  console.log("\n==================================================");
  console.log("DEPLOYMENT COMPLETE! Copy these to your configuration:");
  console.log(`NEXT_PUBLIC_SLOT_TOKEN_ADDRESS=${slotTokenAddress}`);
  console.log(`NEXT_PUBLIC_ESCROW_ADDRESS=${escrowAddress}`);
  console.log("==================================================\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
