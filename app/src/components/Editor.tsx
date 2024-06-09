import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { readContract } from "@wagmi/core";
import { wagmiConfig } from "@/lib/wagmi";
import { EIS_ADDRESS } from "@/lib/eis/constants";
import { eisAbi } from "@/lib/eis/abi";

export const Editor = () => {
  const searchParams = useSearchParams();
  const referenceTokenId = searchParams.get("referenceTokenId");
  const [imageLoaded, setImageLoaded] = useState(false);

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
        }
        setImageLoaded(true);
      })
      .catch(() => {
        setImageLoaded(true);
      });
  }, [referenceTokenId]);

  return (
    <>
      {imageLoaded && (
        <iframe
          id="svg-editor-iframe"
          src="/editor/index.html"
          className="flex-grow"
          style={{ border: "none" }}
        />
      )}
    </>
  );
};
