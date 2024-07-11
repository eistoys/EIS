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
          <div className="relative flex flex-col py-10 px-6 w-full max-w-sm rounded-xl shadow-xl bg-[#191D88] m-3">
            <button
              className="absolute text-white right-2.5 top-3"
              onClick={() => close()}
            >
              <img
                src="/assets/campaign/based-hanabi/icons/x.svg"
                className="shrink-0 aspect-[1.41] fill-white h-4"
              />
            </button>
            <>
              <div className="flex mb-6">
                <div className="text-white text-xl font-bold tracking-wider">
                  MINT ✨
                </div>
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
                  <div className="mb-6">
                    <SpinnerLoader />
                  </div>
                  <div className="text-white tracking-wider text-center text-sm font-bold">
                    Please don't close this modal
                    <br />
                    until the transaction is completed.
                  </div>
                </>
              )}
              {mode == "confirmed" && (
                <>
                  <div className="mb-6 px-6">
                    <img
                      src={image}
                      className="bg-white rounded-xl w-full mx-auto"
                    />
                  </div>
                  <div className="flex flex-col space-y-3 mb-6">
                    <button
                      className="font-bold bg-[#111111] px-3 h-14 text-2xl rounded-xl text-white flex justify-center items-center text-center flex gap-4 hover:opacity-75 transition-opacity duration-300 tracking-wider text-center"
                      onClick={() => {
                        window.open(
                          `https://twitter.com/intent/tweet?text=I%20would%20love%20to%20see%20this%20remixed%20%F0%9F%94%81%20%F0%9F%AB%B0%20%0A%0Ahttps%3A%2F%2Feis.toys%2Fcampaign%2Fbased-hanabi%2Fartworks%2F${tokenId}%3Fver%3Dtestnet-1%20%0A%0A%23eistoys%20%0A%23basedhanabi`,
                          "_blank"
                        );
                      }}
                    >
                      <img
                        src="/assets/campaign/based-hanabi/icons/social-x.svg"
                        className="shrink-0 aspect-[1.41] fill-white h-6"
                      />
                      <div>POST</div>
                    </button>

                    <button
                      className="font-bold bg-[#6944BA] px-3 h-14 text-2xl rounded-xl text-white flex justify-center items-center text-center flex gap-4 hover:opacity-75 transition-opacity duration-300 tracking-wider text-center"
                      onClick={() => {
                        window.open(
                          `https://warpcast.com/~/compose?text=I%20would%20love%20to%20see%20this%20remixed%20%F0%9F%94%81%20%F0%9F%AB%B0%20%40eistoys&embeds[]=https://eis.toys/artworks/${tokenId}?ver=testnet-2`,
                          "_blank"
                        );
                      }}
                    >
                      <img
                        src="/assets/campaign/based-hanabi/icons/social-w.svg"
                        className="shrink-0 aspect-[1.41] fill-white h-6"
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
