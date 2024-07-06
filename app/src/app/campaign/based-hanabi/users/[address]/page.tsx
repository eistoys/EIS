"use client";

import { gql, useQuery } from "@apollo/client";
import { use, useEffect, useMemo } from "react";
import { Address, formatEther } from "viem";

import { Record } from "@/types/record";
import Link from "next/link";
import CreatorIdentity from "@/components/CreatorIdentity";

import {
  useAccount,
  useReadContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { splitsWarehouseAbi } from "../../_lib/splits/abi";
import {
  SPLIT_NATIVE_TOKEN_ADDRESS,
  SPLIT_WAREHOUSE_ADDRESS,
} from "../../_lib/splits/constants";

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
    abi: splitsWarehouseAbi,
    address: SPLIT_WAREHOUSE_ADDRESS,
    functionName: "balanceOf",
    args: [address, BigInt(SPLIT_NATIVE_TOKEN_ADDRESS)],
  });

  const { writeContract, data: hash, reset } = useWriteContract();
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

  return (
    <div className="px-3 md:px-6">
      <div className="flex flex-col md:items-center md:flex-row py-12 gap-6">
        <div className="w-full">
          <CreatorIdentity address={address} />
        </div>
        {connectedAddress && connectedAddress.toLowerCase() == address && (
          <div className="w-full md:max-w-60">
            <button
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-300"
              onClick={() => {
                reset();
                writeContract({
                  abi: splitsWarehouseAbi,
                  address: SPLIT_WAREHOUSE_ADDRESS,
                  functionName: "withdraw",
                  args: [address, SPLIT_NATIVE_TOKEN_ADDRESS],
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
          {records.map((record: Record) => (
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
