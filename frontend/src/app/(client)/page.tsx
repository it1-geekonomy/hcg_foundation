import {
  BannerSection,
  StatSection,
  ProjectsSection,
  Smilestories,
  HopeSection,
  Community,
  FloatingImages,
} from "@/domains/home/index";

export default function ClientPage() {
  return (
    <>
      <BannerSection />
      <StatSection />
      <ProjectsSection />
      <Smilestories />
      <HopeSection />
      <Community />
      <FloatingImages />
    </>
  );
}