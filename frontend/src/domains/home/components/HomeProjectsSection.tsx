"use client";

import { useEffect, useState } from "react";
import { publicProjectsApi } from "@/domains/cms/lib/api";
import {
  mapProjectToCard,
  type CardData,
} from "@/domains/home/constants/project";
import ProjectsSection from "./ProjectsSection";

const PROGRAM_HREFS = [
  "/patient-aid",
  "/awareness-and-screening-camps",
  "/swasti-art-gallery",
  "/pink-hope-support-group",
  "/research-and-innovation",
];

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
            (res.data ?? []).map((project, index) => ({
              ...mapProjectToCard(project, index),
              href: PROGRAM_HREFS[index] ?? `/projects/${project.slug}`,
            }))
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
          <div className="h-[420px] w-full animate-pulse rounded-2xl bg-[#FFE9A8]/60 xl:h-[520px] 2xl:h-[600px]" />
        </section>
      ) : (
        <ProjectsSection cards={cards} />
      )}
    </div>
  );
}
