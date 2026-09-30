import Bannersection from "@/domains/contact/components/bannersection";
import DonateForm from "@/shared/components/DonateForm";
import Letsconnect from "@/domains/contact/components/letsconnect";

export default function OurTeamPage() {
  return (
    <>
      <Bannersection />
      <Letsconnect />
      <div id="donate-form">
        <DonateForm />
      </div>
    </>
  );
}