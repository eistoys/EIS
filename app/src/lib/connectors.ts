import { connectorsForWallets } from "@rainbow-me/rainbowkit";
import {
  coinbaseWallet,
  rainbowWallet,
  walletConnectWallet,
} from "@rainbow-me/rainbowkit/wallets";

coinbaseWallet.preference = "smartWalletOnly";

const connectors = connectorsForWallets(
  [
    {
      groupName: "Smart Wallet: Recommended",
      wallets: [coinbaseWallet],
    },
    {
      groupName: "Others",
      wallets: [rainbowWallet, walletConnectWallet],
    },
  ],
  {
    appName: "EIS",
    projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || "",
  }
);

export { connectors };
