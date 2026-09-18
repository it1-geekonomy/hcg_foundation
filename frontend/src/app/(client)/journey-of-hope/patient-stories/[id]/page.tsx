import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Calendar, ArrowUpRight, Share2 } from "lucide-react";
import DonateForm from "@/shared/components/DonateForm";
import Typography from "@/lib/Typography";
import { PATIENT_STORIES, PatientStory } from "@/domains/journey-of-hope/constants/stories";
import { FacebookIcon, InstagramIcon, WhatsappIcon } from "@/shared/components/icons/SocialIcons";

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

  // Filter 4 related stories (excluding current story) for the 4-column bottom grid matching Figma Component 2
  const relatedStories = PATIENT_STORIES.filter((s) => s.id !== story.id).slice(0, 4);

  return (
    <main className="min-h-screen bg-[#FFFBEA] text-[#2F2707] font-manrope pt-24 sm:pt-28 lg:pt-32">
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

            <div className="mt-4 sm:mt-6 flex flex-wrap items-center gap-2.5 sm:gap-3">
              <Typography variant="body-10" as="span" className="font-argestadisplay font-normal text-[#C08600]">
                Share this story
              </Typography>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  title="Share on Facebook"
                  className="flex size-8 sm:size-9 items-center justify-center rounded-full bg-[#FDC61D] text-[#382E07] shadow-xs transition hover:bg-[#E9B510] active:scale-95 cursor-pointer"
                >
                  <FacebookIcon />
                </button>
                <button
                  type="button"
                  title="Share on Instagram"
                  className="flex size-8 sm:size-9 items-center justify-center rounded-full bg-[#FDC61D] text-[#382E07] shadow-xs transition hover:bg-[#E9B510] active:scale-95 cursor-pointer"
                >
                  <InstagramIcon />
                </button>
                <button
                  type="button"
                  title="Share on WhatsApp"
                  className="flex size-8 sm:size-9 items-center justify-center rounded-full bg-[#FDC61D] text-[#382E07] shadow-xs transition hover:bg-[#E9B510] active:scale-95 cursor-pointer"
                >
                  <WhatsappIcon />
                </button>
                <button
                  type="button"
                  title="Copy Link"
                  className="flex size-8 sm:size-9 items-center justify-center rounded-full bg-[#FDC61D] text-[#382E07] shadow-xs transition hover:bg-[#E9B510] active:scale-95 cursor-pointer"
                >
                  <Share2 className="size-4 text-[#382E07]" />
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Patient Name Title, Date, and Full Story Narrative */}
          <div className="sm:col-span-7 flex flex-col">
            {/* Patient Name Title */}
            <Typography variant="heading-1" as="h1" className="font-tiempos-headline font-normal text-left text-[#0D2838]">
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

        {/* Bottom Section: Read More Stories (4-Column Portrait Overlay Cards) matching Figma Frame 325 */}
        {relatedStories.length > 0 && (
          <div>
            <div className="flex items-center justify-between">
              <Typography variant="body-9" as="h2" className="font-manrope font-medium text-[#161A1D]">
                Read More Stories
              </Typography>
              <Link
                href="/journey-of-hope/patient-stories"
                className="inline-flex items-center gap-1 transition hover:text-[#B88700]"
              >
                <Typography variant="body-9" as="span" className="font-manrope font-semibold text-[#2D2D2D]">
                  View All
                </Typography>
                <ArrowUpRight className="size-4 text-[#2D2D2D]" />
              </Link>
            </div>

            {/* 4-Column Responsive Grid matching Figma Component 2 (4 -> 3 -> 2 -> 1) */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-7">
              {relatedStories.map((relStory) => (
                <Link
                  key={relStory.id}
                  href={`/journey-of-hope/patient-stories/${relStory.id}`}
                  className="group relative block aspect-[413/515] w-full overflow-hidden rounded-[1.375rem] bg-[#EFEAD8] shadow-xs transition duration-300 hover:shadow-md"
                >
                  {/* Full Card Background Image */}
                  <img
                    src={relStory.imageUrl}
                    alt={relStory.patientName}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    loading="lazy"
                  />

                  {/* Bottom Dark Gradient Overlay matching Figma SHADETT */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent transition duration-300 group-hover:from-black/90" />

                  {/* Bottom Card Content: Name, Date (Left) + Circular Arrow Button (Right) */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5 flex items-end justify-between gap-3 z-10">
                    {/* Left: Patient Name & Date */}
                    <div className="flex flex-col text-white min-w-0">
                      <div className="truncate drop-shadow-xs">
                        <Typography variant="heading-8" as="h3" className="font-manrope font-bold text-white">
                          {relStory.patientName}
                        </Typography>
                      </div>
                      <div className="mt-1 flex items-center gap-1.5">
                        <Calendar className="size-3 text-white shrink-0" />
                        <Typography variant="body-8" as="span" className="font-manrope font-medium text-white">
                          {relStory.date}
                        </Typography>
                      </div>
                    </div>

                    {/* Right: Circular Arrow Button matching Figma Group 20 */}
                    <div className="flex size-10 sm:size-10.5 shrink-0 items-center justify-center rounded-full bg-white/90 text-[#1E1E1E] shadow-sm transition duration-300 group-hover:bg-white group-hover:scale-110">
                      <ArrowUpRight className="size-5 text-[#1E1E1E]" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Donate Section at the Bottom */}
      <div id="donate-form">
        <DonateForm />
      </div>
    </main>
  );
}
