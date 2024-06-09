"use client";

import { useState } from "react";

import { FaCheck, FaRegQuestionCircle } from "react-icons/fa";

export default function CreatePage() {
  const [mode, setMode] = useState<"image" | "info">("image");
  const [modalMode, setModalMode] = useState<"loading" | "created">("loading");
  const [isModalOpen, setIsModalOpen] = useState(false);

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
              className="px-4 py-1.5 font-bold text-[#22CC02] rounded-2xl bg-[#1A331A] border-2 border-[#00FF00] hover:bg-[#0F1E0F] transition-colors duration-300"
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

            <div className="flex flex-col w-1/3 justify-center py-12 pl-12 w-full border-l border-solid border-zinc-600">
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
                  className="bg-[#222222] border border-solid border-zinc-500 rounded-xl focus:border-[#22CC02] focus:outline-none p-4 text-white w-full"
                  placeholder="Enter price here"
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
                <div className="text-xl font-semibold tracking-wide leading-6 text-right text-white mr-2">
                  CC0
                </div>
                <FaRegQuestionCircle className="text-gray-500" size="12" />
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
              onClick={() => setMode("info")}
            >
              <FaCheck className="mr-2" size="18" />
              CREATE
            </button>
          </div>
        </div>
      )}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="flex flex-col self-stretch px-5 pt-5 pb-10 my-auto w-full max-w-lg text-2xl font-bold tracking-wide text-white rounded-3xl shadow-2xl bg-neutral-800 max-md:mt-10 max-md:max-w-full">
            {modalMode == "loading" && (
              <>
                <div className="leading-[120%] max-md:max-w-full">
                  CREATING...
                </div>
                <img
                  loading="lazy"
                  src="https://cdn.builder.io/api/v1/image/assets/TEMP/8325f464b2e0e5f77b6412f7fac6008931b132ddce73d8374b3c1eeded246e8e?apiKey=5b267050b6bf44e5a34a2a79f0903d25&"
                  className="self-center mt-5 max-w-full aspect-square w-[180px]"
                />
                <div className="mt-10 leading-7 text-center max-md:max-w-full">
                  Please don't close this modal
                  <br />
                  until the transaction is completed.
                </div>
              </>
            )}
            {modalMode == "created" && (
              <>
                <img
                  loading="lazy"
                  src="https://cdn.builder.io/api/v1/image/assets/TEMP/7f9ff530bdff025ad40766568e553b22359e37e8db9bc40a7e02dafc4935b64a?apiKey=5b267050b6bf44e5a34a2a79f0903d25&"
                  className="self-end border-2 border-white border-solid aspect-square stroke-[2px] stroke-white w-[18px] cursor-pointer"
                  onClick={() => setIsModalOpen(false)}
                />
                <div className="mt-2.5 text-2xl leading-7 max-md:max-w-full">
                  CREATE COMPLETED !! 🎉
                </div>
                <img
                  loading="lazy"
                  srcSet="https://cdn.builder.io/api/v1/image/assets/TEMP/626acacdbbd55d47b9ea169c7baba3cf3d7b6e92cf32817dbc902fac3df3811d?apiKey=5b267050b6bf44e5a34a2a79f0903d25&width=100 100w, https://cdn.builder.io/api/v1/image/assets/TEMP/626acacdbbd55d47b9ea169c7baba3cf3d7b6e92cf32817dbc902fac3df3811d?apiKey=5b267050b6bf44e5a34a2a79f0903d25&width=200 200w, https://cdn.builder.io/api/v1/image/assets/TEMP/626acacdbbd55d47b9ea169c7baba3cf3d7b6e92cf32817dbc902fac3df3811d?apiKey=5b267050b6bf44e5a34a2a79f0903d25&width=400 400w, https://cdn.builder.io/api/v1/image/assets/TEMP/626acacdbbd55d47b9ea169c7baba3cf3d7b6e92cf32817dbc902fac3df3811d?apiKey=5b267050b6bf44e5a34a2a79f0903d25&width=800 800w, https://cdn.builder.io/api/v1/image/assets/TEMP/626acacdbbd55d47b9ea169c7baba3cf3d7b6e92cf32817dbc902fac3df3811d?apiKey=5b267050b6bf44e5a34a2a79f0903d25&width=1200 1200w, https://cdn.builder.io/api/v1/image/assets/TEMP/626acacdbbd55d47b9ea169c7baba3cf3d7b6e92cf32817dbc902fac3df3811d?apiKey=5b267050b6bf44e5a34a2a79f0903d25&width=1600 1600w, https://cdn.builder.io/api/v1/image/assets/TEMP/626acacdbbd55d47b9ea169c7baba3cf3d7b6e92cf32817dbc902fac3df3811d?apiKey=5b267050b6bf44e5a34a2a79f0903d25&width=2000 2000w, https://cdn.builder.io/api/v1/image/assets/TEMP/626acacdbbd55d47b9ea169c7baba3cf3d7b6e92cf32817dbc902fac3df3811d?apiKey=5b267050b6bf44e5a34a2a79f0903d25&"
                  className="self-center mt-5 max-w-full aspect-square w-[400px]"
                />
                <div className="mt-5 text-lg leading-5 max-md:max-w-full">
                  TITLE TITLE TITLE TITLE TITLE
                </div>
                <div className="mt-2.5 text-base leading-5 max-md:max-w-full">
                  This piece delves into the therapeutic role of art in our
                  lives. It highlights how art can transport us to places of
                  calmness and tranquillity, symbolized by nature and water,
                  providing a reprieve from the chaos of daily city life.
                </div>
                <div className="justify-center pt-5 mt-10 text-xl leading-6 text-center border-t border-solid border-zinc-600 max-md:max-w-full">
                  The artwork you created has been carved
                  <br />
                  onchain as CC0. 🎉 This is a public good and will benefit
                  everyone ! ✨
                </div>
                <div className="flex gap-5 py-5 mt-5 text-2xl font-extrabold leading-6 whitespace-nowrap max-md:flex-wrap max-md:max-w-full">
                  <div className="flex-1 justify-center items-center px-16 py-4 rounded-xl border-2 border-white border-solid max-md:px-5">
                    OK
                  </div>
                  <div className="flex flex-col flex-1 justify-center px-14 py-4 bg-violet-800 rounded-xl max-md:px-5">
                    <div className="flex gap-5 justify-center px-2.5">
                      <img
                        loading="lazy"
                        src="https://cdn.builder.io/api/v1/image/assets/TEMP/2ba240d0e724425be2b041267b06998427ee6b477e1e5c751c1cda26a12580b1?apiKey=5b267050b6bf44e5a34a2a79f0903d25&"
                        className="shrink-0 aspect-[1.41] fill-white w-[34px]"
                      />
                      <div>SHARE</div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
