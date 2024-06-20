import hre from "hardhat";
import { toHex, Hex } from "viem";
import { expect } from "chai";

import { TREASURY_ADDRESS, ZORA_BASE_FACTORY_ADDRESS } from "../config";

import { getContract } from "viem";

import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import solady from "solady";

import { smallSVG, middleSVG, largeSVG } from "./data";

const name = "name";
const description = "description";

// use small svg to test zip funcionality and faster test
const smallSVGHex = toHex(smallSVG);

// use middle for other tests
const middleSVGHex = toHex(middleSVG);

// use large svg to test unzip capacity
const largeSVGHex = toHex(largeSVG);

const getFixture = async () => {
  const [creator] = await hre.viem.getWalletClients();
  const eisz = await hre.viem.deployContract("EISZ", [
    ZORA_BASE_FACTORY_ADDRESS,
    TREASURY_ADDRESS
  ]);

  return { creator, eisz };
};

describe("EIPZ", function () {
  describe("", () => {
    it("Should work", async () => {
      const { eisz } = await getFixture();
      expect(eisz.address).not.to.be.undefined;
    });
  });


  describe("View - Zip", () => {
    it("Should work zip", async () => {
      const { eisz } = await getFixture();
      const zippedOffchain = solady.LibZip.flzCompress(smallSVGHex) as Hex;
      const zipped = await eisz.read.zip([smallSVGHex]);
      expect(zippedOffchain).to.equal(zipped);
    });

    it("Should work unzip", async () => {
      const { eisz } = await getFixture();
      const zipped = solady.LibZip.flzCompress(largeSVGHex) as Hex;
      const unzipped = await eisz.read.unzip([zipped]);
      expect(unzipped).to.equal(largeSVGHex);
    });
  });
});