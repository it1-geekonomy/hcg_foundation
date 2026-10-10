import { Suspense } from "react";
import { BannerSection } from "@/domains/home/index";
import HomeBelowFoldLoader from "@/domains/home/components/HomeBelowFoldLoader";
import { loadHomeProjectCards } from "@/domains/home/components/HomeProjectsSection";
import { SeoLinks } from "./SeoLinks";


export default function ClientPage() {
  // Start loading project data alongside the hero. It is below the fold and
  // streamed independently so the API response cannot hold up the first page bytes.
  const cards = loadHomeProjectCards();

  return (
    <>
      {/* The hero's slide text loads on the client, so the page's H1 lives here in the server HTML. */}
      <h1 className="sr-only">HCG Foundation: Donate for Cancer Care &amp; Patient Support</h1>
      <BannerSection />
      <Suspense fallback={null}>
        <HomeBelowFoldLoader cards={cards} />
      </Suspense>
      {/* Hidden links so basic crawlers (like Screaming Frog) can find deep story links */}
      <SeoLinks />
    </>
  );
}
