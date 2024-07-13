import "dotenv/config";

import type { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox-viem";
import "@nomicfoundation/hardhat-verify";
const accounts = [process.env.PRIVATE_KEY || ""];

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {
      forking: {
        url: "https://sepolia.base.org",
        blockNumber: 11591880, // Jun-21-2024 06:40:48 AM +UTC
        enabled: false,
      },
    },
    sepolia: {
      url: "https://rpc.sepolia.org",
      accounts,
    },
    baseSepolia: {
      url: "https://sepolia.base.org",
      accounts,
    },
    zoraSepolia: {
      url: "https://sepolia.rpc.zora.energy",
      accounts,
    },
    base: {
      url: "https://mainnet.base.org",
      accounts,
    },
  },
  etherscan: {
    apiKey: {
      base: process.env.BASESCAN_API_KEY || "",
    },
  },
  mocha: {
    timeout: 200000,
  },
};

export default config;
