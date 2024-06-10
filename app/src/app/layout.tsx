import "@rainbow-me/rainbowkit/styles.css";
import "./globals.css";

import type { Metadata } from "next";
import { Roboto } from "next/font/google";

import { Providers } from "./providers";
import { Header } from "@/components/Header";
import { Suspense } from "react";
import { ToastContainer } from "@/components/ToastContainer";

const roboto = Roboto({
  weight: ["400", "700", "900"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ethereum Image Service",
  description: "Ethereum Image Service is an Infinite Remixable CC0 Garden.",
  openGraph: {
    title: "Ethereum Image Service",
    description: "Ethereum Image Service is an Infinite Remixable CC0 Garden.",
    url: "https://eis.toys/",
    siteName: "Ethereum Image Service",
    images: [
      {
        url: "https://eis.toys/assets/ogp.png",
        width: 800,
        height: 420,
        alt: "Ethereum Image Service",
      },
    ],
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <Providers>
          <div
            className={`${roboto.className} bg-[#222222] min-h-screen flex flex-col`}
          >
            <Header />
            {children}
            <ToastContainer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
