import { Button } from "frames.js/next";
import { frames } from "./frames";

import { readContract } from "@wagmi/core";
import { wagmiConfig } from "@/lib/wagmi";
import { eisAbi } from "@/lib/eis/abi";
import { EIS_ADDRESS, EIS_ADDRESS_ARCHIVE_1 } from "@/lib/eis/constants";

export const runtime = "edge";

// const robotoRegularFont = fetch(
//   new URL("/public/fonts/Roboto-Regular.ttf", import.meta.url)
// ).then((res) => res.arrayBuffer());
// const robotoBoldFont = fetch(
//   new URL("/public/fonts/Roboto-Bold.ttf", import.meta.url)
// ).then((res) => res.arrayBuffer());

const handleRequest = frames(async (ctx) => {
  // const [robotoRegularFontData, robotoBoldFontData] = await Promise.all([
  //   robotoRegularFont,
  //   robotoBoldFont,
  // ]);

  let ver = ctx.url.searchParams.get("ver");
  if (!ver) {
    ver = "testnet-1";
  }

  if (ver == "testnet-1") {
    const tokenId = ctx.url.pathname.split("/").pop();
    if (!tokenId) {
      throw new Error("Token ID not defined");
    }
    const image = await readContract(wagmiConfig, {
      address: EIS_ADDRESS_ARCHIVE_1,
      abi: eisAbi,
      functionName: "loadImage",
      args: [BigInt(tokenId)],
    });

    const price = "0.00069";

    return {
      image: <img src={image} />,
      buttons: [
        <Button
          action="tx"
          target={{ pathname: "/txdata", query: { tokenId } }}
          post_url={`/${tokenId}`}
        >
          {`MINT (${price} ETH)`}
        </Button>,
        <Button
          action="link"
          target={`https://eis.toys/create?referenceTokenId=${tokenId}&ver=${ver}`}
        >
          REMIX
        </Button>,
      ],
      imageOptions: {
        // fonts: [
        //   {
        //     name: "Robot",
        //     data: robotoRegularFontData,
        //     weight: 400,
        //   },
        //   {
        //     name: "Robot",
        //     data: robotoBoldFontData,
        //     weight: 700,
        //   },
        // ],
        aspectRatio: "1:1",
      },
    };
  } else if (ver === "testnet-2") {
    const tokenId = ctx.url.pathname.split("/").pop();
    if (!tokenId) {
      throw new Error("Token ID not defined");
    }
    const image = await readContract(wagmiConfig, {
      address: EIS_ADDRESS,
      abi: eisAbi,
      functionName: "loadImage",
      args: [BigInt(tokenId)],
    });

    const price = "0.00069";

    return {
      image: <img src={image} />,
      buttons: [
        <Button
          action="tx"
          target={{ pathname: "/txdata", query: { tokenId } }}
          post_url={`/${tokenId}`}
        >
          {`MINT (${price} ETH)`}
        </Button>,
        <Button
          action="link"
          target={`https://eis.toys/create?referenceTokenId=${tokenId}&ver=${ver}`}
        >
          REMIX
        </Button>,
      ],
      imageOptions: {
        // fonts: [
        //   {
        //     name: "Robot",
        //     data: robotoRegularFontData,
        //     weight: 400,
        //   },
        //   {
        //     name: "Robot",
        //     data: robotoBoldFontData,
        //     weight: 700,
        //   },
        // ],
        aspectRatio: "1:1",
      },
    };
  } else {
    throw new Error("not implemented");
  }
});

export const GET = handleRequest;
export const POST = handleRequest;
