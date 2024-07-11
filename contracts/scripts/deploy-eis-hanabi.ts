import hre from "hardhat";
import { Address } from "viem";

const PROTOCOL_TREASURY_ADDRESS =
  "0x30be2BE5e49CD1b91B73C967597352382ee880Ba" as Address;
const COLLECTION_OWNER_TREASURY_ADDRESS =
  "0x9cdf2385A3Ab2C8613133B396079075a21561015" as Address;

const FIXED_MINT_FEE = BigInt("690000000000000");
const BASIS_POINTS_BASE = BigInt("10000");
const PROTOCOL_FEE_BASIS_POINTS = BigInt("1000");
const COLLECTION_OWNER_FEE_BASIS_POINTS = BigInt("4500");
const REMIX_FEE_BASIS_POINTS = BigInt("1000");

async function main() {
  const [deployer] = await hre.viem.getWalletClients();
  console.log("deployer.account.address", deployer.account.address);

  const eis = await hre.viem.deployContract("EISHanabi", [
    PROTOCOL_TREASURY_ADDRESS,
    COLLECTION_OWNER_TREASURY_ADDRESS,
    FIXED_MINT_FEE,
    BASIS_POINTS_BASE,
    PROTOCOL_FEE_BASIS_POINTS,
    COLLECTION_OWNER_FEE_BASIS_POINTS,
    REMIX_FEE_BASIS_POINTS,
  ]);
  console.log("EIS Hanabi deployed to:", eis.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
