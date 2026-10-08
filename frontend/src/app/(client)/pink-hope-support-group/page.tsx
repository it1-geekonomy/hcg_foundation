import Bannersection from "@/domains/ourprograms/PinkHopeSupportGroup/components/bannersection";
import DonateForm from "@/shared/components/DonateForm";
import GallerySection from "@/domains/ourprograms/PinkHopeSupportGroup/components/gallery";
import PinkHope from "@/domains/ourprograms/PinkHopeSupportGroup/components/pinkhope";
import Whyjoinus from "@/domains/ourprograms/PinkHopeSupportGroup/components/whypatientjoins";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("/pink-hope-support-group");
export default function OurTeamPage() {
  return (
    <>
      <Bannersection />
            <PinkHope />
            <Whyjoinus />
      <GallerySection />
      <div id="donate-form">
        <DonateForm />
        </div>
    </>
  );
}
