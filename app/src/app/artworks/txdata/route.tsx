import { Abi, encodeFunctionData, zeroAddress } from "viem";

import { eisAbi } from "@/lib/eis/abi";
import { EIS_ADDRESS } from "@/lib/eis/constants";
import { NextRequest, NextResponse } from "next/server";
import { TransactionTargetResponse } from "frames.js";

export async function POST(
  req: NextRequest
): Promise<NextResponse<TransactionTargetResponse>> {
  const url = new URL(req.url);
  const tokenId = url.searchParams.get("tokenId");

  if (!tokenId) {
    throw new Error("Token ID not defined");
  }

  const calldata = encodeFunctionData({
    abi: eisAbi,
    functionName: "mint",
    args: [BigInt(tokenId), BigInt(1), zeroAddress],
  });

  return NextResponse.json({
    chainId: "eip155:84532",
    method: "eth_sendTransaction",
    params: {
      abi: eisAbi as Abi,
      to: EIS_ADDRESS,
      data: calldata,
      value: "690000000000000",
    },
  });
}
