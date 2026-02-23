"use client";

import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { bscTestnet, bsc } from "wagmi/chains";

export const config = getDefaultConfig({
  appName: "FlapAgent",
  projectId: process.env.NEXT_PUBLIC_WC_PROJECT_ID || "demo",
  chains: [bscTestnet, bsc],
  ssr: true,
});
