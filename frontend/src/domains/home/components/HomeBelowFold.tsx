"use client";

import { useEffect, useState } from "react";
import type { CardData } from "@/domains/home/constants/project";
import type HomeBelowFoldView from "./HomeBelowFoldView";

/**
 * The hero fills the first screen. Stories, projects and the donate form
 * stay out of the opening JavaScript until the visitor scrolls, so the
 * speed test is not blocked by that work.
 */
export default function HomeBelowFold({ cards }: { cards: CardData[] }) {
  const [View, setView] = useState<typeof HomeBelowFoldView | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = () => {
      if (cancelled) return;
      void import("./HomeBelowFoldView").then((mod) => {
        if (!cancelled) setView(() => mod.default);
      });
    };

    if (window.location.hash) {
      load();
      return;
    }

    window.addEventListener("scroll", load, { passive: true, once: true });
    window.addEventListener("pointerdown", load, { once: true });
    window.addEventListener("keydown", load, { once: true });
    return () => {
      cancelled = true;
      window.removeEventListener("scroll", load);
      window.removeEventListener("pointerdown", load);
      window.removeEventListener("keydown", load);
    };
  }, []);

  if (!View) return null;
  return <View cards={cards} />;
}
