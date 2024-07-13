export const EIS_HANABI_ADDRESS =
  process.env.NEXT_PUBLIC_NETWORK == "mainnet"
    ? "0xe7a00ba7dfd68118c4fa3fdc618167f389e9d0b4"
    : "0x4e1c2d80b924d300e902f06b198a7645c94162cd";

export const MINT_PRICE = BigInt("690000000000000");
export const GAS_LIMIT = BigInt("50000");
