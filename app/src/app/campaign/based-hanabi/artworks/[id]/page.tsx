"use client";

import CreatorIdentity from "@/components/CreatorIdentity";
import { Record } from "@/types/record";
import { gql, useQuery } from "@apollo/client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { MintModal } from "../../_components/MintModal";
import { Address as AddressType, formatEther } from "viem";
import { MINT_PRICE } from "../../_lib/eis/constants";
import { DefaultAvatar } from "../../_components/DefaultAvatar";
import { Address, Avatar, Name } from "@coinbase/onchainkit/identity";

const GET_RECORD = gql`
  query GetRecord($id: ID!) {
    hanabiRecord(id: $id) {
      tokenId
      creator
      uri
      referTo
      referedFrom
      minted
    }
  }
`;

const GET_RECORDS = gql`
  query GetRecords($ids: [ID!]!) {
    hanabiRecords(where: { tokenId_in: $ids }) {
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
      recordQueryData.hanabiRecord.uri.split("data:application/json;utf8,")[1]
    );
    console.log("metadata", metadata.image);
    return {
      tokenId: recordQueryData.hanabiRecord.tokenId,
      creator: recordQueryData.hanabiRecord.creator,
      image: metadata.image,
      name: metadata.name,
      description: metadata.description,
      referTo: recordQueryData.hanabiRecord.referTo,
      referedFrom: recordQueryData.hanabiRecord.referedFrom,
      minted: recordQueryData.hanabiRecord.minted,
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
    recordsQueryData.hanabiRecords.forEach((record: any) => {
      result[record.tokenId] = JSON.parse(
        record.uri.split("data:application/json;utf8,")[1]
      ).image;
    });
    return result;
  }, [recordsQueryData]);

  const avatar = useMemo(() => {
    if (record?.creator == "0x4298e663517593284ad4fe199b21815bd48a9969") {
      return "/assets/campaign/based-hanabi/theme/gremplin.webp";
    } else if (
      record?.creator == "0xd42bd96b117dd6bd63280620ea981bf967a7ad2b"
    ) {
      return "/assets/campaign/based-hanabi/theme/numo.jpg";
    } else if (
      record?.creator == "0xd3fc370863024a24a71f11e44b69bc869e0fbbee"
    ) {
      return "/assets/campaign/based-hanabi/theme/mae.png";
    } else if (
      record?.creator == "0xe53ad2e73a2ba78cba846e3a96a62b75ee1c113a"
    ) {
      return "/assets/campaign/based-hanabi/theme/ta2nb.jpg";
    } else if (
      record?.creator == "0x8869e7b48e33c5f1fffb0f15f6084c7b438d6371"
    ) {
      return "/assets/campaign/based-hanabi/theme/eboy.jpg";
    }
  }, [record?.creator]);

  return (
    <>
      {record && (
        <div className="flex flex-col flex-grow">
          <div className="flex border-b border-solid border-[#888888] px-3 md:px-10 flex-grow">
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
              <div className="w-full md:w-1/3 justify-center py-12 pl-0 md:pl-10 border-t md:border-l md:border-t-0 border-solid border-[#888888]">
                <div className="text-2xl font-bold tracking-wider text-white mb-2">
                  {record.name}
                </div>
                <Link
                  className="inline-flex"
                  href={`/campaign/based-hanabi/users/${record.creator}`}
                >
                  <div className="flex items-center mb-6">
                    <div className="w-8 h-8 rounded-full overflow-hidden mr-3">
                      {!avatar && (
                        <Avatar
                          address={record.creator as AddressType}
                          className="h-8 w-8 rounded-full"
                          defaultComponent={
                            <DefaultAvatar
                              seed={record.creator}
                              className="w-8 h-8"
                            />
                          }
                          loadingComponent={
                            <DefaultAvatar
                              seed={record.creator}
                              className="w-8 h-8"
                            />
                          }
                        />
                      )}
                      {avatar && (
                        <img src={avatar} className="w-8 h-8 rounded-full" />
                      )}
                    </div>
                    <div>
                      <Name
                        address={record.creator as AddressType}
                        className="text-white text-lg font-extrabold"
                      />
                      <Address
                        address={record.creator as AddressType}
                        className="text-white text-sm"
                      />
                    </div>
                  </div>
                </Link>
                <div className="py-8 space-y-6">
                  <div className="border-b border-[#888888] pb-9">
                    <div className="flex justify-between items-center mb-4">
                      <div className="text-white text-2xl w-full tracking-wider font-semibold">
                        {formatEther(MINT_PRICE)} ETH / per
                      </div>
                    </div>
                    <button
                      className="font-bold w-full flex justify-center items-center px-3 h-14 text-2xl text-white bg-[#337CCF] rounded-xl space-x-4 hover:opacity-75 transition-opacity duration-300 tracking-wider mb-2"
                      onClick={() => setIsMintModalOpen(true)}
                    >
                      <img
                        src="/assets/campaign/based-hanabi/icons/mint.svg"
                        className="my-auto w-6 h-6"
                      />
                      <div>MINT</div>
                    </button>

                    <div className="text-white text-base">
                      {record.minted} Minted
                    </div>
                  </div>
                  <div className="border-b border-[#888888] pb-9">
                    <Link
                      href={`/campaign/based-hanabi/artworks/create?referenceTokenId=${params.id}`}
                      className="w-full block"
                    >
                      <button className="font-bold w-full flex justify-center items-center px-3 h-14 text-2xl text-[#191D88] bg-[#FFD582] rounded-xl space-x-4 hover:opacity-75 transition-opacity duration-300 tracking-wider mb-2">
                        <img
                          src="/assets/campaign/based-hanabi/icons/remix.svg"
                          className="my-auto w-6 h-6"
                        />
                        <div>REMIX</div>
                      </button>
                      <div className="text-white text-base">
                        {record.referedFrom.length} Remixed
                      </div>
                    </Link>
                  </div>
                  <div className="flex flex-col space-y-3 mb-6">
                    <button
                      className="font-bold bg-[#111111] px-3 h-14 text-2xl rounded-xl text-white flex justify-center items-center text-center flex gap-4 hover:opacity-75 transition-opacity duration-300 tracking-wider text-center"
                      onClick={() => {
                        window.open(
                          `https://twitter.com/intent/tweet?text=I%20would%20love%20to%20see%20this%20remixed%20%F0%9F%94%81%20%F0%9F%AB%B0%20%0A%0Ahttps%3A%2F%2Feis.toys%2Fcampaign%2Fbased-hanabi%2Fartworks%2F${params.id}%3Fver%3Dmainnet-2%20%0A%0A%23eistoys%20%0A%23basedhanabi`,
                          "_blank"
                        );
                      }}
                    >
                      <img
                        src="/assets/campaign/based-hanabi/icons/social-x.svg"
                        className="shrink-0 aspect-[1.41] fill-white h-6"
                      />
                      <div>POST</div>
                    </button>

                    <button
                      className="font-bold bg-[#6944BA] px-3 h-14 text-2xl rounded-xl text-white flex justify-center items-center text-center flex gap-4 hover:opacity-75 transition-opacity duration-300 tracking-wider text-center"
                      onClick={() => {
                        window.open(
                          `https://warpcast.com/~/compose?text=I%20would%20love%20to%20see%20this%20remixed%20%F0%9F%94%81%20%F0%9F%AB%B0%20%40eistoys%20%23basedhanabi&embeds[]=https://eis.toys/campaign/based-hanabi/artworks/${params.id}?ver=mainnet-2`,
                          "_blank"
                        );
                      }}
                    >
                      <img
                        src="/assets/campaign/based-hanabi/icons/social-w.svg"
                        className="shrink-0 aspect-[1.41] fill-white h-6"
                      />
                      <div>CAST</div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {record.referedFrom.length > 0 && (
            <div className="p-3 pb-10 md:p-10">
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
      {record && (
        <MintModal
          setIsOpen={setIsMintModalOpen}
          isOpen={isMintModalOpen}
          close={() => setIsMintModalOpen(false)}
          tokenId={params.id}
          image={record.image}
        />
      )}
    </>
  );
}

export default ViewPage;
