import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Calendar, ArrowUpRight, Share2 } from "lucide-react";
import DonateForm from "@/shared/components/DonateForm";
import Typography from "@/lib/Typography";
import { PATIENT_STORIES, PatientStory } from "@/domains/journey-of-hope/constants/stories";

const FacebookIcon = () => (
  <svg className="size-4 text-[#382E07]" fill="currentColor" viewBox="0 0 24 24">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

const InstagramIcon = () => (
  <svg className="size-4 text-[#382E07]" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
  </svg>
);

const WhatsappIcon = () => (
  <svg className="size-4 text-[#382E07]" fill="currentColor" viewBox="0 0 24 24">
    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z" />
  </svg>
);

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
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-12 sm:gap-8 lg:gap-12 items-start font-manrope">

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
              <Typography variant="body-8" as="span" className="text-[#8B7355]">
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
          <div className="sm:col-span-7 flex flex-col font-manrope">
            {/* Patient Name Title */}
            <Typography variant="heading-1" as="h1" className="text-[#2E1C12] italic">
              {story.patientName}
            </Typography>

            {/* Date with Gold Calendar Icon */}
            <div className="mt-2 sm:mt-2.5 flex items-center gap-2">
              <Calendar className="size-4 text-[#B88700] shrink-0" />
              <Typography variant="body-8" as="span" className="text-[#B88700]">
                {story.date}
              </Typography>
            </div>

            {/* Full Story Paragraph Text matching exact Figma Specs */}
            <div className="mt-4 sm:mt-5 space-y-3.5 text-justify">
              {story.fullStory.split("\n\n").map((paragraph, index) => (
                <Typography
                  key={index}
                  variant="body-6"
                  as="p"
                  className="text-[#343E43]"
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
              <Typography variant="heading-2" as="h2" className="text-[#2E1C12]">
                Read More Stories
              </Typography>
              <Link
                href="/journey-of-hope/patient-stories"
                className="inline-flex items-center gap-1 transition hover:text-[#B88700]"
              >
                <Typography variant="body-7" as="span" className="text-[#2E1C12]">
                  View All
                </Typography>
                <ArrowUpRight className="size-4 text-[#2E1C12]" />
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
                  <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5 flex items-end justify-between gap-3 font-manrope z-10">
                    {/* Left: Patient Name & Date */}
                    <div className="flex flex-col text-white font-manrope min-w-0">
                      <Typography variant="heading-3" as="h3" className="text-white drop-shadow-xs truncate">
                        {relStory.patientName}
                      </Typography>
                      <div className="mt-1 flex items-center gap-1.5">
                        <Calendar className="size-3 text-white/90 shrink-0" />
                        <Typography variant="body-8" as="span" className="text-white/85">
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
