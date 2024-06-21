import hre from "hardhat";
import { toHex, Hex } from "viem";
import { expect } from "chai";

import {
  BASIS_POINTS_BASE,
  DISTRIBUTION_INCENTIVE,
  PROTOCOL_FEE_BASIS_POINTS,
  SPLIT_PULL_SPLIT_FACTORY_ADDRESS,
  SPLIT_NATIVE_TOKEN_ADDRESS,
  TREASURY_ADDRESS,
  SPLIT_WAREHOUSE_ADDRESS,
  ZORA_1155_FACTORY_ADDRESS,
  EIS_NAME,
  EIS_DESCRIPTION,
} from "../config";

import { pullSplitAbi } from "./abis/PullSplit";
import { splitsWarehouseAbi } from "./abis/SplitsWarehouse";

import { getContract } from "viem";

import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import solady from "solady";

import { chunk } from "./utils";

import {
  smallSVG,
  middleSVG,
  largeSVG,
  pngImageHex,
  expectedLoadedImageForPngImage,
} from "./data";
import { zoraCreator1155ImplAbi } from "./abis/ZoraCreator1155Impl";

const name = "name";
const description = "description";

const pngMimeType = "image/png";
const svgMimeType = "image/svg+xml";

// use small svg to test zip funcionality and faster test
const smallSVGHex = toHex(smallSVG);

// use middle for other tests
const middleSVGHex = toHex(middleSVG);

// use large svg to test unzip capacity
const largeSVGHex = toHex(largeSVG);

const getFixture = async () => {
  const publicClient = await hre.viem.getPublicClient();
  const [creator, distributor] = await hre.viem.getWalletClients();

  const eis = await hre.viem.deployContract("EIS", [
    ZORA_1155_FACTORY_ADDRESS,
    SPLIT_PULL_SPLIT_FACTORY_ADDRESS,
    TREASURY_ADDRESS,
    BASIS_POINTS_BASE,
    PROTOCOL_FEE_BASIS_POINTS,
    DISTRIBUTION_INCENTIVE,
  ]);

  const zipped = solady.LibZip.flzCompress(pngImageHex) as Hex;

  await eis.write.createZoraCreator1155Contract([
    EIS_NAME,
    EIS_DESCRIPTION,
    1,
    pngMimeType,
    chunk(zipped),
  ]);

  const zoraCreator1155Address = await eis.read.zoraCreator1155();

  const zoraCreator1155 = getContract({
    address: zoraCreator1155Address,
    abi: zoraCreator1155ImplAbi,
    client: publicClient,
  });

  return { creator, distributor, eis, zoraCreator1155 };
};

describe("EIP", function () {
  describe("Deployment", function () {
    it("Should work", async function () {
      const { eis } = await getFixture();
      expect(eis.address).not.to.be.undefined;
      const uri = await eis.read.uri([BigInt(0)]);
      const metadata = JSON.parse(uri.split("data:application/json;utf8,")[1]);
      expect(metadata.name).to.equal(EIS_NAME);
      expect(metadata.description).to.equal(EIS_DESCRIPTION);
      expect(metadata.creator).to.equal(eis.address);
    });
  });

  describe("Zora Integration", function () {
    it("Should work", async function () {
      const { eis, zoraCreator1155 } = await getFixture();
      const uriFromEIS = await eis.read.uri([BigInt(0)]);
      const uriFromZora = await zoraCreator1155.read.uri([BigInt(0)]);
      expect(uriFromEIS).to.equal(uriFromZora);
    });
  });
});
