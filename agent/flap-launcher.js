import { createWalletClient, createPublicClient, http, parseEther, decodeEventLog } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { bscTestnet } from "viem/chains";
import { config } from "./config.js";

// Flap Portal ABI (minimal)
const PORTAL_ABI = [
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
];

export async function launchToken({ name, symbol, meta, buyBnb }) {
  if (!config.privateKey) {
    throw new Error("AGENT_PRIVATE_KEY not set in .env");
  }

  const account = privateKeyToAccount(config.privateKey);

  const walletClient = createWalletClient({
    account,
    chain: bscTestnet,
    transport: http(config.rpcUrl),
  });

  const publicClient = createPublicClient({
    chain: bscTestnet,
    transport: http(config.rpcUrl),
  });

  const value = parseEther(buyBnb || config.defaultBuyBnb);

  console.log(`Launching token: ${name} (${symbol})`);
  console.log(`Portal: ${config.flapPortal}`);
  console.log(`Buy amount: ${buyBnb || config.defaultBuyBnb} BNB`);
  console.log(`From: ${account.address}`);

  const hash = await walletClient.writeContract({
    address: config.flapPortal,
    abi: PORTAL_ABI,
    functionName: "newToken",
    args: [name, symbol, meta || ""],
    value,
  });

  console.log(`Tx submitted: ${hash}`);
  console.log(`Waiting for confirmation...`);

  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  console.log(`Confirmed in block ${receipt.blockNumber}`);

  // Parse TokenCreated event to get the new token address
  let tokenAddress = null;
  for (const log of receipt.logs) {
    try {
      const decoded = decodeEventLog({
        abi: PORTAL_ABI,
        data: log.data,
        topics: log.topics,
      });
      if (decoded.eventName === "TokenCreated") {
        tokenAddress = decoded.args.token;
        break;
      }
    } catch {
      // Not a matching event, skip
    }
  }

  if (!tokenAddress) {
    console.log("Warning: Could not parse TokenCreated event. Check logs manually.");
    console.log("Logs:", JSON.stringify(receipt.logs.map((l) => l.address), null, 2));
  } else {
    console.log(`Token created at: ${tokenAddress}`);
  }

  return {
    txHash: hash,
    blockNumber: receipt.blockNumber,
    tokenAddress,
    name,
    symbol,
    bnbSpent: buyBnb || config.defaultBuyBnb,
  };
}
