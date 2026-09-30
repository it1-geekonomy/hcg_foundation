import Banner from "@/shared/components/Herobannersection";

const CONTACT_US_BANNER = {
  bgImage: "/aboutus/aboutus.png",
  bgImageMobile: "/aboutus/aboutus-mobile.png",
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