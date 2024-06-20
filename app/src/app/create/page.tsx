"use client";

import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { FaCheck, FaRegQuestionCircle } from "react-icons/fa";
import useWindowSize from "react-use/lib/useWindowSize";
import Confetti from "react-confetti";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { readContract } from "@wagmi/core";
import {
  blobToArrayBuffer,
  bufferToDataURL,
  decodeDataURLToSVG,
  encodeSVGToDataURL,
  escapeString,
} from "@/lib/utils";
import { EIS_ADDRESS } from "@/lib/eis/constants";
import { eisAbi } from "@/lib/eis/abi";
import { Hex } from "viem";

import { wagmiConfig } from "@/lib/wagmi";

import { useSearchParams } from "next/navigation";

import solady from "solady";
import { chunk } from "@/lib/eis/chunk";
import { SpinnerLoader } from "@/components/SpinnerLoader";

function CreatePage() {
  // const ref = useRef<HTMLIFrameElement>(null);
  const searchParams = useSearchParams();
  const referenceTokenId = searchParams.get("referenceTokenId");
  const ver = searchParams.get("ver");
  const network = searchParams.get("network");

  // MEMO: Stop and reload if the network and version is not supported
  useEffect(() => {
    if (ver == "testnet-1") {
      alert(
        "Remix for old version NFT is not longer supported. Please refresh the page."
      );
      window.location.href = "/create";
    }
  }, [ver]);

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

  const [imageDataURL, setImageDataURL] = useState("");
  const [imageHex, setImageHex] = useState("");

  const [createdTokenId, setCreatedTokenId] = useState("");
  const [references, setReferences] = useState<
    {
      tokenId: BigInt;
      image: string;
    }[]
  >([]);

  const [usedReferences, setUsedReferences] = useState<
    { tokenId: BigInt; image: string }[]
  >([]);

  const pendingReference = useRef<{ tokenId: BigInt; image: string } | null>(
    null
  );

  // Debounce function
  const debounce = (func: (...args: any[]) => void, delay: number) => {
    let timer: NodeJS.Timeout;
    return (...args: any[]) => {
      clearTimeout(timer);
      timer = setTimeout(() => func(...args), delay);
    };
  };

  const addUsedReference = (newReference: {
    tokenId: BigInt;
    image: string;
  }) => {
    pendingReference.current = newReference;
    debouncedInsert();
  };

  const insertReference = () => {
    const newReference = pendingReference.current;
    if (newReference) {
      const isDuplicate = usedReferences.some(
        (ref) => ref.tokenId === newReference.tokenId
      );
      if (!isDuplicate) {
        setUsedReferences((prevReferences) => [
          ...prevReferences,
          newReference,
        ]);
        pendingReference.current = null; // Reset pending reference after insertion
      } else {
        console.log("Duplicate reference found. Not adding to the list.");
      }
    }
  };

  const debouncedInsert = useRef(debounce(insertReference, 300)).current;

  useEffect(() => {
    const handleBeforeUnload = () => {
      localStorage.removeItem("pc-canvas-data");
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  const [node, setNode] = useState<HTMLIFrameElement | null>(null);
  const setRef = useCallback((node: HTMLIFrameElement | null) => {
    setNode(node);
  }, []);

  useEffect(() => {
    if (!referenceTokenId || !node) {
      setImageLoaded(true);
      return;
    }
    readContract(wagmiConfig, {
      address: EIS_ADDRESS,
      abi: eisAbi,
      functionName: "loadImage",
      args: [BigInt(referenceTokenId)],
    })
      .then((data) => {
        if (data) {
          node.contentWindow?.postMessage(
            { type: "remix", value: data },
            process.env.NEXT_PUBLIC_APP_URL || ""
          );

          addUsedReference({
            tokenId: BigInt(referenceTokenId),
            image: data,
          });
        }
        setImageLoaded(true);
      })
      .catch(() => {
        setImageLoaded(true);
      });
  }, [referenceTokenId, node]);

  useEffect(() => {
    if (!error) {
      return;
    }
    console.error(error.message);
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
      if (event.data.type === "blob") {
        const blob = event.data.value;
        blobToArrayBuffer(blob).then((arrayBuffer) => {
          const buffer = Buffer.from(arrayBuffer);
          const imageHex = buffer.toString("hex");
          console.log("imageHex", imageHex);
          setImageHex(imageHex);
          const dataUrl = bufferToDataURL(buffer);
          setImageDataURL(dataUrl);
          setMode("info");
        });
      }
      if (event.data.type === "remix") {
        setModalMode("remix");
        setIsModalOpen(true);
        if (references.length > 0) {
          return;
        }
        readContract(wagmiConfig, {
          address: EIS_ADDRESS,
          abi: eisAbi,
          functionName: "tokenIdCounter",
        }).then((totalSupply) => {
          let start = totalSupply - BigInt(9);
          if (start < 0) {
            start = BigInt(0);
          }
          readContract(wagmiConfig, {
            address: EIS_ADDRESS,
            abi: eisAbi,
            functionName: "uris",
            args: [start, totalSupply],
          }).then((uris) => {
            const references = uris
              .map((uri, i) => {
                try {
                  return {
                    tokenId: start + BigInt(i),
                    ...JSON.parse(uri.split("data:application/json;utf8,")[1]),
                  };
                } catch {
                  return undefined;
                }
              })
              .filter((v) => v);
            setReferences(references);
          });
        });
      }
    };

    window.addEventListener("message", handleMessage);

    // Cleanup function
    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [node]);

  return (
    <>
      {mode === "image" && (
        <div className="flex flex-col flex-grow">
          {imageLoaded && (
            <>
              <iframe
                ref={setRef}
                id="svg-editor-iframe"
                src="/editor/index.html"
                className="flex-grow"
                style={{ border: "none" }}
              />

              <div className="flex justify-end py-4 px-4 md:px-8">
                <button
                  type="button"
                  className="px-4 py-1.5 font-bold text-[#22CC02] rounded-2xl bg-[#1A331A] border-2 border-[#00FF00] hover:opacity-75 transition-opacity duration-300 tracking-wider flex items-center"
                  onClick={() => {
                    node?.contentWindow?.postMessage(
                      { type: "complete" },
                      process.env.NEXT_PUBLIC_APP_URL || ""
                    );
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
        <div className="flex flex-col flex-grow">
          <div className="flex border-b border-solid border-zinc-600 px-4 flex-grow">
            <div className="flex flex-col md:flex-row w-full">
              <div className="w-full md:w-2/3 py-12">
                <img
                  loading="lazy"
                  src={imageDataURL}
                  className="bg-white rounded-xl w-96 aspect-square mx-auto mb-8 object-cover"
                />

                {usedReferences.length > 0 && (
                  <>
                    <div className="text-xl font-bold tracking-wide text-white mb-4">
                      SOURCE
                    </div>
                    <div className="flex gap-4">
                      <img
                        // key={`source_${i}`}
                        src={usedReferences[usedReferences.length - 1].image}
                        className="bg-white rounded-xl h-40 w-40"
                      />
                      {/* {usedReferences.map((reference, i) => (
                      <img
                        key={`source_${i}`}
                        src={reference.image}
                        className="bg-white rounded-xl h-40 w-40"
                      />
                    ))} */}
                    </div>
                  </>
                )}
              </div>

              <div className="w-full md:w-1/3 justify-center py-12 pl-0 md:pl-12 border-t md:border-l md:border-t-0 border-solid border-zinc-600">
                <div className="text-lg font-bold tracking-wider text-white mb-2">
                  TITLE <span className="text-red-600">*</span>
                </div>
                <input
                  type="text"
                  className="w-full bg-[#222222] border border-solid border-zinc-500 rounded-xl focus:border-[#22CC02] focus:outline-none p-4 text-white mb-6"
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
                  className="w-full bg-[#222222] border border-solid border-zinc-500 rounded-xl focus:border-[#22CC02] focus:outline-none p-4 text-white mb-6"
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
                  <div className="text-lg tracking-wide text-white mr-2">
                    CC0
                  </div>
                  {/* <FaRegQuestionCircle
                  className="text-gray-500 cursor-pointer"
                  size="12"
                /> */}
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-between py-4 px-4 md:px-8">
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
                const escapedTitle = escapeString(title);
                const escapedDescription = escapeString(description);
                console.log("escapedTitle", escapedTitle);
                console.log("escapedDescription", escapedDescription);

                const zippedHexImage = solady.LibZip.flzCompress(
                  imageHex
                ) as Hex;
                if (usedReferences.length == 0) {
                  writeContract({
                    address: EIS_ADDRESS,
                    abi: eisAbi,
                    functionName: "create",
                    args: [
                      escapedTitle,
                      escapedDescription,
                      "image/png",
                      chunk(zippedHexImage),
                    ],
                  });
                } else {
                  // const referenceTokenIds = usedReferences.map(
                  //   (reference) => reference.tokenId as bigint
                  // );
                  // const allocations = usedReferences.map(() => BigInt(10000));
                  // writeContract({
                  //   address: EIS_ADDRESS,
                  //   abi: eisAbi,
                  //   functionName: "remix",
                  //   args: [
                  //     escapedTitle,
                  //     escapedDescription,
                  //     "image/png",
                  //     chunk(zippedHexImage),
                  //     referenceTokenIds.sort(),
                  //     allocations,
                  //   ],
                  // });
                  writeContract({
                    address: EIS_ADDRESS,
                    abi: eisAbi,
                    functionName: "remix",
                    args: [
                      escapedTitle,
                      escapedDescription,
                      "image/png",
                      chunk(zippedHexImage),
                      [
                        usedReferences[usedReferences.length - 1]
                          .tokenId as bigint,
                      ],
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
          <div className="relative flex flex-col py-8 px-6 w-full max-w-lg rounded-3xl shadow-2xl bg-neutral-800 m-4">
            {modalMode == "remix" && (
              <>
                <div className="flex mb-4">
                  <div className="text-white text-xl font-bold tracking-wider">
                    Remix
                  </div>
                  <button
                    className="absolute top-6 right-4 text-4xl text-white"
                    onClick={() => {
                      setIsModalOpen(false);
                    }}
                  >
                    &times;
                  </button>
                </div>
                <div className="text-white tracking-wider text-sm font-bold mb-6">
                  Only the latest 9 images are displayed. Stay tuned for
                  updates!
                </div>
                {references.length === 0 && <SpinnerLoader />}
                <div className="grid grid-cols-3 gap-4">
                  {references.map((reference, i) => {
                    return (
                      <img
                        key={`remix_${i}`}
                        src={reference.image}
                        className="bg-white rounded-xl cursor-pointer"
                        onClick={() => {
                          node?.contentWindow?.postMessage(
                            {
                              type: "remix",
                              value: reference.image,
                            },
                            process.env.NEXT_PUBLIC_APP_URL || ""
                          );
                          addUsedReference(reference);
                          setIsModalOpen(false);
                        }}
                      />
                    );
                  })}
                </div>
              </>
            )}
            {modalMode == "loading" && (
              <>
                <div className="text-white text-xl font-bold tracking-wider">
                  CREATING...
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
                        `https://warpcast.com/~/compose?text=Check%20out%20the%20image%20created%20in%20@eistoys&embeds[]=https://eis.toys/artworks/${createdTokenId}?ver=testnet-2`,
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
