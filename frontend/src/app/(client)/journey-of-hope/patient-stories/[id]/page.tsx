import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Calendar, ArrowUpRight } from "lucide-react";
import DonateForm from "@/shared/components/DonateForm";
import Banner from "@/shared/components/Herobannersection";
import Typography from "@/lib/Typography";
import { PATIENT_STORIES, PatientStory } from "@/domains/journey-of-hope/constants/stories";
import ShareStory from "@/shared/components/ShareStory";
import { RelatedPatientStories } from "@/domains/journey-of-hope/components/RelatedPatientStories";

const CONTAINER = "max-w-[90rem] 2xl:max-w-[97.5rem] mx-auto px-4 sm:px-6 lg:px-8";

export default async function StoryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const story = PATIENT_STORIES.find((s) => s.id === resolvedParams.id || s.slug === resolvedParams.id);

  if (!story) {
    notFound();
  }

  // Filter related stories (excluding current story) for the responsive full-row grid
  const relatedStories = PATIENT_STORIES.filter((s) => s.id !== story.id);

  return (
    <main className="min-h-screen bg-[#FFFBEA] text-[#2F2707] font-manrope">
      <Banner
        bgImage="/journey-of-hope/Journey of Hope banner image.png"
        bgImageAlt="Patient Stories"
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Journey of Hope" },
        ]}
        title="Patient Stories"
      />

      {/* Main Story Detail Section matching Figma Frame 324 */}
      <section className={`${CONTAINER} py-8 sm:py-12 lg:py-16`}>
        {/* 2-Column Grid matching Figma Dev Mode specs (Left: Patient Image | Right: Title, Date & Full Narrative) */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-12 sm:gap-8 lg:gap-12 items-start">

          {/* Left Column: Patient Image + Social Share Buttons */}
          <div className="sm:col-span-5 flex flex-col items-start w-full">
            {/* Patient Portrait Photo */}
            <div className="relative aspect-[615/646] w-full max-w-[37.5rem] sm:max-w-[26.25rem] md:max-w-[30rem] lg:max-w-[32.5rem] xl:max-w-[35rem] overflow-hidden rounded-md bg-[#EFEAD8] shadow-xs">
              <img
                src={story.imageUrl}
                alt={story.patientName}
                className="h-full w-full object-cover"
              />
            </div>

            {/* Reusable Share Story Component */}
            <ShareStory className="!mt-4 sm:!mt-6" />
          </div>

          {/* Right Column: Patient Name Title, Date, and Full Story Narrative */}
          <div className="sm:col-span-7 flex flex-col">
            {/* Patient Name Title matching Figma Dev Mode (Tiempos Headline, Italic, #0D2838) */}
            <Typography
              variant="heading-2"
              as="h1"
              className="font-tiempos-headline font-normal italic text-left text-[#0D2838]"
            >
              {story.patientName}
            </Typography>

            {/* Date with Gold Calendar Icon */}
            <div className="mt-2 sm:mt-2.5 flex items-center gap-2">
              <Calendar className="size-4 text-[#C08600] shrink-0" />
              <Typography variant="body-10" as="span" className="font-argestadisplay font-normal text-[#C08600]">
                {story.date}
              </Typography>
            </div>

            {/* Full Story Paragraph Text matching exact Figma Specs */}
            <div className="mt-4 sm:mt-5 space-y-3.5 text-justify">
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
          </div>
        </div>

        {/* Separator Line matching Figma Line 13 */}
        <div className="my-14 sm:my-18 border-t border-[#EFEAD8]" />

        {/* Bottom Section: Read More Stories (Adaptive Full Row matching current screen columns) */}
        {relatedStories.length > 0 && (
          <RelatedPatientStories stories={relatedStories} />
        )}
      </section>

      {/* Donate Section at the Bottom */}
      <div id="donate-form">
        <DonateForm />
      </div>
    </main>
  );
}
