'use client'

import { connectors } from "./connectors";
import { http, createConfig } from "@wagmi/core";
import { baseSepolia } from "@wagmi/core/chains";

export const wagmiConfig = createConfig({
  connectors: connectors,
  chains: [baseSepolia],
  transports: {
    [baseSepolia.id]: http(),
  },
  ssr: true,
});
