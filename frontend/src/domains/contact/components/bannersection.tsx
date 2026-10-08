import Banner from "@/shared/components/Herobannersection";

const CONTACT_US_BANNER = {
  bgImage: "https://pub-bbab4b37d630465e8c49b68c7d045302.r2.dev/website/1791448332093-oqh4r-rectangle-1668-1-.webp",
  bgImageMobile: "https://pub-bbab4b37d630465e8c49b68c7d045302.r2.dev/website/1791448390178-ydtnp-rectangle-1668-2-.webp",
  bgImageAlt: "Doctors, nurses and families smiling together outside the hospital",
  breadcrumbs: [
    { label: "Home", href: "/" },
    { label: "Contact Us" },
  ],
  title: (
    <>
      Contact Us
    </>
  ),
};

export default function AboutUsPage() {
  return (
    <main>
      <Banner
        bgImage={CONTACT_US_BANNER.bgImage}
        bgImageMobile={CONTACT_US_BANNER.bgImageMobile}
        bgImageAlt={CONTACT_US_BANNER.bgImageAlt}
        breadcrumbs={CONTACT_US_BANNER.breadcrumbs}
        title={CONTACT_US_BANNER.title}
      />
    </main>
  );
}