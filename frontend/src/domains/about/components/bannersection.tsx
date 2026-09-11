import Banner from "@/shared/components/Herobannersection";

// Content is data, kept separate from markup so the same Banner
// can be reused across pages by swapping this object out.
const ABOUT_US_BANNER = {
  bgImage: "/aboutus/aboutus.png",
  bgImageAlt: "Doctors, nurses and families smiling together outside the hospital",
  breadcrumbs: [
    { label: "Home", href: "/" },
    { label: "About Us" },
  ],
  title: (
    <>
      Creating Hope
      <br />
      Through Compassion
    </>
  ),
};

export default function AboutUsPage() {
  return (
    <main>
      <Banner
        bgImage={ABOUT_US_BANNER.bgImage}
        bgImageAlt={ABOUT_US_BANNER.bgImageAlt}
        breadcrumbs={ABOUT_US_BANNER.breadcrumbs}
        title={ABOUT_US_BANNER.title}
      />

      {/* Rest of the About Us page content goes here */}
    </main>
  );
}

/*
Reusing Banner on another page just means passing different props, e.g.:

<Banner
  bgImage="/images/programs-hero.jpg"
  breadcrumbs={[{ label: "Home", href: "/" }, { label: "Our Programs" }]}
  subtitle="What We Do"
  title="Programs That Change Lives"
  description="From early screening to survivor support, every program is built around the patient."
/>
*/