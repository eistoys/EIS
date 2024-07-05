import hre from "hardhat";
import { Hex, parseEther, getContract, formatEther } from "viem";
import { expect } from "chai";

import solady from "solady";

import { chunk } from "./utils";
import { splitsWarehouseAbi } from "./abis/SplitsWarehouse";

import { smallPngImageHex } from "./data";
import {
  SPLIT_NATIVE_TOKEN_ADDRESS,
  SPLIT_PULL_SPLIT_FACTORY_ADDRESS,
  SPLIT_WAREHOUSE_ADDRESS,
  SPLIT_REMAINS,
} from "../config";

const name = "name";
const description = "description";

const compression = {
  none: 0,
  zip: 1,
};

const pngMimeType = "image/png";

const fixedMintFee = parseEther("0.001");
const basisPointsBase = 10000n;
const protocolFeeBasisPoints = 1000n;
const collectionOwnerFeeBasisPoints = 4500n;
const remixFeeBasisPoints = 1000n;

const getFixture = async () => {
  const publicClient = await hre.viem.getPublicClient();
  const [
    owner,
    protocolTreasury,
    collectionOwnerTreasury,
    creator,
    creator2,
    creator3,
    creator4,
    remixer,
    minter,
  ] = await hre.viem.getWalletClients();

  const eisHanabi = await hre.viem.deployContract("EISHanabi", [
    SPLIT_PULL_SPLIT_FACTORY_ADDRESS,
    SPLIT_NATIVE_TOKEN_ADDRESS,
    protocolTreasury.account.address,
    collectionOwnerTreasury.account.address,
    fixedMintFee,
    basisPointsBase,
    protocolFeeBasisPoints,
    collectionOwnerFeeBasisPoints,
    remixFeeBasisPoints,
  ]);

  const splitsWarehouse = getContract({
    address: SPLIT_WAREHOUSE_ADDRESS,
    abi: splitsWarehouseAbi,
    client: publicClient,
  });

  return {
    publicClient,
    owner,
    protocolTreasury,
    collectionOwnerTreasury,
    creator,
    creator2,
    creator3,
    creator4,
    minter,
    remixer,
    eisHanabi,
    splitsWarehouse,
  };
};

