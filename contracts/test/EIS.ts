import hre from "hardhat";
import { toHex, Hex, Address } from "viem";
import { expect } from "chai";

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
  smallPngImageHex,
  expectedLoadedImageForSmallPngImage,
} from "./data";
import {
  SPLIT_NATIVE_TOKEN_ADDRESS,
  SPLIT_PULL_SPLIT_FACTORY_ADDRESS,
  SPLIT_WAREHOUSE_ADDRESS,
} from "../config";

const TREASURY_ADDRESS =
  "0xc0797bd75cd3f34ee1cd046f03d9c85b36c2fd01" as Address;

const FIXED_MINT_FEE = BigInt("690000000000000");
const BASIS_POINTS_BASE = BigInt("10000");
const PROTOCOL_FEE_BASIS_POINTS = BigInt("1000");
const FRONTEND_FEE_BASIS_POINTS = BigInt("1000");
const ROYALTY_BASIS_POINTS = BigInt("2000");
const DISTRIBUTION_INCENTIVE = 100;
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000" as Address;

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
  const [creator, distributor] = await hre.viem.getWalletClients();
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

  return { creator, distributor, eis };
};

describe("EIP", function () {
  describe("Deployment", function () {
    it("Should work", async function () {
      const { eis } = await getFixture();
      expect(eis.address).not.to.be.undefined;
    });
  });

  describe("View - Zip", function () {
    it("Should work zip", async function () {
      const { eis } = await getFixture();
      const zippedOffchain = solady.LibZip.flzCompress(smallSVGHex) as Hex;
      const zipped = await eis.read.zip([smallSVGHex]);
      expect(zippedOffchain).to.equal(zipped);
    });

    it("Should work unzip", async function () {
      const { eis } = await getFixture();
      const zipped = solady.LibZip.flzCompress(largeSVGHex) as Hex;
      const unzipped = await eis.read.unzip([zipped]);
      expect(unzipped).to.equal(largeSVGHex);
    });
  });

  describe("View - Image", function () {
    it("Should work with png", async function () {
      const { eis } = await getFixture();
      const publicClient = await hre.viem.getPublicClient();

      const zipped = solady.LibZip.flzCompress(smallPngImageHex) as Hex;

      const createTxHash = await eis.write.create([
        name,
        description,
        pngMimeType,
        chunk(zipped),
      ]);

      await publicClient.waitForTransactionReceipt({ hash: createTxHash });
      const createdTokenId = BigInt(0);

      const loadedImage = await eis.read.loadImage([createdTokenId]);
      expect(loadedImage).to.equal(expectedLoadedImageForSmallPngImage);
    });

    it("Should work with middle svg", async function () {
      const { eis } = await getFixture();
      const publicClient = await hre.viem.getPublicClient();

      const zipped = solady.LibZip.flzCompress(middleSVGHex) as Hex;

      const createTxHash = await eis.write.create([
        name,
        description,
        svgMimeType,
        chunk(zipped),
      ]);

      await publicClient.waitForTransactionReceipt({ hash: createTxHash });
      const createdTokenId = BigInt(0);

      const loadedImage = await eis.read.loadImage([createdTokenId]);

      const decodedLoadedImage = Buffer.from(
        loadedImage.split("data:image/svg+xml;base64,")[1],
        "base64"
      ).toString("utf-8");

      expect(decodedLoadedImage).to.equal(middleSVG);

      const erc4883Data = await eis.read.renderTokenById([createdTokenId]);
      expect(erc4883Data).to.equal(middleSVG);

      const tokenURI = await eis.read.uri([createdTokenId]);
      const metadata = JSON.parse(
        tokenURI.split("data:application/json;utf8,")[1]
      );
      expect(metadata.image).to.equal(loadedImage);
    });
  });

  describe("View - Fee", function () {
    it("Should work", async function () {
      const { eis } = await getFixture();
      const totalMintFee = BigInt("10000");
      const [protocolFee, frontendFee, remainingFeeAfterFrontendFee] =
        await eis.read.getDividedFeeFromTotalMintFee([totalMintFee]);
      expect(protocolFee).to.equal(BigInt("1000"));
      expect(frontendFee).to.equal(BigInt("900"));
      expect(remainingFeeAfterFrontendFee).to.equal(BigInt("8100"));
    });
  });

  describe("View - Allocation", function () {
    it("Should work", async function () {
      const { eis } = await getFixture();
      const allocations = [BigInt("10000"), BigInt("10000")];
      const [totalAllocation, creatorAllocation] =
        await eis.read.getTotalAllocationAndCreatorAllocation([allocations]);
      expect(totalAllocation).to.equal(BigInt("100000"));
      expect(creatorAllocation).to.equal(BigInt("80000"));
    });
  });

  describe("Fee without Splits", function () {
    it("Should work without frontend fee", async function () {
      const { eis } = await getFixture();

      const publicClient = await hre.viem.getPublicClient();

      const zipped = solady.LibZip.flzCompress(smallSVGHex) as Hex;
      const createTxHash = await eis.write.create([
        name,
        description,
        svgMimeType,
        chunk(zipped),
      ]);
      await publicClient.waitForTransactionReceipt({ hash: createTxHash });
      const createdTokenId = BigInt(0);

      const amount = BigInt(1);
      const value = amount * BigInt(FIXED_MINT_FEE);
      const mintTxHash = await eis.write.mint(
        [createdTokenId, amount, ZERO_ADDRESS],
        {
          value,
        }
      );
      await publicClient.waitForTransactionReceipt({ hash: mintTxHash });
    });

    it("Should work with frontend fee", async function () {
      const { eis } = await getFixture();

      const publicClient = await hre.viem.getPublicClient();

      const zipped = solady.LibZip.flzCompress(smallSVGHex) as Hex;
      const createTxHash = await eis.write.create([
        name,
        description,
        svgMimeType,
        chunk(zipped),
      ]);
      await publicClient.waitForTransactionReceipt({ hash: createTxHash });
      const createdTokenId = BigInt(0);

      const amount = BigInt(1);
      const value = amount * BigInt(FIXED_MINT_FEE);

      const frontendFeeRecipientPrivateKey = generatePrivateKey();
      const frontendFeeRecipient = privateKeyToAccount(
        frontendFeeRecipientPrivateKey
      );

      const mintTxHash = await eis.write.mint(
        [createdTokenId, amount, frontendFeeRecipient.address],
        {
          value,
        }
      );
      await publicClient.waitForTransactionReceipt({ hash: mintTxHash });
    });
  });

  describe("Fee with Splits", function () {
    it("Should work with non remixed asset", async function () {
      const { creator, distributor, eis } = await getFixture();
      const publicClient = await hre.viem.getPublicClient();

      const zipped = solady.LibZip.flzCompress(smallSVGHex) as Hex;
      const createTxHash = await eis.write.create([
        name,
        description,
        svgMimeType,
        chunk(zipped),
      ]);

      await publicClient.waitForTransactionReceipt({ hash: createTxHash });
      const createdTokenId = BigInt(0);

      const amount = BigInt(1);
      const value = amount * FIXED_MINT_FEE;
      const mintTxHash = await eis.write.mint(
        [createdTokenId, amount, ZERO_ADDRESS],
        {
          value,
        }
      );
      await publicClient.waitForTransactionReceipt({ hash: mintTxHash });

      const [, splitAddress, , , , splitParams] = await eis.read.records([
        createdTokenId,
      ]);

      const pullSplit = getContract({
        address: splitAddress,
        abi: pullSplitAbi,
        client: distributor,
      });

      await pullSplit.write.distribute([
        splitParams,
        SPLIT_NATIVE_TOKEN_ADDRESS,
        distributor.account.address,
      ]);

      const splitsWarehouse = getContract({
        address: SPLIT_WAREHOUSE_ADDRESS,
        abi: splitsWarehouseAbi,
        client: distributor,
      });

      const balanceOfCreatorBefore = await publicClient.getBalance({
        address: creator.account.address,
      });
      console.log("balanceOfCreatorBefore", balanceOfCreatorBefore);
      await splitsWarehouse.write.withdraw([
        creator.account.address,
        SPLIT_NATIVE_TOKEN_ADDRESS,
      ]);
      const balanceOfCreatorAfter = await publicClient.getBalance({
        address: creator.account.address,
      });
      console.log("balanceOfCreatorAfter", balanceOfCreatorAfter);
    });
  });

  it("Should work with remixed asset", async function () {
    const { creator, distributor, eis } = await getFixture();
    const publicClient = await hre.viem.getPublicClient();

    const zipped = solady.LibZip.flzCompress(smallSVGHex) as Hex;
    const createTxHash1 = await eis.write.create([
      name,
      description,
      svgMimeType,
      chunk(zipped),
    ]);

    await publicClient.waitForTransactionReceipt({ hash: createTxHash1 });
    const createdTokenId1 = BigInt(0);

    const createTxHash2 = await eis.write.create([
      name,
      description,
      svgMimeType,
      chunk(zipped),
    ]);
    await publicClient.waitForTransactionReceipt({ hash: createTxHash2 });
    const createdTokenId2 = BigInt(1);

    const allocation1 = BigInt("100");
    const allocation2 = BigInt("400");
    const remixTxHash = await eis.write.remix([
      name,
      description,
      svgMimeType,
      chunk(zipped),
      [createdTokenId1, createdTokenId2],
      [allocation1, allocation2],
    ]);
    await publicClient.waitForTransactionReceipt({ hash: remixTxHash });
    const remixedTokenId = BigInt(2);

    const amount = BigInt(1);
    const value = amount * BigInt(FIXED_MINT_FEE);
    const mintTxHash = await eis.write.mint(
      [remixedTokenId, amount, ZERO_ADDRESS],
      {
        value,
      }
    );
    await publicClient.waitForTransactionReceipt({ hash: mintTxHash });

    // TODO: implment the rest of the test

    const [, splitAddressForCreatedToken1, , , , splitParamsForCreatedToken1] =
      await eis.read.records([createdTokenId1]);

    const [, splitAddressForCreatedToken2, , , , splitParamsForCreatedToken2] =
      await eis.read.records([createdTokenId2]);

    const [, splitAddressForRemixedToken, , , , splitParamsForRemixedToken] =
      await eis.read.records([remixedTokenId]);

    const pullSplitForCreatedToken1 = getContract({
      address: splitAddressForCreatedToken1,
      abi: pullSplitAbi,
      client: distributor,
    });

    const pullSplitForCreatedToken2 = getContract({
      address: splitAddressForCreatedToken2,
      abi: pullSplitAbi,
      client: distributor,
    });

    const pullSplitForRemixedToken = getContract({
      address: splitAddressForRemixedToken,
      abi: pullSplitAbi,
      client: distributor,
    });
  });
});
