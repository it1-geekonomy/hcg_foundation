import Innovation from "@/domains/ourprograms/ResearchAndInnovation/components/innovationAndTechnology";
import DonateForm from "@/shared/components/DonateForm";
import Bannersection from "@/domains/ourprograms/ResearchAndInnovation/components/bannersection";
import OtherInitiatives from "@/domains/ourprograms/ResearchAndInnovation/components/otherInitiatives";
import { pageMetadata } from "@/lib/seo";
import ProjectTracker from "@/shared/components/ProjectTracker";

export const metadata = pageMetadata("/innovation-and-technology");

export default function OurTeamPage() {
  return (
    <>
      <ProjectTracker />
      <Bannersection />
      <Innovation />
      <OtherInitiatives />
      <div id="donate-form">
        <DonateForm />
      </div>
    </>
  );
}
