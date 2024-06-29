import hre from "hardhat";
import {
  BASIS_POINTS_BASE,
  DISTRIBUTION_INCENTIVE,
  FIXED_MINT_FEE,
  FRONTEND_FEE_BASIS_POINTS,
  PROTOCOL_FEE_BASIS_POINTS,
  SPLIT_PULL_SPLIT_FACTORY_ADDRESS,
  ROYALTY_BASIS_POINTS,
  TREASURY_ADDRESS,
  ZORA_1155_FACTORY_ADDRESS,
} from "../config";

async function main() {
  const [deployer] = await hre.viem.getWalletClients();
  console.log("deployer.account.address", deployer.account.address);

  const eis = await hre.viem.deployContract("EIS", [
    ZORA_1155_FACTORY_ADDRESS,
    SPLIT_PULL_SPLIT_FACTORY_ADDRESS,
    TREASURY_ADDRESS,
    FIXED_MINT_FEE,
    BASIS_POINTS_BASE,
    PROTOCOL_FEE_BASIS_POINTS,
    FRONTEND_FEE_BASIS_POINTS,
    ROYALTY_BASIS_POINTS,
    DISTRIBUTION_INCENTIVE,
  ]);
  console.log("EIS deployed to:", eis.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
