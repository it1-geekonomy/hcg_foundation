import React from "react";
import { notFound } from "next/navigation";
import { Calendar } from "lucide-react";
import DonateForm from "@/shared/components/DonateForm";
import Typography from "@/lib/Typography";
import { PatientStory } from "@/domains/journey-of-hope/constants/stories";
import ShareStory from "@/shared/components/ShareStory";
import { RelatedPatientStories } from "@/domains/journey-of-hope/components/RelatedPatientStories";
import { isMissingContentError, publicPatientStoriesApi } from "@/domains/cms/lib/api";
import RefreshNotice from "@/shared/components/RefreshNotice";
import { DetailTracker } from "@/shared/components/DetailTracker";
import PuzzleImage from "@/shared/components/Puzzleimage";

const CONTAINER = "max-w-[90rem] 2xl:max-w-[97.5rem] mx-auto px-4 sm:px-6 lg:px-8";

function formatStoryDate(dateStr?: string | null): string {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export default async function StoryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const targetId = resolvedParams.id;

  let story: PatientStory | null = null;
  let relatedStories: PatientStory[] = [];
  let failed = false;
  let is404 = false;

  // 1. Try fetching from public API
  try {
    const res = await publicPatientStoriesApi.getBySlug(targetId);
    if (res.data?.detail) {
      const item = res.data.detail;
      story = {
        id: item.id,
        slug: item.slug,
        patientName: item.title,
        date: formatStoryDate(item.storyDate),
        conditionTag: item.donationState || "Patient Journey",
        excerpt: item.shortDescription || "",
        fullStory: item.content || "",
        imageUrl: item.patientImage || "",
        heroImageUrl: item.patientImage || "",
      };

      if (res.data.related?.data) {
        relatedStories = res.data.related.data.map((r) => ({
          id: r.id,
          slug: r.slug,
          patientName: r.title,
          date: formatStoryDate(r.storyDate),
          conditionTag: r.donationState || "Patient Journey",
          excerpt: r.shortDescription || "",
          fullStory: r.content || "",
          imageUrl: r.patientImage || "",
          heroImageUrl: r.patientImage || "",
        }));
      }
    } else {
      is404 = true;
    }
  } catch (err) {
    if (isMissingContentError(err)) {
      is404 = true;
    } else {
      failed = true;
    }
  }

  if (is404 || (!story && !failed)) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[#FFFBEA] text-[#2F2707] font-manrope">
      <DetailTracker type="smilestories" />

      {/* Main Story Detail Section
          Top padding clears the fixed navbar (banner removed). */}
      <section className={`${CONTAINER} pt-6 sm:pt-26 lg:pt-30 pb-8 sm:pb-12 lg:pb-16`}>
        {failed ? (
          <RefreshNotice title="We couldn't load this story right now" className="py-16" />
        ) : story ? (
          <>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-12 sm:gap-8 lg:gap-12 items-start">
              {/* Left Column: Patient Image + Social Share Buttons */}
              <div className="sm:col-span-5 flex flex-col items-start w-full">
                <div className="relative aspect-[615/646] w-full max-w-[37.5rem] sm:max-w-[26.25rem] md:max-w-[30rem] lg:max-w-[32.5rem] xl:max-w-[35rem] overflow-hidden rounded-md">
                  {/* Puzzle-piece reveal on the detail image only — pieces
                      fade/scale in at their own cell, in a randomized order,
                      the moment this box scrolls into view. Same behavior
                      as the Projects detail page. */}
                  {story.imageUrl ? (
                    <PuzzleImage
                      key={story.id}
                      src={story.imageUrl}
                      alt={story.patientName}
                      rows={4}
                      cols={5}
                      fit="contain"
                      staggerDuration={1000}
                    />
                  ) : null}
                </div>
                <ShareStory className="!mt-4 sm:!mt-6" />
              </div>

              {/* Right Column: Patient Name Title, Date, and Full Story Narrative */}
              <div className="sm:col-span-7 flex flex-col">
                <Typography
                  variant="heading-2"
                  as="h1"
                  className="font-tiempos-headline font-normal italic text-left text-[#0D2838]"
                >
                  {story.patientName}
                </Typography>

                {story.date ? (
                  <div className="mt-2 sm:mt-2.5 flex items-center gap-2">
                    <Calendar className="size-4 text-[#C08600] shrink-0" />
                    <Typography variant="body-10" as="span" className="font-argestadisplay font-normal text-[#C08600]">
                      {story.date}
                    </Typography>
                  </div>
                ) : null}

                {/* Full Story HTML / Text Narrative */}
                <div className="mt-4 sm:mt-5 max-h-[25rem] sm:max-h-[30rem] lg:max-h-[35rem] xl:max-h-[40rem] overflow-y-auto no-scrollbar pr-2 sm:pr-4">
                  {story.fullStory.includes("<") ? (
                    <div
                      className="prose prose-stone max-w-none text-left [&_*]:!text-left text-[#343E43] prose-headings:!text-[#0D2838] prose-a:!text-[#FCCC2D] [&_*]:!bg-transparent [&_p]:!text-[#343E43] [&_span]:!text-[#343E43] [&_div]:!text-[#343E43] [&_strong]:!text-[#343E43] [&_h1]:!text-[#0D2838] [&_h2]:!text-[#0D2838] [&_h3]:!text-[#0D2838] [&_h4]:!text-[#0D2838] [&_h5]:!text-[#0D2838] [&_h6]:!text-[#0D2838] [&_li]:!text-[#343E43] [&_td]:!text-[#343E43] [&_th]:!text-[#0D2838]"
                      dangerouslySetInnerHTML={{ __html: story.fullStory }}
                    />
                  ) : (
                    <div className="space-y-3.5 text-left">
                      {story.fullStory.split("\n\n").map((paragraph, index) => (
                        <Typography
                          key={index}
                          variant="body-10"
                          as="p"
                          className="font-argestadisplay font-normal text-[#343E43]"
                          dangerouslySetInnerHTML={{ __html: paragraph }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Separator Line */}
            <div className="my-14 sm:my-18 border-t border-[#EFEAD8]" />

            {/* Bottom Section: Related Stories */}
            {relatedStories.length > 0 && (
              <RelatedPatientStories stories={relatedStories} />
            )}
          </>
        ) : null}
      </section>

      {/* Donate Section at the Bottom */}
      <div id="donate-form">
        <DonateForm />
      </div>
    </main>
  );
}