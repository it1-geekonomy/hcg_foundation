import Bannersection from "@/domains/resources/Transparencyhub/components/banner";
import DonateForm from "@/shared/components/DonateForm";
import AnnualReportsSection from "@/domains/resources/Transparencyhub/components/annualreports";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("/transparency-and-knowledge-hub");

export default function OurTeamPage() {
  return (
    <>
      {/* <Bannersection /> */}
      <AnnualReportsSection />
      <div id="donate-form">
        <DonateForm />
        </div>
    </>
  );
}
