import hre from "hardhat";
import { TREASURY_ADDRESS, ZORA_BASE_FACTORY_ADDRESS } from "../config";

async function main() {
  const [deployer,] = await hre.viem.getWalletClients();
  console.log("deployer.account.address", deployer.account.address);

  const eisz = await hre.viem.deployContract("EISZ", [
    ZORA_BASE_FACTORY_ADDRESS,
    TREASURY_ADDRESS
  ]);
  console.log("EISZ deployed to:", eisz.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
