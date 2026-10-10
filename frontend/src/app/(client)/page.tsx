import { Suspense } from "react";
import { BannerSection } from "@/domains/home/index";
import HomeBelowFoldLoader from "@/domains/home/components/HomeBelowFoldLoader";
import { loadHomeProjectCards } from "@/domains/home/components/HomeProjectsSection";
import { publicPatientStoriesApi } from "@/domains/cms/lib/api";

// Renders visually hidden links for SEO crawlers since the visual stories load via client JS
async function SeoPatientStoriesLinks() {
  try {
    // Fetch the first 100 stories (or paginated list) server-side for the crawler
    const res = await publicPatientStoriesApi.listPublished({ page: 1, limit: 100 });
    if (!res?.data) return null;
    return (
      <div className="sr-only" aria-hidden="true">
        <h2>Patient Stories Index</h2>
        {res.data.map((story) => (
          <a key={story.id} href={`/patient-stories/${story.slug || story.id}`}>
            {story.title}
          </a>
        ))}
      </div>
    );
  } catch (error) {
    return null;
  }
}

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
      <Suspense fallback={null}>
        <SeoPatientStoriesLinks />
      </Suspense>
    </>
  );
}
