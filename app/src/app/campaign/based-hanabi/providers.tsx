"use client";

import { RainbowKitProvider, getDefaultConfig } from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { ApolloClient, ApolloProvider, InMemoryCache } from "@apollo/client";
import { baseSepolia, base } from "viem/chains";
import { OnchainKitProvider } from "@coinbase/onchainkit";
import { COINBASE_VERIFIED_ACCOUNT_SCHEMA_ID } from "@/config/const";
import { rainbowKitCustomTheme } from "./_config/rainbow-kit";

const config = getDefaultConfig({
  appName: "EIS",
  projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || "",
  chains: [baseSepolia],
  ssr: true,
});

const queryClient = new QueryClient();

const apolloClient = new ApolloClient({
  uri: "https://api.studio.thegraph.com/query/70647/eis/13",
  cache: new InMemoryCache(),
});

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
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
