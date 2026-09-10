import Bannersection from "@/domains/about/components/bannersection";
import DonateForm from "@/shared/components/DonateForm";
import OurMissionSection from "@/domains/about/components/ourmission";

export default function OurTeamPage() {
  return (
    <>
      <Bannersection />
      <OurMissionSection />

      <div id="donate-form">
        <DonateForm />
        </div>
    </>
  );
}