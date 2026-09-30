import {
  BannerSection,
  StatSection,
  Smilestories,
  HopeSection,
  Community,
  FloatingImages,
  Togetherwecreatehope,
  Sustainable,
  Reelsection,
} from "@/domains/home/index";
import HomeProjectsSection from "@/domains/home/components/HomeProjectsSection";
import DonateForm from "@/shared/components/DonateForm";

const gradientClass = "bg-[linear-gradient(180deg,#FFE486_0%,#FFF6D8_100%)]";

export default function ClientPage() {
  return (
    <>
      <BannerSection />
      <div className={gradientClass}>
        <StatSection />
      </div>
      <HomeProjectsSection />
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
