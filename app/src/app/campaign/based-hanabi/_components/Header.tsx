"use client";

import Link from "next/link";
import { ConnectWalletButton } from "./ConnectWalletButton";
import { usePathname } from "next/navigation";

import { Menu } from "lucide-react";
import { useAccount } from "wagmi";
import { useState } from "react";

export const Header = () => {
  const pathname = usePathname();
  const { isConnected, address } = useAccount();

  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="w-full flex justify-between items-center p-3 border-b border-[#888888] h-12 md:h-[60px]">
      <Link href="/campaign/based-hanabi">
        <picture>
          <source media="(max-width: 768px)" srcSet="/assets/logo-mini.svg" />
          <img
            loading="lazy"
            src="/assets/logo.svg"
            className="h-6 md:h-10 cursor-pointer"
          />
        </picture>
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
        <div className="relative flex items-center">
          <div className="flex">
            <button onClick={toggleDropdown}>
              <Menu size={24} color="white" />
            </button>
          </div>
          {isOpen && (
            <div
              className="origin-top-right absolute top-0 right-0 mt-8 md:mt-10 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-20"
              role="menu"
              aria-orientation="vertical"
              aria-labelledby="options-menu"
            >
              <div className="py-1" role="none">
                <Link
                  href="/campaign/based-hanabi/artworks/create"
                  className="block px-4 py-2 text-lg text-gray-700 hover:bg-gray-100"
                  role="menuitem"
                  onClick={() => {
                    setIsOpen(false);
                  }}
                >
                  Create
                </Link>
                {isConnected && (
                  <Link
                    href={`/campaign/based-hanabi/users/${address}`}
                    className="block px-4 py-2 text-lg text-gray-700 hover:bg-gray-100"
                    role="menuitem"
                    onClick={() => {
                      setIsOpen(false);
                    }}
                  >
                    MyPage
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
