import { Button } from "frames.js/next";
import { frames } from "./frames";

import { readContract } from "@wagmi/core";
import { wagmiConfig } from "@/lib/wagmi";
import { eisAbi } from "@/lib/eis/abi";
import { EIS_ADDRESS } from "@/lib/eis/constants";

const handleRequest = frames(async (ctx) => {
  const tokenId = ctx.url.pathname.split("/").pop();
  console.log("tokenId", tokenId);

  const image = await readContract(wagmiConfig, {
    address: EIS_ADDRESS,
    abi: eisAbi,
    functionName: "loadImage",
    args: [tokenId],
  });

  console.log(image);

  return {
    image: <img src={image as string} />,
    buttons: [
      <Button
        action="tx"
        target={{ pathname: "../../txdata", query: { tokenId } }}
        post_url={`/${tokenId}`}
      >
        MINT
      </Button>,
    ],
  };
});

export const GET = handleRequest;
export const POST = handleRequest;
