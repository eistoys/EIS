const PROTOCOL_OWNER_ADDRESS = "0x30be2BE5e49CD1b91B73C967597352382ee880Ba";
const COLLECTION_OWNER_ADDRESS = "0x9cdf2385A3Ab2C8613133B396079075a21561015";

const FIXED_MINT_FEE = BigInt("690000000000000");
const BASIS_POINTS_BASE = BigInt("10000");
const PROTOCOL_FEE_BASIS_POINTS = BigInt("1000");
const COLLECTION_OWNER_FEE_BASIS_POINTS = BigInt("4500");
const REMIX_FEE_BASIS_POINTS = BigInt("1000");
const MAX_SUPPLY = BigInt("10000");

module.exports = [
  PROTOCOL_OWNER_ADDRESS,
  COLLECTION_OWNER_ADDRESS,
  FIXED_MINT_FEE,
  BASIS_POINTS_BASE,
  PROTOCOL_FEE_BASIS_POINTS,
  COLLECTION_OWNER_FEE_BASIS_POINTS,
  REMIX_FEE_BASIS_POINTS,
  MAX_SUPPLY,
];