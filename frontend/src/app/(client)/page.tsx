import {
  BannerSection,
  AboutUs,
  OurImpact,
  OurInitiatives,
  HowCanHelp,
  PatientStories,
  Projects,
  OurEvents,
  MakeImpact,
  DonationBannerPage,
} from "@/domains/home/index";

export default function ClientPage() {
  return (
    <>
      <BannerSection />

      {/* <AboutUs />

      <OurImpact />

      <OurInitiatives />

      <HowCanHelp />

      <PatientStories />

      <Projects />

      <OurEvents />

      <MakeImpact /> */}

      <DonationBannerPage />
    </>
  );
}