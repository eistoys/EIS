import { Metadata } from "next";
import { fetchMetadata } from "frames.js/next";

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const id = params.id;

  const cachebuster = new Date().getTime();
  return {
    title: "Ethereum Image Service",
    description: "Ethereum Image Service is an Infinite Remixable CC0 Garden.",
    openGraph: {
      title: "Ethereum Image Service",
      description:
        "Ethereum Image Service is an Infinite Remixable CC0 Garden.",
      url: "https://eis.toys/campaign/based-hanabi",
      siteName: "Ethereum Image Service",
      images: [
        {
          url: `${process.env.NEXT_PUBLIC_APP_URL}/campaign/based-hanabi/artworks/${id}/og?cachebuster=${cachebuster}`,
          width: 1200,
          height: 630,
          alt: "Ethereum Image Service",
        },
      ],
      type: "website",
    },
    other: {
      ...(await fetchMetadata(
        `${process.env.NEXT_PUBLIC_APP_URL}/campaign/based-hanabi/artworks/${id}/frames`
      )),
    },
  };
}

export default function CampaignBasedHanabLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
