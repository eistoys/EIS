import hre from "hardhat";
import { Address } from "viem";
import {
  SPLIT_NATIVE_TOKEN_ADDRESS,
  SPLIT_PULL_SPLIT_FACTORY_ADDRESS,
} from "../config";

const PROTOCOL_TREASURY_ADDRESS =
  "0xc0797bd75cd3f34ee1cd046f03d9c85b36c2fd01" as Address;
const COLLECTION_OWNER_TREASURY_ADDRESS =
  "0x71165Cf095cc1A0F1649F5E249B1b9d3CB7Bfd02" as Address;

const FIXED_MINT_FEE = BigInt("690000000000000");
const BASIS_POINTS_BASE = BigInt("10000");
const PROTOCOL_FEE_BASIS_POINTS = BigInt("1000");
const COLLECTION_OWNER_FEE_BASIS_POINTS = BigInt("4500");
const REMIX_FEE_BASIS_POINTS = BigInt("1000");

async function main() {
  const [deployer] = await hre.viem.getWalletClients();
  console.log("deployer.account.address", deployer.account.address);

  const eis = await hre.viem.deployContract("EISHanabi", [
    SPLIT_PULL_SPLIT_FACTORY_ADDRESS,
    SPLIT_NATIVE_TOKEN_ADDRESS,
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
