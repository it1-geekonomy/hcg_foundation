import {
  BannerSection,
  StatSection,
  ProjectsSection,
  Smilestories,
  HopeSection,
  Community,
  FloatingImages,
} from "@/domains/home/index";

const gradientClass = "bg-[linear-gradient(180deg,#FFE486_0%,#FFF6D8_100%)]";

export default function ClientPage() {
  return (
    <>
      <BannerSection />
      <div className={gradientClass}>
        <StatSection />
        <ProjectsSection />
      </div>
      <div className={gradientClass}>
        <Smilestories />
        <HopeSection />
      </div>
      <div className={gradientClass}>
        <Community />
        <FloatingImages />
      </div>
    </>
  );
}