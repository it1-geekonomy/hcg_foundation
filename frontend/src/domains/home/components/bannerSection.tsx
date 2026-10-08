import { publicHomeBannersApi } from "@/domains/cms/lib/api";
import {
  HERO_FALLBACK_STEPS,
  mapHomeBannerToHeroStep,
} from "@/domains/home/constants/heroTileScroll";
import TileScrollSection from "./TileScrollSection";

export default async function BannerSection() {
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

  return <TileScrollSection steps={steps} />;
}
