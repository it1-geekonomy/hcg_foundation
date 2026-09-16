"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Calendar, ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";
import Typography from "@/lib/Typography";
import DonateForm from "@/shared/components/DonateForm";
import { PROJECTS_DATA, ProjectItem } from "@/domains/resources/constants/projects";

const CONTAINER = "max-w-[107.625rem] mx-auto px-4 sm:px-8 lg:px-[4.5rem]";
const ITEMS_PER_PAGE = 6;

export default function ProjectsPage() {
  const [projects] = useState<ProjectItem[]>(PROJECTS_DATA);
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(projects.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentProjects = projects.slice(startIndex, startIndex + ITEMS_PER_PAGE);

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
      <section className={`${CONTAINER} py-8 sm:py-12 lg:py-16`}>
        <div className="mb-8 sm:mb-12">
          <Typography variant="heading-1" as="h1" style={{ textAlign: "left" }} className="font-serif text-[1.875rem] sm:text-[2.25rem] lg:text-[2.625rem] italic text-[#2E1C12]">
            Projects
          </Typography>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 lg:gap-10">
          {currentProjects.map((projectItem) => (
            <Link
              key={projectItem.id}
              href={`/resources/projects/${projectItem.id}`}
              className="group relative block aspect-[16/11] sm:aspect-[16/10] xl:aspect-[600/380] w-full min-h-[16.25rem] sm:min-h-[18.75rem] overflow-hidden rounded-[8px] sm:rounded-[10px] bg-[#EFEAD8] shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
            >
              <img
                src={projectItem.imageUrl}
                alt={projectItem.title}
                className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                loading="lazy"
              />

              <div className="absolute inset-x-3 bottom-3 sm:inset-x-4 sm:bottom-4 xl:inset-x-5 xl:bottom-5 p-3 sm:p-4 lg:p-5 xl:pt-[1.8rem] xl:pr-[2.6125rem] xl:pb-[1.74375rem] xl:pl-[1.74375rem] flex items-center justify-between gap-3 sm:gap-4 rounded-[6px] border border-white/10 bg-[#8D8D8D]/40 backdrop-blur-[28px] text-white transition duration-300 group-hover:bg-[#8D8D8D]/50">
                <div className="flex-1 min-w-0 flex flex-col justify-center gap-1 sm:gap-1.5 xl:gap-[0.581rem]">
                  <Typography variant="heading-3" as="h2" style={{ textAlign: "left" }} className="text-[0.875rem] sm:text-[1rem] lg:text-[1.125rem] xl:text-[1.25rem] font-normal text-white font-manrope drop-shadow-xs line-clamp-1 group-hover:text-[#FCCC2D] transition">
                    {projectItem.title}
                  </Typography>

                  <div className="flex items-center gap-1.5 text-[0.6875rem] sm:text-[0.75rem] lg:text-[0.875rem] text-white/90 font-normal">
                    <Calendar className="size-3 sm:size-3.5 xl:size-4 text-white/90 shrink-0" />
                    <Typography variant="body-8" as="span" className="truncate">Project Date: {projectItem.date}</Typography>
                  </div>
                </div>

                <div className="shrink-0">
                  <span className="flex items-center justify-center gap-1.5 xl:gap-[0.581rem] px-3 py-2 sm:px-3.5 sm:py-2.5 xl:w-[11rem] xl:h-[3.5625rem] xl:py-[0.581rem] xl:pr-[0.581rem] xl:pl-[1.1rem] rounded-[6px] border border-white/10 bg-[#FCCC2D] backdrop-blur-[21px] text-[#382E07] text-[0.75rem] sm:text-[0.875rem] font-semibold shadow-xs transition duration-300 group-hover:bg-[#E9B510] group-hover:scale-105 cursor-pointer">
                    <Typography variant="body-8" as="span" className="whitespace-nowrap">Read More</Typography>
                    <ArrowUpRight className="size-3.5 sm:size-4 xl:size-5 text-[#382E07] shrink-0" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {totalPages > 1 && (
          <div className="mt-10 sm:mt-14 flex flex-col items-center gap-3">
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
          </div>
        )}
      </section>

      <div id="donate-form">
        <DonateForm />
      </div>
    </main>
  );
}
