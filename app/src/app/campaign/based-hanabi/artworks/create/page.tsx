"use client";

import { SpinnerLoader } from "@/components/SpinnerLoader";
import { Suspense, useEffect, useRef, useState } from "react";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";

import { PixelEditor, PixelEditorRef } from "../../_components/PixelEditor";
import { EIS_HANABI_ADDRESS } from "../../_lib/eis/constants";
import { eisHanabiAbi } from "../../_lib/eis/abi";
import {
  useAccount,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { escapeString } from "@/lib/utils";
import { chunk } from "@/lib/eis/chunk";
import solady from "solady";
import { Hex } from "viem";
import { useSearchParams } from "next/navigation";
import { gql, useQuery } from "@apollo/client";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { toast } from "react-toastify";

const GET_RECORD = gql`
  query GetRecord($id: ID!) {
    hanabiRecord(id: $id) {
      uri
    }
  }
`;

function CampaignBasedHanabiArtworkCreatePage() {
  const searchParams = useSearchParams();
  const referenceTokenId = searchParams.get("referenceTokenId");
  const [referenceTokenImage, setReferenceTokenImage] = useState("");
  const { isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();
  const { data: recordQueryData } = useQuery(GET_RECORD, {
    variables: { id: referenceTokenId },
  });

  useEffect(() => {
    if (!referenceTokenId || !recordQueryData) {
      return;
    }
    const metadata = JSON.parse(
      recordQueryData.hanabiRecord.uri.split("data:application/json;utf8,")[1]
    );
    setReferenceTokenImage(metadata.image);
    setUsedReferences((prevReferences) => {
      const tokenId = BigInt(referenceTokenId);
      if (prevReferences.some((ref) => ref.tokenId === tokenId)) {
        return prevReferences;
      }
      return [...prevReferences, { tokenId: tokenId, image: metadata.image }];
    });
  }, [referenceTokenId, recordQueryData]);

  const [mode, setMode] = useState<"create" | "info">("create");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"remix" | "loading" | "created">(
    "remix"
  );
  const { width, height } = useWindowSize();

  const [imageDataURL, setImageDataURL] = useState("https://placehold.co/500");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("0.00069");
  const [supply, setSupply] = useState("10000");
  const [isLicenseChecked, setIsLicenseChecked] = useState(false);
  const [createdTokenId, setCreatedTokenId] = useState("0");

  const [usedReferences, setUsedReferences] = useState<
    { tokenId: BigInt; image: string }[]
  >([]);

  const { data: hash, writeContract, reset, error } = useWriteContract();

  useEffect(() => {
    if (error) {
      const message = error.message;
      const truncatedMessage =
        message.length > 80 ? message.substring(0, 80) + "..." : message;
      toast.error(truncatedMessage);
      setIsModalOpen(false);
    }
  }, [error]);

  const { data } = useWaitForTransactionReceipt({
    hash,
  });

  const editorRef = useRef<PixelEditorRef>(null);

  useEffect(() => {
    if (!data) {
      return;
    }
    const [event] = data.logs.filter(
      (log) =>
        log.topics[0] ===
        "0x1d7b926079bb4859082b228aba22de714d0353236d39b39308748de221150153"
    );
    const tokenIdHex = event.topics[1];
    if (!tokenIdHex) {
      return;
    }
    const tokenId = parseInt(tokenIdHex, 16);
    setCreatedTokenId(tokenId.toString());
    setModalMode("created");
  }, [data]);

  const onRemixTokenSelected = (tokenId: BigInt, image: string) => {
    const newReference = {
      tokenId: tokenId,
      image: image,
    };
    setUsedReferences((prevReferences) => {
      if (prevReferences.some((ref) => ref.tokenId === tokenId)) {
        return prevReferences;
      }
      return [...prevReferences, newReference];
    });
  };

  return (
    <div className={`flex flex-col flex-grow ${mode == "info" && "pb-[70px]"}`}>
      <div
        className={`flex flex-col flex-grow mt-5 ${
          mode !== "create" ? "hidden" : ""
        }`}
      >
        <PixelEditor
          ref={editorRef}
          referenceTokenImage={referenceTokenImage}
          onRemixTokenSelected={onRemixTokenSelected}
        />
      </div>
      {mode == "info" && (
        <div className="flex border-b border-solid border-[#888888] px-3 flex-grow">
          <div className="flex flex-col md:flex-row w-full">
            <div className="w-full md:w-2/3 py-12">
              <img
                src={imageDataURL}
                className="bg-white rounded-xl w-96 aspect-square mx-auto mb-8 object-cover"
              />

              {usedReferences.length > 0 && (
                <>
                  <div className="text-xl font-bold tracking-wide text-white mb-4">
                    SOURCE
                  </div>
                  <div className="flex gap-4 overflow-x-auto">
                    {usedReferences.map((reference, i) => (
                      <img
                        key={`source_${i}`}
                        src={reference.image}
                        className="bg-white rounded-xl h-40 w-40"
                      />
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="w-full md:w-1/3 justify-center py-12 pl-0 md:pl-12 border-t md:border-l md:border-t-0 border-solid border-[#888888]">
              <div className="flex gap-2.5 px-px mt-5 text-lg font-bold tracking-wide leading-5 text-red-600 mb-2">
                <div className="text-lg font-bold tracking-wider text-white">
                  LICENSE <span className="text-red-600">*</span>
                </div>
              </div>
              <div className="flex items-center mb-4">
                <input
                  type="checkbox"
                  className="accent-green-600  cursor-pointer"
                  checked={isLicenseChecked}
                  onChange={(e) => setIsLicenseChecked(e.target.checked)}
                />
                <div
                  className="text-lg tracking-wide text-white pl-4 pr-2 cursor-pointer"
                  onClick={() => {
                    setIsLicenseChecked(!isLicenseChecked);
                  }}
                >
                  CC0
                </div>
              </div>
              <div className="text-lg font-bold tracking-wider text-white mb-2">
                TITLE <span className="text-red-600">*</span>
              </div>
              <input
                type="text"
                className="w-full bg-[#191D88] border border-solid border-[#888888] rounded-xl focus:border-[#22CC02] focus:outline-none p-3 text-white mb-6"
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
                className="w-full bg-[#191D88] border border-solid border-[#888888] rounded-xl focus:border-[#22CC02] focus:outline-none p-3 text-white mb-6"
                rows={5}
                placeholder="Enter description here"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />

              <div className="flex justify-between mb-2">
                <div className="text-lg font-bold tracking-wider text-white">
                  PRICE
                </div>
              </div>
              <div className="relative mb-6">
                <input
                  type="text"
                  className="text-xl bg-[#191D88] border border-solid border-[#888888] rounded-xl focus:border-[#22CC02] focus:outline-none p-3 text-white text-center w-full"
                  required
                  disabled
                  value={price}
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                  <span className="text-white">ETH</span>
                </div>
              </div>
              <div className="text-lg font-bold tracking-wider text-white mb-2">
                SUPPLY
              </div>
              <div className="relative flex items-center">
                <input
                  type="text"
                  className="text-xl bg-[#191D88] border border-solid border-[#888888] rounded-xl focus:border-[#22CC02] focus:outline-none p-3 text-white w-full text-center px-12"
                  required
                  disabled
                  value={supply}
                />
              </div>
            </div>
          </div>
        </div>
      )}
      <div
        className={`fixed bottom-0 right-0 flex justify-between px-3 h-10 mb-3 ${
          mode == "create" ? "w-48" : "w-full"
        }`}
      >
        {mode == "info" ? (
          <button
            type="button"
            className="px-4 font-bold bg-[#888888] text-[#191D88] rounded-2xl hover:opacity-75 transition-opacity duration-300 tracking-wider"
            onClick={() => setMode("create")}
          >
            BACK
          </button>
        ) : (
          <div />
        )}
        {mode == "info" && !isConnected ? (
          <button
            className="text-center px-8 py-2 font-bold text-[#191D88] bg-[#FFD582] rounded-xl hover:opacity-75 transition-opacity duration-300 tracking-wider"
            onClick={openConnectModal}
          >
            Connect Wallet
          </button>
        ) : (
          <button
            className="text-center px-8 py-2 font-bold text-[#191D88] bg-[#FFD582] rounded-xl hover:opacity-75 transition-opacity duration-300 tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={
              mode === "info" && (!isLicenseChecked || !title || !isConnected)
            }
            onClick={() => {
              if (mode == "create") {
                setMode("info");
                if (editorRef.current) {
                  const image = editorRef.current.getImageDataURL();
                  setImageDataURL(image);
                }
              } else {
                reset();
                setIsModalOpen(true);
                setModalMode("loading");
                const escapedTitle = escapeString(title);
                const escapedDescription = escapeString(description);
                const base64 = imageDataURL.split(",")[1];
                const buffer = Buffer.from(base64, "base64");
                const imageHex = buffer.toString("hex");
                const zippedHexImage = solady.LibZip.flzCompress(
                  imageHex
                ) as Hex;
                writeContract({
                  address: EIS_HANABI_ADDRESS,
                  abi: eisHanabiAbi,
                  functionName: "create",
                  args: [
                    escapedTitle,
                    escapedDescription,
                    1,
                    "image/png",
                    chunk(zippedHexImage),
                    usedReferences.map((val) => BigInt(val.tokenId.toString())),
                    true,
                  ],
                });
              }
            }}
          >
            {mode == "create" ? "COMPLETE" : "CREATE"}
          </button>
        )}
      </div>
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white bg-opacity-25 backdrop-blur-sm">
          {modalMode == "created" && <Confetti width={width} height={height} />}
          <div className="relative flex flex-col w-full max-w-sm rounded-xl shadow-xl bg-[#191D88] m-3">
            <button
              className="absolute text-white right-2.5 top-3"
              onClick={() => setIsModalOpen(false)}
            >
              <img
                src="/assets/campaign/based-hanabi/icons/x.svg"
                className="shrink-0 aspect-[1.41] fill-white h-4"
              />
            </button>
            <div className="py-10 px-3 md:px-6">
              {modalMode == "loading" && (
                <>
                  <div className="flex mb-6 justify-between items-center">
                    <div className="text-white text-xl font-bold tracking-wider">
                      CREATING...
                    </div>
                  </div>
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
              {modalMode == "created" && (
                <>
                  <div className="flex mb-6 justify-between items-center">
                    <div className="text-white text-xl font-bold tracking-wider">
                      CREATE COMPLETED!! 🎉
                    </div>
                  </div>
                  <div className="mb-6 px-6">
                    <img
                      loading="lazy"
                      srcSet={imageDataURL}
                      className="bg-white rounded-xl w-full mx-auto"
                    />
                  </div>
                  <div className="flex flex-col space-y-3 mb-6">
                    <button
                      className="font-bold bg-[#111111] px-3 h-14 text-2xl rounded-xl text-white flex justify-center items-center text-center flex gap-4 hover:opacity-75 transition-opacity duration-300 tracking-wider text-center"
                      onClick={() => {
                        window.open(
                          `https://twitter.com/intent/tweet?text=I%20would%20love%20to%20see%20this%20remixed%20%F0%9F%94%81%20%F0%9F%AB%B0%20%0A%0Ahttps%3A%2F%2Feis.toys%2Fcampaign%2Fbased-hanabi%2Fartworks%2F${createdTokenId}%3Fver%3Dmainnet-2%20%0A%0A%23eistoys%20%0A%23basedhanabi`,
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
                          `https://warpcast.com/~/compose?text=I%20would%20love%20to%20see%20this%20remixed%20%F0%9F%94%81%20%F0%9F%AB%B0%20%40eistoys%20%23basedhanabi&embeds[]=https://eis.toys/campaign/based-hanabi/artworks/${createdTokenId}?ver=mainnet-2`,
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
                    The artwork you created has been carved onchain as CC0. 🎉
                    <br />
                    This public good benefits everyone! ✨
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CreatePageWrapper() {
  return (
    <Suspense>
      <CampaignBasedHanabiArtworkCreatePage />
    </Suspense>
  );
}
