"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { FaCheck, FaRegQuestionCircle } from "react-icons/fa";
import useWindowSize from "react-use/lib/useWindowSize";
import Confetti from "react-confetti";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { readContract } from "@wagmi/core";
import { encodeSVGToDataURL } from "@/lib/utils";
import { EIS_ADDRESS } from "@/lib/eis/constants";
import { eisAbi } from "@/lib/eis/abi";
import { Hex, toHex } from "viem";

import { wagmiConfig } from "@/lib/wagmi";

import { useSearchParams } from "next/navigation";

import solady from "solady";
import { chunk } from "@/lib/eis/chunk";
import Image from "next/image";

function CreatePage() {
  const ref = useRef<HTMLIFrameElement>(null);
  const searchParams = useSearchParams();

  const referenceTokenId = searchParams.get("referenceTokenId");
  const [imageLoaded, setImageLoaded] = useState(false);

  const { width, height } = useWindowSize();
  const { data: hash, writeContract, reset, error } = useWriteContract();
  const { data } = useWaitForTransactionReceipt({
    hash,
  });

  const [mode, setMode] = useState<"image" | "info">("image");
  const [modalMode, setModalMode] = useState<"remix" | "loading" | "created">(
    "remix"
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("0.00069");
  const [supply, setSupply] = useState("∞");
  const [isLicenseChecked, setIsLicenseChecked] = useState(false);

  const [referenceImage, setReferenceImage] = useState("");
  const referenceImageDataURL = useMemo(() => {
    if (!referenceImage) {
      return "";
    }
    return encodeSVGToDataURL(referenceImage);
  }, [referenceImage]);
  const [image, setImage] = useState("");
  const imageDataURL = useMemo(() => {
    if (!image) {
      return "";
    }
    return encodeSVGToDataURL(image);
  }, [image]);

  const [createdTokenId, setCreatedTokenId] = useState("");

  useEffect(() => {
    if (!referenceTokenId) {
      setImageLoaded(true);
      return;
    }
    readContract(wagmiConfig, {
      address: EIS_ADDRESS,
      abi: eisAbi,
      functionName: "renderTokenById",
      args: [BigInt(referenceTokenId)],
    })
      .then((data) => {
        if (data) {
          window.localStorage.setItem("md-canvasContent", data);
          setReferenceImage(data);
        }
        setImageLoaded(true);
      })
      .catch(() => {
        setImageLoaded(true);
      });
  }, [referenceTokenId]);

  useEffect(() => {
    if (!error) {
      return;
    }
    console.error(error);
    setIsModalOpen(false);
  }, [error]);

  useEffect(() => {
    if (!hash) {
      return;
    }
    console.log("hash", hash);
  }, [hash]);

  useEffect(() => {
    if (!data) {
      return;
    }
    console.log("data", data);
    const event = data.logs[data.logs.length - 1];
    const tokenIdHex = event.topics[1];
    if (!tokenIdHex) {
      return;
    }
    const tokenId = parseInt(tokenIdHex, 16);
    setCreatedTokenId(tokenId.toString());
    setModalMode("created");
  }, [data]);

  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isModalOpen]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data === "remix") {
        setModalMode("remix");
        setIsModalOpen(true);
      }
    };

    window.addEventListener("message", handleMessage);

    // Cleanup function
    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, []);

  return (
    <>
      {mode === "image" && (
        <div className="flex flex-col flex-grow">
          {imageLoaded && (
            <>
              <iframe
                ref={ref}
                id="svg-editor-iframe"
                src="/editor/index.html"
                className="flex-grow"
                style={{ border: "none" }}
              />

              <div className="flex justify-end py-4 px-8">
                <button
                  type="button"
                  className="px-4 py-1.5 font-bold text-[#22CC02] rounded-2xl bg-[#1A331A] border-2 border-[#00FF00] hover:opacity-75 transition-opacity duration-300 tracking-wider flex items-center"
                  onClick={() => {
                    const image =
                      window.localStorage.getItem("md-canvasContent");
                    if (!image) {
                      throw new Error("Image not set");
                    }
                    setImage(image);
                    setMode("info");
                  }}
                >
                  COMPLETE
                </button>
              </div>
            </>
          )}
        </div>
      )}
      {mode === "info" && (
        <div>
          <div className="flex border-b border-solid border-zinc-600 px-8">
            <div className="flex flex-col w-2/3 py-12">
              <Image
                alt="reference image"
                loading="lazy"
                src={imageDataURL}
                className="bg-white rounded-xl mx-auto mb-8"
                width={288}
                height={288}
              />
              {referenceImageDataURL && (
                <>
                  <div className="text-xl font-bold tracking-wide text-white mb-4">
                    SOURCE
                  </div>
                  <div className="flex gap-4">
                    <Image
                      alt="reference image"
                      src={referenceImageDataURL}
                      className="bg-white rounded-xl"
                      width={120}
                      height={120}
                    />
                  </div>
                </>
              )}
            </div>

            <div className="flex flex-col w-1/3 justify-center py-12 pl-12 border-l border-solid border-zinc-600">
              <div className="text-lg font-bold tracking-wider text-white mb-2">
                TITLE <span className="text-red-600">*</span>
              </div>
              <input
                type="text"
                className="bg-[#222222] border border-solid border-zinc-500 rounded-xl focus:border-[#22CC02] focus:outline-none p-4 text-white mb-6"
                placeholder="Enter title here"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <div className="text-lg font-bold tracking-wider text-white mb-2">
                DESCRIPTION{" "}
                <span className="text-base font-medium">(Optional)</span>
              </div>
              <textarea
                className="bg-[#222222] border border-solid border-zinc-500 rounded-xl focus:border-[#22CC02] focus:outline-none p-4 text-white mb-6"
                rows={5}
                placeholder="Enter description here"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />

              <div className="flex justify-between mb-2">
                <div className="text-lg font-bold tracking-wider text-white">
                  PRICE
                </div>
                {/* <div
                  className="underline tracking-wider text-white cursor-pointer"
                  onClick={() => {
                    setPrice("0.00069");
                    setSupply("∞");
                  }}
                >
                  Reset
                </div> */}
              </div>
              <div className="relative mb-6">
                <input
                  type="text"
                  className="text-xl bg-[#222222] border border-solid border-zinc-500 rounded-xl focus:border-[#22CC02] focus:outline-none p-4 text-white text-center w-full"
                  required
                  disabled
                  value={price}
                // onChange={(e) =>
                //   setPrice(e.target.value.replace(/[^0-9.]/g, ""))
                // }
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                  <span className="text-white">ETH</span>
                </div>
              </div>
              <div className="text-lg font-bold tracking-wider text-white mb-2">
                SUPPLY
              </div>
              <div className="relative flex items-center mb-4">
                <button
                  type="button"
                  className="absolute left-0 text-white w-12 h-12"
                // onClick={() => {
                //   setSupply((prev) => {
                //     if (prev === "∞") {
                //       return "0";
                //     } else {
                //       const num = parseFloat(prev);
                //       if (num === 0) {
                //         return "0";
                //       }
                //       return (num + -1).toString();
                //     }
                //   });
                // }}
                >
                  -
                </button>
                <input
                  type="text"
                  className="text-xl bg-[#222222] border border-solid border-zinc-500 rounded-xl focus:border-[#22CC02] focus:outline-none p-4 text-white w-full text-center px-12"
                  required
                  disabled
                  value={supply}
                // onChange={(e) =>
                //   setSupply(e.target.value.replace(/[^0-9.∞]/g, ""))
                // }
                />
                <button
                  type="button"
                  className="absolute right-0 text-white w-12 h-12"
                // onClick={() => {
                //   setSupply((prev) => {
                //     if (prev === "∞") {
                //       return "0";
                //     } else {
                //       const num = parseFloat(prev);
                //       return (num + 1).toString();
                //     }
                //   });
                // }}
                >
                  +
                </button>
              </div>

              <div className="flex gap-2.5 px-px mt-5 text-lg font-bold tracking-wide leading-5 text-red-600 mb-2">
                <div className="text-lg font-bold tracking-wider text-white">
                  LICENSE <span className="text-red-600">*</span>
                </div>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  className="accent-green-600 mr-4"
                  checked={isLicenseChecked}
                  onChange={(e) => setIsLicenseChecked(e.target.checked)}
                />
                <div className="text-lg tracking-wide text-white mr-2">CC0</div>
                {/* <FaRegQuestionCircle
                  className="text-gray-500 cursor-pointer"
                  size="12"
                /> */}
              </div>
            </div>
          </div>
          <div className="flex justify-between py-4 px-8">
            <button
              type="button"
              className="px-4 py-1.5 font-bold border border-gray-500 text-gray-500 rounded-2xl hover:opacity-75 transition-opacity duration-300 tracking-wide"
              onClick={() => setMode("image")}
            >
              Back
            </button>
            <button
              type="button"
              className="px-4 py-1.5 font-bold text-[#22CC02] rounded-2xl bg-[#1A331A] border-2 border-[#00FF00] hover:opacity-75 hover:opacity-75 transition-opacity duration-300 tracking-wide flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!title || !isLicenseChecked}
              onClick={async () => {
                reset();
                setModalMode("loading");
                setIsModalOpen(true);
                const hexImage = toHex(image);
                const zippedHexImage = solady.LibZip.flzCompress(
                  hexImage
                ) as Hex;
                if (!referenceTokenId) {
                  writeContract({
                    address: EIS_ADDRESS,
                    abi: eisAbi,
                    functionName: "create",
                    args: [title, description, chunk(zippedHexImage)],
                  });
                } else {
                  writeContract({
                    address: EIS_ADDRESS,
                    abi: eisAbi,
                    functionName: "remix",
                    args: [
                      title,
                      description,
                      chunk(zippedHexImage),
                      [BigInt(referenceTokenId)],
                      [BigInt(10000)],
                    ],
                  });
                }
              }}
            >
              <FaCheck className="mr-2" size="18" />
              CREATE
            </button>
          </div>
        </div>
      )}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white bg-opacity-25 backdrop-blur-sm">
          {modalMode == "created" && <Confetti width={width} height={height} />}
          <div className="relative flex flex-col py-8 px-6 w-full max-w-lg rounded-3xl shadow-2xl bg-neutral-800">
            {modalMode == "remix" && (
              <>
                <div className="flex mb-4">
                  <div className="text-white text-xl font-bold tracking-wider">
                    Remix
                  </div>
                  <button
                    className="absolute top-6 right-4 text-4xl text-white"
                    onClick={() => {
                      ref.current?.contentWindow?.postMessage(
                        "close",
                        "http://localhost:3000"
                      );
                      setIsModalOpen(false);
                    }}
                  >
                    &times;
                  </button>
                </div>
                <div className="text-white tracking-wider text-sm font-bold">
                  Coming soon!
                </div>
              </>
            )}
            {modalMode == "loading" && (
              <>
                <div className="text-white text-xl font-bold tracking-wider">
                  CREATING...
                </div>
                <div className="flex items-center justify-center h-60">
                  <svg
                    aria-hidden="true"
                    className="w-20 h-20 text-gray-200 animate-spin dark:text-gray-600 fill-[#22CC02]"
                    viewBox="0 0 100 101"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                      fill="currentColor"
                    />
                    <path
                      d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                      fill="currentFill"
                    />
                  </svg>
                </div>
                <div className="text-white tracking-wider text-center text-xl font-bold">
                  Please don't close this modal
                  <br />
                  until the transaction is completed.
                </div>
              </>
            )}
            {modalMode == "created" && (
              <>
                <div className="flex mb-4">
                  <div className="text-white text-xl font-bold tracking-wider">
                    CREATE COMPLETED
                  </div>
                  <button
                    className="absolute top-6 right-4 text-4xl text-white"
                    onClick={() => setIsModalOpen(false)}
                  >
                    &times;
                  </button>
                </div>
                <Image
                  alt="image data"
                  loading="lazy"
                  src={imageDataURL}
                  className="bg-white rounded-xl mx-auto mb-8"
                  width={192}
                  height={192}
                />
                <div className="flex gap-4 px-8 pb-8 mb-4 border-b border-solid border-zinc-600">
                  <button
                    className="w-1/2 font-bold text-white px-4 py-2 text-lg font-bold border-2 rounded-xl border-white hover:opacity-75 transition-opacity duration-300 tracking-wider text-center"
                    onClick={() => setIsModalOpen(false)}
                  >
                    OK
                  </button>

                  <button
                    className="w-1/2 font-bold bg-violet-800 px-4 py-2 text-lg rounded-xl text-white flex justify-center items-center text-center flex gap-4 hover:opacity-75 transition-opacity duration-300 tracking-wider text-center"
                    onClick={() => {
                      window.open(
                        `https://warpcast.com/~/compose?text=Check%20out%20the%20image%20created%20in%20@eistoys&embeds[]=https://eis.toys/artworks/${createdTokenId}`,
                        "_blank"
                      );
                    }}
                  >
                    <img
                      loading="lazy"
                      src="https://cdn.builder.io/api/v1/image/assets/TEMP/2ba240d0e724425be2b041267b06998427ee6b477e1e5c751c1cda26a12580b1?apiKey=5b267050b6bf44e5a34a2a79f0903d25&"
                      className="shrink-0 aspect-[1.41] fill-white w-6"
                    />
                    <div>SHARE</div>
                  </button>
                </div>
                <div className="text-white tracking-wider text-center text-sm font-bold">
                  The artwork you created has been carved onchain as CC0. 🎉
                  <br />
                  This is a public good and will benefit everyone ! ✨
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default function CreatePageWrapper() {
  return (
    <Suspense>
      <CreatePage />
    </Suspense>
  );
}
