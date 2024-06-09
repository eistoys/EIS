import hre from "hardhat";
import { toHex } from "viem";
import { expect } from "chai";

import {
  BASIS_POINTS_BASE,
  DISTRIBUTION_INCENTIVE,
  FIXED_MINT_FEE,
  FRONTEND_FEE_BASIS_POINTS,
  PROTOCOL_FEE_BASIS_POINTS,
  SPLIT_PULL_SPLIT_FACTORY_ADDRESS,
  ROYALTY_BASIS_POINTS,
  SPLIT_NATIVE_TOKEN_ADDRESS,
  TREASURY_ADDRESS,
  SPLIT_WAREHOUSE_ADDRESS,
  ZERO_ADDRESS,
} from "../config";

import { pullSplitAbi } from "./abis/PullSplit";
import { splitsWarehouseAbi } from "./abis/SplitsWarehouse";

import { getContract } from "viem";

import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";

const name = "name";
const description = "description";

const svg = `
<svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
 <g>
  <title>Layer 1</title>
  <path d="m154.5,130c1,0 5.00214,-0.09206 50,1c38.00197,0.92227 82.01849,3.77441 120,7c33.01724,2.804 61.03821,5.69824 78,8c13.03348,1.76868 20,3 23,4l1,1l1,0l0,-1" id="svg_1" stroke="#000" fill="none"/>
  <path d="m417.5,207c0,1 -0.96729,1.03383 -2,2c-7.76263,7.26234 -24.75378,21.34929 -53,41c-30.73679,21.38339 -59.81024,41.3201 -90,59c-20.87117,12.22269 -32.96394,18.08557 -40,21c-4.97525,2.06082 -6,2 -6,3l0,-1" id="svg_2" stroke="#000" fill="none"/>
  <path d="m210.5,204c0,0 2.11432,0.78575 21,11c18.11195,9.79578 42.00674,22.98601 69,36c29.00726,13.98499 58.42227,27.19019 82,40c17.33047,9.41568 32.04285,17.94028 46,28c11.03409,7.95291 19.95032,14.06024 26,19c4.95975,4.0498 9,8 11,10c2,2 4,3 5,4c0,0 0.61731,1.07611 1,2c0.5412,1.30655 3,2 5,5l2,2l2,3l2,1" id="svg_3" stroke="#000" fill="none"/>
  <path d="m415.5,442c0,0 0,1 0,-1c0,-12 5.91501,-37.50882 19,-64c11.09802,-22.46851 21.94107,-40.74036 32,-54c7.27771,-9.59348 12.88855,-14.19409 18,-17c3.92029,-2.15204 6.07611,-2.61731 7,-3c1.30655,-0.5412 1,-1 1,-2l-1,-1" id="svg_4" stroke="#000" fill="none"/>
  <path d="m597.5,256c0,0 0,3 0,21c0,16 0,35 0,51c0,12 0,21 0,27c0,3 0,5 0,6l0,0l0,0l0,-1" id="svg_5" stroke="#000" fill="none"/>
  <path d="m569.5,338c1,0 2,1 5,4c7,7 15.88452,14.30511 22,23c5.92303,8.42126 10.38531,16.77173 15,25c3.28137,5.85086 4.75531,11.13202 7,15c1.80969,3.11847 3.69342,5.4588 5,6c1.84778,0.76538 8.4668,-3.58414 20,-17c16.69666,-19.42221 34.60553,-46.32385 47,-78c12.67517,-32.39352 17.35449,-58.96414 19,-77c1.27521,-13.97762 1,-22 1,-25c0,-2 0,-3 0,-3c0,0 0,-1 0,-2l0,-2" id="svg_6" stroke="#000" fill="none"/>
  <path d="m654.5,143c0,0 -1,0 -2,0c-2,0 -16,0 -46,0c-69,0 -94,0 -115,0c-16,0 -27.61716,2.12686 -35,8c-6.64041,5.28252 -10.3851,10.37201 -13,14c-1.65381,2.29454 -3,4 -3,5l-1,0l0,0l0,0" id="svg_7" stroke="#000" fill="none"/>
  <path d="m123.5,259c0,1 0,1 0,7c0,12 0,36 0,65c0,29 0,56 0,74c0,10 0,17 0,22l0,2l0,1l0,0" id="svg_8" stroke="#000" fill="none"/>
  <path d="m264.5,441c0,1 1,1 1,1c4,0 9.9827,0.12973 17,1c18.95972,2.35132 41.89343,4.99747 56,6c8.97736,0.638 13,1 15,1l1,-1l0,-4" id="svg_9" stroke="#000" fill="none"/>
 </g>
</svg>
`;
const svgHex = toHex(svg);

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
    it("Should work", async function () {
      const { eis } = await getFixture();
      const zipped = await eis.read.zip([svgHex]);
      const unzipped = await eis.read.unzip([zipped]);
      expect(unzipped).to.equal(svgHex);
    });
  });

  describe("View - Image", function () {
    it("Should work", async function () {
      const { eis } = await getFixture();
      const publicClient = await hre.viem.getPublicClient();

      const zipped = await eis.read.zip([svgHex]);
      const createTxHash = await eis.write.create([
        name,
        description,
        [zipped],
      ]);
      await publicClient.waitForTransactionReceipt({ hash: createTxHash });
      const createdTokenId = BigInt(0);

      const loadedImage = await eis.read.loadImage([createdTokenId]);

      const decodedLoadedImage = Buffer.from(
        loadedImage.split("data:image/svg+xml;base64,")[1],
        "base64"
      ).toString("utf-8");

      expect(decodedLoadedImage).to.equal(svg);

      const erc4883Data = await eis.read.renderTokenById([createdTokenId]);
      expect(erc4883Data).to.equal(svg);

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

      const zipped = await eis.read.zip([svgHex]);
      const createTxHash = await eis.write.create([
        name,
        description,
        [zipped],
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

      const zipped = await eis.read.zip([svgHex]);
      const createTxHash = await eis.write.create([
        name,
        description,
        [zipped],
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

      const zipped = await eis.read.zip([svgHex]);
      const createTxHash = await eis.write.create([
        name,
        description,
        [zipped],
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

      const [, splitAddress, , , splitParams] = await eis.read.records([
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

    const zipped = await eis.read.zip([svgHex]);
    const createTxHash1 = await eis.write.create([name, description, [zipped]]);
    await publicClient.waitForTransactionReceipt({ hash: createTxHash1 });
    const createdTokenId1 = BigInt(0);

    const createTxHash2 = await eis.write.create([name, description, [zipped]]);
    await publicClient.waitForTransactionReceipt({ hash: createTxHash2 });
    const createdTokenId2 = BigInt(1);

    const allocation1 = BigInt("100");
    const allocation2 = BigInt("400");
    const remixTxHash = await eis.write.remix([
      name,
      description,
      [zipped],
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

    const [, splitAddressForCreatedToken1, splitParamsForCreatedToken1] =
      await eis.read.records([createdTokenId1]);

    const [, splitAddressForCreatedToken2, splitParamsForCreatedToken2] =
      await eis.read.records([createdTokenId2]);

    const [, splitAddressForRemixedToken, splitParamsForRemixedToken] =
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
