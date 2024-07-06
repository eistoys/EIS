"use client";

import Link from "next/link";
import { ConnectWalletButton } from "./ConnectWalletButton";

export const Header = () => {
  return (
    <div className="w-full flex justify-between items-center p-3 border-b border-[#888888] h-12 md:h-[60px]">
      <Link href="/campaign/based-hanabi">
        <img
          loading="lazy"
          src="/assets/logo.svg"
          className="h-6 md:h-10 cursor-pointer"
        />
      </Link>
      <ConnectWalletButton />
    </div>
  );
};
