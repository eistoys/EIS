import Link from "next/link";
import { MintModal } from "./MintModal";
import { useState } from "react";
import { truncateString } from "@/lib/utils";

export interface ArtworkListItemProps {
  tokenId: string;
  creator: string;
  image: string;
}

export const ArtworkListItem: React.FC<ArtworkListItemProps> = ({
  tokenId,
  creator,
  image,
}) => {
  const [isMintModalOpen, setIsMintModalOpen] = useState(false);

  return (
    <div>
      <Link href={`/campaign/based-hanabi/artworks/${tokenId}`}>
        <div className="bg-white mb-4 rounded-3xl">
          <img src={image} className="w-full h-full object-cover rounded-3xl" />
        </div>
      </Link>
      <Link href="/campaign/based-hanabi/users/0xab95e42096ef6c18ed278f4fca25754c96e60aae">
        <div className="flex space-x-3 font-semibold text-white items-center mb-4">
          <div className="rounded-full bg-zinc-500 h-[30px] w-[30px]" />
          <div className="text-lg tracking-wider">
            {!creator.includes(".")
              ? truncateString(creator, 1)
              : "consome.eth"}
          </div>
        </div>
      </Link>
      <div className="flex space-x-2 font-bold">
        <button
          className="w-full flex justify-center items-center h-10 text-white bg-[#337CCF] rounded-xl space-x-3 hover:opacity-75 transition-opacity duration-300 tracking-wider"
          onClick={() => setIsMintModalOpen(true)}
        >
          <img
            src="/assets/campaign/based-hanabi/icons/mint.svg"
            className="my-auto w-4 h-4"
          />
          <div>MINT</div>
        </button>
        <Link
          href={`/campaign/based-hanabi/artworks/create?referenceTokenId=${tokenId}`}
          className="w-full"
        >
          <button className="w-full flex justify-center items-center h-10 text-[#191D88] bg-[#FFD582] rounded-xl space-x-3 hover:opacity-75 transition-opacity duration-300 tracking-wider ">
            <img
              src="/assets/campaign/based-hanabi/icons/remix.svg"
              className="my-auto w-4 h-4"
            />
            <div>REMIX</div>
          </button>
        </Link>
      </div>
      <MintModal
        isOpen={isMintModalOpen}
        close={() => setIsMintModalOpen(false)}
        tokenId={tokenId}
        image={image}
      />
    </div>
  );
};
