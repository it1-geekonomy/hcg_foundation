"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Calendar, ArrowUpRight } from "lucide-react";
import Typography from "@/lib/Typography";
import Banner from "@/shared/components/Herobannersection";
import DonateForm from "@/shared/components/DonateForm";
import PaginationControls from "@/shared/components/PaginationControls";
import { PATIENT_STORIES } from "@/domains/journey-of-hope/constants/stories";

const CONTAINER = "max-w-[90rem] 2xl:max-w-[97.5rem] mx-auto px-4 sm:px-6 lg:px-8";

export default function PatientStoriesPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(8);

  useEffect(() => {
    const updateItemsPerPage = () => {
      if (window.innerWidth < 640) {
        setItemsPerPage(4);
      } else if (window.innerWidth < 768) {
        setItemsPerPage(6);
      } else if (window.innerWidth < 1280) {
        setItemsPerPage(6);
      } else {
        setItemsPerPage(8);
      }
    };
    updateItemsPerPage();
    window.addEventListener("resize", updateItemsPerPage);
    return () => window.removeEventListener("resize", updateItemsPerPage);
  }, []);

  const totalPages = Math.ceil(PATIENT_STORIES.length / itemsPerPage);
  const safePage = Math.min(currentPage, Math.max(1, totalPages));
  const maxStartIndex = Math.max(0, PATIENT_STORIES.length - itemsPerPage);
  const startIndex = Math.min((safePage - 1) * itemsPerPage, maxStartIndex);
  const currentStories = PATIENT_STORIES.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

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

      {/* Main Patient Stories Grid Section with Fully Filled Rows */}
      <section className={`${CONTAINER} py-8 sm:py-10 lg:py-12`}>
        <div
          key={`${safePage}-${itemsPerPage}`}
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-7 transition-opacity duration-300 ease-in-out"
        >
          {currentStories.map((story) => (
            <Link
              key={story.id}
              href={`/journey-of-hope/patient-stories/${story.id}`}
              className="group relative flex flex-col justify-between aspect-[385/493] w-full overflow-hidden rounded-[1.375rem] border border-white/50 bg-[#EFEAD8] p-[1.1rem] sm:p-[1.35rem] pb-0 sm:pb-0 shadow-sm transition duration-300 hover:shadow-md hover:border-white/70"
            >
              {/* 1. Full-bleed background photo (Figma SHADETT layer: blurred 0.75rem to let natural colors bleed through) */}
              <img
                src={story.imageUrl}
                alt=""
                aria-hidden="true"
                className="absolute inset-0 h-full w-full object-cover scale-110 filter blur-[0.75rem] opacity-90 transition duration-500 group-hover:scale-115"
              />

              {/* 2. Soft translucent glass tint over outer card matching Figma Subtract fill */}
              <div className="absolute inset-0 bg-white/20 backdrop-blur-md transition duration-300 group-hover:bg-white/25" />

              {/* 3. Inner Card matching Figma Rectangle 31 (339x368, Radius: 1.25rem) */}
              <div className="relative z-10 w-full aspect-[339/368] overflow-hidden rounded-[1.25rem] shadow-xs">
                <img
                  src={story.imageUrl}
                  alt={story.patientName}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  loading="lazy"
                />
              </div>

              {/* 4. Bottom Info Bar matching Figma Frame 97 (Height: 6.375rem): Name & Date (Left) + Circular Arrow Button (Right) */}
              <div className="relative z-10 h-[5.5rem] sm:h-[6.375rem] px-1 flex items-center justify-between gap-3">
                {/* Left: Patient Name & Date */}
                <div className="flex flex-col text-white min-w-0">
                  <div className="truncate">
                    <Typography
                      variant="heading-8"
                      as="h3"
                      className="font-manrope font-bold text-white"
                    >
                      {story.patientName}
                    </Typography>
                  </div>
                  <div className="mt-1 flex items-center gap-1.5 text-[#FFFFFF]">
                    <Calendar className="size-3.5 sm:size-4 text-[#FFFFFF] shrink-0" />
                    <Typography
                      variant="body-8"
                      as="span"
                      className="font-manrope font-medium text-[#FFFFFF]"
                    >
                      {story.date}
                    </Typography>
                  </div>
                </div>

                {/* Right: Circular Arrow Button matching Figma */}
                <div className="flex size-10 sm:size-11 shrink-0 items-center justify-center rounded-full bg-white text-[#1E1E1E] shadow-sm transition duration-300 group-hover:scale-110">
                  <ArrowUpRight className="size-5 sm:size-5.5 text-[#1E1E1E]" />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Bottom Centered Pagination Navigation Dots */}
        <PaginationControls
          currentPage={safePage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          showArrows={false}
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
