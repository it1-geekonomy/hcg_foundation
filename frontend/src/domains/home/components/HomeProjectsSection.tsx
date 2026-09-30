"use client";

import { useEffect, useState } from "react";
import { publicProjectsApi } from "@/domains/cms/lib/api";
import {
  mapProjectToCard,
  type CardData,
} from "@/domains/home/constants/project";
import ProjectsSection from "./ProjectsSection";

export default function HomeProjectsSection() {
  const [cards, setCards] = useState<CardData[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await publicProjectsApi.listPublished({ limit: 12 });
        if (!cancelled) {
          setCards(
            (res.data ?? []).map((project, index) =>
              mapProjectToCard(project, index)
            )
          );
        }
      } catch {
        if (!cancelled) setCards([]);
      } finally {
        if (!cancelled) setLoaded(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div id="projects" className="scroll-mt-24">
      {!loaded ? (
        <section className="bg-[#FFF6D8] px-8 py-16 text-black sm:px-12 md:px-16 lg:px-6 xl:px-6 2xl:px-40">
          <div className="h-[480px] w-full animate-pulse rounded-2xl bg-[#FFE9A8]/60 xl:h-[600px]" />
        </section>
      ) : (
        <ProjectsSection cards={cards} />
      )}
    </div>
  );
}
