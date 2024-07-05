import hre from "hardhat";
import { Hex, parseEther, Address } from "viem";
import { expect } from "chai";

import solady from "solady";

import { chunk } from "./utils";

import { smallPngImageHex, expectedLoadedImageForSmallPngImage } from "./data";
import { SPLIT_PULL_SPLIT_FACTORY_ADDRESS } from "../config";

const name = "name";
const description = "description";

const compression = {
  none: 0,
  zip: 1,
};

const pngMimeType = "image/png";

const fixedMintFee = parseEther("0.001");
const basisPointsBase = 10000n;
const protocolFeeBasisPoints = 1000n; // 10%
const collectionOwnerFeeBasisPoints = 4500n; // 45%
const remixFeeBasisPoints = 1000n; // 10%
const distributionIncentive = 100;

const getFixture = async () => {
  const publicClient = await hre.viem.getPublicClient();
  const [deployer, protocolTreasury, collectionOwnerTreasury, creator, buyer] =
    await hre.viem.getWalletClients();

  const eisHanabi = await hre.viem.deployContract("EISHanabi", [
    SPLIT_PULL_SPLIT_FACTORY_ADDRESS,
    protocolTreasury.account.address,
    collectionOwnerTreasury.account.address,
    fixedMintFee,
    basisPointsBase,
    protocolFeeBasisPoints,
    collectionOwnerFeeBasisPoints,
    remixFeeBasisPoints,
    distributionIncentive,
  ]);

  return {
    publicClient,
    deployer,
    protocolTreasury,
    collectionOwnerTreasury,
    creator,
    buyer,
    eisHanabi,
  };
};

describe("EISHanabi", function () {
  describe("Deployment", function () {
    it("Should deploy successfully", async function () {
      const { eisHanabi } = await getFixture();
      expect(eisHanabi.address).not.to.be.undefined;
    });
  });

  describe("Create", function () {
    it("Should create a new token", async function () {
      const { publicClient, creator, eisHanabi } = await getFixture();
      const zippedImageHex = solady.LibZip.flzCompress(smallPngImageHex) as Hex;

      await publicClient.waitForTransactionReceipt({
        hash: await eisHanabi.write.create(
          [
            name,
            description,
            compression.zip,
            pngMimeType,
            chunk(zippedImageHex),
            [],
            true,
          ],
          { account: creator.account }
        ),
      });

      const tokenId = 0n;
      const record = await eisHanabi.read.records([tokenId]);
      expect(record[1]).to.equal(name);
      expect(record[2]).to.equal(description);
      // TODO: more checks

      // TODO: combine uri here too
    });
  });

  describe("URI", function () {
    it("Should return correct URI", async function () {
      const { publicClient, creator, eisHanabi } = await getFixture();
      const zippedImageHex = solady.LibZip.flzCompress(smallPngImageHex) as Hex;

      await publicClient.waitForTransactionReceipt({
        hash: await eisHanabi.write.create(
          [
            name,
            description,
            compression.zip,
            pngMimeType,
            chunk(zippedImageHex),
            [],
            true,
          ],
          { account: creator.account }
        ),
      });

      const tokenId = 0n;
      const uri = await eisHanabi.read.uri([tokenId]);
      const metadata = JSON.parse(uri.split("data:application/json;utf8,")[1]);
      expect(metadata.name).to.equal(name);
      expect(metadata.description).to.equal(description);
    });
  });

  describe("Mint", function () {
    it("Should mint a token", async function () {
      const { publicClient, creator, buyer, eisHanabi } = await getFixture();
      const zippedImageHex = solady.LibZip.flzCompress(smallPngImageHex) as Hex;

      await publicClient.waitForTransactionReceipt({
        hash: await eisHanabi.write.create(
          [
            name,
            description,
            compression.zip,
            pngMimeType,
            chunk(zippedImageHex),
            [],
            false, // isInitialMintEnabled set to false for this test
          ],
          { account: creator.account }
        ),
      });

      const tokenId = 0n;
      await eisHanabi.write.mint([tokenId, 1n], {
        account: buyer.account,
        value: fixedMintFee,
      });

      const balance = await eisHanabi.read.balanceOf([
        buyer.account.address,
        tokenId,
      ]);
      expect(balance).to.equal(1n);
    });
  });

  describe("Fee Distribution", function () {
    it("Should distribute fees correctly", async function () {
      const {
        publicClient,
        protocolTreasury,
        collectionOwnerTreasury,
        creator,
        buyer,
        eisHanabi,
      } = await getFixture();
      const zippedImageHex = solady.LibZip.flzCompress(smallPngImageHex) as Hex;

      await publicClient.waitForTransactionReceipt({
        hash: await eisHanabi.write.create(
          [
            name,
            description,
            compression.zip,
            pngMimeType,
            chunk(zippedImageHex),
            [],
            false,
          ],
          { account: creator.account }
        ),
      });

      const tokenId = 0n;
      const initialBalances = await Promise.all([
        publicClient.getBalance({ address: protocolTreasury.account.address }),
        publicClient.getBalance({
          address: collectionOwnerTreasury.account.address,
        }),
        publicClient.getBalance({ address: creator.account.address }),
      ]);

      await eisHanabi.write.mint([tokenId, 1n], {
        account: buyer.account,
        value: fixedMintFee,
      });

      const finalBalances = await Promise.all([
        publicClient.getBalance({ address: protocolTreasury.account.address }),
        publicClient.getBalance({
          address: collectionOwnerTreasury.account.address,
        }),
        publicClient.getBalance({ address: creator.account.address }),
      ]);

      const expectedProtocolFee =
        (fixedMintFee * protocolFeeBasisPoints) / basisPointsBase;
      const expectedCollectionOwnerFee =
        (fixedMintFee * collectionOwnerFeeBasisPoints) / basisPointsBase;
      const expectedCreatorFee =
        fixedMintFee - expectedProtocolFee - expectedCollectionOwnerFee;

      expect(finalBalances[0] - initialBalances[0]).to.equal(
        expectedProtocolFee
      );
      expect(finalBalances[1] - initialBalances[1]).to.equal(
        expectedCollectionOwnerFee
      );
      expect(finalBalances[2] - initialBalances[2]).to.equal(
        expectedCreatorFee
      );
    });
  });
});
