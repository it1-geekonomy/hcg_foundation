import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Calendar } from "lucide-react";
import DonateForm from "@/shared/components/DonateForm";
import Banner from "@/shared/components/Herobannersection";
import Typography from "@/lib/Typography";
import { PATIENT_STORIES, PatientStory } from "@/domains/journey-of-hope/constants/stories";
import ShareStory from "@/shared/components/ShareStory";
import { RelatedPatientStories } from "@/domains/journey-of-hope/components/RelatedPatientStories";
import { publicPatientStoriesApi } from "@/domains/cms/lib/api";

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
  let errorMsg: string | null = null;
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
        imageUrl: item.patientImage || "https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?q=80&w=800&auto=format&fit=crop",
        heroImageUrl: item.patientImage || "https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?q=80&w=1600&auto=format&fit=crop",
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
          imageUrl: r.patientImage || "https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?q=80&w=800&auto=format&fit=crop",
          heroImageUrl: r.patientImage || "https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?q=80&w=1600&auto=format&fit=crop",
        }));
      }
    } else {
      is404 = true;
    }
  } catch (err: any) {
    if (err.message && err.message.includes("404")) {
      is404 = true;
    } else {
      errorMsg = err.message || "Failed to connect to the server. Please check your connection and try again later.";
    }
  }

  if (is404 || (!story && !errorMsg)) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[#FFFBEA] text-[#2F2707] font-manrope">
      <Banner
        bgImage="/journey-of-hope/Journey of Hope banner image.png"
        bgImageAlt="Patient Stories"
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Journey of Hope", href: "/journey-of-hope/patient-stories" },
        ]}
        title="Patient Stories"
      />

      {/* Main Story Detail Section */}
      <section className={`${CONTAINER} py-8 sm:py-12 lg:py-16`}>
        {errorMsg ? (
          <div className="flex flex-col justify-center items-center py-20 min-h-[40vh] text-center max-w-2xl mx-auto px-4">
            <Typography variant="heading-3" as="h2" className="text-[#842A2A] mb-4 font-tiempos-headline italic">
              Connection Issue
            </Typography>
            <Typography variant="body-9" as="p" className="text-[#343E43]">
              {errorMsg}
            </Typography>
          </div>
        ) : story ? (
          <>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-12 sm:gap-8 lg:gap-12 items-start">
              {/* Left Column: Patient Image + Social Share Buttons */}
          <div className="sm:col-span-5 flex flex-col items-start w-full">
            <div className="relative aspect-[615/646] w-full max-w-[37.5rem] sm:max-w-[26.25rem] md:max-w-[30rem] lg:max-w-[32.5rem] xl:max-w-[35rem] overflow-hidden rounded-md bg-[#EFEAD8] shadow-xs">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={story.imageUrl}
                alt={story.patientName}
                className="h-full w-full object-cover"
              />
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
                  className="prose prose-stone max-w-none text-justify text-[#343E43]"
                  dangerouslySetInnerHTML={{ __html: story.fullStory }}
                />
              ) : (
                <div className="space-y-3.5 text-justify">
                  {story.fullStory.split("\n\n").map((paragraph, index) => (
                    <Typography
                      key={index}
                      variant="body-10"
                      as="p"
                      className="font-argestadisplay font-normal text-[#343E43]"
                    >
                      {paragraph}
                    </Typography>
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
