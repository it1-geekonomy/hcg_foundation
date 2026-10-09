import { publicProjectsApi } from "@/domains/cms/lib/api";
import {
  mapProjectToCard,
  type CardData,
} from "@/domains/home/constants/project";
import dynamic from "next/dynamic";

const ProjectsSection = dynamic(() => import("./ProjectsSection"));

const PROGRAM_HREFS = [
  "/patient-aid",
  "/awareness-and-screening-camps",
  "/swasti-art-gallery",
  "/pink-hope-support-group",
  "/innovation-and-technology", 
];

export async function loadHomeProjectCards(): Promise<CardData[]> {
  try {
    const res = await publicProjectsApi.listPublished({ limit: 12 });
    return (res.data ?? []).map((project, index) => ({
      ...mapProjectToCard(project, index),
      href: PROGRAM_HREFS[index] ?? `/projects/${project.slug}`,
    }));
  } catch (error) {
    console.error("Failed to fetch projects", error);
    return [];
  }
}

export default async function HomeProjectsSection() {
  const cards = await loadHomeProjectCards();

  return (
    <div id="projects" className="scroll-mt-24">
      {cards.length === 0 ? (
        <section className="bg-[#FFF6D8] px-8 py-16 text-black sm:px-12 md:px-16 lg:px-6 xl:px-6 2xl:px-40">
          <div className="h-[680px] sm:h-[760px] lg:h-[420px] xl:h-[520px] 2xl:h-[600px] w-full animate-pulse rounded-2xl bg-[#FFE9A8]/60" />
        </section>
      ) : (
        <ProjectsSection cards={cards} />
      )}
    </div>
  );
}
