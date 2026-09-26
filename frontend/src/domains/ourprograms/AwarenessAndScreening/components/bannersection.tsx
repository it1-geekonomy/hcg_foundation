import Banner from "@/shared/components/Herobannersection";

// Content is data, kept separate from markup so the same Banner
// can be reused across pages by swapping this object out.
const AWARENESS_BANNER = {
  bgImage: "/financialbanner/financialsupportbanner.png",
  bgImageMobile: "/aboutus/aboutus-mobile.png",
  bgImageAlt: "awareness",
  breadcrumbs: [
    { label: "Home", href: "/" },
    { label: "Our Program" },
  ],
  title: (
    <>
      Awareness &
      <br />
      Screening Camps
    </>
  ),
};

export default function AboutUsPage() {
  return (
    <main>
      <Banner
        bgImage={AWARENESS_BANNER.bgImage}
        bgImageMobile={AWARENESS_BANNER.bgImageMobile}
        bgImageAlt={AWARENESS_BANNER.bgImageAlt}
        breadcrumbs={AWARENESS_BANNER.breadcrumbs}
        title={AWARENESS_BANNER.title}
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