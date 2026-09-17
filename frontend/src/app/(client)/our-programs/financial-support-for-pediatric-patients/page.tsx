import Financialsupport from "@/domains/ourprograms/FinancialSupport/components/financialsupport";
import DonateForm from "@/shared/components/DonateForm";
import HopeSection from "@/domains/ourprograms/FinancialSupport/components/hopesection";
import HowToRefer from "@/domains/ourprograms/FinancialSupport/components/howtoreferpatient";

export default function OurTeamPage() {
  return (
    <>
      <Financialsupport />
      <HopeSection />
      <HowToRefer />

      <div id="donate-form">
        <DonateForm />
        </div>
    </>
  );
}