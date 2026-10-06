"use client";

import { useEffect, useState } from "react";
import { publicHomeBannersApi } from "@/domains/cms/lib/api";
import {
  HERO_FALLBACK_STEPS,
  mapHomeBannerToHeroStep,
  type HeroTileStep,
} from "@/domains/home/constants/heroTileScroll";
import TileScrollSection from "./TileScrollSection";

export default function BannerSection() {
  const [steps, setSteps] = useState<HeroTileStep[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await publicHomeBannersApi.listActive();
        const mapped = (res.data ?? [])
          .map(mapHomeBannerToHeroStep)
          .filter((step) => step.backgroundSrc);
        if (!cancelled) {
          setSteps(mapped.length > 0 ? mapped : HERO_FALLBACK_STEPS);
        }
      } catch {
        if (!cancelled) setSteps(HERO_FALLBACK_STEPS);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!steps) {
    return <div className="relative z-0 h-screen w-full bg-black" aria-busy />;
  }

  return <TileScrollSection steps={steps} />;
}
