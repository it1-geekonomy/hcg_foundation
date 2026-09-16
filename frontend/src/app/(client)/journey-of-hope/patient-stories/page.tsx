"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Calendar, ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";
import DonateForm from "@/shared/components/DonateForm";
import { PATIENT_STORIES, PatientStory } from "@/domains/journey-of-hope/constants/stories";

const CONTAINER = "max-w-[1440px] 2xl:max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-8";
const ITEMS_PER_PAGE = 8;

export default function PatientStoriesPage() {
  const [stories] = useState<PatientStory[]>(PATIENT_STORIES);
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(stories.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentStories = stories.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
      window.scrollTo({ top: 120, behavior: "smooth" });
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
      window.scrollTo({ top: 120, behavior: "smooth" });
    }
  };

  return (
    <main className="min-h-screen bg-[#FFFBEA] text-[#2F2707] font-manrope pt-24 sm:pt-28 lg:pt-32">
      {/* ========================================================================= */}
      {/* TEAMMATE HERO BANNER SLOT                                                 */}
      {/* Un-comment / import when teammate pushes their Hero Banner component:    */}
      {/* <PatientStoriesHeroBanner />                                             */}
      {/* ========================================================================= */}

      {/* Main Patient Stories Grid Section matching Figma Canvas MTL 2 / Node 1342:30935 */}
      <section className={`${CONTAINER} py-8 sm:py-10 lg:py-12`}>
        {/* 8 Cards Per Page: 4 on Desktop (xl), 3 on Laptop/Tablet (md/lg), 2 on Small Tablet (sm), 1 on Mobile */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-7 min-h-[600px]">
          {currentStories.map((story) => (
            <Link
              key={story.id}
              href={`/journey-of-hope/patient-stories/${story.id}`}
              className="group relative block aspect-[413/515] w-full overflow-hidden rounded-[22px] bg-[#EFEAD8] shadow-xs transition duration-300 hover:shadow-md"
            >
              {/* Full Card Background Image */}
              <img
                src={story.imageUrl}
                alt={story.patientName}
                className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                loading="lazy"
              />

              {/* Bottom Dark Gradient Overlay matching Figma SHADETT */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent transition duration-300 group-hover:from-black/90" />

              {/* Bottom Card Content: Name, Date (Left) + Circular Arrow Button (Right) */}
              <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5 flex items-end justify-between gap-3 font-manrope z-10">
                {/* Left: Patient Name & Date */}
                <div className="flex flex-col text-white font-manrope">
                  <h3 className="font-manrope text-lg sm:text-xl font-bold tracking-tight text-white drop-shadow-xs">
                    {story.patientName}
                  </h3>
                  <div className="mt-1 flex items-center gap-1.5 text-xs font-medium text-white/85">
                    <Calendar className="size-3 text-white/90 shrink-0" />
                    <span>{story.date}</span>
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

        {/* Bottom Centered Pagination Navigation Arrows matching updated Figma design */}
        <div className="mt-8 sm:mt-10 flex flex-col items-center justify-center gap-3">
          <div className="flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              aria-label="Previous page"
              className={`flex size-9 sm:size-10 items-center justify-center rounded-full shadow-xs transition active:scale-95 cursor-pointer ${
                currentPage === 1
                  ? "bg-[#EFE4C8] text-[#8C826B] opacity-60 cursor-not-allowed"
                  : "bg-[#FDC61D] text-[#382E07] hover:bg-[#E9B510]"
              }`}
            >
              <ChevronLeft className="size-5" />
            </button>

            <button
              type="button"
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              aria-label="Next page"
              className={`flex size-9 sm:size-10 items-center justify-center rounded-full shadow-xs transition active:scale-95 cursor-pointer ${
                currentPage === totalPages
                  ? "bg-[#EFE4C8] text-[#8C826B] opacity-60 cursor-not-allowed"
                  : "bg-[#FDC61D] text-[#382E07] hover:bg-[#E9B510]"
              }`}
            >
              <ChevronRight className="size-5" />
            </button>
          </div>

          {/* Page Indicator Dots */}
          <div className="mt-1 flex items-center justify-center gap-2">
            {Array.from({ length: totalPages }).map((_, idx) => {
              const pageNum = idx + 1;
              const isActive = pageNum === currentPage;
              return (
                <button
                  key={pageNum}
                  type="button"
                  onClick={() => {
                    setCurrentPage(pageNum);
                    window.scrollTo({ top: 120, behavior: "smooth" });
                  }}
                  aria-label={`Go to page ${pageNum}`}
                  className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                    isActive
                      ? "w-8 bg-[#FDC61D]"
                      : "w-2.5 bg-[#EFE4C8] hover:bg-[#E9B510]/60"
                  }`}
                />
              );
            })}
          </div>
        </div>
      </section>

      {/* Donate Section at the Bottom */}
      <div id="donate-form">
        <DonateForm />
      </div>
    </main>
  );
}

