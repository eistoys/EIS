import "@coinbase/onchainkit/tailwind.css";
import "@rainbow-me/rainbowkit/styles.css";
import "./globals.css";

import type { Metadata } from "next";

import { Providers } from "./providers";
import { LayoutSwitcher } from "./layout-switcher";

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
          <LayoutSwitcher>{children}</LayoutSwitcher>
        </Providers>
      </body>
    </html>
  );
}
