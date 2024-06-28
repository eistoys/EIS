"use client";

import { gql, useQuery } from "@apollo/client";
import { useMemo } from "react";

import { Record } from "@/types/record";
import Link from "next/link";
import CreatorIdentity from "@/components/CreatorIdentity";

const GET_RECORDS = gql`
  query GetRecords($address: String!) {
    records(where: { creator: $address }) {
      tokenId
      creator
      uri
      referTo
      referedFrom
    }
  }
`;

function UserPage({ params }: { params: { address: string } }) {
  const address = useMemo(() => {
    if (!params.address) {
      return "";
    }
    return params.address.toLowerCase();
  }, [params.address]);

  const { data } = useQuery(GET_RECORDS, {
    variables: { address: address },
  });

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
    <>
      <div className="mt-16 mb-2 font-bold text-center text-white text-sm">
        Created by
      </div>

      <div className="mb-8 flex justify-center">
        <CreatorIdentity address={address} />
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
    </>
  );
}

export default UserPage;
