"use client";

import CreatorIdentity from "@/components/CreatorIdentity";
import { Record } from "@/types/record";
import { gql, useQuery } from "@apollo/client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { MintModal } from "../../_components/MintModal";

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
  const [isMintModalOpen, setIsMintModalOpen] = useState(false);

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
                        <Link
                          href={`/campaign/based-hanabi/artworks//${tokenId}`}
                        >
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
                <Link className="inline-flex" href={`/users/${record.creator}`}>
                  <div className="hover:opacity-80">
                    <CreatorIdentity address={record.creator} />
                  </div>
                </Link>
                <div className="py-8 space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <div className="text-white text-3xl w-full tracking-wider font-bold">
                        0.006 ETH
                      </div>
                    </div>
                    <button
                      className="font-bold w-full flex justify-center items-center px-4 py-3 text-white bg-blue-600 rounded-xl space-x-4 hover:opacity-75 transition-opacity duration-300 tracking-wider mb-2"
                      onClick={() => setIsMintModalOpen(true)}
                    >
                      <img
                        loading="lazy"
                        src="https://cdn.builder.io/api/v1/image/assets/TEMP/bc3e19d227e2bf6ee5f8fd6813316690db486ab3861739ef2df46d9675f1df82?"
                        className="my-auto w-5 h-5"
                      />
                      <div>MINT</div>
                    </button>
                    <div className="text-white text-sm">4009 Minted</div>
                  </div>

                  <Link
                    href="/campaign/based-hanabi/artworks/create"
                    className="w-full block"
                  >
                    <button className="font-bold w-full flex justify-center items-center px-4 py-3 text-[#191D88] bg-[#FFD582] rounded-xl space-x-4 hover:opacity-75 transition-opacity duration-300 tracking-wider mb-2">
                      <img
                        loading="lazy"
                        src="https://cdn.builder.io/api/v1/image/assets/TEMP/74adfd0e2048e52c1ba6d8c41acbd81f99084a137f2e45e27bf071dbf79264c1?"
                        className="my-auto w-5 h-5"
                      />
                      <div>REMIX</div>
                    </button>
                    <div className="text-white text-sm">36 Minted</div>
                  </Link>
                  <button
                    className="w-full font-bold bg-violet-800 px-4 py-3 rounded-xl text-white flex justify-center items-center text-center flex space-x-4 hover:opacity-75 transition-opacity duration-300 tracking-wider text-center"
                    onClick={() => {
                      window.open(
                        `https://warpcast.com/~/compose?text=I%20would%20love%20to%20see%20this%20remixed%20%F0%9F%94%81%20%F0%9F%AB%B0%20%40eistoys&embeds[]=https://eis.toys/artworks/${record.tokenId}?ver=testnet-2`,
                        "_blank"
                      );
                    }}
                  >
                    <img
                      loading="lazy"
                      src="https://cdn.builder.io/api/v1/image/assets/TEMP/2ba240d0e724425be2b041267b06998427ee6b477e1e5c751c1cda26a12580b1?apiKey=5b267050b6bf44e5a34a2a79f0903d25&"
                      className="my-auto w-5 h-5"
                    />
                    <div>SHARE</div>
                  </button>
                </div>
              </div>
            </div>
          </div>
          {record.referedFrom.length > 0 && (
            <div className="p-4">
              <div className="text-xl font-bold tracking-wide text-white mb-4">
                REMIX ACTIVITY
              </div>
              <div className="flex gap-4 overflow-x-auto">
                {record.referedFrom.map((tokenId, i) => (
                  <Link href={`/campaign/based-hanabi/artworks/${tokenId}`}>
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
      <MintModal
        isOpen={isMintModalOpen}
        close={() => setIsMintModalOpen(false)}
      />
    </>
  );
}

export default ViewPage;
