import { BannerSection } from "@/domains/home/index";
import HomeBelowFold from "@/domains/home/components/HomeBelowFold";
import { loadHomeProjectCards } from "@/domains/home/components/HomeProjectsSection";

export default async function ClientPage() {
  const cards = await loadHomeProjectCards();

  return (
    <>
      {/* The hero's slide text loads on the client, so the page's H1 lives here in the server HTML. */}
      <h1 className="sr-only">HCG Foundation: Donate for Cancer Care &amp; Patient Support</h1>
      <BannerSection />
      <HomeBelowFold cards={cards} />
    </>
  );
}
