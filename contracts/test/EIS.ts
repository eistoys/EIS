import hre from "hardhat";
import { toHex, Hex, parseEther } from "viem";
import { expect } from "chai";

import {
  BASIS_POINTS_BASE,
  DISTRIBUTION_INCENTIVE,
  PROTOCOL_FEE_BASIS_POINTS,
  SPLIT_PULL_SPLIT_FACTORY_ADDRESS,
  TREASURY_ADDRESS,
  ZORA_1155_FACTORY_ADDRESS,
  EIS_NAME,
  EIS_DESCRIPTION,
  ZORA_CONTRACT_BASE_ID,
  MAX_UINT_256,
  ZORA_BASE_FEE,
} from "../config";

import { getContract, encodeAbiParameters, parseAbiParameters } from "viem";

import solady from "solady";

import { chunk } from "./utils";

import {
  smallSVG,
  middleSVG,
  largeSVG,
  smallPngImageHex,
  expectedLoadedImageForSmallPngImage,
} from "./data";
import { zoraCreator1155ImplAbi } from "./abis/ZoraCreator1155Impl";

const name = "name";
const description = "description";

const compression = {
  none: 0,
  zip: 1,
};

const pngMimeType = "image/png";

const fixedPrice = parseEther("0.001");

const getFixture = async () => {
  const publicClient = await hre.viem.getPublicClient();
  const [creator, buyer] = await hre.viem.getWalletClients();

  const eis = await hre.viem.deployContract("EIS", [
    ZORA_1155_FACTORY_ADDRESS,
    SPLIT_PULL_SPLIT_FACTORY_ADDRESS,
    TREASURY_ADDRESS,
    BASIS_POINTS_BASE,
    PROTOCOL_FEE_BASIS_POINTS,
    DISTRIBUTION_INCENTIVE,
  ]);

  const zippedImageHex = solady.LibZip.flzCompress(smallPngImageHex) as Hex;

  await publicClient.waitForTransactionReceipt({
    hash: await eis.write.createZoraCreator1155Contract([
      EIS_NAME,
      EIS_DESCRIPTION,
      compression.zip,
      pngMimeType,
      chunk(zippedImageHex),
    ]),
  });

  const zoraCreator1155Address = await eis.read.zoraCreator1155();

  const zoraCreator1155 = getContract({
    address: zoraCreator1155Address,
    abi: zoraCreator1155ImplAbi,
    client: publicClient,
  });

  // console.log("eis.address", eis.address);
  // console.log("zoraCreator1155.address", zoraCreator1155.address);

  return { publicClient, creator, buyer, eis, zoraCreator1155 };
};

describe("EIP", function () {
  describe("Deployment", function () {
    it("Should work", async function () {
      const { eis } = await getFixture();
      expect(eis.address).not.to.be.undefined;
      const uri = await eis.read.uri([BigInt(0)]);
      const metadata = JSON.parse(uri.split("data:application/json;utf8,")[1]);
      // console.log(metadata);
      expect(metadata.name).to.equal(EIS_NAME);
      expect(metadata.description).to.equal(EIS_DESCRIPTION);
    });
  });

  describe("View Image", function () {
    it("Should work: loadImage", async function () {
      const { publicClient, eis } = await getFixture();
      const createdTokenId = BigInt("1");
      const zippedImageHex = solady.LibZip.flzCompress(smallPngImageHex) as Hex;

      await publicClient.waitForTransactionReceipt({
        hash: await eis.write.create([
          name,
          description,
          compression.zip,
          pngMimeType,
          chunk(zippedImageHex),
          MAX_UINT_256,
          fixedPrice,
        ]),
      });

      const loadedImage = await eis.read.loadImage([createdTokenId]);
      expect(loadedImage).to.equal(expectedLoadedImageForSmallPngImage);
    });
  });

  describe("Zora Integration", function () {
    it("Should work: contractURI", async function () {
      const { eis, zoraCreator1155 } = await getFixture();
      const uriFromEIS = await eis.read.uri([ZORA_CONTRACT_BASE_ID]);
      const contractURIFromZora = await zoraCreator1155.read.contractURI();
      expect(uriFromEIS).to.equal(contractURIFromZora);
    });

    it("Should work: uri", async function () {
      const { publicClient, eis, zoraCreator1155 } = await getFixture();

      const createdTokenId = BigInt("1");
      const name = "name";
      const description = "description";

      const zippedImageHex = solady.LibZip.flzCompress(smallPngImageHex) as Hex;
      await publicClient.waitForTransactionReceipt({
        hash: await eis.write.create([
          name,
          description,
          compression.zip,
          pngMimeType,
          chunk(zippedImageHex),
          MAX_UINT_256,
          fixedPrice,
        ]),
      });

      const uriFromEIS = await eis.read.uri([createdTokenId]);
      const uriFromZora = await zoraCreator1155.read.uri([createdTokenId]);
      expect(uriFromEIS).to.equal(uriFromZora);
    });

    it("Should work: purchase", async function () {
      const { publicClient, eis, buyer, zoraCreator1155 } = await getFixture();

      const createdTokenId = BigInt("1");
      const name = "name";
      const description = "description";

      const zippedImageHex = solady.LibZip.flzCompress(smallPngImageHex) as Hex;
      await publicClient.waitForTransactionReceipt({
        hash: await eis.write.create([
          name,
          description,
          compression.zip,
          pngMimeType,
          chunk(zippedImageHex),
          MAX_UINT_256,
          fixedPrice,
        ]),
      });

      const minterAddress = await eis.read.minter();
      const [buyerAddress] = await buyer.getAddresses();

      const mintArguments = encodeAbiParameters(parseAbiParameters("address"), [
        buyerAddress,
      ]);

      await zoraCreator1155.write.mint(
        [minterAddress, createdTokenId, BigInt(1), [], mintArguments],
        {
          account: buyerAddress,
          value: fixedPrice + ZORA_BASE_FEE,
        }
      );

      expect(
        await zoraCreator1155.read.balanceOf([buyerAddress, createdTokenId])
      ).to.equal(BigInt(1));
    });
  });
});
