import Banner from "@/shared/components/Herobannersection";

// Content is data, kept separate from markup so the same Banner
// can be reused across pages by swapping this object out.
const ABOUT_US_BANNER = {
  bgImage: "https://pub-bbab4b37d630465e8c49b68c7d045302.r2.dev/website/1791350327977-4lzbp-rectangle-184-3-.webp",
  bgImageMobile: "https://pub-bbab4b37d630465e8c49b68c7d045302.r2.dev/website/1791350372287-2h2k9-rectangle-184-5-.webp",
  bgImageAlt: "Doctors, nurses and families smiling together outside the hospital",
  breadcrumbs: [
    { label: "Home", href: "/" },
    { label: "Our Program" },
  ],
  title: (
    <>
      Swasti Art Gallery
    </>
  ),
};

export default function AboutUsPage() {
  return (
    <main>
      <Banner
        bgImage={ABOUT_US_BANNER.bgImage}
        bgImageMobile={ABOUT_US_BANNER.bgImageMobile}
        bgImageAlt={ABOUT_US_BANNER.bgImageAlt}
        breadcrumbs={ABOUT_US_BANNER.breadcrumbs}
        title={ABOUT_US_BANNER.title}
      />
    </main>
  );
}