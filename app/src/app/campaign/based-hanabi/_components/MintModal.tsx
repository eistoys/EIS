import { SpinnerLoader } from "@/components/SpinnerLoader";
import { useEffect, useState } from "react";
import { formatEther } from "viem";
import { EIS_HANABI_ADDRESS, MINT_PRICE } from "../_lib/eis/constants";
import { useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { eisHanabiAbi } from "../_lib/eis/abi";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";

const defaultMode = "ask";
const defaultAmount = 1;

export const MintModal = ({
  isOpen,
  close,
  tokenId,
  image,
}: {
  isOpen: boolean;
  close: any;
  tokenId: string;
  image: string;
}) => {
  const [mode, setMode] = useState<"ask" | "loading" | "confirmed">(
    defaultMode
  );
  const [amount, setAmount] = useState(defaultAmount);

  const incrementAmount = () => {
    setAmount((prevAmount) => prevAmount + 1);
  };

  const decrementAmount = () => {
    if (amount > 1) {
      setAmount((prevAmount) => prevAmount - 1);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setAmount(defaultAmount);
      setMode(defaultMode);
    }
  }, [isOpen]);

  const { data: hash, writeContract, reset } = useWriteContract();

  const { data } = useWaitForTransactionReceipt({
    hash,
  });

  useEffect(() => {
    if (!data) {
      return;
    }
    setMode("confirmed");
  }, [data]);

  const { width, height } = useWindowSize();

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white bg-opacity-25 backdrop-blur-sm">
          {mode == "confirmed" && <Confetti width={width} height={height} />}
          <div className="relative flex flex-col py-8 px-6 w-full max-w-lg rounded-xl shadow-2xl bg-[#191D88] m-4">
            <>
              <div className="flex mb-8">
                <div className="text-white text-xl font-bold tracking-wider">
                  MINT ✨
                </div>
                <button
                  className="absolute top-6 right-4 text-4xl text-white"
                  onClick={() => close()}
                >
                  &times;
                </button>
              </div>
              {mode == "ask" && (
                <>
                  <div className="flex justify-between items-center mb-3">
                    <div className="text-white text-3xl w-full tracking-wider font-bold">
                      {formatEther(MINT_PRICE)} ETH
                    </div>
                  </div>
                  <div className="relative flex items-center mb-3">
                    <button
                      type="button"
                      className="absolute left-0 text-white w-12 h-12 font-extrabold text-xl"
                      onClick={decrementAmount}
                    >
                      -
                    </button>
                    <input
                      type="text"
                      className="text-2xl font-semibold bg-[#191D88] border border-solid border-[#888888] rounded-xl focus:border-[#22CC02] focus:outline-none p-3 text-white w-full text-center px-12"
                      required
                      disabled
                      value={amount}
                    />
                    <button
                      type="button"
                      className="absolute right-0 text-white w-12 h-12 font-extrabold text-xl"
                      onClick={incrementAmount}
                    >
                      +
                    </button>
                  </div>
                  <div className="grid grid-cols-5 space-x-3 mb-6">
                    {[1, 10, 50, 100, 500].map((value) => (
                      <button
                        key={value}
                        type="button"
                        className="bg-[#191D88] border border-solid border-[#888888] text-white text-sm font-bold py-1.5 px-1 rounded-full tracking-wider"
                        onClick={() => setAmount(value)}
                      >
                        {value}
                      </button>
                    ))}
                  </div>

                  <button
                    className="font-bold w-full flex justify-center items-center px-4 py-3 text-white bg-blue-600 rounded-xl space-x-4 hover:opacity-75 transition-opacity duration-300 tracking-wider mb-2"
                    onClick={() => {
                      reset();
                      setMode("loading");
                      writeContract({
                        address: EIS_HANABI_ADDRESS,
                        abi: eisHanabiAbi,
                        functionName: "mint",
                        args: [BigInt(tokenId), BigInt(amount)],
                        value: MINT_PRICE * BigInt(amount),
                      });
                    }}
                  >
                    <img
                      loading="lazy"
                      src="https://cdn.builder.io/api/v1/image/assets/TEMP/bc3e19d227e2bf6ee5f8fd6813316690db486ab3861739ef2df46d9675f1df82?"
                      className="my-auto w-5 h-5"
                    />
                    <div className="">MINT TO VOTE</div>
                  </button>
                </>
              )}
              {mode == "loading" && (
                <>
                  <SpinnerLoader />
                  <div className="text-white tracking-wider text-center text-md md:text-xl font-bold">
                    Please don't close this modal
                    <br />
                    until the transaction is completed.
                  </div>
                </>
              )}
              {mode == "confirmed" && (
                <>
                  <img
                    src={image}
                    className="bg-white rounded-xl h-64 w-64 mx-auto mb-8"
                  />
                  <div className="flex gap-4 px-0 md:px-8 pb-8 mb-4 border-b border-solid border-zinc-600">
                    <button
                      className="w-full font-bold bg-violet-800 px-4 py-2 text-lg rounded-xl text-white flex justify-center items-center text-center flex gap-4 hover:opacity-75 transition-opacity duration-300 tracking-wider text-center"
                      onClick={() => {
                        window.open(
                          `https://warpcast.com/~/compose?text=I%20would%20love%20to%20see%20this%20remixed%20%F0%9F%94%81%20%F0%9F%AB%B0%20%40eistoys&embeds[]=https://eis.toys/artworks/${tokenId}?ver=testnet-2`,
                          "_blank"
                        );
                      }}
                    >
                      <img
                        loading="lazy"
                        src="https://cdn.builder.io/api/v1/image/assets/TEMP/2ba240d0e724425be2b041267b06998427ee6b477e1e5c751c1cda26a12580b1?apiKey=5b267050b6bf44e5a34a2a79f0903d25&"
                        className="shrink-0 aspect-[1.41] fill-white w-6"
                      />
                      <div>CAST</div>
                    </button>
                  </div>
                  <div className="text-white tracking-wider text-center text-xs md:text-sm font-bold">
                    Congratulations ! ✨
                    <br />
                    You have successfully minted.
                  </div>
                </>
              )}
            </>
          </div>
        </div>
      )}
    </>
  );
};
