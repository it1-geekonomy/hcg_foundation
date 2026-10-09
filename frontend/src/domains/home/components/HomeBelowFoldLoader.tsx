import HomeBelowFold from "./HomeBelowFold";
import type { CardData } from "@/domains/home/constants/project";

/** Stream below-the-fold data without delaying the server-rendered hero. */
export default async function HomeBelowFoldLoader({
  cards,
}: {
  cards: Promise<CardData[]>;
}) {
  return <HomeBelowFold cards={await cards} />;
}
