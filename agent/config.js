// Agent Configuration
export const config = {
  // BSC Testnet
  rpcUrl: "https://data-seed-prebsc-1-s1.bnbchain.org:8545",
  chainId: 97,

  // Flap Portal (BSC Testnet)
  flapPortal: "0x5bEacaF7ABCbB3aB280e80D007FD31fcE26510e9",

  // FlapMintNFT contract (update after deployment)
  flapAgentNFT: "0x0000000000000000000000000000000000000000",

  // Agent private key (from .env)
  privateKey: process.env.AGENT_PRIVATE_KEY || "",

  // Token ID this agent controls (from .env)
  agentTokenId: parseInt(process.env.AGENT_TOKEN_ID || "0"),

  // Default BNB to spend on initial buy when launching a token
  defaultBuyBnb: "0.001",
};
