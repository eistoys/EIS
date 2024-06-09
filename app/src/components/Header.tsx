"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";

import { useAccount } from "wagmi";

export const Header = () => {
  const { isConnected } = useAccount();

  return (
    <div className="flex justify-between px-4 py-2 w-full border-b border-solid border-zinc-600">
      <div className="flex items-center space-x-8">
        <Link href="/">
          <img
            loading="lazy"
            src="/assets/logo.svg"
            className="w-28 cursor-pointer"
          />
        </Link>
        <Link href="/concept">
          <p className="font-medium text-white tracking-wide cursor-pointer">
            CONCEPT
          </p>
        </Link>
        <a target="_blank" href="https://warpcast.com/~/channel/eis">
          <p className="font-medium text-white tracking-wide cursor-pointer">
            GIVE US FEEEDBACK :)
          </p>
        </a>
      </div>
      <div className="flex space-x-4">
        {isConnected && (
          <button className="px-4 py-2 font-bold bg-[#22CC02] text-white rounded-2xl hover:bg-[#1FA802]">
            + Create
          </button>
        )}
        <ConnectButton
          accountStatus="full"
          chainStatus="none"
          showBalance={false}
        />
      </div>
    </div>
  );
};
