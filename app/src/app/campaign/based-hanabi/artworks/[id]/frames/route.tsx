import { createFrames, Button } from "frames.js/next";
import { readContract } from "@wagmi/core";
import { wagmiConfig } from "@/lib/wagmi";
import { EIS_HANABI_ADDRESS } from "../../../_lib/eis/constants";
import { eisHanabiAbi } from "../../../_lib/eis/abi";

import path from "path";

const frames = createFrames({
  basePath: "/",
});

const handleRequest = frames(async (ctx) => {
  const parts = ctx.url.pathname.split(path.sep);
  const tokenId = parts[4];
  if (!tokenId) {
    throw new Error("Token ID not defined");
  }

  const dyamicImageDataUrl = await readContract(wagmiConfig, {
    address: EIS_HANABI_ADDRESS,
    abi: eisHanabiAbi,
    functionName: "loadImageDataUrl",
    args: [BigInt(tokenId)],
  });

  const price = "0.00069";

  return {
    image: <img src={dyamicImageDataUrl} />,
    buttons: [
      <Button
        action="tx"
        target={{
          pathname: `/campaign/based-hanabi/artworks/${tokenId}/frames/txdata`,
          query: { tokenId },
        }}
        post_url={`/campaign/based-hanabi/artworks/${tokenId}/frames`}
      >
        {`MINT (${price} ETH)`}
      </Button>,
      <Button
        action="link"
        target={`https://eis.toys/campaign/based-hanabi/artworks/create?referenceTokenId=${tokenId}`}
      >
        REMIX
      </Button>,
    ],
    imageOptions: {
      aspectRatio: "1:1",
      width: 256,
      height: 256,
    },
    headers: {
      "Cache-Control": "max-age=0",
    },
  };
});

export const GET = handleRequest;
export const POST = handleRequest;
