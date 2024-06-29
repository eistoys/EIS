"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";

export const Header = () => {
  return (
    <div className="w-full flex justify-between items-center py-4 px-4 border-b border-zinc-600">
      <Link href="/campaign/based-hanabi">
        <img
          loading="lazy"
          src="/assets/logo.svg"
          className="w-28 cursor-pointer"
        />
      </Link>
      <ConnectButton
        accountStatus="full"
        chainStatus="name"
        showBalance={false}
      />
    </div>
  );
};
