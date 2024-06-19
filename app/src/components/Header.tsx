"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAccount } from "wagmi";

import { FaPlus } from "react-icons/fa";
import { useState } from "react";

export const Header = () => {
  const { isConnected } = useAccount();
  const pathname = usePathname();

  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="flex justify-between pl-4 pr-2 md:px-8 py-4 w-full border-b border-solid border-zinc-600">
      <div className="flex items-center space-x-8">
        <Link href="/">
          <img
            loading="lazy"
            src="/assets/logo.svg"
            className="w-28 cursor-pointer"
          />
        </Link>
        {/* <Link
          href="/concept"
          className="hover:opacity-75 hover:opacity-75 transition-opacity"
        >
          <p className="text-lg font-bold text-white cursor-pointer tracking-wider">
            CONCEPT
          </p>
        </Link> */}
        <a
          target="_blank"
          href="https://warpcast.com/~/channel/eis"
          className="hover:opacity-75 hover:opacity-75 transition-opacity hidden md:block"
        >
          <p className="text-lg font-bold text-white cursor-pointer tracking-wider">
            GIVE US FEEEDBACK :)
          </p>
        </a>
      </div>
      <div className="flex">
        {isConnected && pathname !== "/create" && (
          <Link href="/create">
            <button className="px-4 py-1.5 font-bold text-[#22CC02] rounded-2xl bg-[#1A331A] border-2 border-[#00FF00] hover:opacity-75 transition-opacity duration-300 tracking-wider flex items-center mr-2">
              <FaPlus className="mr-2" size="18" /> CREATE
            </button>
          </Link>
        )}
        {pathname !== "/" && (
          <ConnectButton
            accountStatus="full"
            chainStatus="name"
            showBalance={false}
          />
        )}
        <div className="relative inline-block text-left md:hidden">
          <div className="mt-1">
            <button
              type="button"
              className="inline-flex justify-center w-full rounded-md p-2 text-white focus:outline-none"
              id="options-menu"
              aria-expanded="true"
              aria-haspopup="true"
              onClick={toggleDropdown}
            >
              <svg
                className="h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M3 5h14a1 1 0 100-2H3a1 1 0 000 2zm0 4h14a1 1 0 100-2H3a1 1 0 000 2zm0 4h14a1 1 0 100-2H3a1 1 0 000 2z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>

          {isOpen && (
            <div
              className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5"
              role="menu"
              aria-orientation="vertical"
              aria-labelledby="options-menu"
            >
              <div className="py-1" role="none">
                <a
                  target="_blank"
                  href="https://warpcast.com/~/channel/eis"
                  className="block px-4 py-2 text-lg text-gray-700 hover:bg-gray-100"
                  role="menuitem"
                >
                  Feedback
                </a>
                <Link
                  href="/create"
                  className="block px-4 py-2 text-lg text-gray-700 hover:bg-gray-100"
                  role="menuitem"
                  onClick={() => {
                    setIsOpen(false);
                  }}
                >
                  Create
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
