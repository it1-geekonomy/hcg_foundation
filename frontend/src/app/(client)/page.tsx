import {
  BannerSection,
  StatSection,
  ProjectsSection,
  Smilestories,
  HopeSection,
  Community,
  FloatingImages,
  Togetherwecreatehope,
  Sustainable,
  Reelsection,
} from "@/domains/home/index";
import DonateForm from "@/shared/components/DonateForm";

const gradientClass = "bg-[linear-gradient(180deg,#FFE486_0%,#FFF6D8_100%)]";

export default function ClientPage() {
  return (
    <>
      <BannerSection />
      <div className={gradientClass}>
        <StatSection />
        </ div>
        <ProjectsSection />
      <div className={gradientClass}>
        <Smilestories />
        <HopeSection />
      </div>
      <div className={gradientClass}>
        <Community />
        <FloatingImages />
      </div>
      <DonateForm />
      <div className={gradientClass}>
      <Togetherwecreatehope />
      </div>
      <Sustainable />
        <Reelsection />
    </>
  );
}