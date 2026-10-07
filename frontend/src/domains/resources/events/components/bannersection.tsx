import Banner from "@/shared/components/Herobannersection";

// Content is data, kept separate from markup so the same Banner
// can be reused across pages by swapping this object out.
const FINANCIALSUPPORT_BANNER = {
  bgImage: "https://pub-bbab4b37d630465e8c49b68c7d045302.r2.dev/website/1791296290041-5pkq1-rectangle-186.webp",
  bgImageMobile: "https://pub-bbab4b37d630465e8c49b68c7d045302.r2.dev/website/1791368727266-myemf-rectangle-186-2-.webp",
  bgImageAlt: "finance",
  breadcrumbs: [
    { label: "Home", href: "/" },
    { label: "Resources" },
  ],
  title: (
    <>
    Events
    </>
  ),
};

export default function AboutUsPage() {
  return (
    <main>
      <Banner
        bgImage={FINANCIALSUPPORT_BANNER.bgImage}
        bgImageMobile={FINANCIALSUPPORT_BANNER.bgImageMobile}
        bgImageAlt={FINANCIALSUPPORT_BANNER.bgImageAlt}
        breadcrumbs={FINANCIALSUPPORT_BANNER.breadcrumbs}
        title={FINANCIALSUPPORT_BANNER.title}
      />

      {/* Rest of the About Us page content goes here */}
    </main>
  );
}