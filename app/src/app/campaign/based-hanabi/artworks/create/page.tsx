"use client";

import PixelEditor from "@/components/PixelEditor";
import { SpinnerLoader } from "@/components/SpinnerLoader";
import { useState } from "react";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";

export default function CampaignBasedHanabiArtworkCreatePage() {
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
  const [supply, setSupply] = useState("∞");
  const [isLicenseChecked, setIsLicenseChecked] = useState(false);
  const [createdTokenId, setCreatedTokenId] = useState("");

  const [usedReferences, setUsedReferences] = useState<
    { tokenId: BigInt; image: string }[]
  >([
    { tokenId: BigInt(1), image: "https://placehold.co/500" },
    { tokenId: BigInt(2), image: "https://placehold.co/500" },
    { tokenId: BigInt(3), image: "https://placehold.co/500" },
  ]);

  return (
    <div className={`flex flex-col flex-grow ${mode == "info" && "pb-[70px]"}`}>
      {mode == "create" && (
        <div className="flex flex-col flex-grow justify-center">
          <PixelEditor />
        </div>
      )}
      {mode == "info" && (
        <div className="flex border-b border-solid border-[#888888] px-4 flex-grow">
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
              <div className="relative flex items-center mb-4">
                <button
                  type="button"
                  className="absolute left-0 text-white w-12 h-12"
                >
                  -
                </button>
                <input
                  type="text"
                  className="text-xl bg-[#191D88] border border-solid border-[#888888] rounded-xl focus:border-[#22CC02] focus:outline-none p-3 text-white w-full text-center px-12"
                  required
                  disabled
                  value={supply}
                />
                <button
                  type="button"
                  className="absolute right-0 text-white w-12 h-12"
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
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="fixed bottom-0 left-0 w-full flex justify-between p-4">
        {mode == "info" ? (
          <button
            type="button"
            className="px-4 py-1.5 font-bold border border-gray-500 text-gray-500 rounded-2xl hover:opacity-75 transition-opacity duration-300 tracking-wide"
            onClick={() => setMode("create")}
          >
            Back
          </button>
        ) : (
          <div />
        )}
        <button
          className="text-center px-8 py-2 font-bold text-[#191D88] bg-[#FFD582] rounded-xl hover:opacity-75 transition-opacity duration-300 "
          onClick={() => {
            if (mode == "create") {
              setMode("info");
            } else {
              setIsModalOpen(true);
              setModalMode("loading");
              setTimeout(() => {
                setModalMode("created");
              }, 3000);
            }
          }}
        >
          Complete
        </button>
      </div>
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white bg-opacity-25 backdrop-blur-sm">
          {modalMode == "created" && <Confetti width={width} height={height} />}
          <div className="relative flex flex-col py-8 px-6 w-full max-w-lg rounded-3xl shadow-2xl bg-[#191D88] m-4">
            {modalMode == "loading" && (
              <>
                <div className="flex mb-8">
                  <div className="text-white text-xl font-bold tracking-wider">
                    CREATING...
                  </div>
                  <button
                    className="absolute top-6 right-4 text-4xl text-white"
                    onClick={() => setIsModalOpen(false)}
                  >
                    &times;
                  </button>
                </div>
                <SpinnerLoader />
                <div className="text-white tracking-wider text-center text-md md:text-xl font-bold">
                  Please don't close this modal
                  <br />
                  until the transaction is completed.
                </div>
              </>
            )}
            {modalMode == "created" && (
              <>
                <div className="flex mb-8">
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
                <img
                  loading="lazy"
                  srcSet={imageDataURL}
                  className="bg-white rounded-xl h-64 w-64 mx-auto mb-8"
                />
                <div className="flex gap-4 px-0 md:px-8 pb-8 mb-4 border-b border-solid border-zinc-600">
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
                        `https://warpcast.com/~/compose?text=I%20would%20love%20to%20see%20this%20remixed%20%F0%9F%94%81%20%F0%9F%AB%B0%20%40eistoys&embeds[]=https://eis.toys/artworks/${createdTokenId}?ver=testnet-2`,
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
                <div className="text-white tracking-wider text-center text-xs md:text-sm font-bold">
                  The artwork you created has been carved onchain as CC0. 🎉
                  <br />
                  This public good benefits everyone! ✨
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
