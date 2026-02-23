import { CONTRACTS } from "./contract-addresses";

// FlapAgentNFT ABI (BAP-578 + Flap Extension)
export const FLAP_AGENT_NFT_ABI = [
  // Minting
  {
    name: "mintAgent",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      {
        name: "metadata",
        type: "tuple",
        components: [
          { name: "name", type: "string" },
          { name: "persona", type: "string" },
          { name: "voiceHash", type: "bytes32" },
          { name: "animationURI", type: "string" },
          { name: "vaultURI", type: "string" },
          { name: "vaultHash", type: "bytes32" },
          { name: "avatarId", type: "uint8" },
        ],
      },
      { name: "strategy", type: "uint8" },
      { name: "agentWallet", type: "address" },
    ],
    outputs: [{ type: "uint256" }],
  },
  // Funding
  {
    name: "fundAgent",
    type: "function",
    stateMutability: "payable",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [],
  },
  {
    name: "withdrawFromAgent",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "tokenId", type: "uint256" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [],
  },
  // Lifecycle
  {
    name: "pauseAgent",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [],
  },
  {
    name: "unpauseAgent",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [],
  },
  {
    name: "terminateAgent",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [],
  },
  // Token Launch Tracking
  {
    name: "recordTokenLaunch",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "tokenId", type: "uint256" },
      { name: "tokenAddress", type: "address" },
      { name: "name", type: "string" },
      { name: "symbol", type: "string" },
      { name: "bnbSpent", type: "uint256" },
    ],
    outputs: [],
  },
  // Views
  {
    name: "getAgentMetadata",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [
      {
        type: "tuple",
        components: [
          { name: "name", type: "string" },
          { name: "persona", type: "string" },
          { name: "voiceHash", type: "bytes32" },
          { name: "animationURI", type: "string" },
          { name: "vaultURI", type: "string" },
          { name: "vaultHash", type: "bytes32" },
          { name: "avatarId", type: "uint8" },
        ],
      },
    ],
  },
  {
    name: "getAgentInfo",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [
      {
        type: "tuple",
        components: [
          { name: "strategy", type: "uint8" },
          { name: "agentWallet", type: "address" },
          { name: "tokensLaunched", type: "uint256" },
          { name: "totalBNBDeployed", type: "uint256" },
        ],
      },
    ],
  },
  {
    name: "getAgentBalance",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [{ type: "uint256" }],
  },
  {
    name: "getState",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [{ type: "uint8" }],
  },
  {
    name: "getTokenLaunches",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [
      {
        type: "tuple[]",
        components: [
          { name: "tokenAddress", type: "address" },
          { name: "name", type: "string" },
          { name: "symbol", type: "string" },
          { name: "launchedAt", type: "uint256" },
          { name: "bnbSpent", type: "uint256" },
        ],
      },
    ],
  },
  {
    name: "totalAgents",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }],
  },
  {
    name: "ownerOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [{ type: "address" }],
  },
  {
    name: "tokenOfOwnerByIndex",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "owner", type: "address" },
      { name: "index", type: "uint256" },
    ],
    outputs: [{ type: "uint256" }],
  },
  {
    name: "balanceOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "owner", type: "address" }],
    outputs: [{ type: "uint256" }],
  },
  // Events
  {
    name: "AgentMinted",
    type: "event",
    inputs: [
      { name: "tokenId", type: "uint256", indexed: true },
      { name: "name", type: "string", indexed: false },
      { name: "strategy", type: "uint8", indexed: false },
      { name: "agentWallet", type: "address", indexed: false },
    ],
  },
  {
    name: "TokenLaunched",
    type: "event",
    inputs: [
      { name: "tokenId", type: "uint256", indexed: true },
      { name: "tokenAddress", type: "address", indexed: false },
      { name: "name", type: "string", indexed: false },
      { name: "symbol", type: "string", indexed: false },
    ],
  },
] as const;

// Flap Portal ABI (only newToken function)
export const FLAP_PORTAL_ABI = [
  {
    name: "newToken",
    type: "function",
    stateMutability: "payable",
    inputs: [
      { name: "name", type: "string" },
      { name: "symbol", type: "string" },
      { name: "meta", type: "string" },
    ],
    outputs: [{ name: "token", type: "address" }],
  },
  {
    name: "TokenCreated",
    type: "event",
    inputs: [
      { name: "ts", type: "uint256", indexed: false },
      { name: "creator", type: "address", indexed: false },
      { name: "nonce", type: "uint256", indexed: false },
      { name: "token", type: "address", indexed: false },
      { name: "name", type: "string", indexed: false },
      { name: "symbol", type: "string", indexed: false },
      { name: "meta", type: "string", indexed: false },
    ],
  },
] as const;

export const flapAgentNFTConfig = {
  address: CONTRACTS.FLAP_AGENT_NFT,
  abi: FLAP_AGENT_NFT_ABI,
} as const;

export const flapPortalConfig = {
  address: CONTRACTS.FLAP_PORTAL,
  abi: FLAP_PORTAL_ABI,
} as const;
