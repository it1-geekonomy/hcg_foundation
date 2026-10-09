import { headers } from "next/headers";
import { publicHomeBannersApi } from "@/domains/cms/lib/api";
import {
  HERO_FALLBACK_STEPS,
  mapHomeBannerToHeroStep,
} from "@/domains/home/constants/heroTileScroll";
import TileScrollSection from "./TileScrollSection";

export default async function BannerSection() {
  const headersList = await headers();
  const userAgent = headersList.get("user-agent") || "";
  const initialIsMobile = /Mobile|Android|iPhone|iPod|Windows Phone/i.test(userAgent);
  let steps = HERO_FALLBACK_STEPS;
  try {
    const res = await publicHomeBannersApi.listActive();
    const mapped = (res.data ?? [])
      .map(mapHomeBannerToHeroStep)
      .filter((step) => step.backgroundSrc);
    if (mapped.length > 0) {
      steps = mapped;
    }
  } catch (error) {
    console.error("Failed to fetch banners", error);
  }

  return <TileScrollSection steps={steps} initialIsMobile={initialIsMobile} />;
}
