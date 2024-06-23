"use client";

import { gql, useQuery } from "@apollo/client";
import Link from "next/link";
import { useMemo } from "react";
import { Record } from "@/types/record";

const GET_RECORDS = gql`
  query GetRecords {
    records(first: 21, orderBy: tokenId, orderDirection: desc) {
      tokenId
      creator
      uri
      referTo
      referedFrom
    }
  }
`;

export default function Home() {
  const { data } = useQuery(GET_RECORDS);

  const records = useMemo(() => {
    if (!data) {
      return [];
    }
    return data.records.map((record: any) => {
      return {
        tokenId: record.tokenId,
        creator: record.creator,
        image: JSON.parse(record.uri.split("data:application/json;utf8,")[1])
          .image,
        referTo: record.referTo,
        referedFrom: record.referedFrom,
      };
    });
  }, [data]);

  return (
    <div>
      <div className="flex flex-col justify-center items-center">
        <div className="flex justify-center items-center px-16 mt-20 w-full max-md:px-5 max-md:mt-10 max-md:max-w-full">
          <div className="max-w-full w-[903px]">
            <div className="flex gap-5 max-md:flex-col max-md:gap-0">
              <div className="flex flex-col w-6/12 max-md:w-full max-md:items-center">
                <img
                  loading="lazy"
                  src="https://cdn.builder.io/api/v1/image/assets/TEMP/b621c13f5e3d6a53bc6754f9636f0f80cc184f2f3310336462ddfbcdd1b38a36?apiKey=5b267050b6bf44e5a34a2a79f0903d25&"
                  className="w-full aspect-square max-md:w-3/5 max-md:mt-10"
                />
              </div>
              <div className="flex flex-col ml-24 w-6/12 max-md:w-full max-md:ml-0 max-md:items-center">
                <div className="self-stretch my-auto text-7xl font-black text-white leading-[96px] tracking-[4px] max-md:text-center max-md:text-5xl max-md:leading-[60px] max-md:mt-5">
                  Ethereum
                  <br />
                  Image
                  <br />
                  Service
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-16 text-4xl tracking-wide text-center text-white leading-[58px] max-md:mt-10 max-md:max-w-full max-md:text-2xl max-md:leading-[36px] mb-12">
          Ethereum Image Service is an Infinite Remixable CC0 Garden.
        </div>
        <Link href="/create" className="w-full flex justify-center px-4">
          <button className="w-full max-w-xl text-xl p-4 font-bold text-[#22CC02] rounded-2xl bg-[#1A331A] border-2 border-[#00FF00] hover:opacity-75 transition-opacity duration-300 tracking-wider text-center">
            LAUNCH APP
          </button>
        </Link>
        <div className="justify-center px-5 mt-20 max-w-full w-[900px] max-md:mt-10">
          <div className="flex gap-12 max-md:flex-col max-md:gap-0">
            <div className="flex flex-col w-[33%] max-md:ml-0 max-md:w-full">
              <a href="https://x.com/eistoys" target="_blank">
                <div className="flex flex-col justify-center text-xl font-semibold tracking-wide leading-5 text-center text-black max-md:mt-10">
                  <div className="flex flex-col py-12 px-4 bg-white rounded-[48px] max-md:px-5 h-64">
                    <img
                      loading="lazy"
                      srcSet="https://cdn.builder.io/api/v1/image/assets/TEMP/ec81fe7f92468270382e1e84ff023099fe3f0068389c45209cf532227934666b?apiKey=5b267050b6bf44e5a34a2a79f0903d25&width=100 100w, https://cdn.builder.io/api/v1/image/assets/TEMP/ec81fe7f92468270382e1e84ff023099fe3f0068389c45209cf532227934666b?apiKey=5b267050b6bf44e5a34a2a79f0903d25&width=200 200w, https://cdn.builder.io/api/v1/image/assets/TEMP/ec81fe7f92468270382e1e84ff023099fe3f0068389c45209cf532227934666b?apiKey=5b267050b6bf44e5a34a2a79f0903d25&width=400 400w, https://cdn.builder.io/api/v1/image/assets/TEMP/ec81fe7f92468270382e1e84ff023099fe3f0068389c45209cf532227934666b?apiKey=5b267050b6bf44e5a34a2a79f0903d25&width=800 800w, https://cdn.builder.io/api/v1/image/assets/TEMP/ec81fe7f92468270382e1e84ff023099fe3f0068389c45209cf532227934666b?apiKey=5b267050b6bf44e5a34a2a79f0903d25&width=1200 1200w, https://cdn.builder.io/api/v1/image/assets/TEMP/ec81fe7f92468270382e1e84ff023099fe3f0068389c45209cf532227934666b?apiKey=5b267050b6bf44e5a34a2a79f0903d25&width=1600 1600w, https://cdn.builder.io/api/v1/image/assets/TEMP/ec81fe7f92468270382e1e84ff023099fe3f0068389c45209cf532227934666b?apiKey=5b267050b6bf44e5a34a2a79f0903d25&width=2000 2000w, https://cdn.builder.io/api/v1/image/assets/TEMP/ec81fe7f92468270382e1e84ff023099fe3f0068389c45209cf532227934666b?apiKey=5b267050b6bf44e5a34a2a79f0903d25&"
                      className="self-center bg-black rounded-full aspect-square h-[120px] w-[120px]"
                    />
                    <div className="mt-6">Follow on X</div>
                  </div>
                </div>
              </a>
            </div>

            <div className="flex flex-col ml-5 w-[33%] max-md:ml-0 max-md:w-full">
              <a href="https://warpcast.com/eistoys" target="_blank">
                <div className="flex flex-col justify-center text-xl font-bold tracking-wide leading-5 text-center text-black max-md:mt-10">
                  <div className="flex flex-col py-12 px-4 bg-white rounded-[48px] max-md:px-5 h-64">
                    <img
                      loading="lazy"
                      srcSet="https://cdn.builder.io/api/v1/image/assets/TEMP/8c02bc8f04abd1c0707558d903eab0aaddcb184cf9c3db80a4404436d9a99f36?apiKey=5b267050b6bf44e5a34a2a79f0903d25&width=100 100w, https://cdn.builder.io/api/v1/image/assets/TEMP/8c02bc8f04abd1c0707558d903eab0aaddcb184cf9c3db80a4404436d9a99f36?apiKey=5b267050b6bf44e5a34a2a79f0903d25&width=200 200w, https://cdn.builder.io/api/v1/image/assets/TEMP/8c02bc8f04abd1c0707558d903eab0aaddcb184cf9c3db80a4404436d9a99f36?apiKey=5b267050b6bf44e5a34a2a79f0903d25&width=400 400w, https://cdn.builder.io/api/v1/image/assets/TEMP/8c02bc8f04abd1c0707558d903eab0aaddcb184cf9c3db80a4404436d9a99f36?apiKey=5b267050b6bf44e5a34a2a79f0903d25&width=800 800w, https://cdn.builder.io/api/v1/image/assets/TEMP/8c02bc8f04abd1c0707558d903eab0aaddcb184cf9c3db80a4404436d9a99f36?apiKey=5b267050b6bf44e5a34a2a79f0903d25&width=1200 1200w, https://cdn.builder.io/api/v1/image/assets/TEMP/8c02bc8f04abd1c0707558d903eab0aaddcb184cf9c3db80a4404436d9a99f36?apiKey=5b267050b6bf44e5a34a2a79f0903d25&width=1600 1600w, https://cdn.builder.io/api/v1/image/assets/TEMP/8c02bc8f04abd1c0707558d903eab0aaddcb184cf9c3db80a4404436d9a99f36?apiKey=5b267050b6bf44e5a34a2a79f0903d25&width=2000 2000w, https://cdn.builder.io/api/v1/image/assets/TEMP/8c02bc8f04abd1c0707558d903eab0aaddcb184cf9c3db80a4404436d9a99f36?apiKey=5b267050b6bf44e5a34a2a79f0903d25&"
                      className="self-center bg-violet-800 rounded-full aspect-square h-[120px] w-[120px]"
                    />
                    <div className="mt-6">Follow on Farcaster</div>
                  </div>
                </div>
              </a>
            </div>

            <div className="flex flex-col ml-5 w-[33%] max-md:ml-0 max-md:w-full">
              <a href="https://github.com/eistoys/EIS" target="_blank">
                <div className="flex flex-col justify-center text-xl font-bold tracking-wide leading-5 text-center text-black max-md:mt-10">
                  <div className="flex flex-col py-12 px-4 bg-white rounded-[48px] max-md:px-5 h-64">
                    <img
                      loading="lazy"
                      srcSet="https://cdn.builder.io/api/v1/image/assets/TEMP/6e682ee4a3f3eb065311cf98b28a9418b30cf73d2e42e1476631f3fbcf2cd2e9?apiKey=5b267050b6bf44e5a34a2a79f0903d25&width=100 100w, https://cdn.builder.io/api/v1/image/assets/TEMP/6e682ee4a3f3eb065311cf98b28a9418b30cf73d2e42e1476631f3fbcf2cd2e9?apiKey=5b267050b6bf44e5a34a2a79f0903d25&width=200 200w, https://cdn.builder.io/api/v1/image/assets/TEMP/6e682ee4a3f3eb065311cf98b28a9418b30cf73d2e42e1476631f3fbcf2cd2e9?apiKey=5b267050b6bf44e5a34a2a79f0903d25&width=400 400w, https://cdn.builder.io/api/v1/image/assets/TEMP/6e682ee4a3f3eb065311cf98b28a9418b30cf73d2e42e1476631f3fbcf2cd2e9?apiKey=5b267050b6bf44e5a34a2a79f0903d25&width=800 800w, https://cdn.builder.io/api/v1/image/assets/TEMP/6e682ee4a3f3eb065311cf98b28a9418b30cf73d2e42e1476631f3fbcf2cd2e9?apiKey=5b267050b6bf44e5a34a2a79f0903d25&width=1200 1200w, https://cdn.builder.io/api/v1/image/assets/TEMP/6e682ee4a3f3eb065311cf98b28a9418b30cf73d2e42e1476631f3fbcf2cd2e9?apiKey=5b267050b6bf44e5a34a2a79f0903d25&width=1600 1600w, https://cdn.builder.io/api/v1/image/assets/TEMP/6e682ee4a3f3eb065311cf98b28a9418b30cf73d2e42e1476631f3fbcf2cd2e9?apiKey=5b267050b6bf44e5a34a2a79f0903d25&width=2000 2000w, https://cdn.builder.io/api/v1/image/assets/TEMP/6e682ee4a3f3eb065311cf98b28a9418b30cf73d2e42e1476631f3fbcf2cd2e9?apiKey=5b267050b6bf44e5a34a2a79f0903d25&"
                      className="self-center bg-black rounded-full aspect-square h-[120px] w-[120px]"
                    />
                    <div className="mt-6">Join our GitHub</div>
                  </div>
                </div>
              </a>
            </div>
          </div>
        </div>
        <div className="shrink-0 h-2.5 border-t border-solid border-zinc-600 max-md:max-w-full" />
        <div className="mt-16 mb-8 text-3xl font-bold text-center text-white">
          Newly Created Assets
        </div>

        <div className="container mx-auto px-4 pb-12 max-w-5xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {records.map((record: Record) => (
              <Link
                href={`/view/${record.tokenId}`}
                className="w-full aspect-square cursor-pointer"
                key={record.tokenId}
              >
                <img
                  src={record.image}
                  alt={record.creator}
                  className="w-full h-full object-cover"
                />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
