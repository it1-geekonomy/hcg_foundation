import Comingsoon from "@/domains/ourprograms/ResearchAndInnovation/components/comingsoon";
import DonateForm from "@/shared/components/DonateForm";
import Bannersection from "@/domains/ourprograms/ResearchAndInnovation/components/bannersection";
export default function OurTeamPage() {
  return (
    <>
      <Bannersection />
        <Comingsoon />
      <div id="donate-form">
        <DonateForm />
        </div>
    </>
  );
}
