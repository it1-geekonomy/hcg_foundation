import Bannersection from "@/domains/ourprograms/AwarenessAndScreening/components/bannersection";
import DonateForm from "@/shared/components/DonateForm";
import Cancerscreening from "@/domains/ourprograms/AwarenessAndScreening/components/cancerscreening";
import ReferralProcess from "@/domains/ourprograms/AwarenessAndScreening/components/referalprocess";
import Screeningsection from "@/domains/ourprograms/AwarenessAndScreening/components/screeningsection";
export default function OurTeamPage() {
  return (
    <>
      <Bannersection />
      <Cancerscreening /> 
      <ReferralProcess /> 
      <Screeningsection />   
      <div id="donate-form">
        <DonateForm />
        </div>
    </>
  );
}