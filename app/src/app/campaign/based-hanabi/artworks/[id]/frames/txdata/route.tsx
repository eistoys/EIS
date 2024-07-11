import { Abi, encodeFunctionData } from "viem";

import { NextRequest, NextResponse } from "next/server";
import { TransactionTargetResponse } from "frames.js";
import { eisHanabiAbi } from "@/app/campaign/based-hanabi/_lib/eis/abi";
import { EIS_HANABI_ADDRESS } from "@/app/campaign/based-hanabi/_lib/eis/constants";

export async function POST(
  req: NextRequest
): Promise<NextResponse<TransactionTargetResponse>> {
  const url = new URL(req.url);
  const tokenId = url.searchParams.get("tokenId");

  if (!tokenId) {
    throw new Error("Token ID not defined");
  }

  const calldata = encodeFunctionData({
    abi: eisHanabiAbi,
    functionName: "mint",
    args: [BigInt(tokenId), BigInt(1)],
  });

  return NextResponse.json({
    chainId: "eip155:84532",
    method: "eth_sendTransaction",
    params: {
      abi: eisHanabiAbi as Abi,
      to: EIS_HANABI_ADDRESS,
      data: calldata,
      value: "690000000000000",
    },
  });
}
