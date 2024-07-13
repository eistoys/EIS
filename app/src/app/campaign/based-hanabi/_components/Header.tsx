"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAccount } from "wagmi";
import { useState, useEffect } from "react";
import {
  IoClose,
  IoMenu,
  IoHome,
  IoLogoTwitter,
  IoLogoGithub,
} from "react-icons/io5";

export const Header = () => {
  const pathname = usePathname();
  const { isConnected, address } = useAccount();
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
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

  const MenuContent = () => (
    <div className="flex flex-col w-full h-full bg-[#191D88] text-white p-4">
      <div className="flex justify-between items-center mb-6">
        <div className="text-2xl font-bold">EIS</div>
        <button onClick={toggleMenu} className="text-white">
          <IoClose size={24} />
        </button>
      </div>

      {isConnected ? (
        <>
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-yellow-300 rounded-full mr-3"></div>
            <div>
              <div className="text-lg font-semibold">yamadatarou.eth</div>
              <div className="text-sm text-gray-300">0x7a21...33aa13</div>
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

  return (
    <div className="w-full flex justify-between items-center p-3 bg-[#191D88] text-white h-12 md:h-[60px]">
      <Link href="/campaign/based-hanabi">
        <img src="/assets/logo.svg" alt="EIS" className="h-6 md:h-10" />
      </Link>
      <div className="flex items-center space-x-3">
        <button onClick={toggleMenu}>
          <IoMenu className="w-6 h-6 text-white" />
        </button>
      </div>

      {isOpen && (
        <div
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
