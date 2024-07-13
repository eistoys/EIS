import { http, createConfig } from "@wagmi/core";
import { baseSepolia, base } from "@wagmi/core/chains";

export const wagmiConfig =
  process.env.NEXT_PUBLIC_NETWORK == "mainnet"
    ? createConfig({
        chains: [base],
        transports: {
          [base.id]: http(),
        },
        ssr: true,
      })
    : createConfig({
        chains: [baseSepolia],
        transports: {
          [baseSepolia.id]: http(),
        },
        ssr: true,
      });
