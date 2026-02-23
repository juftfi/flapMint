#!/usr/bin/env node

/**
 * FlapAgent Runtime - MVP
 *
 * Usage:
 *   node agent/run.js launch --name "MyToken" --symbol "MTK" --buy 0.001
 *   node agent/run.js status
 *
 * Requires .env:
 *   AGENT_PRIVATE_KEY=0x...
 *   AGENT_TOKEN_ID=0
 */

import { launchToken } from "./flap-launcher.js";
import { config } from "./config.js";
import { createPublicClient, http, formatEther } from "viem";
import { bscTestnet } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";

// Parse CLI args
const args = process.argv.slice(2);
const command = args[0];

function getArg(name) {
  const idx = args.indexOf(`--${name}`);
  return idx !== -1 && idx + 1 < args.length ? args[idx + 1] : null;
}

async function main() {
  if (!command) {
    console.log("FlapAgent Runtime");
    console.log("=================");
    console.log("Commands:");
    console.log("  launch  --name <name> --symbol <symbol> [--buy <bnb>] [--meta <ipfs_cid>]");
    console.log("  status  Show agent wallet balance and info");
    console.log("");
    console.log("Environment:");
    console.log("  AGENT_PRIVATE_KEY  Agent wallet private key");
    console.log("  AGENT_TOKEN_ID     NFT token ID of this agent");
    process.exit(0);
  }

  if (command === "status") {
    await showStatus();
  } else if (command === "launch") {
    const name = getArg("name");
    const symbol = getArg("symbol");
    const buy = getArg("buy");
    const meta = getArg("meta");

    if (!name || !symbol) {
      console.error("Error: --name and --symbol are required");
      process.exit(1);
    }

    try {
      const result = await launchToken({ name, symbol, meta, buyBnb: buy });
      console.log("\n--- Launch Result ---");
      console.log(JSON.stringify(result, null, 2));
    } catch (err) {
      console.error("Launch failed:", err.message);
      process.exit(1);
    }
  } else {
    console.error(`Unknown command: ${command}`);
    process.exit(1);
  }
}

async function showStatus() {
  console.log("FlapAgent Status");
  console.log("=================");
  console.log(`Chain: BSC Testnet (${config.chainId})`);
  console.log(`Portal: ${config.flapPortal}`);
  console.log(`NFT Contract: ${config.flapAgentNFT}`);
  console.log(`Agent Token ID: ${config.agentTokenId}`);

  if (config.privateKey) {
    const account = privateKeyToAccount(config.privateKey);
    console.log(`Agent Wallet: ${account.address}`);

    const publicClient = createPublicClient({
      chain: bscTestnet,
      transport: http(config.rpcUrl),
    });

    const balance = await publicClient.getBalance({ address: account.address });
    console.log(`Wallet Balance: ${formatEther(balance)} BNB`);
  } else {
    console.log("Agent Wallet: Not configured (set AGENT_PRIVATE_KEY)");
  }
}

main().catch(console.error);
