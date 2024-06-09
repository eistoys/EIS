"use client";

import { useEffect, useState } from "react";

import { FaCheck, FaRegQuestionCircle } from "react-icons/fa";

import useWindowSize from "react-use/lib/useWindowSize";
import Confetti from "react-confetti";

export default function CreatePage() {
  const { width, height } = useWindowSize();

  const [mode, setMode] = useState<"image" | "info">("image");
  const [modalMode, setModalMode] = useState<"loading" | "created">("loading");
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  return (
    <>
      {mode === "image" && (
        <div className="flex flex-col flex-grow">
          <iframe
            id="svg-editor-iframe"
            src="/editor/index.html"
            className="flex-grow"
            style={{ border: "none" }}
          />
          <div className="flex justify-end py-4 px-20">
            <button
              type="button"
              className="px-4 py-1.5 font-bold text-[#22CC02] rounded-2xl bg-[#1A331A] border-2 border-[#00FF00] hover:opacity-75 transition-opacity duration-300 tracking-wider flex items-center"
              onClick={() => setMode("info")}
            >
              COMPLETE
            </button>
          </div>
        </div>
      )}
      {mode === "info" && (
        <div>
          <div className="flex border-b border-solid border-zinc-600 px-20">
            <div className="flex flex-col w-2/3 py-12">
              <img
                loading="lazy"
                srcSet="https://cdn.builder.io/api/v1/image/assets/TEMP/a4791fe2b20660da9f933316b81dec9569baa1b2f0dc477ce4a9dd5bb9823c7f?apiKey=5b267050b6bf44e5a34a2a79f0903d25&width=100 100w, https://cdn.builder.io/api/v1/image/assets/TEMP/a4791fe2b20660da9f933316b81dec9569baa1b2f0dc477ce4a9dd5bb9823c7f?apiKey=5b267050b6bf44e5a34a2a79f0903d25&width=200 200w, https://cdn.builder.io/api/v1/image/assets/TEMP/a4791fe2b20660da9f933316b81dec9569baa1b2f0dc477ce4a9dd5bb9823c7f?apiKey=5b267050b6bf44e5a34a2a79f0903d25&width=400 400w, https://cdn.builder.io/api/v1/image/assets/TEMP/a4791fe2b20660da9f933316b81dec9569baa1b2f0dc477ce4a9dd5bb9823c7f?apiKey=5b267050b6bf44e5a34a2a79f0903d25&width=800 800w, https://cdn.builder.io/api/v1/image/assets/TEMP/a4791fe2b20660da9f933316b81dec9569baa1b2f0dc477ce4a9dd5bb9823c7f?apiKey=5b267050b6bf44e5a34a2a79f0903d25&width=1200 1200w, https://cdn.builder.io/api/v1/image/assets/TEMP/a4791fe2b20660da9f933316b81dec9569baa1b2f0dc477ce4a9dd5bb9823c7f?apiKey=5b267050b6bf44e5a34a2a79f0903d25&width=1600 1600w, https://cdn.builder.io/api/v1/image/assets/TEMP/a4791fe2b20660da9f933316b81dec9569baa1b2f0dc477ce4a9dd5bb9823c7f?apiKey=5b267050b6bf44e5a34a2a79f0903d25&width=2000 2000w, https://cdn.builder.io/api/v1/image/assets/TEMP/a4791fe2b20660da9f933316b81dec9569baa1b2f0dc477ce4a9dd5bb9823c7f?apiKey=5b267050b6bf44e5a34a2a79f0903d25&"
                className="h-96 w-96 mx-auto mb-8"
              />
              <div className="text-xl font-bold tracking-wide text-white mb-4">
                SOURCE
              </div>
              <div className="flex gap-4">
                <div className="bg-white rounded-xl h-40 w-40" />
              </div>
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
              />
              <div className="text-lg font-bold tracking-wider text-white mb-2">
                DESCRIPTION{" "}
                <span className="text-base font-medium">(Optional)</span>
              </div>
              <textarea
                className="bg-[#222222] border border-solid border-zinc-500 rounded-xl focus:border-[#22CC02] focus:outline-none p-4 text-white mb-6"
                rows={5}
                placeholder="Enter description here"
              />

              <div className="flex justify-between mb-2">
                <div className="text-lg font-bold tracking-wider text-white">
                  PRICE
                </div>
                <div className="text-base underline tracking-wider text-white cursor-pointer">
                  Reset
                </div>
              </div>
              <div className="relative mb-6">
                <input
                  type="text"
                  className="bg-[#222222] border border-solid border-zinc-500 rounded-xl focus:border-[#22CC02] focus:outline-none p-4 text-white text-center w-full"
                  required
                  onChange={(e) => {
                    e.target.value = e.target.value.replace(/[^0-9.]/g, "");
                  }}
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
                  className="bg-[#222222] border border-solid border-zinc-500 rounded-xl focus:border-[#22CC02] focus:outline-none p-4 text-white w-full text-center px-12"
                  required
                  onChange={(e) => {
                    e.target.value = e.target.value.replace(/[^0-9.∞]/g, "");
                  }}
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
                <input type="checkbox" className="accent-green-600 mr-4" />
                <div className="text-lg tracking-wide text-white mr-2">CC0</div>
                <FaRegQuestionCircle
                  className="text-gray-500 cursor-pointer"
                  size="12"
                />
              </div>
            </div>
          </div>
          <div className="flex justify-between py-4 px-20">
            <button
              type="button"
              className="px-4 py-1.5 font-bold border border-gray-500 text-gray-500 rounded-2xl hover:opacity-75 transition-opacity duration-300 tracking-wide"
              onClick={() => setMode("image")}
            >
              Back
            </button>
            <button
              type="button"
              className="px-4 py-1.5 font-bold text-[#22CC02] rounded-2xl bg-[#1A331A] border-2 border-[#00FF00] hover:opacity-75 hover:opacity-75 transition-opacity duration-300 tracking-wide flex items-center"
              onClick={() => {
                setModalMode("loading");
                setIsModalOpen(true);
                setTimeout(() => {
                  setModalMode("created");
                }, 3000);
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
                <img
                  loading="lazy"
                  srcSet="https://cdn.builder.io/api/v1/image/assets/TEMP/626acacdbbd55d47b9ea169c7baba3cf3d7b6e92cf32817dbc902fac3df3811d?apiKey=5b267050b6bf44e5a34a2a79f0903d25&width=100 100w, https://cdn.builder.io/api/v1/image/assets/TEMP/626acacdbbd55d47b9ea169c7baba3cf3d7b6e92cf32817dbc902fac3df3811d?apiKey=5b267050b6bf44e5a34a2a79f0903d25&width=200 200w, https://cdn.builder.io/api/v1/image/assets/TEMP/626acacdbbd55d47b9ea169c7baba3cf3d7b6e92cf32817dbc902fac3df3811d?apiKey=5b267050b6bf44e5a34a2a79f0903d25&width=400 400w, https://cdn.builder.io/api/v1/image/assets/TEMP/626acacdbbd55d47b9ea169c7baba3cf3d7b6e92cf32817dbc902fac3df3811d?apiKey=5b267050b6bf44e5a34a2a79f0903d25&width=800 800w, https://cdn.builder.io/api/v1/image/assets/TEMP/626acacdbbd55d47b9ea169c7baba3cf3d7b6e92cf32817dbc902fac3df3811d?apiKey=5b267050b6bf44e5a34a2a79f0903d25&width=1200 1200w, https://cdn.builder.io/api/v1/image/assets/TEMP/626acacdbbd55d47b9ea169c7baba3cf3d7b6e92cf32817dbc902fac3df3811d?apiKey=5b267050b6bf44e5a34a2a79f0903d25&width=1600 1600w, https://cdn.builder.io/api/v1/image/assets/TEMP/626acacdbbd55d47b9ea169c7baba3cf3d7b6e92cf32817dbc902fac3df3811d?apiKey=5b267050b6bf44e5a34a2a79f0903d25&width=2000 2000w, https://cdn.builder.io/api/v1/image/assets/TEMP/626acacdbbd55d47b9ea169c7baba3cf3d7b6e92cf32817dbc902fac3df3811d?apiKey=5b267050b6bf44e5a34a2a79f0903d25&"
                  className="h-64 w-64 mx-auto mb-8"
                />
                <div className="flex gap-4 px-8 pb-8 mb-4 border-b border-solid border-zinc-600">
                  <button
                    className="w-1/2 font-bold text-white px-4 py-2 text-lg font-bold border-2 rounded-xl border-white hover:opacity-75 transition-opacity duration-300 tracking-wider text-center"
                    onClick={() => setIsModalOpen(false)}
                  >
                    OK
                  </button>
                  <button className="w-1/2 font-bold bg-violet-800 px-4 py-2 text-lg rounded-xl text-white flex justify-center items-center text-center flex gap-4 hover:opacity-75 transition-opacity duration-300 tracking-wider text-center">
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
