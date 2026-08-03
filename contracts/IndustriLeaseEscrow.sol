// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

// ─────────────────────────────────────────────────────────────────────────────
//  IndustriLeaseEscrow.sol  ·  IndustriLease  ·  Sepolia Testnet
//
//  Trustless clearing-house for industrial machine time-slot rentals.
//
//  Lifecycle:
//    1. SME calls lockFunds(slotId)          – deposits ETH (slot price)
//    2. Factory AI agent dispatches job
//    3. Telemetry sim produces signed proof
//    4. Agent calls releaseFunds(slotId, sig) – verifies proof, disburses:
//         · 90 %  → factory wallet
//         · 10 %  → protocol / agent reward pool
//    (alt) refundSME(slotId, percentage)      – partial refund on mid-run fail
//
//  Signature verification uses ECDSA: the machine's registered on-chain
//  address must be the signer of keccak256(abi.encodePacked(slotId, "COMPLETED"))
//
//  Deploy order:
//    1. Deploy MachineSlotToken → address A
//    2. Deploy IndustriLeaseEscrow(address A) → address B
//    3. Call MachineSlotToken.setEscrowContract(address B)
// ─────────────────────────────────────────────────────────────────────────────

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";

interface IMachineSlotToken {
    enum SlotStatus {
        AVAILABLE, BOOKED, EXECUTING, COMPLETED, CANCELLED, REFUNDED
    }

    struct SlotMetadata {
        bytes32 machineId;
        uint64  startTime;
        uint64  endTime;
        uint96  pricePerHour;
        address factory;
        SlotStatus status;
    }

    function getSlot(uint256 slotId) external view returns (SlotMetadata memory);
    function updateSlotStatus(uint256 slotId, SlotStatus newStatus) external;
    function machineAgent(bytes32 machineId) external view returns (address);
}

