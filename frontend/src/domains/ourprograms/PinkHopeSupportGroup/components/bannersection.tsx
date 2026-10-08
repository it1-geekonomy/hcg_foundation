import Banner from "@/shared/components/Herobannersection";

// Content is data, kept separate from markup so the same Banner
// can be reused across pages by swapping this object out.
const ABOUT_US_BANNER = {
  bgImage: "https://pub-bbab4b37d630465e8c49b68c7d045302.r2.dev/website/1791436303673-2nr7l-rectangle-1657-4-.webp",
  bgImageMobile: "https://pub-bbab4b37d630465e8c49b68c7d045302.r2.dev/website/1791436379146-e8dy9-rectangle-1665-1-.webp",
  bgImageAlt: "Doctors, nurses and families smiling together outside the hospital",
  breadcrumbs: [
    { label: "Home", href: "/" },
    { label: "Our Programs" },
  ],
  title: (
    <>
      Pink Hope Patient 
      <br />
      Support Group
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