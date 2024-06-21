import "dotenv/config";

import type { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox-viem";

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
      },
    },
    baseSepolia: {
      url: "https://sepolia.base.org",
      accounts,
    },
  },
  mocha: {
    timeout: 200000,
  },
};

export default config;
