import { preload } from "react-dom";
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
  // Preload the Donation Popup (OverlayForm) LCP image to fix Lighthouse "discoverable in initial document"
  preload("/_next/image?url=https%3A%2F%2Fpub-bbab4b37d630465e8c49b68c7d045302.r2.dev%2Fwebsite%2F1791283199024-7slhm-donation-pop-up-1.webp&w=1080&q=75", { as: "image", fetchPriority: "high" });

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
