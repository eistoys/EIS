"use client";

import { useMemo, useState } from "react";
import { ArtworkListItem } from "./_components/ArtworkListItem";
import { ArtworkListItemRankingHeader } from "./_components/ArtworkListItemRankingHeader";
import { Record } from "./_types/Record";
import { gql, useQuery } from "@apollo/client";

import Markdown from "react-markdown";
import { basedHanabiDescription } from "./_data/based-hanabi-description";

const mockImage =
  "data:image/png;base64,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";

const GET_LATEST_RECORDS = gql`
  query GetLatestRecords {
    hanabiRecords(first: 1000, orderBy: tokenId, orderDirection: desc) {
      tokenId
      creator
      uri
      minted
    }
  }
`;

const GET_LEADERBOARD_RECORDS = gql`
  query GetLeaderboardRecords {
    hanabiRecords(first: 1000, orderBy: minted, orderDirection: desc) {
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

  const [mode, setMode] = useState<"new" | "trend">("new");

  return (
    <div className="py-8">
      <div className="relative mb-24">
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
      <div className="text-4xl font-extrabold text-center text-white">
        THEME
      </div>
      <div className="w-full max-w-6xl mx-auto flex overflow-x-auto gap-8 px-4 mb-24 py-16">
        <div className="flex-none w-64 h-80">
          <ArtworkListItem
            tokenId="1"
            image={mockImage}
            creator={"0xab95e42096Ef6C18eD278f4FcA25754c96E60aae"}
            minted={0}
          />
        </div>
        <div className="flex-none w-64 h-80">
          <ArtworkListItem
            tokenId="1"
            image={mockImage}
            creator="consome.eth"
            minted={0}
          />
        </div>
        <div className="flex-none w-64 h-80">
          <ArtworkListItem
            tokenId="1"
            image={mockImage}
            creator="consome.eth"
            minted={0}
          />
        </div>
        <div className="flex-none w-64 h-80">
          <ArtworkListItem
            tokenId="1"
            image={mockImage}
            creator="consome.eth"
            minted={0}
          />
        </div>
      </div>
      <div className="text-4xl font-extrabold text-center text-white mb-12">
        GALLERY
      </div>
      <div className="flex text-sm md:text-base justify-center max-w-md mx-auto mb-12 px-3 space-x-24">
        <div
          className={`p-2 text-sm md:text-base font-bold tracking-wider cursor-pointer ${
            mode === "new"
              ? "text-white border-b-2 border-white"
              : "text-stone-400"
          }`}
          onClick={() => setMode("new")}
        >
          NEW
        </div>
        <div
          className={`p-2 text-sm md:text-base font-bold tracking-wider cursor-pointer ${
            mode === "trend"
              ? "text-white border-b-2 border-white"
              : "text-stone-400"
          }`}
          onClick={() => setMode("trend")}
        >
          TREND
        </div>
      </div>
      {mode === "new" && (
        <div className="tracking-wider">
          <div className="w-full max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 px-4 mb-16">
            {latestRecords.map((record, i) => {
              return (
                <div key={i}>
                  <ArtworkListItem
                    tokenId={record.tokenId}
                    creator={record.creator}
                    image={record.image}
                    minted={record.minted}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}
      {mode === "trend" && (
        <div>
          <div className="w-full max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 px-4 mb-16">
            {leaderboardRecords.map((record, i) => {
              return (
                <div key={i}>
                  <ArtworkListItem
                    tokenId={record.tokenId}
                    creator={record.creator}
                    image={record.image}
                    minted={record.minted}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}
      <div className="w-full max-w-4xl mx-auto px-4 py-12" id="description">
        <Markdown className={"markdown"}>{basedHanabiDescription}</Markdown>
      </div>
    </div>
  );
}
