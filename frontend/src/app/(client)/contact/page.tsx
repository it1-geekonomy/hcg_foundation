import Bannersection from "@/domains/contact/components/bannersection";
import DonateForm from "@/shared/components/DonateForm";
import Letsconnect from "@/domains/contact/components/letsconnect";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("/contact");

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