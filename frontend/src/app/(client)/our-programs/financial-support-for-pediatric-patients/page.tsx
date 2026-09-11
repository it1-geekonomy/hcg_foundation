import Financialsupport from "@/domains/ourprograms/components/financialsupport";
import DonateForm from "@/shared/components/DonateForm";
import HopeSection from "@/domains/ourprograms/components/hopesection";
import HowToRefer from "@/domains/ourprograms/components/howtoreferpatient";

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