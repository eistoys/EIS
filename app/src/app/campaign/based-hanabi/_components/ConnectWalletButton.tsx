import { ConnectButton } from "@rainbow-me/rainbowkit";
import { ArrowRightLeft } from "lucide-react";

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
                    className="flex justify-center items-center text-center px-4 h-6 md:h-8 text-white bg-red-500 rounded-full hover:opacity-75 tracking-wider"
                  >
                    <div className="mr-[6px]">
                      <ArrowRightLeft size={12} fontWeight={600} />
                    </div>
                    NETWORK
                  </button>
                );
              }

              console.log(account.displayName);

              return (
                <div style={{ display: "flex", gap: 12 }}>
                  <button
                    onClick={openAccountModal}
                    type="button"
                    className="flex justify-center items-center text-center px-4 h-6 md:h-8 text-white border border-2 rounded-full hover:opacity-75 tracking-wider"
                  >
                    {account.displayName}
                  </button>
                </div>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
};
