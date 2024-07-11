import "./markdown.css";

import { Montserrat } from "next/font/google";
import { Header } from "./_components/Header";
import { Providers } from "./providers";
import { Metadata } from "next";

const montserrat = Montserrat({
  weight: ["400", "600", "700", "900"],
  subsets: ["latin"],
});

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
        url: "https://eis.toys/assets/ogp-hanabi.png",
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
