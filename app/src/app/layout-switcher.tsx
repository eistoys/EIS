"use client";

import { Header } from "@/components/Header";
import { ToastContainer } from "@/components/ToastContainer";
import { Roboto } from "next/font/google";
import { usePathname } from "next/navigation";
import { Providers } from "./providers";

const roboto = Roboto({
  weight: ["400", "700", "900"],
  subsets: ["latin"],
});

export function LayoutSwitcher({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (pathname.includes("/campaign/based-hanabi")) {
    return <>{children}</>;
  } else {
    return (
      <Providers>
        <div
          className={`${roboto.className} bg-[#222222] min-h-screen flex flex-col`}
        >
          <Header />
          {children}
          <ToastContainer />
        </div>
      </Providers>
    );
  }
}
