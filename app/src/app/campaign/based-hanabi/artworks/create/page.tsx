"use client";

import PixelEditor from "@/components/PixelEditor";
import { useState } from "react";

export default function CampaignBasedHanabiArtworkCreatePage() {
  const [mode, setMode] = useState<"create" | "info">("create");

  const [imageDataURL, setImageDataURL] = useState("https://placehold.co/500");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("0.00069");
  const [supply, setSupply] = useState("∞");
  const [isLicenseChecked, setIsLicenseChecked] = useState(false);

  const [usedReferences, setUsedReferences] = useState<
    { tokenId: BigInt; image: string }[]
  >([
    { tokenId: BigInt(1), image: "https://placehold.co/500" },
    { tokenId: BigInt(2), image: "https://placehold.co/500" },
    { tokenId: BigInt(3), image: "https://placehold.co/500" },
  ]);

  return (
    <div className="pb-[70px]">
      {mode == "create" && <PixelEditor />}
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
          onClick={() => setMode("info")}
        >
          Complete
        </button>
      </div>
    </div>
  );
}
