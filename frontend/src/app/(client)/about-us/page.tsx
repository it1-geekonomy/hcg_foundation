import Bannersection from "@/domains/about/components/bannersection";
import DonateForm from "@/shared/components/DonateForm";
import OurMissionSection from "@/domains/about/components/ourmission";
import Statsection from "@/domains/about/components/statsection";
import WhatWeStandFor from "@/domains/about/components/whatwestand";
import AwardsRecognition from "@/domains/about/components/awardssection";
import AboutTeamSection from "@/domains/about/components/AboutTeamSection";

export default function OurTeamPage() {
  return (
    <>
      <Bannersection />
      <OurMissionSection />
      <Statsection />
      <WhatWeStandFor />
      <AboutTeamSection />
      <AwardsRecognition />

      <div id="donate-form" className="pt-14 bg-[#FFF6D8]">
        <DonateForm />
        </div>
    </>
  );
}