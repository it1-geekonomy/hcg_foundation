import Banner from "@/shared/components/Herobannersection";

// Content is data, kept separate from markup so the same Banner
// can be reused across pages by swapping this object out.
const FINANCIALSUPPORT_BANNER = {
  bgImage: "/financialbanner/financialsupportbanner.png",
  bgImageMobile: "/aboutus/aboutus-mobile.png",
  bgImageAlt: "finance",
  breadcrumbs: [
    { label: "Home", href: "/" },
    { label: "Our Program" },
  ],
  title: (
    <>
      Financial Support for 
      <br />
      Patients

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