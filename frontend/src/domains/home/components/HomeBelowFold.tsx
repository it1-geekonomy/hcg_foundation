"use client";

import type { CardData } from "@/domains/home/constants/project";
import HomeBelowFoldView from "./HomeBelowFoldView";

export default function HomeBelowFold({ cards }: { cards: CardData[] }) {
  return <HomeBelowFoldView cards={cards} />;
}
