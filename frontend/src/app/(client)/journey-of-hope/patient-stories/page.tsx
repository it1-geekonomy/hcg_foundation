"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Calendar, ArrowUpRight } from "lucide-react";
import Typography from "@/lib/Typography";
import DonateForm from "@/shared/components/DonateForm";
import PaginationControls from "@/shared/components/PaginationControls";
import { PATIENT_STORIES, PatientStory } from "@/domains/journey-of-hope/constants/stories";

const CONTAINER = "max-w-[90rem] 2xl:max-w-[97.5rem] mx-auto px-4 sm:px-6 lg:px-8";
const ITEMS_PER_PAGE = 8;

export default function PatientStoriesPage() {
  const [stories] = useState<PatientStory[]>(PATIENT_STORIES);
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(stories.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentStories = stories.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 120, behavior: "smooth" });
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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-7 min-h-[37.5rem]">
          {currentStories.map((story) => (
            <Link
              key={story.id}
              href={`/journey-of-hope/patient-stories/${story.id}`}
              className="group relative block aspect-[413/515] w-full overflow-hidden rounded-[1.375rem] bg-[#EFEAD8] shadow-xs transition duration-300 hover:shadow-md"
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
                <div className="flex flex-col text-white font-manrope min-w-0">
                  <Typography variant="heading-3" as="h3" className="text-white drop-shadow-xs truncate">
                    {story.patientName}
                  </Typography>
                  <div className="mt-1 flex items-center gap-1.5">
                    <Calendar className="size-3 text-white/90 shrink-0" />
                    <Typography variant="body-8" as="span" className="text-white/85">
                      {story.date}
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

        {/* Bottom Centered Pagination Navigation Arrows matching updated Figma design */}
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          className="mt-8 sm:mt-10"
        />
      </section>

      {/* Donate Section at the Bottom */}
      <div id="donate-form">
        <DonateForm />
      </div>
    </main>
  );
}

