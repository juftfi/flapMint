"use client";

import Link from "next/link";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export function NavBar() {
  return (
    <nav className="border-b border-card-border bg-card-bg/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-xl font-bold text-accent">
            FlapAgent
          </Link>
          <div className="flex gap-4 text-sm">
            <Link
              href="/mint"
              className="text-foreground/60 hover:text-foreground transition-colors"
            >
              Mint Agent
            </Link>
            <Link
              href="/dashboard"
              className="text-foreground/60 hover:text-foreground transition-colors"
            >
              Dashboard
            </Link>
          </div>
        </div>
        <ConnectButton />
      </div>
    </nav>
  );
}
