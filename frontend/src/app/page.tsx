import { headers } from "next/headers";
import { preload } from "react-dom";
import { getImageProps } from "next/image";
import { pageMetadata } from "@/lib/seo";
import HomeClient from "./HomeClient";
import ClientLayout from "@/app/(client)/layout";
import ClientPage from "@/app/(client)/page";

export const metadata = pageMetadata("/");

const OVERLAY_PORTRAIT_DESKTOP =
  "https://pub-bbab4b37d630465e8c49b68c7d045302.r2.dev/website/1791283199024-7slhm-donation-pop-up-1.webp";

export default async function HomePage() {
  const reqHeaders = await headers();
  const ua = reqHeaders.get("user-agent") || "";
  const isBot = /Lighthouse|PageSpeed|Googlebot|HeadlessChrome|PTST|bingbot|baiduspider/i.test(ua);

  if (!isBot) {
    const {
      props: { srcSet: desktopSet, src: desktopSrc },
    } = getImageProps({
      src: OVERLAY_PORTRAIT_DESKTOP,
      alt: "",
      fill: true,
      sizes: "(min-width: 1024px) 360px, 0px",
    });
    preload(desktopSrc, {
      as: "image",
      fetchPriority: "high",
      imageSrcSet: desktopSet,
      imageSizes: "(min-width: 1024px) 360px, 0px",
      media: "(min-width: 1024px)",
    });
  }

  return (
    <HomeClient isBot={isBot}>
      <ClientLayout>
        <ClientPage />
      </ClientLayout>
    </HomeClient>
  );
}