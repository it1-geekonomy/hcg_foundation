import Bannersection from "@/domains/resources/Transparencyhub/components/banner";
import DonateForm from "@/shared/components/DonateForm";
import AnnualReportsSection from "@/domains/resources/Transparencyhub/components/annualreports";

export default function OurTeamPage() {
  return (
    <>
      <Bannersection />
      <AnnualReportsSection />
      <div id="donate-form">
        <DonateForm />
        </div>
    </>
  );
}