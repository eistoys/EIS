"use client";

import { useState } from "react";

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
          <div className="flex flex-col justify-center px-16 py-5 text-lg tracking-wide whitespace-nowrap border-t border-solid border-zinc-600 max-md:px-5 max-md:max-w-full">
            <div className="flex gap-5 justify-between pr-20 mr-7 ml-8 max-w-full w-[1434px] max-md:flex-wrap max-md:pr-5 max-md:mr-2.5">
              <button
                type="button"
                className="py-2.5 px-5 me-2 mb-2 text-sm text-gray-900 focus:outline-none bg-white rounded-full border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 focus:ring-gray-700 bg-gray-800 text-gray-400 border-gray-600 hover:text-white hover:bg-gray-700 font-bold"
              >
                Back
              </button>

              {/* <div className="flex flex-col justify-center self-start p-3 font-extrabold text-green-500 bg-green-900 border-2 border-green-500 border-solid leading-[89%] rounded-[100px]"> */}
              {/* <div className="flex gap-2.5 justify-center px-2.5">
                  <img
                    loading="lazy"
                    src="https://cdn.builder.io/api/v1/image/assets/TEMP/87afd48c5981c21011d57836bf22bd2d3081ccbb548daba1c72162176ee9786f?apiKey=5b267050b6bf44e5a34a2a79f0903d25&"
                    className="shrink-0 self-start border-2 border-green-500 border-solid aspect-[1.28] stroke-[2px] stroke-green-500 w-[18px]"
                  /> */}
              <div
                className="text-white bg-gradient-to-r from-green-400 via-green-500 to-green-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-green-300 focus:ring-green-800 font-bold rounded-full text-sm px-5 py-2.5 text-center me-2 mb-2"
                onClick={() => {
                  setMode("info");
                }}
              >
                CREATE
              </div>
              {/* </div> */}
              {/* </div> */}
            </div>
          </div>
        </div>
      )}
      {mode === "info" && (
        <div className="max-md:max-w-full">
          <div className="flex gap-5 max-md:flex-col max-md:gap-0">
            <div className="flex flex-col w-[67%] max-md:ml-0 max-md:w-full">
              <div className="flex flex-col pt-10 pl-20 max-md:max-w-full">
                <img
                  loading="lazy"
                  srcSet="https://cdn.builder.io/api/v1/image/assets/TEMP/a4791fe2b20660da9f933316b81dec9569baa1b2f0dc477ce4a9dd5bb9823c7f?apiKey=5b267050b6bf44e5a34a2a79f0903d25&width=100 100w, https://cdn.builder.io/api/v1/image/assets/TEMP/a4791fe2b20660da9f933316b81dec9569baa1b2f0dc477ce4a9dd5bb9823c7f?apiKey=5b267050b6bf44e5a34a2a79f0903d25&width=200 200w, https://cdn.builder.io/api/v1/image/assets/TEMP/a4791fe2b20660da9f933316b81dec9569baa1b2f0dc477ce4a9dd5bb9823c7f?apiKey=5b267050b6bf44e5a34a2a79f0903d25&width=400 400w, https://cdn.builder.io/api/v1/image/assets/TEMP/a4791fe2b20660da9f933316b81dec9569baa1b2f0dc477ce4a9dd5bb9823c7f?apiKey=5b267050b6bf44e5a34a2a79f0903d25&width=800 800w, https://cdn.builder.io/api/v1/image/assets/TEMP/a4791fe2b20660da9f933316b81dec9569baa1b2f0dc477ce4a9dd5bb9823c7f?apiKey=5b267050b6bf44e5a34a2a79f0903d25&width=1200 1200w, https://cdn.builder.io/api/v1/image/assets/TEMP/a4791fe2b20660da9f933316b81dec9569baa1b2f0dc477ce4a9dd5bb9823c7f?apiKey=5b267050b6bf44e5a34a2a79f0903d25&width=1600 1600w, https://cdn.builder.io/api/v1/image/assets/TEMP/a4791fe2b20660da9f933316b81dec9569baa1b2f0dc477ce4a9dd5bb9823c7f?apiKey=5b267050b6bf44e5a34a2a79f0903d25&width=2000 2000w, https://cdn.builder.io/api/v1/image/assets/TEMP/a4791fe2b20660da9f933316b81dec9569baa1b2f0dc477ce4a9dd5bb9823c7f?apiKey=5b267050b6bf44e5a34a2a79f0903d25&"
                  className="self-center max-w-full aspect-square w-[620px]"
                />
                <div className="mt-20 ml-2.5 text-xl font-bold tracking-wide leading-6 text-white max-md:mt-10 max-md:max-w-full">
                  SOURCE
                </div>
                <div className="flex gap-5 pr-20 mt-5 ml-2.5 max-md:flex-wrap max-md:pr-5 max-md:max-w-full">
                  <div className="flex flex-col justify-center text-base font-medium tracking-wide leading-5 text-white">
                    <div className="shrink-0 bg-white rounded-xl h-[180px] w-[180px]" />
                    <div className="self-center mt-5">Original Creators 1</div>
                  </div>
                  <div className="flex flex-col justify-center text-base font-medium tracking-wide leading-5 text-white">
                    <div className="shrink-0 bg-white rounded-xl h-[180px] w-[180px]" />
                    <div className="self-center mt-5">Original Creators 2</div>
                  </div>
                  <div className="flex flex-col justify-center text-base font-medium tracking-wide leading-5 whitespace-nowrap text-zinc-800">
                    <div className="shrink-0 rounded-xl bg-zinc-800 h-[180px] w-[180px]" />
                    <div className="self-center mt-5">-</div>
                  </div>
                  <div className="flex flex-col justify-center text-base font-medium tracking-wide leading-5 whitespace-nowrap text-zinc-800">
                    <div className="shrink-0 rounded-xl bg-zinc-800 h-[180px] w-[180px]" />
                    <div className="self-center mt-5">-</div>
                  </div>
                  <div className="flex flex-col justify-center pb-10">
                    <div className="shrink-0 rounded-xl bg-zinc-800 h-[180px]" />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-col ml-5 w-[33%] max-md:ml-0 max-md:w-full">
              <div className="flex flex-col grow justify-center items-start pt-10 pr-20 pl-5 w-full border-l border-solid border-zinc-600 max-md:pr-5 max-md:max-w-full">
                <div className="text-lg font-bold tracking-wide leading-5 text-red-600 max-md:max-w-full">
                  TITLE<span className="text-red-600">*</span>
                </div>
                <input
                  type="text"
                  id="first_name"
                  className="mt-4 bg-gray-50 border border-gray-300 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500"
                  placeholder="John"
                  required
                />

                <div className="mt-5 text-lg font-bold tracking-wide leading-5 text-white max-md:max-w-full">
                  DESCRIPTION{" "}
                  <span className="text-base font-medium">(Optional)</span>
                </div>
                <div className="justify-center px-5 py-2.5 mt-2.5 text-base tracking-wide leading-5 text-white rounded-xl border border-solid border-zinc-500 max-md:max-w-full">
                  This piece delves into the therapeutic role of art in our
                  lives. This piece delves into the therapeutic role of art in
                  our lives. This piece delves into the therapeutic role of art
                  in our lives.{" "}
                </div>
                <div className="flex gap-2.5 px-px mt-5 text-lg font-bold tracking-wide leading-5 text-red-600">
                  <div>
                    LICENSE<span className="text-red-600">*</span>
                  </div>
                  <img
                    loading="lazy"
                    src="https://cdn.builder.io/api/v1/image/assets/TEMP/950c011a227a83965fd462ce5f098285ee7b334eb575ca5985abf360cd2acd1d?apiKey=5b267050b6bf44e5a34a2a79f0903d25&"
                    className="shrink-0 my-auto w-4 aspect-square"
                  />
                </div>
                <div className="flex gap-5 px-5 py-3 mt-2.5 max-md:flex-wrap">
                  <div className="flex flex-col justify-center px-5 py-2.5 my-auto border border-solid border-zinc-500">
                    <div className="shrink-0 w-3.5 h-3.5 bg-white" />
                  </div>
                  <div className="text-xl font-semibold tracking-wide leading-6 text-right text-white">
                    CC0
                  </div>
                </div>
                <div className="flex flex-col py-5 mt-5 w-full border-t border-solid border-zinc-600 max-md:max-w-full">
                  <div className="text-lg font-bold tracking-wide leading-5 text-white max-md:max-w-full">
                    PRICE
                  </div>
                  <div className="flex gap-5 px-5 py-3 mt-2.5 max-md:flex-wrap">
                    <div className="flex flex-col justify-center px-5 py-2.5 my-auto border border-solid border-zinc-500">
                      <div className="shrink-0 w-3.5 h-3.5 bg-white" />
                    </div>
                    <div className="text-xl font-semibold tracking-wide leading-6 text-right text-white">
                      Default
                    </div>
                  </div>
                  <div className="justify-center items-center p-3 mt-2.5 text-2xl font-semibold tracking-wide leading-7 rounded-xl border border-solid border-zinc-500 text-zinc-500 max-md:px-5 max-md:max-w-full">
                    <span className="text-xl ">0.00069 </span>
                    <span className="text-xl">ETH</span>
                  </div>
                  <div className="mt-5 text-lg font-bold tracking-wide leading-5 text-zinc-500 max-md:max-w-full">
                    SUPPLY
                  </div>
                  <div className="flex flex-col justify-center p-3 mt-2.5 text-xl font-extrabold tracking-wide leading-4 whitespace-nowrap rounded-xl border border-solid border-zinc-500 text-zinc-500 max-md:max-w-full">
                    <div className="flex gap-5 justify-between items-center px-2.5">
                      <div className="self-stretch my-auto">-</div>
                      <div className="self-stretch leading-[120%]">∞</div>
                      <div className="self-stretch my-auto">+</div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col py-5 w-full text-base tracking-wide leading-5 text-white border-t border-solid border-zinc-600 max-md:max-w-full">
                  <div className="flex gap-2.5 pr-5 text-lg font-bold max-md:flex-wrap max-md:pr-5">
                    <div>FEE DISTRIBUTION</div>
                    <img
                      loading="lazy"
                      src="https://cdn.builder.io/api/v1/image/assets/TEMP/950c011a227a83965fd462ce5f098285ee7b334eb575ca5985abf360cd2acd1d?apiKey=5b267050b6bf44e5a34a2a79f0903d25&"
                      className="shrink-0 my-auto w-4 aspect-square"
                    />
                  </div>
                  <div className="flex gap-5 justify-between pr-12 mt-5 w-full max-md:flex-wrap max-md:pr-5 max-md:max-w-full">
                    <div className="font-medium">Creator (YOU)</div>
                    <div className="flex gap-2.5 whitespace-nowrap">
                      <div className="underline">0x7a21...33aa13</div>
                      <img
                        loading="lazy"
                        src="https://cdn.builder.io/api/v1/image/assets/TEMP/98f1a3d3c9b896ee1631238c496cb376295bdf3f2ddfd2dcc714847711bed205?apiKey=5b267050b6bf44e5a34a2a79f0903d25&"
                        className="shrink-0 my-auto w-3 aspect-square"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col justify-center p-3 mt-2.5 text-xl font-extrabold leading-4 whitespace-nowrap rounded-xl border border-solid border-zinc-500 max-md:max-w-full">
                    <div className="flex gap-5 justify-between items-center px-2.5">
                      <div className="self-stretch my-auto">-</div>
                      <div className="self-stretch leading-[120%]">80%</div>
                      <div className="self-stretch my-auto">+</div>
                    </div>
                  </div>
                  <div className="flex gap-5 justify-between mt-5 max-md:flex-wrap max-md:max-w-full">
                    <div className="font-medium">Original Creator 1</div>
                    <div>0x7a21...33aa13</div>
                  </div>
                  <div className="flex flex-col justify-center p-3 mt-2.5 text-xl font-extrabold leading-4 whitespace-nowrap rounded-xl border border-solid border-zinc-500 max-md:max-w-full">
                    <div className="flex gap-5 justify-between items-center px-2.5">
                      <div className="self-stretch my-auto">-</div>
                      <div className="self-stretch leading-[120%]">10%</div>
                      <div className="self-stretch my-auto">+</div>
                    </div>
                  </div>
                  <div className="flex gap-5 justify-between mt-5 max-md:flex-wrap max-md:max-w-full">
                    <div className="font-medium">Original Creator 2</div>
                    <div>0x7a21...33aa13</div>
                  </div>
                  <div className="flex flex-col justify-center p-3 mt-2.5 text-xl font-extrabold leading-4 whitespace-nowrap rounded-xl border border-solid border-zinc-500 max-md:max-w-full">
                    <div className="flex gap-5 justify-between items-center px-2.5">
                      <div className="self-stretch my-auto">-</div>
                      <div className="self-stretch leading-[120%]">10%</div>
                      <div className="self-stretch my-auto">+</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col justify-center px-16 py-5 text-lg tracking-wide whitespace-nowrap border-t border-solid border-zinc-600 max-md:px-5 max-md:max-w-full">
            <div className="flex gap-5 justify-between pr-20 mr-7 ml-8 max-w-full w-[1434px] max-md:flex-wrap max-md:pr-5 max-md:mr-2.5">
              <div className="justify-center p-3 font-medium border-2 border-solid border-zinc-500 leading-[100%] rounded-[100px] text-zinc-500 max-md:px-5">
                BACK
              </div>
              <div className="flex flex-col justify-center self-start p-3 font-extrabold text-green-500 bg-green-900 border-2 border-green-500 border-solid leading-[89%] rounded-[100px]">
                <div className="flex gap-2.5 justify-center px-2.5">
                  <img
                    loading="lazy"
                    src="https://cdn.builder.io/api/v1/image/assets/TEMP/87afd48c5981c21011d57836bf22bd2d3081ccbb548daba1c72162176ee9786f?apiKey=5b267050b6bf44e5a34a2a79f0903d25&"
                    className="shrink-0 self-start border-2 border-green-500 border-solid aspect-[1.28] stroke-[2px] stroke-green-500 w-[18px]"
                  />
                  <div
                    className="cursor-pointer"
                    onClick={() => {
                      setIsModalOpen(true);
                      setModalMode("loading");
                      setTimeout(() => {
                        setModalMode("created");
                      }, 3000);
                    }}
                  >
                    CREATE
                  </div>
                </div>
              </div>
            </div>
          </div>
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
        </div>
      )}
    </>
  );
}
