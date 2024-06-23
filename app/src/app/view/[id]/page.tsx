"use client";

import { Record } from "@/types/record";
import { gql, useQuery } from "@apollo/client";
import Link from "next/link";
import { useMemo } from "react";

const GET_RECORD = gql`
  query GetRecord($id: ID!) {
    record(id: $id) {
      tokenId
      creator
      uri
      referTo
      referedFrom
    }
  }
`;

const GET_RECORDS = gql`
  query GetRecords($ids: [ID!]!) {
    records(where: { tokenId_in: $ids }) {
      tokenId
      creator
      uri
      referTo
      referedFrom
    }
  }
`;

function ViewPage({ params }: { params: { id: string } }) {
  const { data: recordQueryData } = useQuery(GET_RECORD, {
    variables: { id: params.id },
  });

  const record = useMemo(() => {
    if (!recordQueryData) {
      return;
    }

    const metadata = JSON.parse(
      recordQueryData.record.uri.split("data:application/json;utf8,")[1]
    );
    return {
      tokenId: recordQueryData.record.tokenId,
      creator: recordQueryData.record.creator,
      image: metadata.image,
      name: metadata.name,
      description: metadata.description,
      referTo: recordQueryData.record.referTo,
      referedFrom: recordQueryData.record.referedFrom,
    } as Record;
  }, [recordQueryData]);

  const ids = useMemo(() => {
    if (!record) {
      return;
    }
    return record.referTo.concat(record.referedFrom);
  }, [record]);

  const { data: recordsQueryData } = useQuery(GET_RECORDS, {
    variables: { ids: ids },
  });

  const images = useMemo(() => {
    if (!recordsQueryData) {
      return {};
    }
    const result: any = {};
    recordsQueryData.records.forEach((record: any) => {
      result[record.tokenId] = JSON.parse(
        record.uri.split("data:application/json;utf8,")[1]
      ).image;
    });
    return result;
  }, [recordsQueryData]);

  return (
    <>
      {record && (
        <div className="flex flex-col flex-grow">
          <div className="flex border-b border-solid border-zinc-600 px-4 flex-grow">
            <div className="flex flex-col md:flex-row w-full">
              <div className="w-full md:w-2/3 py-12">
                <img
                  loading="lazy"
                  src={record.image}
                  className="bg-white rounded-xl w-96 aspect-square mx-auto mb-8 object-cover"
                />

                {record.referTo.length > 0 && (
                  <>
                    <div className="text-xl font-bold tracking-wide text-white mb-4">
                      SOURCE
                    </div>
                    <div className="flex gap-4 overflow-x-auto">
                      {record.referTo.map((tokenId, i) => (
                        <Link href={`/view/${tokenId}`}>
                          <img
                            key={`source_${i}`}
                            src={images[tokenId]}
                            className="bg-white rounded-xl h-40 w-40"
                          />
                        </Link>
                      ))}
                    </div>
                  </>
                )}
              </div>
              <div className="w-full md:w-1/3 justify-center py-12 pl-0 md:pl-12 border-t md:border-l md:border-t-0 border-solid border-zinc-600">
                <div className="text-2xl font-bold tracking-wider text-white mb-2">
                  {record.name}
                </div>
                <Link href={`/users/${record.creator}`}>
                  <div className="text-sm font-bold tracking-wider text-zinc-500 mb-2 hover:underline">
                    {record.creator}
                  </div>
                </Link>
                <div className="py-8 space-y-4">
                  <Link
                    href={`/create?ver=testnet-2&referenceTokenId=${record.tokenId}`}
                  >
                    <button
                      type="button"
                      className="px-4 w-full text-center py-2 font-bold text-[#22CC02] rounded-2xl bg-[#1A331A] border-2 border-[#00FF00] hover:opacity-75 hover:opacity-75 transition-opacity duration-300 tracking-wide disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Remix
                    </button>
                  </Link>
                  <button
                    className="w-full font-bold bg-violet-800 px-4 py-2 text-lg rounded-xl text-white gap-4 hover:opacity-75 transition-opacity duration-300 tracking-wider text-center"
                    onClick={() => {
                      window.open(
                        `https://warpcast.com/~/compose?text=I%20would%20love%20to%20see%20this%20remixed%20%F0%9F%94%81%20%F0%9F%AB%B0%20%40eistoys&embeds[]=https://eis.toys/artworks/${record.tokenId}?ver=testnet-2`,
                        "_blank"
                      );
                    }}
                  >
                    Cast
                  </button>
                </div>
              </div>
            </div>
          </div>
          {record.referedFrom.length > 0 && (
            <div className="p-4">
              <div className="text-xl font-bold tracking-wide text-white mb-4">
                Remixed by
              </div>
              <div className="flex gap-4 overflow-x-auto">
                {record.referedFrom.map((tokenId, i) => (
                  <Link href={`/view/${tokenId}`}>
                    <img
                      key={`source_${i}`}
                      src={images[tokenId]}
                      className="bg-white rounded-xl h-40 w-40"
                    />
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}

export default ViewPage;
