import Banner from "@/shared/components/Herobannersection";

// Content is data, kept separate from markup so the same Banner
// can be reused across pages by swapping this object out.
const FINANCIALSUPPORT_BANNER = {
  bgImage: "https://pub-bbab4b37d630465e8c49b68c7d045302.r2.dev/website/1791376405836-2h06b-rectangle-184-7-.webp",
  bgImageMobile: "https://pub-bbab4b37d630465e8c49b68c7d045302.r2.dev/website/1791376489425-a4fjn-rectangle-1661-2-.webp",
  bgImageAlt: "finance",
  breadcrumbs: [
    { label: "Home", href: "/" },
    { label: "Our Programs" },
  ],
  title: (
    <>
     Patient Aid
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

/*
Reusing Banner on another page just means passing different props, e.g.:

<Banner
  bgImage="/images/programs-hero.jpg"
  bgImageMobile="/images/programs-hero-mobile.jpg"
  breadcrumbs={[{ label: "Home", href: "/" }, { label: "Our Programs" }]}
  subtitle="What We Do"
  title="Programs That Change Lives"
  description="From early screening to survivor support, every program is built around the patient."
/>
*/