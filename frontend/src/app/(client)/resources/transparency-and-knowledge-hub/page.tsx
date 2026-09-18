import Bannersection from "@/domains/resources/Transparencyhub/components/banner";
import DonateForm from "@/shared/components/DonateForm";
import AnnualReportsSection from "@/domains/resources/Transparencyhub/components/annualreports";

export default function OurTeamPage() {
  return (
    <>
      <Bannersection />
      <AnnualReportsSection />
        <DonateForm />
    </>
  );
}