contract IndustriLeaseEscrow is Ownable, ReentrancyGuard {
    using ECDSA for bytes32;
    using MessageHashUtils for bytes32;

    // ─── Constants ────────────────────────────────────────────────────────────

    /// @dev 10_000 = 100.00%. Factory receives FACTORY_BPS of gross payment.
    uint256 public constant FACTORY_BPS  = 9_000;   // 90 %
    uint256 public constant PROTOCOL_BPS = 1_000;   // 10 %

    // ─── Storage ──────────────────────────────────────────────────────────────

    IMachineSlotToken public immutable slotToken;

    /// @notice Protocol fee collection address (multisig / agent reward pool).
    address public protocolTreasury;

    struct EscrowRecord {
        address sme;            // Buyer who locked funds
        uint256 lockedAmount;   // Total ETH locked (wei)
        bool    released;       // True after any settlement (release or refund)
    }

    mapping(uint256 => EscrowRecord) public escrows;

    /// @notice machineId → the hardware signing key registered off-chain.
    ///         This is the private key whose corresponding address is stored here.
    ///         The Python simulator signs telemetry proofs with this key.
    mapping(bytes32 => address) public machineSignerAddress;

    // ─── Events ───────────────────────────────────────────────────────────────

    event FundsLocked(
        uint256 indexed slotId,
        address indexed sme,
        uint256 amount
    );

    event FundsReleased(
        uint256 indexed slotId,
        address indexed factory,
        uint256 factoryShare,
        uint256 protocolShare
    );

    event PartialRefundIssued(
        uint256 indexed slotId,
        address indexed sme,
        uint256 refundAmount,
        uint256 completionPercentage
    );

    event FullRefundIssued(uint256 indexed slotId, address indexed sme, uint256 amount);

    event MachineSignerSet(bytes32 indexed machineId, address signer);

    // ─── Errors ───────────────────────────────────────────────────────────────

    error SlotNotAvailable(uint256 slotId);
    error IncorrectPayment(uint256 required, uint256 sent);
    error AlreadySettled(uint256 slotId);
    error InvalidSignature();
    error InvalidPercentage();
    error OnlyAgentOrOwner();
    error TransferFailed();
    error SlotNotBooked(uint256 slotId);
    error MachineSignerNotSet(bytes32 machineId);

    // ─── Constructor ──────────────────────────────────────────────────────────

    constructor(address _slotToken, address _protocolTreasury)
        Ownable(msg.sender)
    {
        require(_slotToken != address(0), "SlotToken: zero");
        require(_protocolTreasury != address(0), "Treasury: zero");
        slotToken        = IMachineSlotToken(_slotToken);
        protocolTreasury = _protocolTreasury;
    }

    // ─── Admin ────────────────────────────────────────────────────────────────

    /// @notice Register the hardware signer public address for a machine.
    ///         This is the Ethereum address derived from the machine's private
    ///         key that the Python telemetry simulator uses to sign proofs.
    function setMachineSigner(bytes32 machineId, address signer)
        external
        onlyOwner
    {
        require(signer != address(0), "Signer: zero");
        machineSignerAddress[machineId] = signer;
        emit MachineSignerSet(machineId, signer);
    }

    function setProtocolTreasury(address treasury) external onlyOwner {
        require(treasury != address(0), "Treasury: zero");
        protocolTreasury = treasury;
    }

    // ─── Step 1: SME locks funds ──────────────────────────────────────────────

    /// @notice SME calls this to book a slot and lock payment into escrow.
    ///
    ///         Exact ETH payment must match the computed slot cost:
    ///             durationHours * pricePerHour
    ///
    ///         The SME uploads their encrypted CAD file off-chain immediately
    ///         after this transaction confirms.
    ///
    /// @param slotId  Token ID of the chosen MachineSlotToken.
    function lockFunds(uint256 slotId)
        external
        payable
        nonReentrant
    {
        IMachineSlotToken.SlotMetadata memory slot = slotToken.getSlot(slotId);

        // ── Slot must be AVAILABLE ────────────────────────────────────────────
        if (slot.status != IMachineSlotToken.SlotStatus.AVAILABLE) {
            revert SlotNotAvailable(slotId);
        }

        // ── Compute required payment ──────────────────────────────────────────
        uint256 durationSeconds = slot.endTime - slot.startTime;
        uint256 durationHours   = durationSeconds / 3600;
        // Enforce at least 1 hour minimum to avoid dust locks
        if (durationHours == 0) durationHours = 1;
        uint256 required = durationHours * uint256(slot.pricePerHour);

        if (msg.value != required) {
            revert IncorrectPayment(required, msg.value);
        }

        // ── Record escrow ─────────────────────────────────────────────────────
        escrows[slotId] = EscrowRecord({
            sme:          msg.sender,
            lockedAmount: msg.value,
            released:     false
        });

        // ── Transition slot status to BOOKED ──────────────────────────────────
        slotToken.updateSlotStatus(slotId, IMachineSlotToken.SlotStatus.BOOKED);

        emit FundsLocked(slotId, msg.sender, msg.value);
    }

    // ─── Step 2 (internal): Slot marked EXECUTING ─────────────────────────────
    // Called by the factory AI agent (Python) via a Next.js relay route to
    // indicate the job has been dispatched to hardware. Kept simple here;
    // the agent may also call updateSlotStatus directly via a separate tx.

    function markExecuting(uint256 slotId) external {
        IMachineSlotToken.SlotMetadata memory slot = slotToken.getSlot(slotId);
        address agent = slotToken.machineAgent(slot.machineId);
        if (msg.sender != agent && msg.sender != owner()) revert OnlyAgentOrOwner();
        if (slot.status != IMachineSlotToken.SlotStatus.BOOKED) revert SlotNotBooked(slotId);

        slotToken.updateSlotStatus(slotId, IMachineSlotToken.SlotStatus.EXECUTING);
    }

    // ─── Step 3: Agent submits telemetry proof → release funds ───────────────

    /// @notice Factory AI agent calls this after the telemetry simulator
    ///         produces a signed completion proof.
    ///
    ///         Proof message format (matches Python simulator signing logic):
    ///             message = keccak256(abi.encodePacked(slotId, "COMPLETED"))
    ///             signature = sign(eth_sign(message), machinePrivateKey)
    ///
    ///         On successful ECDSA recovery:
    ///             · 90 % of locked ETH → factory wallet
    ///             · 10 % of locked ETH → protocol treasury
    ///
    /// @param slotId             Token ID of the settled slot.
    /// @param telemetrySignature 65-byte ECDSA signature from machine key.
    function releaseFunds(
        uint256 slotId,
        bytes memory telemetrySignature
    )
        external
        nonReentrant
    {
        IMachineSlotToken.SlotMetadata memory slot = slotToken.getSlot(slotId);
        EscrowRecord storage record = escrows[slotId];

        // ── Guards ────────────────────────────────────────────────────────────
        if (record.released) revert AlreadySettled(slotId);
        if (
            slot.status != IMachineSlotToken.SlotStatus.BOOKED &&
            slot.status != IMachineSlotToken.SlotStatus.EXECUTING
        ) revert SlotNotBooked(slotId);

        address expectedSigner = machineSignerAddress[slot.machineId];
        if (expectedSigner == address(0)) revert MachineSignerNotSet(slot.machineId);

        // ── Verify telemetry proof signature ──────────────────────────────────
        //    The Python simulator produces:
        //      private_key.sign(keccak256(abi.encodePacked(slotId, "COMPLETED")))
        bytes32 msgHash = keccak256(abi.encodePacked(slotId, "COMPLETED"));
        bytes32 ethHash = msgHash.toEthSignedMessageHash();
        address recovered = ethHash.recover(telemetrySignature);

        if (recovered != expectedSigner) revert InvalidSignature();

        // ── Mark settled before transfer (Checks-Effects-Interactions) ────────
        record.released = true;
        slotToken.updateSlotStatus(slotId, IMachineSlotToken.SlotStatus.COMPLETED);

        // ── Disburse funds ────────────────────────────────────────────────────
        uint256 total          = record.lockedAmount;
        uint256 factoryShare   = (total * FACTORY_BPS)  / 10_000;
        uint256 protocolShare  = (total * PROTOCOL_BPS) / 10_000;

        _safeTransfer(slot.factory,  factoryShare);
        _safeTransfer(protocolTreasury, protocolShare);

        emit FundsReleased(slotId, slot.factory, factoryShare, protocolShare);
    }

    // ─── Fallback: Parametric partial / full refund ───────────────────────────

    /// @notice Called by the authorized machine agent or protocol owner when
    ///         telemetry indicates a mid-run hardware failure.
    ///
    ///         partialCompletionBps is expressed in basis points (0 – 10_000).
    ///         The SME receives the uncompleted portion:
    ///             refundAmount = lockedAmount * (10_000 - partialCompletionBps) / 10_000
    ///         The factory receives the completed portion minus protocol fee.
    ///
    /// @param slotId                 Token ID of the failed slot.
    /// @param partialCompletionBps   How much of the job was completed (bps).
    ///                               0 = full refund; 10_000 = full release (use releaseFunds instead).
    function refundSME(
        uint256 slotId,
        uint256 partialCompletionBps
    )
        external
        nonReentrant
    {
        IMachineSlotToken.SlotMetadata memory slot = slotToken.getSlot(slotId);
        EscrowRecord storage record = escrows[slotId];

        // ── Guards ────────────────────────────────────────────────────────────
        if (record.released) revert AlreadySettled(slotId);
        if (partialCompletionBps > 10_000) revert InvalidPercentage();

        address agent = slotToken.machineAgent(slot.machineId);
        if (msg.sender != agent && msg.sender != owner()) revert OnlyAgentOrOwner();

        if (
            slot.status != IMachineSlotToken.SlotStatus.BOOKED &&
            slot.status != IMachineSlotToken.SlotStatus.EXECUTING
        ) revert SlotNotBooked(slotId);

        // ── Mark settled ──────────────────────────────────────────────────────
        record.released = true;
        slotToken.updateSlotStatus(slotId, IMachineSlotToken.SlotStatus.REFUNDED);

        uint256 total = record.lockedAmount;

        if (partialCompletionBps == 0) {
            // Full refund → SME gets everything back
            _safeTransfer(record.sme, total);
            emit FullRefundIssued(slotId, record.sme, total);
        } else {
            // Partial: factory keeps the completed portion (minus protocol cut)
            uint256 factoryGross   = (total * partialCompletionBps) / 10_000;
            uint256 protocolShare  = (factoryGross * PROTOCOL_BPS) / 10_000;
            uint256 factoryShare   = factoryGross - protocolShare;
            uint256 smeRefund      = total - factoryGross;

            _safeTransfer(slot.factory,      factoryShare);
            _safeTransfer(protocolTreasury,  protocolShare);
            _safeTransfer(record.sme,        smeRefund);

            emit PartialRefundIssued(slotId, record.sme, smeRefund, partialCompletionBps);
        }
    }

    // ─── Views ────────────────────────────────────────────────────────────────

    /// @notice Compute the exact ETH amount an SME must send to lockFunds().
    function computeSlotPrice(uint256 slotId)
        external
        view
        returns (uint256 totalWei, uint256 durationHours)
    {
        IMachineSlotToken.SlotMetadata memory slot = slotToken.getSlot(slotId);
        uint256 durSec = slot.endTime - slot.startTime;
        durationHours  = durSec / 3600;
        if (durationHours == 0) durationHours = 1;
        totalWei = durationHours * uint256(slot.pricePerHour);
    }

    function getEscrowRecord(uint256 slotId)
        external
        view
        returns (EscrowRecord memory)
    {
        return escrows[slotId];
    }

    // ─── Internal ─────────────────────────────────────────────────────────────

    function _safeTransfer(address to, uint256 amount) internal {
        if (amount == 0) return;
        (bool ok, ) = payable(to).call{value: amount}("");
        if (!ok) revert TransferFailed();
    }

    /// @dev Allows the contract to receive ETH (e.g., from lockFunds)
    receive() external payable {}
}
