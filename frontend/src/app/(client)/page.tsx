import { Suspense } from "react";
import { BannerSection } from "@/domains/home/index";
import HomeBelowFoldLoader from "@/domains/home/components/HomeBelowFoldLoader";
import { loadHomeProjectCards } from "@/domains/home/components/HomeProjectsSection";
import { publicPatientStoriesApi } from "@/domains/cms/lib/api";

// Renders visually hidden links for SEO crawlers since the visual stories load via client JS
async function SeoPatientStoriesLinks() {
  try {
    let allStories: any[] = [];
    let currentPage = 1;
    let totalPages = 1;

    // Fetch all pages of stories so the crawler sees every single link
    while (currentPage <= totalPages) {
      const res = await publicPatientStoriesApi.listPublished({ page: currentPage, limit: 100 });
      if (!res?.data) break;

      allStories = [...allStories, ...res.data];
      totalPages = res.meta?.totalPages || 1;
      currentPage++;
    }

    if (allStories.length === 0) return null;

    return (
      <div className="sr-only" aria-hidden="true">
        <h2>Patient Stories Index</h2>
        {allStories.map((story) => (
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
