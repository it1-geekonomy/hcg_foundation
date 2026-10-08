import Bannersection from "@/domains/ourprograms/swastiArtGallery/bannersection";
import DonateForm from "@/shared/components/DonateForm";
import Artgallery from "@/domains/ourprograms/swastiArtGallery/artgallery";
import Gallery from "@/domains/ourprograms/swastiArtGallery/galleryimages";
import { pageMetadata } from "@/lib/seo";
import ProjectTracker from "@/shared/components/ProjectTracker";

export const metadata = pageMetadata("/swasti-art-gallery");
export default function OurTeamPage() {
  return (
    <>
      <ProjectTracker />
      <Bannersection />
      <Artgallery />
      <Gallery />
      <div id="donate-form">
        <DonateForm />
      </div>
    </>
  );
}
