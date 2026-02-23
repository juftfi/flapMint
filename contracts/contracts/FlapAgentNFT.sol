// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "./interfaces/IBAP578.sol";

/// @title FlapAgentNFT - AI Agent NFT for Flap Launchpad (BAP-578)
/// @notice Each NFT represents an AI Agent that can autonomously launch tokens on Flap.sh
/// @dev Implements BAP-578 with Flap-specific extensions: strategy type, launched tokens tracking
contract FlapAgentNFT is ERC721Enumerable, ReentrancyGuard, Pausable, Ownable, IBAP578 {

    // ─── Constants ───────────────────────────────────────────────
    uint256 public constant MAX_AGENTS_PER_ADDRESS = 5;

    // ─── Flap Agent Extension ────────────────────────────────────
    enum StrategyType { MEME_LAUNCHER, TREND_FOLLOWER, COMMUNITY_BUILDER }

    struct FlapAgentInfo {
        StrategyType strategy;
        address agentWallet;        // EOA controlled by agent runtime
        uint256 tokensLaunched;
        uint256 totalBNBDeployed;
    }

    // ─── Token Launch Record ─────────────────────────────────────
    struct TokenLaunch {
        address tokenAddress;
        string name;
        string symbol;
        uint256 launchedAt;
        uint256 bnbSpent;
    }

    // ─── State ───────────────────────────────────────────────────
    uint256 private _nextTokenId;
    string private _baseTokenURI;

    mapping(uint256 => AgentState) private _agentStates;
    mapping(uint256 => AgentMetadata) private _agentMetadata;
    mapping(uint256 => address) private _logicAddresses;
    mapping(uint256 => uint256) private _agentBalances;
    uint256 public totalAgentBalances;
    mapping(address => uint256) public mintCount;

    // Flap extension state
    mapping(uint256 => FlapAgentInfo) private _agentInfo;
    mapping(uint256 => TokenLaunch[]) private _tokenLaunches;

    // ─── Events ──────────────────────────────────────────────────
    event AgentMinted(uint256 indexed tokenId, string name, StrategyType strategy, address agentWallet);
    event TokenLaunched(uint256 indexed tokenId, address tokenAddress, string name, string symbol);
    event AgentWalletUpdated(uint256 indexed tokenId, address newWallet);

    // ─── Modifiers ───────────────────────────────────────────────
    modifier onlyTokenOwner(uint256 tokenId) {
        require(ownerOf(tokenId) == msg.sender, "Not token owner");
        _;
    }

    modifier onlyActiveAgent(uint256 tokenId) {
        require(_agentStates[tokenId] == AgentState.ACTIVE, "Agent not active");
        _;
    }

    // ─── Constructor ─────────────────────────────────────────────
    constructor() ERC721("FlapAgent", "FAGENT") Ownable(msg.sender) {}

    // ═══════════════════════════════════════════════════════════════
    // MINTING (BAP-578 + Flap Extension)
    // ═══════════════════════════════════════════════════════════════

    /// @notice Mint a new AI Agent NFT
    /// @param metadata BAP-578 standard metadata
    /// @param strategy Agent's token launch strategy
    /// @param agentWallet EOA address the agent runtime controls
    function mintAgent(
        AgentMetadata calldata metadata,
        StrategyType strategy,
        address agentWallet
    ) external whenNotPaused nonReentrant returns (uint256) {
        require(mintCount[msg.sender] < MAX_AGENTS_PER_ADDRESS, "Max agents reached");
        require(bytes(metadata.name).length > 0, "Name required");
        require(agentWallet != address(0), "Invalid agent wallet");

        uint256 tokenId = _nextTokenId++;
        mintCount[msg.sender]++;
        _safeMint(msg.sender, tokenId);

        _agentMetadata[tokenId] = metadata;
        _agentStates[tokenId] = AgentState.ACTIVE;
        _agentInfo[tokenId] = FlapAgentInfo({
            strategy: strategy,
            agentWallet: agentWallet,
            tokensLaunched: 0,
            totalBNBDeployed: 0
        });

        emit AgentMinted(tokenId, metadata.name, strategy, agentWallet);
        return tokenId;
    }

    // ═══════════════════════════════════════════════════════════════
    // FLAP: TOKEN LAUNCH TRACKING
    // ═══════════════════════════════════════════════════════════════

    /// @notice Record a token launch by the agent (called by owner or logic contract)
    function recordTokenLaunch(
        uint256 tokenId,
        address tokenAddress,
        string calldata name,
        string calldata symbol,
        uint256 bnbSpent
    ) external onlyTokenOwner(tokenId) onlyActiveAgent(tokenId) {
        _tokenLaunches[tokenId].push(TokenLaunch({
            tokenAddress: tokenAddress,
            name: name,
            symbol: symbol,
            launchedAt: block.timestamp,
            bnbSpent: bnbSpent
        }));

        _agentInfo[tokenId].tokensLaunched++;
        _agentInfo[tokenId].totalBNBDeployed += bnbSpent;

        emit TokenLaunched(tokenId, tokenAddress, name, symbol);
    }

    /// @notice Get agent's Flap-specific info
    function getAgentInfo(uint256 tokenId) external view returns (FlapAgentInfo memory) {
        _requireOwned(tokenId);
        return _agentInfo[tokenId];
    }

    /// @notice Get all tokens launched by an agent
    function getTokenLaunches(uint256 tokenId) external view returns (TokenLaunch[] memory) {
        _requireOwned(tokenId);
        return _tokenLaunches[tokenId];
    }

    /// @notice Update agent wallet address
    function setAgentWallet(uint256 tokenId, address newWallet)
        external
        onlyTokenOwner(tokenId)
    {
        require(newWallet != address(0), "Invalid wallet");
        _agentInfo[tokenId].agentWallet = newWallet;
        emit AgentWalletUpdated(tokenId, newWallet);
    }

    // ═══════════════════════════════════════════════════════════════
    // AGENT LIFECYCLE (BAP-578)
    // ═══════════════════════════════════════════════════════════════

    function pauseAgent(uint256 tokenId) external onlyTokenOwner(tokenId) {
        require(_agentStates[tokenId] == AgentState.ACTIVE, "Agent not active");
        _agentStates[tokenId] = AgentState.PAUSED;
        emit AgentPaused(tokenId);
    }

    function unpauseAgent(uint256 tokenId) external onlyTokenOwner(tokenId) {
        require(_agentStates[tokenId] == AgentState.PAUSED, "Agent not paused");
        _agentStates[tokenId] = AgentState.ACTIVE;
        emit AgentUnpaused(tokenId);
    }

    function terminateAgent(uint256 tokenId) external onlyTokenOwner(tokenId) {
        require(_agentStates[tokenId] != AgentState.TERMINATED, "Already terminated");
        _agentStates[tokenId] = AgentState.TERMINATED;
        emit AgentTerminated(tokenId);
    }

    function getState(uint256 tokenId) external view returns (AgentState) {
        _requireOwned(tokenId);
        return _agentStates[tokenId];
    }

    // ═══════════════════════════════════════════════════════════════
    // FUNDING (BAP-578) - Native BNB
    // ═══════════════════════════════════════════════════════════════

    /// @notice Fund an active agent with BNB
    function fundAgent(uint256 tokenId) external payable onlyActiveAgent(tokenId) {
        require(msg.value > 0, "Amount must be > 0");
        _agentBalances[tokenId] += msg.value;
        totalAgentBalances += msg.value;
        emit AgentFunded(tokenId, msg.value);
    }

    /// @notice Withdraw BNB from agent
    function withdrawFromAgent(uint256 tokenId, uint256 amount)
        external
        onlyTokenOwner(tokenId)
        nonReentrant
    {
        require(amount > 0, "Amount must be > 0");
        require(_agentBalances[tokenId] >= amount, "Insufficient balance");
        _agentBalances[tokenId] -= amount;
        totalAgentBalances -= amount;
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "BNB transfer failed");
        emit AgentWithdrawn(tokenId, amount);
    }

    function getAgentBalance(uint256 tokenId) external view returns (uint256) {
        _requireOwned(tokenId);
        return _agentBalances[tokenId];
    }

    // ═══════════════════════════════════════════════════════════════
    // METADATA (BAP-578)
    // ═══════════════════════════════════════════════════════════════

    function getAgentMetadata(uint256 tokenId) external view returns (AgentMetadata memory) {
        _requireOwned(tokenId);
        return _agentMetadata[tokenId];
    }

    function updateAgentMetadata(uint256 tokenId, AgentMetadata calldata metadata)
        external
        onlyTokenOwner(tokenId)
    {
        _agentMetadata[tokenId] = metadata;
        emit MetadataUpdated(tokenId);
    }

    // ═══════════════════════════════════════════════════════════════
    // LOGIC ADDRESS & EXECUTION (BAP-578)
    // ═══════════════════════════════════════════════════════════════

    function setLogicAddress(uint256 tokenId, address logic) external onlyTokenOwner(tokenId) {
        _logicAddresses[tokenId] = logic;
        emit LogicAddressUpdated(tokenId, logic);
    }

    function executeAction(uint256 tokenId, bytes calldata data)
        external
        onlyTokenOwner(tokenId)
        onlyActiveAgent(tokenId)
        nonReentrant
        returns (bytes memory)
    {
        address logic = _logicAddresses[tokenId];
        require(logic != address(0), "No logic address set");
        (bool success, bytes memory result) = logic.call(data);
        require(success, "Action execution failed");
        emit ActionExecuted(tokenId, result);
        return result;
    }

    // ═══════════════════════════════════════════════════════════════
    // TOKEN URI & ADMIN
    // ═══════════════════════════════════════════════════════════════

    function setBaseURI(string memory baseURI) external onlyOwner {
        _baseTokenURI = baseURI;
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);
        if (bytes(_baseTokenURI).length == 0) return "";
        return string(abi.encodePacked(_baseTokenURI, Strings.toString(tokenId), ".json"));
    }

    function pause() external onlyOwner { _pause(); }
    function unpause() external onlyOwner { _unpause(); }

    function totalAgents() external view returns (uint256) {
        return _nextTokenId;
    }

    function getMintCount(address account) external view returns (uint256) {
        return mintCount[account];
    }

    /// @notice Withdraw surplus BNB not belonging to agents
    function withdrawSurplus(uint256 amount) external onlyOwner nonReentrant {
        require(amount > 0, "Amount must be > 0");
        uint256 available = address(this).balance - totalAgentBalances;
        require(amount <= available, "Exceeds surplus");
        (bool success, ) = owner().call{value: amount}("");
        require(success, "Transfer failed");
    }

    receive() external payable {}
}
