import hre from "hardhat";
import { toHex } from "viem";

describe("EIP", function () {
  describe("Test", function () {
    it("Should work", async function () {
      const publicClient = await hre.viem.getPublicClient();

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

      const eis = await hre.viem.deployContract("EIS");
      console.log("EIS deployed to:", eis.address);

      console.log("svgHex", svgHex);
      const zipped = await eis.read.zip([svgHex]);

      console.log("zipped", zipped);
      const createTxHash = await eis.write.create([[zipped]]);
      await publicClient.waitForTransactionReceipt({ hash: createTxHash });

      const createdTokenId = BigInt(0);
      const loaded = await eis.read.loadImage([createdTokenId]);

      console.log("loaded", loaded);

      const erc4883Data = await eis.read.renderTokenById([createdTokenId]);
      console.log("erc4883Data", erc4883Data);

      const tokenURI = await eis.read.uri([createdTokenId]);
      console.log("tokenURI", tokenURI);

      const amount = BigInt(1);
      const mintTxHash = await eis.write.mint([createdTokenId, amount]);
      await publicClient.waitForTransactionReceipt({ hash: mintTxHash });
    });
  });
});
