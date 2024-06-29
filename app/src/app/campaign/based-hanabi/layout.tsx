import { Roboto } from "next/font/google";
import { Header } from "./_components/Header";
import { Providers } from "./providers";

const roboto = Roboto({
  weight: ["400", "700", "900"],
  subsets: ["latin"],
});

export default function CampaignBasedHanabLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Providers>
      <div
        className={`${roboto.className} bg-[#191D88] min-h-screen flex flex-col`}
      >
        <Header />
        <div>{children}</div>
      </div>
    </Providers>
  );
}
