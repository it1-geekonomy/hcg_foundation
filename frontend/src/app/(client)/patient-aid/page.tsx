import Financialsupport from "@/domains/ourprograms/FinancialSupport/components/financialsupport";
import DonateForm from "@/shared/components/DonateForm";
import HopeSection from "@/domains/ourprograms/FinancialSupport/components/hopesection";
import HowToRefer from "@/domains/ourprograms/FinancialSupport/components/howtoreferpatient";
import SmileStories from "@/domains/home/components/Smilestories";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("/patient-aid");

export default function OurTeamPage() {
  return (
    <>
      <Financialsupport />
      <HopeSection />
      <div className="bg-[#FFF8E2]">
        <SmileStories variant="fullStory" />
      </div>
      <HowToRefer />

      <div id="donate-form">
        <DonateForm />
        </div>
    </>
  );
}
