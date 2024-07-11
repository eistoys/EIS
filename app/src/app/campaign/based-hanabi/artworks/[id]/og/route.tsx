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

  const templateImageUrl =
    "https://eis.toys/assets/ogp-hanabi-artwork-template.png";

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "1200px",
          height: "630px",
          position: "relative",
        }}
      >
        <img
          src={templateImageUrl}
          alt="Template"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "50px",
            right: "50px",
            width: "500px",
            height: "500px",
            overflow: "hidden",
            display: "flex",
            borderRadius: "24px",
          }}
        >
          <img
            src={dyamicImageDataUrl}
            alt="Dynamic Image"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
