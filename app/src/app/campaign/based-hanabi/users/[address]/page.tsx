"use client";

import { gql, useQuery } from "@apollo/client";
import { useEffect, useMemo } from "react";
import { Address, formatEther } from "viem";
import {
  useAccount,
  useReadContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { EIS_HANABI_ADDRESS, GAS_LIMIT } from "../../_lib/eis/constants";
import { eisHanabiAbi } from "../../_lib/eis/abi";
import Link from "next/link";

import { Avatar, Name } from "@coinbase/onchainkit/identity";
import { DefaultAvatar } from "../../_components/DefaultAvatar";
import { toast } from "react-toastify";

const GET_RECORDS = gql`
  query GetRecords($address: String!) {
    hanabiRecords(where: { creator: $address }) {
      tokenId
      creator
      uri
      referTo
      referedFrom
    }
  }
`;

function UserPage({ params }: { params: { address: string } }) {
  const { address: connectedAddress } = useAccount();

  const address = useMemo(() => {
    if (!params.address) {
      return "" as Address;
    }
    return params.address.toLowerCase() as Address;
  }, [params.address]);

  const { data } = useQuery(GET_RECORDS, {
    variables: { address: address },
  });

  const { data: balance, refetch } = useReadContract({
    abi: eisHanabiAbi,
    address: EIS_HANABI_ADDRESS,
    functionName: "claimableFees",
    args: [address],
  });

  const { writeContract, data: hash, reset, error } = useWriteContract();

  useEffect(() => {
    if (error) {
      const message = error.message;
      const truncatedMessage =
        message.length > 80 ? message.substring(0, 80) + "..." : message;
      toast.error(truncatedMessage);
    }
  }, [error]);

  const { data: receipt } = useWaitForTransactionReceipt({
    hash,
  });

  useEffect(() => {
    if (!receipt) {
      return;
    }
    refetch();
  }, [receipt]);

  const records = useMemo(() => {
    if (!data) {
      return [];
    }
    return data.hanabiRecords.map((record: any) => {
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

  const formattedBalance = balance
    ? parseFloat(formatEther(balance)).toFixed(6)
    : "0";
  const displayBalance =
    parseFloat(formattedBalance) < 0.000001 ? 0 : formattedBalance;

  const avatar = useMemo(() => {
    if (address == "0x4298e663517593284ad4fe199b21815bd48a9969") {
      return "/assets/campaign/based-hanabi/theme/gremplin.webp";
    } else if (address == "0xd42bd96b117dd6bd63280620ea981bf967a7ad2b") {
      return "/assets/campaign/based-hanabi/theme/numo.jpg";
    } else if (address == "0xd3fc370863024a24a71f11e44b69bc869e0fbbee") {
      return "/assets/campaign/based-hanabi/theme/mae.png";
    } else if (address == "0xe53ad2e73a2ba78cba846e3a96a62b75ee1c113a") {
      return "/assets/campaign/based-hanabi/theme/ta2nb.jpg";
    } else if (address == "0x8869e7b48e33c5f1fffb0f15f6084c7b438d6371") {
      return "/assets/campaign/based-hanabi/theme/eboy.jpg";
    }
  }, [address]);

  return (
    <div className="px-3 md:px-6">
      <div className="flex flex-col items-center py-12 gap-6">
        <div>
          {!avatar && (
            <Avatar
              address={address}
              className="h-24 w-24 rounded-full"
              defaultComponent={
                <DefaultAvatar seed={address} className="w-24 h-24" />
              }
              loadingComponent={
                <DefaultAvatar seed={address} className="w-24 h-24" />
              }
            />
          )}
          {avatar && <img src={avatar} className="w-24 h-24 rounded-full" />}
        </div>
        <div className="flex flex-col justify-center items-center">
          <Name
            address={address}
            className="text-white text-xl font-bold mb-2"
          />
          <div className="text-gray-400 text-xs md:text-base">{address}</div>
        </div>
        {connectedAddress && connectedAddress.toLowerCase() === address && (
          <div className="w-full md:max-w-60">
            <button
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-300"
              onClick={() => {
                reset();
                writeContract({
                  abi: eisHanabiAbi,
                  address: EIS_HANABI_ADDRESS,
                  functionName: "claimFees",
                  args: [GAS_LIMIT],
                });
              }}
            >
              CLAIM {displayBalance} ETH
            </button>
          </div>
        )}
      </div>

      <div className="w-full pb-12 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {records.map((record: any) => (
            <Link
              href={`/campaign/based-hanabi/artworks/${record.tokenId}`}
              className="w-full aspect-square cursor-pointer"
              key={record.tokenId}
            >
              <img
                src={record.image}
                alt={record.creator}
                className="w-full h-full object-cover bg-white"
              />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default UserPage;
