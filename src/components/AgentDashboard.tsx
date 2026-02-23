"use client";

import { useAccount, useReadContract } from "wagmi";
import { FLAP_AGENT_NFT_ABI } from "@/lib/contracts";
import { CONTRACTS } from "@/lib/contract-addresses";
import { AgentCard } from "./AgentCard";

export function AgentDashboard() {
  const { address, isConnected } = useAccount();

  const { data: agentCount } = useReadContract({
    address: CONTRACTS.FLAP_AGENT_NFT,
    abi: FLAP_AGENT_NFT_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const { data: totalAgents } = useReadContract({
    address: CONTRACTS.FLAP_AGENT_NFT,
    abi: FLAP_AGENT_NFT_ABI,
    functionName: "totalAgents",
  });

  if (!isConnected) {
    return (
      <div className="text-center py-20">
        <p className="text-foreground/50 text-lg">Connect your wallet to view your Agents</p>
      </div>
    );
  }

  const count = agentCount ? Number(agentCount) : 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">My Agents</h2>
        <div className="text-sm text-foreground/40">
          {count} owned / {totalAgents?.toString() || "0"} total
        </div>
      </div>

      {count === 0 ? (
        <div className="text-center py-16 border border-card-border rounded-xl bg-card-bg">
          <p className="text-foreground/40 mb-2">No agents yet</p>
          <a
            href="/mint"
            className="text-accent hover:underline text-sm"
          >
            Mint your first Agent
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: count }, (_, i) => (
            <AgentCardWrapper key={i} ownerAddress={address!} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}

function AgentCardWrapper({
  ownerAddress,
  index,
}: {
  ownerAddress: `0x${string}`;
  index: number;
}) {
  const { data: tokenId } = useReadContract({
    address: CONTRACTS.FLAP_AGENT_NFT,
    abi: FLAP_AGENT_NFT_ABI,
    functionName: "tokenOfOwnerByIndex",
    args: [ownerAddress, BigInt(index)],
  });

  if (tokenId === undefined) return null;

  return <AgentCard tokenId={tokenId as bigint} isOwner={true} />;
}
