import Link from "next/link";
import { MintModal } from "./MintModal";
import { useMemo, useState } from "react";

import { Avatar, Name } from "@coinbase/onchainkit/identity";
import { Address as AddressType } from "viem";
import { DefaultAvatar } from "./DefaultAvatar";

export interface ArtworkListItemProps {
  tokenId: string;
  creator: string;
  image: string;
  minted: number;
}

export const ArtworkListItem: React.FC<ArtworkListItemProps> = ({
  tokenId,
  creator,
  image,
  minted,
}) => {
  const avatar = useMemo(() => {
    if (creator == "0x4298e663517593284ad4fe199b21815bd48a9969") {
      return "/assets/campaign/based-hanabi/theme/gremplin.webp";
    } else if (creator == "0xd42bd96b117dd6bd63280620ea981bf967a7ad2b") {
      return "/assets/campaign/based-hanabi/theme/numo.jpg";
    } else if (creator == "0xd3fc370863024a24a71f11e44b69bc869e0fbbee") {
      return "/assets/campaign/based-hanabi/theme/mae.png";
    } else if (creator == "0xe53ad2e73a2ba78cba846e3a96a62b75ee1c113a") {
      return "/assets/campaign/based-hanabi/theme/ta2nb.jpg";
    } else if (creator == "0x8869e7b48e33c5f1fffb0f15f6084c7b438d6371") {
      return "/assets/campaign/based-hanabi/theme/eboy.jpg";
    }
  }, [creator]);

  const [isMintModalOpen, setIsMintModalOpen] = useState(false);

  return (
    <div>
      <Link href={`/campaign/based-hanabi/users/${creator}`}>
        <div className="flex space-x-3 font-semibold text-white items-center mb-2">
          {!avatar && (
            <Avatar
              address={creator as AddressType}
              defaultComponent={
                <DefaultAvatar seed={creator} className="w-6 h-6" />
              }
              loadingComponent={
                <DefaultAvatar seed={creator} className="w-6 h-6" />
              }
              className="w-6 h-6"
            />
          )}
          {avatar && <img src={avatar} className="w-6 h-6 rounded-full" />}
          <Name
            address={creator as AddressType}
            className="text-white text-lg font-extrabold"
          />
        </div>
      </Link>
      <Link href={`/campaign/based-hanabi/artworks/${tokenId}`}>
        <div className="bg-white mb-2 rounded-3xl">
          <img src={image} className="w-full h-full object-cover rounded-3xl" />
        </div>
      </Link>
      <div className="flex justify-end space-x-2 mb-2 text-white text-base tracking-wider text-right font-semibold">
        <img
          src="/assets/campaign/based-hanabi/icons/mint.svg"
          className="my-auto w-4 h-4"
        />
        <p>MINT {minted} / 10000</p>
      </div>

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
        setIsOpen={setIsMintModalOpen}
        isOpen={isMintModalOpen}
        close={() => setIsMintModalOpen(false)}
        tokenId={tokenId}
        image={image}
      />
    </div>
  );
};
