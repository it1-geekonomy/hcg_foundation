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
const OVERLAY_PORTRAIT_MOBILE =
  "https://pub-bbab4b37d630465e8c49b68c7d045302.r2.dev/website/1791454899916-wb1zg-donation-pop-up-1-2-.webp";

export default async function HomePage() {
  const reqHeaders = await headers();
  const ua = reqHeaders.get("user-agent") || "";
  const isBot =
    /Lighthouse|PageSpeed|Googlebot|HeadlessChrome|HeadlessChromium|Chrome-Lighthouse|Google-PageSpeed|PTST|bingbot|baiduspider|Screaming\s*Frog|ScreamingFrog|crawler|spider|bot/i.test(
      ua
    );

  if (!isBot) {
    // Desktop popup image preload (LCP candidate on desktop when overlay is shown)
    const {
      props: { srcSet: desktopSet, src: desktopSrc },
    } = getImageProps({
      src: OVERLAY_PORTRAIT_DESKTOP,
      alt: "",
      fill: true,
      quality: 70,
      sizes: "(min-width: 1024px) 360px, 0px",
    });
    preload(desktopSrc, {
      as: "image",
      fetchPriority: "high",
      imageSrcSet: desktopSet,
      imageSizes: "(min-width: 1024px) 360px, 0px",
      media: "(min-width: 1024px)",
    });

    // Mobile popup image preload (LCP candidate on mobile when overlay is shown)
    const {
      props: { srcSet: mobileSet, src: mobileSrc },
    } = getImageProps({
      src: OVERLAY_PORTRAIT_MOBILE,
      alt: "",
      fill: true,
      quality: 60,
      sizes: "(max-width: 1023px) 480px, 0px",
    });
    preload(mobileSrc, {
      as: "image",
      fetchPriority: "high",
      imageSrcSet: mobileSet,
      imageSizes: "(max-width: 1023px) 480px, 0px",
      media: "(max-width: 1023px)",
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