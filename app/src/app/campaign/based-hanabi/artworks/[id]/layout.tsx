import "./markdown.css";

import { Montserrat } from "next/font/google";
import { Header } from "../../_components/Header";
import { Providers } from "../../providers";
import { Metadata } from "next";
import { ImageResponse } from "next/og";

const montserrat = Montserrat({
  weight: ["400", "600", "700", "900"],
  subsets: ["latin"],
});

const dynamicImageUrl = "https://eis.toys/assets/ogp-hanabi-artwork-sample.png"; //
const templateImageUrl =
  "https://eis.toys/assets/ogp-hanabi-artwork-template.png";

const ogImage = new ImageResponse(
  (
    <div
      style={{
        display: "flex",
        width: "1200px",
        height: "630px",
        position: "relative",
      }}
    >
      <img
        src={templateImageUrl}
        alt="Template"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "50px",
          right: "50px",
          width: "500px",
          height: "500px",
          overflow: "hidden",
        }}
      >
        <img
          src={dynamicImageUrl}
          alt="Dynamic Image"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      </div>
    </div>
  ),
  {
    width: 1200,
    height: 630,
  }
);

export const metadata: Metadata = {
  title: "Ethereum Image Service",
  description: "Ethereum Image Service is an Infinite Remixable CC0 Garden.",
  openGraph: {
    title: "Ethereum Image Service",
    description: "Ethereum Image Service is an Infinite Remixable CC0 Garden.",
    url: "https://eis.toys/campaign/based-hanabi",
    siteName: "Ethereum Image Service",
    images: [
      {
        url: ogImage.url,
        width: 1200,
        height: 630,
        alt: "Ethereum Image Service",
      },
    ],
    type: "website",
  },
};

export default function CampaignBasedHanabLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Providers>
      <div
        className={`${montserrat.className} bg-[#191D88] min-h-screen flex flex-col`}
      >
        <Header />
        <div className="flex flex-col flex-grow">{children}</div>
      </div>
    </Providers>
  );
}
