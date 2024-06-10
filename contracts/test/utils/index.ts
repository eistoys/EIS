import { Hex } from "viem";

export const CHUNK_SIZE = 24576;
export const KB = 1024;

export const hexToBuffer = (hex: Hex) => {
  return Buffer.from(hex.slice(2), "hex");
};

export const chunkBuffer = (buffer: Buffer, chunkSize: number) => {
  const chunks = [];
  for (let i = 0; i < buffer.length; i += chunkSize) {
    chunks.push(buffer.slice(i, i + chunkSize));
  }
  return chunks;
};

export const chunksToHexChunks = (chunks: Buffer[]) => {
  return chunks.map((chunk) => bufferToHexString(chunk));
};

export const bufferToHexString = (buffer: Buffer) => {
  return ("0x" + buffer.toString("hex")) as Hex;
};

export const chunk = (hex: Hex) => {
  const buffer = hexToBuffer(hex);
  const chunks = chunkBuffer(buffer, CHUNK_SIZE - 1);
  return chunksToHexChunks(chunks);
};
