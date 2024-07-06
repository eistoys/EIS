"use client";

import { useMemo, useState } from "react";
import { ArtworkListItem } from "./_components/ArtworkListItem";
import { ArtworkListItemRankingHeader } from "./_components/ArtworkListItemRankingHeader";
import { Record } from "./_types/Record";
import { gql, useQuery } from "@apollo/client";

const mockImage =
  "data:image/png;base64,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";

const GET_LATEST_RECORDS = gql`
  query GetLatestRecords {
    hanabiRecords(first: 21, orderBy: tokenId, orderDirection: desc) {
      tokenId
      creator
      uri
    }
  }
`;

const GET_LEADERBOARD_RECORDS = gql`
  query GetLeaderboardRecords {
    hanabiRecords(first: 100, orderBy: minted, orderDirection: desc) {
      tokenId
      creator
      uri
      referedFrom
      minted
      name
    }
  }
`;

export default function CampaignBasedHanabiPage() {
  const { data: latestData } = useQuery(GET_LATEST_RECORDS);
  const { data: leaderboardData } = useQuery(GET_LEADERBOARD_RECORDS);

  const latestRecords = useMemo<Record[]>(() => {
    if (!latestData) {
      return [];
    }
    return latestData.hanabiRecords.map((record: any) => {
      return {
        image: JSON.parse(record.uri.split("data:application/json;utf8,")[1])
          .image,
        ...record,
      };
    });
  }, [latestData]);

  const leaderboardRecords = useMemo<Record[]>(() => {
    if (!leaderboardData) {
      return [];
    }
    return leaderboardData.hanabiRecords.map((record: any) => {
      return {
        image: JSON.parse(record.uri.split("data:application/json;utf8,")[1])
          .image,
        ...record,
      };
    });
  }, [leaderboardData]);

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
          <div className="text-white text-4xl md:text-6xl font-bold text-center">
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
            <ArtworkListItem
              tokenId="1"
              image={mockImage}
              creator="consome.eth"
            />
            <ArtworkListItem
              tokenId="1"
              image={mockImage}
              creator="consome.eth"
            />
            <ArtworkListItem
              tokenId="1"
              image={mockImage}
              creator="consome.eth"
            />
            <ArtworkListItem
              tokenId="1"
              image={mockImage}
              creator="consome.eth"
            />
          </div>
          <div className="text-center font-bold text-white mb-24">
            *All mint fees will be used for this irl
          </div>
          <div className="flex flex-col w-full text-2xl tracking-wide leading-7 text-white max-w-4xl mx-auto px-4 mb-24 tracking-wider">
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
          <div className="tracking-wider">
            <div className="text-4xl font-extrabold text-center text-white mb-16">
              Submission
            </div>
            <div className="w-full max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 px-4 mb-16">
              {latestRecords.map((record, i) => {
                return (
                  <div key={i}>
                    <ArtworkListItem
                      tokenId={record.tokenId}
                      creator={record.creator}
                      image={record.image}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
      {mode === "leaderBoard" && (
        <div>
          <div className="w-full max-w-xl mx-auto space-y-16 px-4">
            {leaderboardRecords.map((record, i) => {
              return (
                <div key={i}>
                  <ArtworkListItemRankingHeader
                    ranking={i + 1}
                    title={record.name}
                    minted={record.minted}
                  />
                  <ArtworkListItem
                    tokenId={record.tokenId}
                    creator={record.creator}
                    image={record.image}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
