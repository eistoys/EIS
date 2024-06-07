import { Abi, encodeFunctionData } from "viem";

import { eisAbi } from "@/lib/eis/abi";
import { EIS_ADDRESS } from "@/lib/eis/constants";
import { NextRequest, NextResponse } from "next/server";
import { TransactionTargetResponse } from "frames.js";

export async function POST(
  req: NextRequest
): Promise<NextResponse<TransactionTargetResponse>> {
  const url = new URL(req.url);
  const tokenId = url.searchParams.get("tokenId");

  const calldata = encodeFunctionData({
    abi: eisAbi,
    functionName: "mint",
    args: [tokenId, 1],
  });

  return NextResponse.json({
    chainId: "eip155:11155111",
    method: "eth_sendTransaction",
    params: {
      abi: eisAbi as Abi,
      to: EIS_ADDRESS,
      data: calldata,
    },
  });
}
