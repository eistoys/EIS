import hre from "hardhat";
import { Address } from "viem";
import { SPLIT_PULL_SPLIT_FACTORY_ADDRESS } from "../config";

const TREASURY_ADDRESS =
  "0xc0797bd75cd3f34ee1cd046f03d9c85b36c2fd01" as Address;
const FIXED_MINT_FEE = BigInt("690000000000000");
const BASIS_POINTS_BASE = BigInt("10000");
const PROTOCOL_FEE_BASIS_POINTS = BigInt("1000");
const FRONTEND_FEE_BASIS_POINTS = BigInt("1000");
const ROYALTY_BASIS_POINTS = BigInt("2000");
const DISTRIBUTION_INCENTIVE = 100;

async function main() {
  const [deployer] = await hre.viem.getWalletClients();
  console.log("deployer.account.address", deployer.account.address);

  const eis = await hre.viem.deployContract("EIS", [
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
