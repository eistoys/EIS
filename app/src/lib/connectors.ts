import { connectorsForWallets } from "@rainbow-me/rainbowkit";
import {
  rainbowWallet,
  walletConnectWallet,
} from "@rainbow-me/rainbowkit/wallets";
import { customCoinbaseWallet } from "./customCoinbaseWallet";

const connectors = connectorsForWallets(
  [
    {
      groupName: "Recommended",
      wallets: [
        customCoinbaseWallet({
          appName: "EIS",
          preference: "smartWalletOnly",
        }),
      ],
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
