"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAccount, useReadContract, useDisconnect } from "wagmi";
import { IoClose, IoMenu, IoLogoGithub } from "react-icons/io5";
import { ConnectWalletButton } from "./ConnectWalletButton";
import { Address, Avatar, Name } from "@coinbase/onchainkit/identity";
import { useConnectModal } from "@rainbow-me/rainbowkit";

import { eisHanabiAbi } from "../_lib/eis/abi";
import { EIS_HANABI_ADDRESS } from "../_lib/eis/constants";
import { Address as AddressType, formatEther } from "viem";
import { DefaultAvatar } from "./DefaultAvatar";

import { SiFarcaster } from "react-icons/si";
import { RiTwitterXLine } from "react-icons/ri";

export const Header: React.FC = () => {
  const pathname = usePathname();
  const { isConnected, address } = useAccount();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { disconnect } = useDisconnect();
  const { openConnectModal } = useConnectModal();

  const { data: balance } = useReadContract({
    abi: eisHanabiAbi,
    address: EIS_HANABI_ADDRESS,
    functionName: "claimableFees",
    args: [address as AddressType],
  });

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      window.removeEventListener("resize", checkMobile);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleMenu = () => setIsOpen(!isOpen);

  const MenuContent: React.FC = () => (
    <div className="flex flex-col w-full h-full bg-[#191D88] text-white p-4">
      <div className="flex justify-between items-center mb-12">
        <Link href="/campaign/based-hanabi">
          <img src="/assets/logo.svg" alt="EIS" className="h-6" />
        </Link>
        <div className="space-x-3 flex">
          <button onClick={toggleMenu} className="text-white">
            <IoClose size={24} />
          </button>
        </div>
      </div>

      {isConnected ? (
        <>
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 rounded-full overflow-hidden mr-3">
              <DefaultAvatar seed={address} className="w-12 h-12" />
            </div>
            <div>
              <Name
                address={address}
                className="text-white text-lg font-extrabold"
              />
              <Address address={address} className="text-white text-sm" />
            </div>
          </div>

          <Link
            href={`/campaign/based-hanabi/users/${address}`}
            className="block mb-6"
          >
            <div className="bg-[#3B82F6] rounded-full py-3 px-4 flex justify-between items-center">
              <div className="text-xl font-bold tracking-wider">
                {balance ? parseFloat(formatEther(balance)).toFixed(6) : "0"}{" "}
                ETH
              </div>
              <span className="text-white font-bold tracking-wider">
                My Page &gt;
              </span>
            </div>
          </Link>
          <button
            onClick={() => disconnect()}
            className="bg-transparent border-2 border-white rounded-full py-3 mb-8 text-lg font-bold tracking-wider"
          >
            DISCONNECT
          </button>
        </>
      ) : (
        <button
          onClick={openConnectModal}
          className="bg-transparent border-2 border-white rounded-full py-3 mb-8 text-lg font-semibold"
        >
          CONNECT
        </button>
      )}

      <div className="space-y-4 mb-auto">
        <Link
          href="/campaign/based-hanabi"
          className="block text-2xl font-bold"
          onClick={() => setIsOpen(false)}
        >
          TOP
        </Link>
        <Link
          href="/campaign/based-hanabi#description"
          className="block text-2xl font-bold"
          onClick={() => setIsOpen(false)}
        >
          DESCRIPTION
        </Link>

        <Link
          href="/campaign/based-hanabi/artworks/create"
          className="block text-2xl font-bold text-yellow-400"
          onClick={() => setIsOpen(false)}
        >
          CREATE
        </Link>
      </div>

      <div className="mt-auto flex justify-between items-center">
        <a
          target="_blank"
          href="https://warpcast.com/~/channel/eis"
          className="block px-4 py-2 text-base"
        >
          Feedback :)
        </a>
        <div className="flex space-x-4">
          <a
            href="https://warpcast.com/eistoys"
            target="_blank"
            className="w-8 h-8 rounded-full flex items-center justify-center"
          >
            <SiFarcaster className="w-5 h-5" />
          </a>
          <a
            href="https://x.com/eistoys"
            target="_blank"
            className="w-8 h-8  rounded-full flex items-center justify-center"
          >
            <RiTwitterXLine className=" w-5 h-5" />
          </a>
          <a
            href="https://github.com/eistoys/EIS"
            target="_blank"
            className="w-8 h-8 rounded-full flex items-center justify-center"
          >
            <IoLogoGithub className=" w-5 h-5" />
          </a>
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full flex justify-between items-center p-3 bg-[#191D88] text-white h-12 md:h-[60px]">
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
      <div className="flex items-center space-x-3">
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
        <button onClick={toggleMenu}>
          {!isConnected && <IoMenu className="w-6 h-6 text-white" />}
          {isConnected && (
            <Avatar
              address={address}
              defaultComponent={
                <DefaultAvatar seed={address} className="w-6 h-6" />
              }
              loadingComponent={
                <DefaultAvatar seed={address} className="w-6 h-6" />
              }
              className="w-6 h-6"
            />
          )}
        </button>
      </div>

      {isOpen && (
        <div
          ref={menuRef}
          className={`fixed top-0 right-0 h-full bg-[#191D88] z-50 
                     ${isMobile ? "w-full" : "w-80"} 
                     transition-all duration-300 ease-in-out`}
        >
          <MenuContent />
        </div>
      )}
    </div>
  );
};
