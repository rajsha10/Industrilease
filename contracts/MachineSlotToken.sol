// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

// ─────────────────────────────────────────────────────────────────────────────
//  MachineSlotToken.sol  ·  IndustriLease  ·  Sepolia Testnet
//
//  Represents fractional, time-bounded capacity of a physical industrial
//  machine as an ERC-1155 semi-fungible token.
//
//  Each token ID maps to a unique (machineId, startTime, endTime) tuple.
//  Quantity > 1 is deliberately unsupported per slot to enforce exclusivity;
//  minting always produces a single-copy token (supply = 1) per slotId.
//
//  OpenZeppelin v5 — paste both this file and its imports into Remix,
//  selecting the same pragma/version for compilation.
// ─────────────────────────────────────────────────────────────────────────────

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract MachineSlotToken is ERC1155, Ownable, ReentrancyGuard {
    // ─── Structs ────────────────────────────────────────────────────────────

    /// @notice All on-chain metadata describing a single time-slot token.
    struct SlotMetadata {
        string  machineId;      // Unique identifier of the physical machine
        uint256 startTime;      // Unix timestamp – slot window start
        uint256 endTime;        // Unix timestamp – slot window end
        uint256 pricePerHour;   // Price in wei
        uint256 setupFee;       // Setup fee in wei
        uint256 totalLayers;    // Total layers for the job
        address factory;        // Factory owner who will receive payment
        SlotStatus status;      // Current lifecycle state of the slot
    }

    enum SlotStatus {
        AVAILABLE,   // Freshly minted; waiting for an SME booking
        BOOKED,      // SME has locked funds in escrow
        EXECUTING,   // Job dispatched to hardware layer
        COMPLETED,   // Telemetry proof verified; settlement triggered
        CANCELLED,   // Slot voided (factory or protocol action)
        REFUNDED     // Partial or full refund issued to SME
    }

    // ─── Storage ──────────────────────────────────────────────────────────────

    /// @dev Auto-incrementing slot ID counter. Starts at 1 (0 reserved).
    uint256 private _nextSlotId = 1;

    /// @notice slotId → metadata
    mapping(uint256 => SlotMetadata) public slots;

    /// @notice Authorized AI agents allowed to mint slots.
    mapping(address => bool) public authorizedAgents;

    /// @notice Address of the deployed IndustriLeaseEscrow contract.
    ///         Only the escrow is allowed to flip slot status flags.
    address public escrowContract;

    // ─── Events ───────────────────────────────────────────────────────────────

    event SlotMinted(
        uint256 indexed slotId,
        string machineId,
        address indexed factory,
        uint256 startTime,
        uint256 endTime,
        uint256 pricePerHour
    );

    event SlotStatusUpdated(uint256 indexed slotId, SlotStatus newStatus);

    event AgentAuthorizationSet(address indexed agent, bool status);

    event EscrowContractSet(address escrow);

    // ─── Errors ───────────────────────────────────────────────────────────────

    error Unauthorized();
    error InvalidTimeRange();
    error ZeroPrice();
    error SlotNotFound(uint256 slotId);
    error InvalidStatusTransition(SlotStatus current, SlotStatus requested);

    // ─── Constructor ──────────────────────────────────────────────────────────

    /// @param baseURI  Base metadata URI; use "" if storing metadata on-chain only.
    constructor(string memory baseURI)
        ERC1155(baseURI)
        Ownable(msg.sender)
    {}

    // ─── Admin: Machine & Escrow Setup ────────────────────────────────────────

    /// @notice Factory owner registers their machine and designates the AI
    ///         agent address (or ERC-7579 session key validator) that is
    ///         permitted to call mintSlot() on their behalf.
    /// @param  machineId  Unique off-chain hardware identifier.
    /// @param  agent      EOA / smart account address of the factory AI agent.
    /// @notice Factory owner registers or revokes the AI agent address
    ///         that is permitted to call mintSlot().
    /// @param  agent      Address of the factory AI agent.
    /// @param  status     Authorization status.
    function setAgentAuthorization(address agent, bool status)
        external
        onlyOwner
    {
        require(agent != address(0), "Agent: zero address");
        authorizedAgents[agent] = status;
        emit AgentAuthorizationSet(agent, status);
    }

    /// @notice Protocol owner links the deployed escrow contract so that
    ///         only it can mutate slot lifecycle status.
    function setEscrowContract(address escrow) external onlyOwner {
        require(escrow != address(0), "Escrow: zero address");
        escrowContract = escrow;
        emit EscrowContractSet(escrow);
    }

    // ─── Core: Slot Minting ───────────────────────────────────────────────────

    /// @notice Called by the authorized factory AI agent when the telemetry
    ///         simulator detects an IDLE window on a registered machine.
    ///
    ///         Each successful call mints exactly ONE ERC-1155 token (supply=1)
    ///         to the factory address and records the slot metadata on-chain.
    ///
    /// @param  machineId    Physical machine identifier.
    /// @param  startTime    Slot availability start (Unix timestamp, seconds).
    /// @param  endTime      Slot availability end   (Unix timestamp, seconds).
    /// @param  pricePerHour Price in wei per hour of utilisation.
    /// @param  factory      Factory wallet that will receive escrow payments.
    ///
    /// @return slotId  The newly assigned ERC-1155 token ID.
    function mintSlot(
        string calldata machineId,
        uint256 startTime,
        uint256 endTime,
        uint256 pricePerHour,
        uint256 setupFee,
        uint256 totalLayers
    )
        external
        nonReentrant
        returns (uint256 slotId)
    {
        // ── Access control ────────────────────────────────────────────────────
        if (!authorizedAgents[msg.sender]) revert Unauthorized();

        // ── Parameter validation ──────────────────────────────────────────────
        if (endTime <= startTime)   revert InvalidTimeRange();
        if (pricePerHour == 0)      revert ZeroPrice();

        // ── Assign ID & write metadata ────────────────────────────────────────
        slotId = _nextSlotId++;

        slots[slotId] = SlotMetadata({
            machineId:    machineId,
            startTime:    startTime,
            endTime:      endTime,
            pricePerHour: pricePerHour,
            setupFee:     setupFee,
            totalLayers:  totalLayers,
            factory:      owner(),
            status:       SlotStatus.AVAILABLE
        });

        // ── Mint exactly 1 token to the factory wallet ────────────────────────
        _mint(owner(), slotId, 1, "");

        emit SlotMinted(slotId, machineId, owner(), startTime, endTime, pricePerHour);
    }

    // ─── Status Lifecycle (Escrow-Only) ───────────────────────────────────────

    /// @notice Transitions a slot to a new status.
    ///         Only the registered escrow contract may call this to ensure
    ///         status mutations stay in sync with on-chain fund movements.
    function updateSlotStatus(uint256 slotId, SlotStatus newStatus)
        external
    {
        if (msg.sender != escrowContract) revert Unauthorized();

        SlotMetadata storage slot = slots[slotId];
        if (slot.startTime == 0) revert SlotNotFound(slotId);

        // ── Enforce valid state machine transitions ────────────────────────────
        _requireValidTransition(slot.status, newStatus);

        slot.status = newStatus;
        emit SlotStatusUpdated(slotId, newStatus);
    }

    // ─── Views ────────────────────────────────────────────────────────────────

    function getSlot(uint256 slotId)
        external
        view
        returns (SlotMetadata memory)
    {
        return slots[slotId];
    }

    function nextSlotId() external view returns (uint256) {
        return _nextSlotId;
    }

    // ─── Internal Helpers ─────────────────────────────────────────────────────

    /// @dev Enforces the valid one-way status machine to prevent illegal jumps.
    function _requireValidTransition(
        SlotStatus current,
        SlotStatus next
    ) internal pure {
        // Valid transitions:
        //  AVAILABLE  → BOOKED
        //  BOOKED     → EXECUTING | CANCELLED | REFUNDED
        //  EXECUTING  → COMPLETED | REFUNDED
        if (current == SlotStatus.AVAILABLE  && next == SlotStatus.BOOKED)     return;
        if (current == SlotStatus.BOOKED     && next == SlotStatus.EXECUTING)  return;
        if (current == SlotStatus.BOOKED     && next == SlotStatus.CANCELLED)  return;
        if (current == SlotStatus.BOOKED     && next == SlotStatus.REFUNDED)   return;
        if (current == SlotStatus.EXECUTING  && next == SlotStatus.COMPLETED)  return;
        if (current == SlotStatus.EXECUTING  && next == SlotStatus.REFUNDED)   return;
        revert InvalidStatusTransition(current, next);
    }
}
