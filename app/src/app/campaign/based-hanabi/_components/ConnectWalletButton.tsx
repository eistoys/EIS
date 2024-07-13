import { ConnectButton } from "@rainbow-me/rainbowkit";
import { ArrowRightLeft } from "lucide-react";
import { useReadContract } from "wagmi";
import { eisHanabiAbi } from "../_lib/eis/abi";
import { EIS_HANABI_ADDRESS } from "../_lib/eis/constants";
import { Address, formatEther } from "viem";
import Link from "next/link";

export const ConnectWalletButton = () => {
  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        authenticationStatus,
        mounted,
      }) => {
        const { data: balance } = useReadContract({
          abi: eisHanabiAbi,
          address: EIS_HANABI_ADDRESS,
          functionName: "claimableFees",
          args: [account?.address as Address],
        });

        // Note: If your app doesn't use authentication, you
        // can remove all 'authenticationStatus' checks
        const ready = mounted && authenticationStatus !== "loading";
        const connected =
          ready &&
          account &&
          chain &&
          (!authenticationStatus || authenticationStatus === "authenticated");

        return (
          <div
            {...(!ready && {
              "aria-hidden": true,
              style: {
                opacity: 0,
                pointerEvents: "none",
                userSelect: "none",
              },
            })}
          >
            {(() => {
              if (!connected) {
                return (
                  <button
                    onClick={openConnectModal}
                    type="button"
                    className="flex justify-center items-center text-center px-4 h-6 md:h-8 text-white font-bold border border-2 rounded-full hover:opacity-75 tracking-wider"
                  >
                    CONNECT
                  </button>
                );
              }

              if (chain.unsupported) {
                return (
                  <button
                    onClick={openChainModal}
                    type="button"
                    className="flex justify-center items-center text-center px-4 h-6 md:h-8 text-white font-bold bg-red-500 rounded-full hover:opacity-75 tracking-wider"
                  >
                    <div className="mr-[6px]">
                      <ArrowRightLeft size={12} />
                    </div>
                    NETWORK
                  </button>
                );
              }

              return (
                <div style={{ display: "flex", gap: 12 }}>
                  <Link
                    href={`/campaign/based-hanabi/users/${account.address}`}
                  >
                    <button
                      type="button"
                      className="flex justify-center items-center text-center px-4 h-6 md:h-8 text-white bg-[#337CCF] font-bold rounded-full hover:opacity-75 tracking-wider"
                    >
                      {balance
                        ? parseFloat(formatEther(balance)).toFixed(6)
                        : 0}{" "}
                      ETH
                    </button>
                  </Link>
                </div>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
};
