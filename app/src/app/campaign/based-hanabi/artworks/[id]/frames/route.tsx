import { createFrames, Button } from "frames.js/next";

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

  const price = "0.00069";
  const cachebuster = new Date().getTime();
  return {
    image: `${process.env.NEXT_PUBLIC_APP_URL}/campaign/based-hanabi/artworks/${tokenId}/image?cachebuster=${cachebuster}`,
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
