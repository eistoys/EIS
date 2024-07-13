import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import { readContract } from "@wagmi/core";
import { wagmiConfig } from "@/lib/wagmi";
import { EIS_HANABI_ADDRESS } from "../../../_lib/eis/constants";
import { eisHanabiAbi } from "../../../_lib/eis/abi";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const id = searchParams.get("id") as string;

  const dyamicImageDataUrl = await readContract(wagmiConfig, {
    address: EIS_HANABI_ADDRESS,
    abi: eisHanabiAbi,
    functionName: "loadImageDataUrl",
    args: [BigInt(id)],
  });

  return new ImageResponse(<img src={dyamicImageDataUrl} />, {
    width: 256,
    height: 256,
  });
}
