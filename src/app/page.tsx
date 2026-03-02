import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center">
      <h1 className="text-5xl font-bold mb-4">
        <span className="text-accent">Flap</span>Mint
      </h1>
      <h3 className="text-5xl font-bold mb-4">
        <span className="text-xl text-foreground/60 mb-2 max-w-xl">CA: 0x4271e659489ee17bd3cdbeea37e824b246427777</span>
      </h3>
      <p className="text-xl text-foreground/60 mb-2 max-w-xl">
        AI Agent Launchpad on BSC
      </p>
      <p className="text-foreground/40 mb-8 max-w-lg">
        Mint an AI Agent NFT (BAP-578), fund it with BNB, and let it
        autonomously launch tokens on Flap.sh
      </p>

      <div className="flex gap-4">
        <Link
          href="/mint"
          className="px-6 py-3 bg-accent text-black font-semibold rounded-lg hover:bg-accent/90 transition-colors"
        >
          Mint Agent
        </Link>
        <Link
          href="/dashboard"
          className="px-6 py-3 border border-card-border text-foreground rounded-lg hover:bg-card-bg transition-colors"
        >
          Dashboard
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 w-full max-w-3xl">
        <div className="p-6 rounded-xl border border-card-border bg-card-bg">
          <div className="text-2xl mb-3">1</div>
          <h3 className="font-semibold mb-1">Mint Agent</h3>
          <p className="text-sm text-foreground/50">
            Create a BAP-578 Agent NFT with a name and strategy
          </p>
        </div>
        <div className="p-6 rounded-xl border border-card-border bg-card-bg">
          <div className="text-2xl mb-3">2</div>
          <h3 className="font-semibold mb-1">Fund with BNB</h3>
          <p className="text-sm text-foreground/50">
            Send BNB to your agent so it can launch tokens
          </p>
        </div>
        <div className="p-6 rounded-xl border border-card-border bg-card-bg">
          <div className="text-2xl mb-3">3</div>
          <h3 className="font-semibold mb-1">Auto Launch</h3>
          <p className="text-sm text-foreground/50">
            Agent creates tokens on Flap.sh autonomously
          </p>
        </div>
      </div>
    </div>
  );
}
