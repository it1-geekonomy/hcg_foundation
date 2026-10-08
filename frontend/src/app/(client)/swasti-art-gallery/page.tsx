import Bannersection from "@/domains/ourprograms/swastiArtGallery/bannersection";
import DonateForm from "@/shared/components/DonateForm";
import Artgallery from "@/domains/ourprograms/swastiArtGallery/artgallery";
import Gallery from "@/domains/ourprograms/swastiArtGallery/galleryimages";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("/swasti-art-gallery");
export default function OurTeamPage() {
  return (
    <>
      <Bannersection />
      <Artgallery />
      <Gallery />
      <div id="donate-form">
        <DonateForm />
        </div>
    </>
  );
}
