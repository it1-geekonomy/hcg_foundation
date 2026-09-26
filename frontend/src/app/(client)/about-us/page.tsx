import Bannersection from "@/domains/about/components/bannersection";
import DonateForm from "@/shared/components/DonateForm";
import OurMissionSection from "@/domains/about/components/ourmission";
import Statsection from "@/domains/about/components/statsection";
import WhatWeStandFor from "@/domains/about/components/whatwestand";
import AboutTeamSection from "@/domains/about/components/AboutTeamSection";
import AboutAwardsSection from "@/domains/about/components/AboutAwardsSection";

export default function OurTeamPage() {
  return (
    <>
      <Bannersection />
      <OurMissionSection />
      <Statsection />
      <WhatWeStandFor />
      <AboutTeamSection />
      <AboutAwardsSection />

      <div id="donate-form" className="bg-[#FFF6D8] pt-14">
        <DonateForm />
      </div>
    </>
  );
}