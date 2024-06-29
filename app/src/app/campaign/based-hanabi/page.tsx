"use client";

import { useState } from "react";
import { ArtworkListItem } from "./_components/ArtworkListItem";
import { ArtworkListItemRankingHeader } from "./_components/ArtworkListItemRankingHeader";

export default function CampaignBasedHanabiPage() {
  const [mode, setMode] = useState<"overview" | "leaderBoard">("overview");

  return (
    <div className="py-8">
      <div className="relative mb-12">
        <img
          src="/assets/campaign/based-hanabi/hero-background.svg"
          className="absolute w-full object-cover h-80 md:h-[500px] opacity-20"
        />
        <div className="relative h-80 md:h-[500px] flex flex-col justify-center">
          <img
            src="/assets/campaign/based-hanabi/hero-text.svg"
            className="w-full max-w-4xl mx-auto"
          />
          <div className="text-white text-4xl md:text-6xl font-bold text-center tracking-wider">
            Remix Contest
          </div>
        </div>
      </div>
      <div className="flex justify-between px-12 max-w-md mx-auto mb-12">
        <div
          className={`p-2 font-bold tracking-wider cursor-pointer ${
            mode === "overview"
              ? "text-white border-b-2 border-white"
              : "text-stone-400"
          }`}
          onClick={() => setMode("overview")}
        >
          OVERVIEW
        </div>
        <div
          className={`p-2 font-bold tracking-wider cursor-pointer ${
            mode === "leaderBoard"
              ? "text-white border-b-2 border-white"
              : "text-stone-400"
          }`}
          onClick={() => setMode("leaderBoard")}
        >
          LEADERBOARD
        </div>
      </div>
      {mode === "overview" && (
        <div>
          <div className="w-full max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 px-4 mb-16">
            <ArtworkListItem />
            <ArtworkListItem />
            <ArtworkListItem />
            <ArtworkListItem />
          </div>
          <div className="text-center font-bold text-white mb-24">
            *All mint fees will be used for this irl
          </div>
          <div className="flex flex-col w-full text-2xl tracking-wide leading-7 text-white max-w-4xl mx-auto px-4 mb-24">
            <div className="text-4xl font-extrabold text-center">
              Description
            </div>
            <div className="mt-16 font-extrabold">Contest Overview</div>
            <div className="mt-5 text-lg leading-6">
              🚀 We’re thrilled to announce a contest using Ethereum Image
              Service (EIS) for our upcoming crypto meetup, Base Hanabi! 🌟 We
              want you to create sticker designs that will be given out at the
              event. Through this contest, let’s empower the Base Hanabi event
              and the culture of Base even more!
            </div>
            <div className="mt-16 font-bold">What is EIS?</div>
            <div className="mt-5 text-lg leading-6">
              Ethereum Image Service (EIS) is a groundbreaking platform that
              allows you to create and share CC0, fully on-chain artworks. It's
              all about public goods and infinite remixability! With EIS, your
              art becomes part of a collaborative canvas in the sky, where
              anyone can remix and create. Plus, you can earn revenue through
              NFTs!
            </div>
            <div className="mt-16 font-bold">What is Hanabi?</div>
            <div className="mt-5 text-lg leading-6">
              Hanabi means &quot;fireworks&quot; in Japanese, symbolizing the
              explosive creativity and vibrant community spirit we want to
              celebrate.
            </div>
            <div className="mt-16 font-bold">Contest Details:</div>
            <div className="mt-5 text-lg leading-6">
              <ul>
                <li>
                  <span className="font-bold">Canvas Size: </span>64x64 pixels
                </li>
                <li>
                  <span className="font-bold">Contest Period: </span>2024/7/XX -
                  7/YY (dates to be confirmed)
                </li>
                <li>
                  <span className="font-bold">Original Images: </span>We’ll
                  provide 4 images for you to remix
                </li>
                <li>
                  <span className="font-bold">Submission: </span>Remix these
                  images into awesome pixel art!
                </li>
              </ul>
            </div>
          </div>
          <div className="flex flex-col w-full text-2xl tracking-wide leading-7 text-white max-w-4xl mx-auto px-4 mb-24">
            <div className="text-4xl font-extrabold text-center">Rewards</div>
            <div className="mt-16 font-bold">Text text text</div>
            <div className="mt-5 text-lg leading-6">
              🚀 We’re thrilled to announce a contest using Ethereum Image
              Service (EIS) for our upcoming crypto meetup, Base Hanabi! 🌟 We
              want you to create sticker designs that will be given out at the
              event. Through this contest, let’s empower the Base Hanabi event
              and the culture of Base even more!
            </div>
            <div className="mt-16 font-bold">Text text text</div>
            <div className="mt-5 text-lg leading-6">
              🚀 We’re thrilled to announce a contest using Ethereum Image
              Service (EIS) for our upcoming crypto meetup, Base Hanabi! 🌟 We
              want you to create sticker designs that will be given out at the
              event. Through this contest, let’s empower the Base Hanabi event
              and the culture of Base even more!
            </div>
            <div className="mt-16 font-bold">Text text text</div>
            <div className="mt-5 text-lg leading-6">
              🚀 We’re thrilled to announce a contest using Ethereum Image
              Service (EIS) for our upcoming crypto meetup, Base Hanabi! 🌟 We
              want you to create sticker designs that will be given out at the
              event. Through this contest, let’s empower the Base Hanabi event
              and the culture of Base even more!
            </div>
          </div>
          <div>
            <div className="text-4xl font-extrabold text-center text-white mb-16">
              Submission
            </div>
            <div className="w-full max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 px-4 mb-16">
              <ArtworkListItem />
              <ArtworkListItem />
              <ArtworkListItem />
              <ArtworkListItem />
            </div>
          </div>
        </div>
      )}
      {mode === "leaderBoard" && (
        <div>
          <div className="w-full max-w-xl mx-auto space-y-16 px-4">
            {Array.from({ length: 9 }, (_, i) => (
              <div>
                <ArtworkListItemRankingHeader
                  ranking={i + 1}
                  title={"Title Title Title Title Title"}
                />
                <ArtworkListItem />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
