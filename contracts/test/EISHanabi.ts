import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";

import hre from "hardhat";
import { Hex, parseEther, formatEther } from "viem";
import { expect } from "chai";

import solady from "solady";

import { chunk } from "./utils";
import { smallPngImageHex } from "./data";

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
    protocolTreasury.account.address,
    collectionOwnerTreasury.account.address,
    fixedMintFee,
    basisPointsBase,
    protocolFeeBasisPoints,
    collectionOwnerFeeBasisPoints,
    remixFeeBasisPoints,
  ]);

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
      const { publicClient, creator, eisHanabi } =
        await loadFixture(getFixture);
      const zippedImageHex = solady.LibZip.flzCompress(smallPngImageHex) as Hex;
      const imageChunks = chunk(zippedImageHex);

      await publicClient.waitForTransactionReceipt({
        hash: await eisHanabi.write.create(
          [
            name,
            description,
            compression.zip,
            pngMimeType,
            imageChunks,
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
      const imageChunks = chunk(zippedImageHex);

      await publicClient.waitForTransactionReceipt({
        hash: await eisHanabi.write.create(
          [
            name,
            description,
            compression.zip,
            pngMimeType,
            imageChunks,
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
      const { publicClient, creator, minter, eisHanabi } =
        await loadFixture(getFixture);
      const zippedImageHex = solady.LibZip.flzCompress(smallPngImageHex) as Hex;
      const imageChunks = chunk(zippedImageHex);

      await publicClient.waitForTransactionReceipt({
        hash: await eisHanabi.write.create(
          [
            name,
            description,
            compression.zip,
            pngMimeType,
            imageChunks,
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
    it("Should distribute fees correctly and allow withdrawal", async function () {
      const {
        publicClient,
        protocolTreasury,
        collectionOwnerTreasury,
        creator,
        minter,
        eisHanabi,
      } = await loadFixture(getFixture);
      const zippedImageHex = solady.LibZip.flzCompress(smallPngImageHex) as Hex;
      const imageChunks = chunk(zippedImageHex);

      await publicClient.waitForTransactionReceipt({
        hash: await eisHanabi.write.create(
          [
            name,
            description,
            compression.zip,
            pngMimeType,
            imageChunks,
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
        publicClient.getBalance({ address: creator.account.address }),
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

      const creatorClaimableFees = await eisHanabi.read.claimableFees([
        creator.account.address,
      ]);

      expect(creatorClaimableFees).to.equal(expectedCreatorFee);

      const initialCreatorBalance = await publicClient.getBalance({
        address: creator.account.address,
      });

      const claimTxHash = await eisHanabi.write.claimFees({
        account: creator.account,
      });
      const claimReceipt = await publicClient.waitForTransactionReceipt({
        hash: claimTxHash,
      });

      const gasUsed = claimReceipt.gasUsed;
      const gasPrice = claimReceipt.effectiveGasPrice;
      const claimGasCost = gasUsed * gasPrice;

      const finalCreatorBalance = await publicClient.getBalance({
        address: creator.account.address,
      });

      const creatorBalanceIncrease =
        finalCreatorBalance - initialCreatorBalance + claimGasCost;
      expect(creatorBalanceIncrease).to.be.equal(expectedCreatorFee);

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

    it("Should correctly distribute fees for remixed NFTs", async function () {
      const {
        publicClient,
        protocolTreasury,
        collectionOwnerTreasury,
        creator,
        remixer,
        minter,
        eisHanabi,
      } = await loadFixture(getFixture);

      const zippedImageHex = solady.LibZip.flzCompress(smallPngImageHex) as Hex;
      const imageChunks = chunk(zippedImageHex);

      await publicClient.waitForTransactionReceipt({
        hash: await eisHanabi.write.create(
          [
            "Original NFT",
            "Original Description",
            compression.zip,
            pngMimeType,
            imageChunks,
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
            imageChunks,
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
        publicClient.getBalance({ address: creator.account.address }),
        publicClient.getBalance({ address: remixer.account.address }),
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

      const creatorClaimableFees = await eisHanabi.read.claimableFees([
        creator.account.address,
      ]);
      const remixerClaimableFees = await eisHanabi.read.claimableFees([
        remixer.account.address,
      ]);

      expect(creatorClaimableFees).to.equal(expectedRemixFee);
      expect(remixerClaimableFees).to.equal(expectedCreatorFee);

      const initialCreatorBalance = await publicClient.getBalance({
        address: creator.account.address,
      });
      const initialRemixerBalance = await publicClient.getBalance({
        address: remixer.account.address,
      });

      const claimCreatorTxHash = await eisHanabi.write.claimFees({
        account: creator.account,
      });
      const claimCreatorReceipt = await publicClient.waitForTransactionReceipt({
        hash: claimCreatorTxHash,
      });

      const claimRemixerTxHash = await eisHanabi.write.claimFees({
        account: remixer.account,
      });
      const claimRemixerReceipt = await publicClient.waitForTransactionReceipt({
        hash: claimRemixerTxHash,
      });

      const creatorGasUsed = claimCreatorReceipt.gasUsed;
      const creatorGasPrice = claimCreatorReceipt.effectiveGasPrice;
      const creatorGasCost = creatorGasUsed * creatorGasPrice;

      const remixerGasUsed = claimRemixerReceipt.gasUsed;
      const remixerGasPrice = claimRemixerReceipt.effectiveGasPrice;
      const remixerGasCost = remixerGasUsed * remixerGasPrice;

      const finalCreatorBalance = await publicClient.getBalance({
        address: creator.account.address,
      });
      const finalRemixerBalance = await publicClient.getBalance({
        address: remixer.account.address,
      });

      const creatorBalanceIncrease =
        finalCreatorBalance - initialCreatorBalance + creatorGasCost;
      const remixerBalanceIncrease =
        finalRemixerBalance - initialRemixerBalance + remixerGasCost;

      expect(creatorBalanceIncrease).to.be.equal(expectedRemixFee);
      expect(remixerBalanceIncrease).to.be.equal(expectedCreatorFee);

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

    it("Should correctly distribute fees for NFT with multiple references", async function () {
      const {
        publicClient,
        protocolTreasury,
        collectionOwnerTreasury,
        creator: creator1,
        creator2,
        creator3,
        creator4,
        remixer,
        minter,
        eisHanabi,
      } = await loadFixture(getFixture);

      const zippedImageHex = solady.LibZip.flzCompress(smallPngImageHex) as Hex;
      const imageChunks = chunk(zippedImageHex);

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
              imageChunks,
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
            imageChunks,
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

      for (let i = 0; i < 4; i++) {
        const creatorClaimableFees = await eisHanabi.read.claimableFees([
          originalCreators[i].account.address,
        ]);
        expect(creatorClaimableFees).to.equal(
          expectedRemixFeePerOriginalCreator
        );
      }

      const remixerClaimableFees = await eisHanabi.read.claimableFees([
        remixer.account.address,
      ]);
      expect(remixerClaimableFees).to.equal(expectedRemixerFee);

      const initialCreatorBalances = await Promise.all(
        originalCreators.map((c) =>
          publicClient.getBalance({ address: c.account.address })
        )
      );
      const initialRemixerBalance = await publicClient.getBalance({
        address: remixer.account.address,
      });

      // Calculate gas costs and net balance increase for each creator
      const gasCosts = await Promise.all(
        [...originalCreators, remixer].map(async (creator) => {
          const claimTxHash = await eisHanabi.write.claimFees({
            account: creator.account,
          });
          const claimReceipt = await publicClient.waitForTransactionReceipt({
            hash: claimTxHash,
          });
          const gasUsed = claimReceipt.gasUsed;
          const gasPrice = claimReceipt.effectiveGasPrice;
          return gasUsed * gasPrice;
        })
      );

      const finalCreatorBalances = await Promise.all(
        originalCreators.map((c) =>
          publicClient.getBalance({ address: c.account.address })
        )
      );
      const finalRemixerBalance = await publicClient.getBalance({
        address: remixer.account.address,
      });

      for (let i = 0; i < 4; i++) {
        const netBalanceIncrease =
          finalCreatorBalances[i] - initialCreatorBalances[i] + gasCosts[i];
        expect(netBalanceIncrease).to.be.equal(
          expectedRemixFeePerOriginalCreator
        );
      }

      const netRemixerBalanceIncrease =
        finalRemixerBalance - initialRemixerBalance + gasCosts[4];
      expect(netRemixerBalanceIncrease).to.be.equal(expectedRemixerFee);

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
