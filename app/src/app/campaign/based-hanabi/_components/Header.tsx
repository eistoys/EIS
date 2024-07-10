"use client";

import Link from "next/link";
import { ConnectWalletButton } from "./ConnectWalletButton";
import { usePathname } from "next/navigation";

export const Header = () => {
  const pathname = usePathname();

  return (
    <div className="w-full flex justify-between items-center p-3 border-b border-[#888888] h-12 md:h-[60px]">
      <Link href="/campaign/based-hanabi">
        <img
          loading="lazy"
          src="/assets/logo.svg"
          className="h-6 md:h-10 cursor-pointer"
        />
      </Link>
      <div className="space-x-3 flex">
        {!pathname.includes("create") && (
          <Link href="/campaign/based-hanabi/artworks/create">
            <button
              type="button"
              className="flex justify-center items-center text-center px-4 h-6 md:h-8 text-[#191D88] bg-[#FFD582] font-bold rounded-full hover:opacity-75 tracking-wider"
            >
              CREATE
            </button>
          </Link>
        )}
        <ConnectWalletButton />
      </div>
    </div>
  );
};
