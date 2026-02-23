"use client";

import { useState } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { FLAP_AGENT_NFT_ABI } from "@/lib/contracts";
import { CONTRACTS } from "@/lib/contract-addresses";
import { STRATEGY_LABELS, STRATEGY_DESCRIPTIONS } from "@/lib/flap";
import { zeroHash } from "viem";

export function MintAgent() {
  const { address, isConnected } = useAccount();
  const [name, setName] = useState("");
  const [persona, setPersona] = useState("");
  const [strategy, setStrategy] = useState(0);
  const [agentWallet, setAgentWallet] = useState("");

  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const handleMint = () => {
    if (!name || !agentWallet) return;

    writeContract({
      address: CONTRACTS.FLAP_AGENT_NFT,
      abi: FLAP_AGENT_NFT_ABI,
      functionName: "mintAgent",
      args: [
        {
          name,
          persona: persona || `AI Agent: ${name}`,
          voiceHash: zeroHash,
          animationURI: "",
          vaultURI: "",
          vaultHash: zeroHash,
          avatarId: 0,
        },
        strategy,
        agentWallet as `0x${string}`,
      ],
    });
  };

  if (!isConnected) {
    return (
      <div className="text-center py-20">
        <p className="text-foreground/50 text-lg">Connect your wallet to mint an Agent</p>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto">
      <h2 className="text-2xl font-bold mb-6">Mint AI Agent</h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm text-foreground/60 mb-1">Agent Name *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. MemeBot Alpha"
            className="w-full px-4 py-2 bg-card-bg border border-card-border rounded-lg focus:outline-none focus:border-accent"
          />
        </div>

        <div>
          <label className="block text-sm text-foreground/60 mb-1">Persona (optional)</label>
          <textarea
            value={persona}
            onChange={(e) => setPersona(e.target.value)}
            placeholder="Describe your agent's personality..."
            rows={2}
            className="w-full px-4 py-2 bg-card-bg border border-card-border rounded-lg focus:outline-none focus:border-accent resize-none"
          />
        </div>

        <div>
          <label className="block text-sm text-foreground/60 mb-2">Strategy</label>
          <div className="space-y-2">
            {Object.entries(STRATEGY_LABELS).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setStrategy(Number(key))}
                className={`w-full text-left p-3 rounded-lg border transition-colors ${
                  strategy === Number(key)
                    ? "border-accent bg-accent/10"
                    : "border-card-border bg-card-bg hover:border-foreground/20"
                }`}
              >
                <div className="font-medium text-sm">{label}</div>
                <div className="text-xs text-foreground/40 mt-0.5">
                  {STRATEGY_DESCRIPTIONS[Number(key)]}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm text-foreground/60 mb-1">Agent Wallet Address *</label>
          <input
            type="text"
            value={agentWallet}
            onChange={(e) => setAgentWallet(e.target.value)}
            placeholder="0x... (EOA the agent runtime controls)"
            className="w-full px-4 py-2 bg-card-bg border border-card-border rounded-lg focus:outline-none focus:border-accent font-mono text-sm"
          />
          <p className="text-xs text-foreground/30 mt-1">
            The wallet that the agent script will use to launch tokens
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
            {error.message.slice(0, 200)}
          </div>
        )}

        {isSuccess && (
          <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400 text-sm">
            Agent minted successfully! View it on the Dashboard.
          </div>
        )}

        <button
          onClick={handleMint}
          disabled={isPending || isConfirming || !name || !agentWallet}
          className="w-full py-3 bg-accent text-black font-semibold rounded-lg hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending
            ? "Confirm in Wallet..."
            : isConfirming
            ? "Minting..."
            : "Mint Agent NFT"}
        </button>
      </div>
    </div>
  );
}
