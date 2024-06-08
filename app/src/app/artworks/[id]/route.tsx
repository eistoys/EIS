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
    image: (
      <div tw="flex bg-neutral-800">
        <div tw="flex w-6/12 p-8">
          <img
            loading="lazy"
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/eceeae9e998c00c77f9c55f79f09b4a51381bfc1621f3a0f1a40136df5f2e09f?apiKey=5b267050b6bf44e5a34a2a79f0903d25&width=100 100w, https://cdn.builder.io/api/v1/image/assets/TEMP/eceeae9e998c00c77f9c55f79f09b4a51381bfc1621f3a0f1a40136df5f2e09f?apiKey=5b267050b6bf44e5a34a2a79f0903d25&width=200 200w, https://cdn.builder.io/api/v1/image/assets/TEMP/eceeae9e998c00c77f9c55f79f09b4a51381bfc1621f3a0f1a40136df5f2e09f?apiKey=5b267050b6bf44e5a34a2a79f0903d25&width=400 400w, https://cdn.builder.io/api/v1/image/assets/TEMP/eceeae9e998c00c77f9c55f79f09b4a51381bfc1621f3a0f1a40136df5f2e09f?apiKey=5b267050b6bf44e5a34a2a79f0903d25&width=800 800w, https://cdn.builder.io/api/v1/image/assets/TEMP/eceeae9e998c00c77f9c55f79f09b4a51381bfc1621f3a0f1a40136df5f2e09f?apiKey=5b267050b6bf44e5a34a2a79f0903d25&width=1200 1200w, https://cdn.builder.io/api/v1/image/assets/TEMP/eceeae9e998c00c77f9c55f79f09b4a51381bfc1621f3a0f1a40136df5f2e09f?apiKey=5b267050b6bf44e5a34a2a79f0903d25&width=1600 1600w, https://cdn.builder.io/api/v1/image/assets/TEMP/eceeae9e998c00c77f9c55f79f09b4a51381bfc1621f3a0f1a40136df5f2e09f?apiKey=5b267050b6bf44e5a34a2a79f0903d25&width=2000 2000w, https://cdn.builder.io/api/v1/image/assets/TEMP/eceeae9e998c00c77f9c55f79f09b4a51381bfc1621f3a0f1a40136df5f2e09f?apiKey=5b267050b6bf44e5a34a2a79f0903d25&"
          />
        </div>
        <div tw="flex flex-col w-6/12 py-16 pr-12">
          <div tw="flex flex-col text-xs text-white">
            <div tw="text-4xl font-bold">TITLE TITLE TITLE TITLE TITLE</div>
            <div tw="mt-4 text-2xl text-zinc-400">yamadatarou.eth</div>
            <div tw="mt-4 text-2xl leading-7">
              This piece delves into the therapeutic role of art in our lives.
              It highlights how art can transport us to places of calmness and
              tranquillity, symbolized by nature and water, providing a reprieve
              from the chaos of daily city life.
            </div>
            <div tw="mt-8 text-2xl font-bold">0.00069 ETH</div>
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
        target={`https://eis.toys/create?tokenId=${tokenId}`}
      >
        REMIX
      </Button>,
    ],
  };
});

export const GET = handleRequest;
export const POST = handleRequest;
