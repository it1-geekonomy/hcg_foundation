"use client";

import dynamic from "next/dynamic";
import type { CardData } from "@/domains/home/constants/project";
import StatSection from "./StatSection";
import HopeSection from "./HopeSection";
import Community from "./Community";
import Togetherwecreatehope from "./Togetherwecreatehope";
import ProjectsSection from "./ProjectsSection";

const DonateForm = dynamic(() => import("@/shared/components/DonateForm"));
const Reelsection = dynamic(() => import("./Reelsection"));
const FloatingImages = dynamic(() => import("./FloatingImages"));
const Smilestories = dynamic(() => import("./Smilestories"));
const Sustainable = dynamic(() => import("./Sustainable"));

const gradientClass = "bg-[linear-gradient(180deg,#FFE486_0%,#FFF6D8_100%)]";

export default function HomeBelowFoldView({ cards }: { cards: CardData[] }) {
  return (
    <>
      <div className={gradientClass}>
        <StatSection />
      </div>
      <div id="projects" className="scroll-mt-24">
        {cards.length === 0 ? (
          <section className="bg-[#FFF6D8] px-8 py-16 text-black sm:px-12 md:px-16 lg:px-6 xl:px-6 2xl:px-40">
            <div className="h-[680px] w-full animate-pulse rounded-2xl bg-[#FFE9A8]/60 sm:h-[760px] lg:h-[420px] xl:h-[520px] 2xl:h-[600px]" />
          </section>
        ) : (
          <ProjectsSection cards={cards} />
        )}
      </div>
      <div className={gradientClass}>
        <Smilestories />
        <HopeSection />
      </div>
      <div className={gradientClass}>
        <Community />
        <FloatingImages />
      </div>
      <div id="donate-form" className="bg-[#FFF6D8] pb-10 lg:pb-24">
        <DonateForm />
      </div>
      <div className={gradientClass}>
        <Togetherwecreatehope />
      </div>
      <Sustainable />
      <Reelsection />
    </>
  );
}
