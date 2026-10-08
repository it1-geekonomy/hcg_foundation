import {
  BannerSection,
  StatSection,
  HopeSection,
  Community,
  Togetherwecreatehope,
} from "@/domains/home/index";
import HomeProjectsSection from "@/domains/home/components/HomeProjectsSection";
import dynamic from "next/dynamic";

const DonateForm = dynamic(() => import("@/shared/components/DonateForm"));
const Reelsection = dynamic(() => import("@/domains/home/components/Reelsection"));
const FloatingImages = dynamic(() => import("@/domains/home/components/FloatingImages"));
const Smilestories = dynamic(() => import("@/domains/home/components/Smilestories"));
const Sustainable = dynamic(() => import("@/domains/home/components/Sustainable"));


const gradientClass = "bg-[linear-gradient(180deg,#FFE486_0%,#FFF6D8_100%)]";

export default function ClientPage() {
  return (
    <>
      {/* The hero's slide text loads on the client, so the page's H1 lives here in the server HTML. */}
      <h1 className="sr-only">HCG Foundation: Donate for Cancer Care &amp; Patient Support</h1>
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
