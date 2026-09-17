import Bannersection from "@/domains/ourprograms/Swasthigallery/components/bannersection";
import DonateForm from "@/shared/components/DonateForm";
import Artgallery from "@/domains/ourprograms/Swasthigallery/components/artgallery";

export default function OurTeamPage() {
  return (
    <>
      <Bannersection />
      <Artgallery />
        
      <div id="donate-form">
        <DonateForm />
        </div>
    </>
  );
}