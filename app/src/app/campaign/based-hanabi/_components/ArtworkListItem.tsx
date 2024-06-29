import Link from "next/link";
import { MintModal } from "./MintModal";
import { useState } from "react";

export const ArtworkListItem = () => {
  const [isMintModalOpen, setIsMintModalOpen] = useState(false);

  return (
    <div>
      <Link href="/campaign/based-hanabi/artworks/1">
        <div className="bg-white rounded-3xl aspect-square mb-4" />
      </Link>
      <Link href="/campaign/based-hanabi/users/0xab95e42096ef6c18ed278f4fca25754c96e60aae">
        <div className="flex space-x-3 font-semibold text-white items-center mb-4">
          <div className="rounded-full bg-zinc-500 h-[30px] w-[30px]" />
          <div className="">consome.eth</div>
        </div>
      </Link>
      <div className="flex space-x-2 font-bold">
        <button
          className="w-full flex justify-center items-center px-4 py-2 text-white bg-blue-600 rounded-xl space-x-3 hover:opacity-75 transition-opacity duration-300 tracking-wider"
          onClick={() => setIsMintModalOpen(true)}
        >
          <img
            loading="lazy"
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/bc3e19d227e2bf6ee5f8fd6813316690db486ab3861739ef2df46d9675f1df82?"
            className="my-auto w-4 h-4"
          />
          <div>MINT</div>
        </button>
        <Link href="/campaign/based-hanabi/artworks/create" className="w-full">
          <button className="w-full flex justify-center items-center px-4 py-2 text-[#191D88] bg-[#FFD582] rounded-xl space-x-3 hover:opacity-75 transition-opacity duration-300 tracking-wider ">
            <img
              loading="lazy"
              src="https://cdn.builder.io/api/v1/image/assets/TEMP/74adfd0e2048e52c1ba6d8c41acbd81f99084a137f2e45e27bf071dbf79264c1?"
              className="my-auto w-4 h-4"
            />
            <div>REMIX</div>
          </button>
        </Link>
      </div>
      <MintModal
        isOpen={isMintModalOpen}
        close={() => setIsMintModalOpen(false)}
      />
    </div>
  );
};
