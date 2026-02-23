"use client";

import { useReadContract, useWriteContract } from "wagmi";
import { FLAP_AGENT_NFT_ABI } from "@/lib/contracts";
import { CONTRACTS } from "@/lib/contract-addresses";
import { STRATEGY_LABELS, STATE_LABELS, STATE_COLORS } from "@/lib/flap";
import { formatEther, parseEther } from "viem";
import { useState } from "react";

interface AgentCardProps {
  tokenId: bigint;
  isOwner: boolean;
}

export function AgentCard({ tokenId, isOwner }: AgentCardProps) {
  const [fundAmount, setFundAmount] = useState("");
  const [showFund, setShowFund] = useState(false);

  const { data: metadata } = useReadContract({
    address: CONTRACTS.FLAP_AGENT_NFT,
    abi: FLAP_AGENT_NFT_ABI,
    functionName: "getAgentMetadata",
    args: [tokenId],
  });

  const { data: info } = useReadContract({
    address: CONTRACTS.FLAP_AGENT_NFT,
    abi: FLAP_AGENT_NFT_ABI,
    functionName: "getAgentInfo",
    args: [tokenId],
  });

  const { data: balance } = useReadContract({
    address: CONTRACTS.FLAP_AGENT_NFT,
    abi: FLAP_AGENT_NFT_ABI,
    functionName: "getAgentBalance",
    args: [tokenId],
  });

  const { data: state } = useReadContract({
    address: CONTRACTS.FLAP_AGENT_NFT,
    abi: FLAP_AGENT_NFT_ABI,
    functionName: "getState",
    args: [tokenId],
  });

  const { writeContract: fund, isPending: isFunding } = useWriteContract();
  const { writeContract: pause, isPending: isPausing } = useWriteContract();
  const { writeContract: unpause, isPending: isUnpausing } = useWriteContract();

  const handleFund = () => {
    if (!fundAmount) return;
    fund({
      address: CONTRACTS.FLAP_AGENT_NFT,
      abi: FLAP_AGENT_NFT_ABI,
      functionName: "fundAgent",
      args: [tokenId],
      value: parseEther(fundAmount),
    });
    setFundAmount("");
    setShowFund(false);
  };

  const agentState = state !== undefined ? Number(state) : 0;

  return (
    <div className="p-5 rounded-xl border border-card-border bg-card-bg">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-lg">{metadata?.name || `Agent #${tokenId}`}</h3>
          <p className="text-xs text-foreground/40 mt-0.5">Token #{tokenId.toString()}</p>
        </div>
        <span className={`text-xs font-medium ${STATE_COLORS[agentState] || "text-gray-400"}`}>
          {STATE_LABELS[agentState] || "Unknown"}
        </span>
      </div>

      {metadata?.persona && (
        <p className="text-sm text-foreground/50 mb-3 line-clamp-2">{metadata.persona}</p>
      )}

      <div className="grid grid-cols-2 gap-3 text-sm mb-4">
        <div className="p-2 rounded bg-background">
          <div className="text-foreground/40 text-xs">Strategy</div>
          <div className="font-medium">{STRATEGY_LABELS[Number(info?.strategy)] || "Unknown"}</div>
        </div>
        <div className="p-2 rounded bg-background">
          <div className="text-foreground/40 text-xs">Balance</div>
          <div className="font-medium font-mono">
            {balance !== undefined ? formatEther(balance as bigint) : "0"} BNB
          </div>
        </div>
        <div className="p-2 rounded bg-background">
          <div className="text-foreground/40 text-xs">Tokens Launched</div>
          <div className="font-medium">{info?.tokensLaunched?.toString() || "0"}</div>
        </div>
        <div className="p-2 rounded bg-background">
          <div className="text-foreground/40 text-xs">BNB Deployed</div>
          <div className="font-medium font-mono">
            {info?.totalBNBDeployed ? formatEther(info.totalBNBDeployed) : "0"}
          </div>
        </div>
      </div>

      {info?.agentWallet && (
        <div className="text-xs text-foreground/30 font-mono mb-3 truncate">
          Wallet: {info.agentWallet}
        </div>
      )}

      {isOwner && agentState === 0 && (
        <div className="flex gap-2">
          {showFund ? (
            <div className="flex gap-2 flex-1">
              <input
                type="text"
                value={fundAmount}
                onChange={(e) => setFundAmount(e.target.value)}
                placeholder="BNB amount"
                className="flex-1 px-3 py-1.5 bg-background border border-card-border rounded text-sm font-mono"
              />
              <button
                onClick={handleFund}
                disabled={isFunding || !fundAmount}
                className="px-3 py-1.5 bg-accent text-black text-sm font-medium rounded disabled:opacity-50"
              >
                {isFunding ? "..." : "Send"}
              </button>
              <button
                onClick={() => setShowFund(false)}
                className="px-3 py-1.5 text-sm text-foreground/50"
              >
                X
              </button>
            </div>
          ) : (
            <>
              <button
                onClick={() => setShowFund(true)}
                className="flex-1 py-1.5 bg-accent/10 text-accent text-sm font-medium rounded hover:bg-accent/20 transition-colors"
              >
                Fund
              </button>
              <button
                onClick={() =>
                  pause({
                    address: CONTRACTS.FLAP_AGENT_NFT,
                    abi: FLAP_AGENT_NFT_ABI,
                    functionName: "pauseAgent",
                    args: [tokenId],
                  })
                }
                disabled={isPausing}
                className="px-3 py-1.5 text-sm text-yellow-400 border border-yellow-400/30 rounded hover:bg-yellow-400/10"
              >
                Pause
              </button>
            </>
          )}
        </div>
      )}

      {isOwner && agentState === 1 && (
        <button
          onClick={() =>
            unpause({
              address: CONTRACTS.FLAP_AGENT_NFT,
              abi: FLAP_AGENT_NFT_ABI,
              functionName: "unpauseAgent",
              args: [tokenId],
            })
          }
          disabled={isUnpausing}
          className="w-full py-1.5 text-sm text-green-400 border border-green-400/30 rounded hover:bg-green-400/10"
        >
          Unpause
        </button>
      )}
    </div>
  );
}
