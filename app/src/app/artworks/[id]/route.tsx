import { Button } from "frames.js/next";
import { frames } from "./frames";

import { readContract } from "@wagmi/core";
import { wagmiConfig } from "@/lib/wagmi";
import { eisAbi } from "@/lib/eis/abi";
import { EIS_ADDRESS } from "@/lib/eis/constants";
import { truncateString } from "@/lib/utils";

export const runtime = "edge";

const robotoRegularFont = fetch(
  new URL("/public/fonts/Roboto-Regular.ttf", import.meta.url)
).then((res) => res.arrayBuffer());
const robotoBoldFont = fetch(
  new URL("/public/fonts/Roboto-Bold.ttf", import.meta.url)
).then((res) => res.arrayBuffer());

const handleRequest = frames(async (ctx) => {
  const [robotoRegularFontData, robotoBoldFontData] = await Promise.all([
    robotoRegularFont,
    robotoBoldFont,
  ]);

  const tokenId = ctx.url.pathname.split("/").pop();
  if (!tokenId) {
    throw new Error("Token ID not defined");
  }

  const uri = await readContract(wagmiConfig, {
    address: EIS_ADDRESS,
    abi: eisAbi,
    functionName: "uri",
    args: [BigInt(tokenId)],
  });

  const metadata = JSON.parse(uri.split("data:application/json;utf8,")[1]);

  return {
    image: (
      <div tw="flex bg-neutral-800 rounded-xl">
        <div tw="flex w-6/12 p-8 my-auto">
          <img src={metadata.image} tw="bg-white rounded-xl" />
        </div>
        <div tw="flex flex-col w-6/12 py-20 pr-12">
          <div tw="flex flex-col text-xs text-white h-full">
            <div tw="text-[2.625rem] font-bold">
              {truncateString(metadata.name, 20)}
            </div>
            <div tw="mt-4 text-2xl text-zinc-400">{metadata.creator}</div>
            <div tw="mt-4 text-2xl leading-8">
              {truncateString(metadata.description, 200)}
            </div>
            <div tw="mt-auto text-3xl font-bold">0.00069 ETH</div>
          </div>
        </div>
      </div>
    ),
    buttons: [
      <Button
        action="tx"
        target={{ pathname: "/txdata", query: { tokenId } }}
        post_url={`/${tokenId}`}
      >
        MINT
      </Button>,
      <Button
        action="link"
        target={`https://eis.toys/create?referenceTokenId=${tokenId}`}
      >
        REMIX
      </Button>,
    ],
    imageOptions: {
      fonts: [
        {
          name: "Robot",
          data: robotoRegularFontData,
          weight: 400,
        },
        {
          name: "Robot",
          data: robotoBoldFontData,
          weight: 700,
        },
      ],
    },
  };
});

export const GET = handleRequest;
export const POST = handleRequest;
