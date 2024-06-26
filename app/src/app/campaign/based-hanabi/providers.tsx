"use client";

import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { WagmiProvider, createConfig, http } from "wagmi";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { ApolloClient, ApolloProvider, InMemoryCache } from "@apollo/client";
import { baseSepolia, base } from "viem/chains";
import { connectors } from "@/lib/connectors";
import { OnchainKitProvider } from "@coinbase/onchainkit";
import { COINBASE_VERIFIED_ACCOUNT_SCHEMA_ID } from "@/config/const";
import { rainbowKitCustomTheme } from "./_config/rainbow-kit";

export const wagmiConfigWithConnecter = createConfig({
  connectors,
  chains: [baseSepolia],
  transports: {
    [baseSepolia.id]: http(),
  },
  ssr: true,
});

const queryClient = new QueryClient();

const apolloClient = new ApolloClient({
  uri: "https://api.studio.thegraph.com/query/70647/eis/6",
  cache: new InMemoryCache(),
});

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={wagmiConfigWithConnecter}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={rainbowKitCustomTheme}>
          <ApolloProvider client={apolloClient}>
            <OnchainKitProvider
              schemaId={COINBASE_VERIFIED_ACCOUNT_SCHEMA_ID}
              chain={base}
            >
              {children}
            </OnchainKitProvider>
          </ApolloProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
