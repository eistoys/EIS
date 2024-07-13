"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAccount } from "wagmi";
import {
  IoClose,
  IoMenu,
  IoHome,
  IoLogoTwitter,
  IoLogoGithub,
} from "react-icons/io5";
import { ConnectWalletButton } from "./ConnectWalletButton";
import { Avatar } from "@coinbase/onchainkit/identity";
import { createAvatar } from "@dicebear/core";
import { identicon } from "@dicebear/collection";

const getRandomAvatar = (seed: string) => {
  const avatar = createAvatar(identicon, {
    seed: seed,
    size: 32,
  });
  return avatar.toDataUri();
};

export const Header: React.FC = () => {
  const pathname = usePathname();
  const { isConnected, address } = useAccount();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [avatarSeed] = useState<string>(Math.random().toString());

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

  const handleConnect = () => {
    // Implement your connect logic here
    console.log("Connecting wallet...");
  };

  const handleDisconnect = () => {
    // Implement your disconnect logic here
    console.log("Disconnecting wallet...");
  };

  const MenuContent: React.FC = () => (
    <div className="flex flex-col w-full h-full bg-[#191D88] text-white p-4">
      <div className="flex justify-between items-center mb-6">
        <div className="text-2xl font-bold">EIS</div>
        <div className="space-x-3 flex">
          <button onClick={toggleMenu} className="text-white">
            <IoClose size={24} />
          </button>
        </div>
      </div>

      {isConnected ? (
        <>
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 rounded-full overflow-hidden mr-3">
              <img
                src={getRandomAvatar(address || avatarSeed)}
                alt="User Avatar"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="text-lg font-semibold">yamadatarou.eth</div>
              <div className="text-sm text-gray-300">
                {address
                  ? `${address.slice(0, 6)}...${address.slice(-4)}`
                  : "0x7a21...33aa13"}
              </div>
            </div>
          </div>

          <Link
            href={`/campaign/based-hanabi/users/${address}`}
            className="block"
          >
            <div className="bg-[#3B82F6] rounded-full py-3 px-4 flex justify-between items-center mb-4">
              <div className="text-xl font-bold">239.4 ETH</div>
              <span className="text-white">My Page &gt;</span>
            </div>
          </Link>

          <button
            onClick={handleDisconnect}
            className="bg-transparent border-2 border-white rounded-full py-3 mb-8 text-lg font-semibold"
          >
            DISCONNECT
          </button>
        </>
      ) : (
        <button
          onClick={handleConnect}
          className="bg-transparent border-2 border-white rounded-full py-3 mb-8 text-lg font-semibold"
        >
          CONNECT
        </button>
      )}

      <div className="space-y-4 mb-auto">
        <Link href="#" className="block text-2xl font-bold">
          TOP
        </Link>
        <Link href="#" className="block text-2xl font-bold">
          DESCRIPTION
        </Link>
        <Link
          href="/campaign/based-hanabi/artworks/create"
          className="block text-2xl font-bold text-yellow-400"
        >
          CREATE
        </Link>
      </div>

      <div className="mt-auto flex justify-between items-center">
        <div>Feedback :)</div>
        <div className="flex space-x-4">
          <Link
            href="#"
            className="w-8 h-8 bg-white rounded-full flex items-center justify-center"
          >
            <IoHome className="text-[#191D88] w-5 h-5" />
          </Link>
          <Link
            href="#"
            className="w-8 h-8 bg-white rounded-full flex items-center justify-center"
          >
            <IoLogoTwitter className="text-[#191D88] w-5 h-5" />
          </Link>
          <Link
            href="#"
            className="w-8 h-8 bg-white rounded-full flex items-center justify-center"
          >
            <IoLogoGithub className="text-[#191D88] w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  );

  const defaultAvatarComponent = (seed: string) => {
    return (
      <div className="w-8 h-8 rounded-full overflow-hidden">
        <img
          src={getRandomAvatar(seed)}
          alt="Loading Avatar"
          className="w-full h-full object-cover"
        />
      </div>
    );
  };

  return (
    <div className="w-full flex justify-between items-center p-3 bg-[#191D88] text-white h-12 md:h-[60px]">
      <Link href="/campaign/based-hanabi">
        <img src="/assets/logo.svg" alt="EIS" className="h-6 md:h-10" />
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
          {!isConnected && <IoMenu className="w-8 h-8 text-white" />}
          {isConnected && (
            <Avatar
              address={address}
              defaultComponent={defaultAvatarComponent(address || avatarSeed)}
              loadingComponent={defaultAvatarComponent(address || avatarSeed)}
              className="w-8 h-8"
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
