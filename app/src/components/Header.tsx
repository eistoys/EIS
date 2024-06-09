"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAccount } from "wagmi";

import { FaPlus } from "react-icons/fa";

export const Header = () => {
  const { isConnected } = useAccount();
  const pathname = usePathname();

  return (
    <div className="flex justify-between px-8 py-4 w-full border-b border-solid border-zinc-600">
      <div className="flex items-center space-x-8">
        <Link href="/">
          <img
            loading="lazy"
            src="/assets/logo.svg"
            className="w-28 cursor-pointer"
          />
        </Link>
        <Link
          href="/concept"
          className="hover:opacity-75 hover:opacity-75 transition-opacity"
        >
          <p className="text-lg font-bold text-white cursor-pointer tracking-wider">
            CONCEPT
          </p>
        </Link>
        <a
          target="_blank"
          href="https://warpcast.com/~/channel/eis"
          className="hover:opacity-75 hover:opacity-75 transition-opacity"
        >
          <p className="text-lg font-bold text-white cursor-pointer tracking-wider">
            GIVE US FEEEDBACK :)
          </p>
        </a>
      </div>
      <div className="flex space-x-4">
        {isConnected && pathname !== "/create" && (
          <Link href="/create">
            <button className="px-4 py-1.5 font-bold text-[#22CC02] rounded-2xl bg-[#1A331A] border-2 border-[#00FF00] hover:opacity-75 transition-opacity duration-300 tracking-wider flex items-center">
              <FaPlus className="mr-2" size="18" /> CREATE
            </button>
          </Link>
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
