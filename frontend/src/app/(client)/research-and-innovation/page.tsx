import Innovation from "@/domains/ourprograms/ResearchAndInnovation/components/innovationAndTechnology";
import DonateForm from "@/shared/components/DonateForm";
import Bannersection from "@/domains/ourprograms/ResearchAndInnovation/components/bannersection";
import OtherInitiatives from "@/domains/ourprograms/ResearchAndInnovation/components/otherInitiatives";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("/research-and-innovation");

export default function OurTeamPage() {
  return (
    <>
      <Bannersection />
        <Innovation />
      <OtherInitiatives />
      <div id="donate-form">
        <DonateForm />
        </div>
    </>
  );
}