describe.only("EISHanabi", function () {
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

      const imageDataUrl = await eisHanabi.read.loadImageDataUrl([tokenId]);
      const tokenURI = await eisHanabi.read.uri([tokenId]);
      const metadata = JSON.parse(
        tokenURI.split("data:application/json;utf8,")[1]
      );
      expect(metadata.image).to.equal(imageDataUrl);
      console.log("imageDataUrl", imageDataUrl);
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
      const { publicClient, creator, minter, eisHanabi } = await getFixture();
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
        account: minter.account,
        value: fixedMintFee,
      });

      const balance = await eisHanabi.read.balanceOf([
        minter.account.address,
        tokenId,
      ]);
      expect(balance).to.equal(1n);
    });
  });

  describe("Fee Distribution", function () {
    it.skip("Should distribute fees correctly and allow withdrawal", async function () {
      const {
        publicClient,
        protocolTreasury,
        collectionOwnerTreasury,
        owner,
        creator,
        minter,
        eisHanabi,
        splitsWarehouse,
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
      const amount = 1n;

      const initialBalances = await Promise.all([
        publicClient.getBalance({ address: protocolTreasury.account.address }),
        publicClient.getBalance({
          address: collectionOwnerTreasury.account.address,
        }),
        splitsWarehouse.read.balanceOf([
          creator.account.address,
          BigInt(SPLIT_NATIVE_TOKEN_ADDRESS),
        ]),
      ]);

      await eisHanabi.write.mint([tokenId, amount], {
        account: minter.account,
        value: fixedMintFee * amount,
      });

      const expectedProtocolFee =
        (fixedMintFee * protocolFeeBasisPoints) / basisPointsBase;
      const expectedCollectionOwnerFee =
        (fixedMintFee * collectionOwnerFeeBasisPoints) / basisPointsBase;
      const expectedCreatorFee =
        fixedMintFee - expectedProtocolFee - expectedCollectionOwnerFee;

      const finalProtocolBalance = await publicClient.getBalance({
        address: protocolTreasury.account.address,
      });
      const finalCollectionOwnerBalance = await publicClient.getBalance({
        address: collectionOwnerTreasury.account.address,
      });

      expect(finalProtocolBalance - initialBalances[0]).to.equal(
        expectedProtocolFee
      );
      expect(finalCollectionOwnerBalance - initialBalances[1]).to.equal(
        expectedCollectionOwnerFee
      );

      const warehouseBalance = await splitsWarehouse.read.balanceOf([
        creator.account.address,
        BigInt(SPLIT_NATIVE_TOKEN_ADDRESS),
      ]);

      // adjust remains in split + SPLIT_REMAINS
      expect(warehouseBalance - initialBalances[2] + SPLIT_REMAINS).to.equal(
        expectedCreatorFee
      );

      const initialCreatorBalance = await publicClient.getBalance({
        address: creator.account.address,
      });
      await splitsWarehouse.write.withdraw(
        [creator.account.address, SPLIT_NATIVE_TOKEN_ADDRESS],
        { account: owner.account }
      );

      const finalCreatorBalance = await publicClient.getBalance({
        address: creator.account.address,
      });

      // adjust remains in split and warehouse by SPLIT_REMAINS + SPLIT_REMAINS
      const creatorBalanceIncrease =
        finalCreatorBalance - initialCreatorBalance;
      expect(
        creatorBalanceIncrease + SPLIT_REMAINS + SPLIT_REMAINS
      ).to.be.equal(expectedCreatorFee);

      const finalWarehouseBalance = await splitsWarehouse.read.balanceOf([
        creator.account.address,
        BigInt(SPLIT_NATIVE_TOKEN_ADDRESS),
      ]);
      expect(finalWarehouseBalance).to.equal(SPLIT_REMAINS);

      console.log("=== LOG ===");
      console.log("Fee Distribution for Non-Remixed NFT:");
      console.log(`Total Mint Price: ${formatEther(fixedMintFee)} ETH`);
      console.log(
        `Protocol Fee: ${formatEther(expectedProtocolFee)} ETH (${protocolFeeBasisPoints / 100n}%)`
      );
      console.log(
        `Collection Owner Fee: ${formatEther(expectedCollectionOwnerFee)} ETH (${collectionOwnerFeeBasisPoints / 100n}%)`
      );
      console.log(
        `Creator Fee: ${formatEther(expectedCreatorFee)} ETH (${(basisPointsBase - protocolFeeBasisPoints - collectionOwnerFeeBasisPoints) / 100n}%)`
      );
    });

    it.skip("Should correctly distribute fees for remixed NFTs", async function () {
      const {
        publicClient,
        protocolTreasury,
        collectionOwnerTreasury,
        owner,
        remixer,
        creator,
        minter,
        eisHanabi,
        splitsWarehouse,
      } = await getFixture();

      const zippedImageHex = solady.LibZip.flzCompress(smallPngImageHex) as Hex;

      await publicClient.waitForTransactionReceipt({
        hash: await eisHanabi.write.create(
          [
            "Original NFT",
            "Original Description",
            compression.zip,
            pngMimeType,
            chunk(zippedImageHex),
            [],
            false,
          ],
          { account: creator.account }
        ),
      });

      const tokenId1 = 0n;

      await publicClient.waitForTransactionReceipt({
        hash: await eisHanabi.write.create(
          [
            "Remixed NFT",
            "Remixed Description",
            compression.zip,
            pngMimeType,
            chunk(zippedImageHex),
            [tokenId1],
            false,
          ],
          { account: remixer.account }
        ),
      });

      const tokenId2 = 1n;

      const initialBalances = await Promise.all([
        publicClient.getBalance({ address: protocolTreasury.account.address }),
        publicClient.getBalance({
          address: collectionOwnerTreasury.account.address,
        }),
        publicClient.getBalance({
          address: creator.account.address,
        }),
        publicClient.getBalance({
          address: remixer.account.address,
        }),
      ]);

      const amount = 1n;
      await eisHanabi.write.mint([tokenId2, amount], {
        account: minter.account,
        value: fixedMintFee * amount,
      });

      const expectedProtocolFee =
        (fixedMintFee * protocolFeeBasisPoints) / basisPointsBase;
      const expectedCollectionOwnerFee =
        (fixedMintFee * collectionOwnerFeeBasisPoints) / basisPointsBase;
      const totalCreatorFee =
        fixedMintFee - expectedProtocolFee - expectedCollectionOwnerFee;
      const expectedRemixFee =
        (totalCreatorFee * remixFeeBasisPoints) / basisPointsBase;
      const expectedCreatorFee = totalCreatorFee - expectedRemixFee;

      const finalProtocolBalance = await publicClient.getBalance({
        address: protocolTreasury.account.address,
      });
      const finalCollectionOwnerBalance = await publicClient.getBalance({
        address: collectionOwnerTreasury.account.address,
      });

      expect(finalProtocolBalance - initialBalances[0]).to.equal(
        expectedProtocolFee
      );
      expect(finalCollectionOwnerBalance - initialBalances[1]).to.equal(
        expectedCollectionOwnerFee
      );

      const originalCreatorWarehouseBalance =
        await splitsWarehouse.read.balanceOf([
          creator.account.address,
          BigInt(SPLIT_NATIVE_TOKEN_ADDRESS),
        ]);
      const remixerWarehouseBalance = await splitsWarehouse.read.balanceOf([
        remixer.account.address,
        BigInt(SPLIT_NATIVE_TOKEN_ADDRESS),
      ]);

      expect(originalCreatorWarehouseBalance + SPLIT_REMAINS).to.equal(
        expectedRemixFee
      );
      expect(remixerWarehouseBalance + SPLIT_REMAINS).to.equal(
        expectedCreatorFee
      );

      await splitsWarehouse.write.withdraw(
        [creator.account.address, SPLIT_NATIVE_TOKEN_ADDRESS],
        { account: owner.account }
      );
      await splitsWarehouse.write.withdraw(
        [remixer.account.address, SPLIT_NATIVE_TOKEN_ADDRESS],
        { account: owner.account }
      );

      const finalOriginalCreatorBalance = await publicClient.getBalance({
        address: creator.account.address,
      });
      const finalRemixerBalance = await publicClient.getBalance({
        address: remixer.account.address,
      });

      expect(
        finalOriginalCreatorBalance -
          initialBalances[2] +
          SPLIT_REMAINS +
          SPLIT_REMAINS
      ).to.be.equal(expectedRemixFee);

      expect(
        finalRemixerBalance - initialBalances[3] + SPLIT_REMAINS + SPLIT_REMAINS
      ).to.be.equal(expectedCreatorFee);

      const finalOriginalCreatorWarehouseBalance =
        await splitsWarehouse.read.balanceOf([
          creator.account.address,
          BigInt(SPLIT_NATIVE_TOKEN_ADDRESS),
        ]);
      const finalRemixerWarehouseBalance = await splitsWarehouse.read.balanceOf(
        [remixer.account.address, BigInt(SPLIT_NATIVE_TOKEN_ADDRESS)]
      );

      expect(finalOriginalCreatorWarehouseBalance).to.equal(SPLIT_REMAINS);
      expect(finalRemixerWarehouseBalance).to.equal(SPLIT_REMAINS);

      console.log("=== LOG ===");
      console.log("Fee Distribution for Remixed NFT:");
      console.log(`Total Mint Price: ${formatEther(fixedMintFee)} ETH`);
      console.log(
        `Protocol Fee: ${formatEther(expectedProtocolFee)} ETH (${protocolFeeBasisPoints / 100n}%)`
      );
      console.log(
        `Collection Owner Fee: ${formatEther(expectedCollectionOwnerFee)} ETH (${collectionOwnerFeeBasisPoints / 100n}%)`
      );
      console.log(`Total Creator Fee: ${formatEther(totalCreatorFee)} ETH`);
      console.log(
        `  Original Creator Fee: ${formatEther(expectedRemixFee)} ETH (${remixFeeBasisPoints / 100n}% of Creator Fee)`
      );
      console.log(
        `  Creator Fee: ${formatEther(expectedCreatorFee)} ETH (${(10000n - remixFeeBasisPoints) / 100n}% of Creator Fee)`
      );
    });

    it.skip("Should correctly distribute fees for NFT with multiple references", async function () {
      const {
        publicClient,
        protocolTreasury,
        collectionOwnerTreasury,
        owner,
        creator: creator1,
        creator2,
        creator3,
        creator4,
        remixer,
        minter,
        eisHanabi,
        splitsWarehouse,
      } = await getFixture();

      const zippedImageHex = solady.LibZip.flzCompress(smallPngImageHex) as Hex;

      // Create 4 original NFTs
      const originalCreators = [creator1, creator2, creator3, creator4];
      const originalTokenIds = [];

      for (let i = 0; i < 4; i++) {
        await publicClient.waitForTransactionReceipt({
          hash: await eisHanabi.write.create(
            [
              `Original NFT ${i + 1}`,
              `Original Description ${i + 1}`,
              compression.zip,
              pngMimeType,
              chunk(zippedImageHex),
              [],
              false,
            ],
            { account: originalCreators[i].account }
          ),
        });
        originalTokenIds.push(BigInt(i));
      }

      // Create remixed NFT referencing all 4 original NFTs
      await publicClient.waitForTransactionReceipt({
        hash: await eisHanabi.write.create(
          [
            "Remixed NFT",
            "Remixed Description",
            compression.zip,
            pngMimeType,
            chunk(zippedImageHex),
            originalTokenIds,
            false,
          ],
          { account: remixer.account }
        ),
      });

      const remixedTokenId = 4n;

      const initialBalances = await Promise.all([
        publicClient.getBalance({ address: protocolTreasury.account.address }),
        publicClient.getBalance({
          address: collectionOwnerTreasury.account.address,
        }),
        ...originalCreators.map((c) =>
          publicClient.getBalance({ address: c.account.address })
        ),
        publicClient.getBalance({ address: remixer.account.address }),
      ]);

      // Mint the remixed NFT
      const amount = 1n;
      await eisHanabi.write.mint([remixedTokenId, amount], {
        account: minter.account,
        value: fixedMintFee * amount,
      });

      // Calculate fees
      const expectedProtocolFee =
        (fixedMintFee * protocolFeeBasisPoints) / basisPointsBase;
      const expectedCollectionOwnerFee =
        (fixedMintFee * collectionOwnerFeeBasisPoints) / basisPointsBase;
      const totalCreatorFee =
        fixedMintFee - expectedProtocolFee - expectedCollectionOwnerFee;
      const totalRemixFee =
        (totalCreatorFee * remixFeeBasisPoints) / basisPointsBase;
      const expectedRemixFeePerOriginalCreator = totalRemixFee / 4n;
      const expectedRemixerFee = totalCreatorFee - totalRemixFee;

      // Check protocol and collection owner fees
      const finalProtocolBalance = await publicClient.getBalance({
        address: protocolTreasury.account.address,
      });
      const finalCollectionOwnerBalance = await publicClient.getBalance({
        address: collectionOwnerTreasury.account.address,
      });

      expect(finalProtocolBalance - initialBalances[0]).to.equal(
        expectedProtocolFee
      );
      expect(finalCollectionOwnerBalance - initialBalances[1]).to.equal(
        expectedCollectionOwnerFee
      );

      // Check warehouse balances for original creators and remixer
      for (let i = 0; i < 4; i++) {
        const creatorWarehouseBalance = await splitsWarehouse.read.balanceOf([
          originalCreators[i].account.address,
          BigInt(SPLIT_NATIVE_TOKEN_ADDRESS),
        ]);
        expect(creatorWarehouseBalance + SPLIT_REMAINS).to.equal(
          expectedRemixFeePerOriginalCreator
        );
      }

      const remixerWarehouseBalance = await splitsWarehouse.read.balanceOf([
        remixer.account.address,
        BigInt(SPLIT_NATIVE_TOKEN_ADDRESS),
      ]);
      expect(remixerWarehouseBalance + SPLIT_REMAINS).to.equal(
        expectedRemixerFee
      );

      // Withdraw for all creators
      for (const creator of [...originalCreators, remixer]) {
        await splitsWarehouse.write.withdraw(
          [creator.account.address, SPLIT_NATIVE_TOKEN_ADDRESS],
          { account: owner.account }
        );
      }

      // Check final balances
      const finalBalances = await Promise.all([
        ...originalCreators.map((c) =>
          publicClient.getBalance({ address: c.account.address })
        ),
        publicClient.getBalance({ address: remixer.account.address }),
      ]);

      for (let i = 0; i < 4; i++) {
        expect(
          finalBalances[i] -
            initialBalances[i + 2] +
            SPLIT_REMAINS +
            SPLIT_REMAINS
        ).to.be.equal(expectedRemixFeePerOriginalCreator);
      }
      expect(
        finalBalances[4] - initialBalances[6] + SPLIT_REMAINS + SPLIT_REMAINS
      ).to.be.equal(expectedRemixerFee);

      // Log fee distribution
      console.log("=== LOG ===");
      console.log("Fee Distribution for Remixed NFT with Multiple References:");
      console.log(`Total Mint Price: ${formatEther(fixedMintFee)} ETH`);
      console.log(
        `Protocol Fee: ${formatEther(expectedProtocolFee)} ETH (${protocolFeeBasisPoints / 100n}%)`
      );
      console.log(
        `Collection Owner Fee: ${formatEther(expectedCollectionOwnerFee)} ETH (${collectionOwnerFeeBasisPoints / 100n}%)`
      );
      console.log(`Total Creator Fee: ${formatEther(totalCreatorFee)} ETH`);
      console.log(
        `  Total Remix Fee: ${formatEther(totalRemixFee)} ETH (${remixFeeBasisPoints / 100n}% of Creator Fee)`
      );
      console.log(
        `    Fee per Original Creator: ${formatEther(expectedRemixFeePerOriginalCreator)} ETH (2.5% of Creator Fee)`
      );
      console.log(
        `  Creator Fee: ${formatEther(expectedRemixerFee)} ETH (${(10000n - remixFeeBasisPoints) / 100n}% of Creator Fee)`
      );
    });
  });
});
