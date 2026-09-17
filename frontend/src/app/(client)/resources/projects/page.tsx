"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Calendar, ArrowUpRight } from "lucide-react";
import Typography from "@/lib/Typography";
import DonateForm from "@/shared/components/DonateForm";
import PaginationControls from "@/shared/components/PaginationControls";
import { PROJECTS_DATA, ProjectItem } from "@/domains/resources/constants/projects";

const CONTAINER = "max-w-[107.625rem] mx-auto px-4 sm:px-8 lg:px-[4.5rem]";
const CARDS_PER_PAGE = 4;
const STEP = 2;

export default function ProjectsPage() {
  const [projects] = useState<ProjectItem[]>(PROJECTS_DATA);
  const [currentPage, setCurrentPage] = useState(1);

  // Sliding window ensures a full 4-card grid on every page (never leaves half-empty rows)
  const maxStartIndex = Math.max(0, projects.length - CARDS_PER_PAGE);
  const totalPages =
    projects.length <= CARDS_PER_PAGE
      ? 1
      : Math.ceil((projects.length - CARDS_PER_PAGE) / STEP) + 1;

  const startIndex = Math.min((currentPage - 1) * STEP, maxStartIndex);
  const currentProjects = projects.slice(startIndex, startIndex + CARDS_PER_PAGE);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 120, behavior: "smooth" });
  };

  return (
    <main className="min-h-screen bg-[#FFFBEA] text-[#2F2707] font-manrope pt-24 sm:pt-28 lg:pt-32">
      <section className={`${CONTAINER} py-8 sm:py-12 lg:py-16`}>
        <div className="mb-8 sm:mb-12">
          <Typography variant="heading-1" as="h1" className="text-[#2E1C12]">
            Projects
          </Typography>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 lg:gap-10">
          {currentProjects.map((projectItem) => (
            <Link
              key={projectItem.id}
              href={`/resources/projects/${projectItem.id}`}
              className="group relative block aspect-[16/11] sm:aspect-[16/10] xl:aspect-[600/380] w-full min-h-[16.25rem] sm:min-h-[18.75rem] overflow-hidden rounded-lg sm:rounded-[0.625rem] bg-[#EFEAD8] shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
            >
              <img
                src={projectItem.imageUrl}
                alt={projectItem.title}
                className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                loading="lazy"
              />

              <div className="absolute inset-x-3 bottom-3 sm:inset-x-4 sm:bottom-4 xl:inset-x-5 xl:bottom-5 p-3 sm:p-4 lg:p-5 xl:pt-[1.8rem] xl:pr-[2.6125rem] xl:pb-[1.74375rem] xl:pl-[1.74375rem] flex items-center justify-between gap-3 sm:gap-4 rounded-md border border-white/10 bg-[#8D8D8D]/40 backdrop-blur-[1.75rem] text-white transition duration-300 group-hover:bg-[#8D8D8D]/50">
                <div className="flex-1 min-w-0 flex flex-col justify-center gap-1 sm:gap-1.5 xl:gap-[0.581rem]">
                  <div className="truncate drop-shadow-xs">
                    <Typography variant="heading-3" as="h2" className="text-white group-hover:text-[#FCCC2D] transition">
                      {projectItem.title}
                    </Typography>
                  </div>

                  <div className="flex items-center gap-1.5 min-w-0">
                    <Calendar className="size-3 sm:size-3.5 xl:size-4 text-white/90 shrink-0" />
                    <div className="truncate">
                      <Typography variant="body-8" as="span" className="text-white/90">
                        Project Date: {projectItem.date}
                      </Typography>
                    </div>
                  </div>
                </div>

                <div className="shrink-0">
                  <span className="flex items-center justify-center whitespace-nowrap gap-1.5 xl:gap-[0.581rem] px-3 py-2 sm:px-3.5 sm:py-2.5 xl:w-[11rem] xl:h-[3.5625rem] xl:py-[0.581rem] xl:pr-[0.581rem] xl:pl-[1.1rem] rounded-md border border-white/10 bg-[#FCCC2D] backdrop-blur-[1.3125rem] text-[#382E07] shadow-xs transition duration-300 group-hover:bg-[#E9B510] group-hover:scale-105 cursor-pointer">
                    <Typography variant="body-8" as="span" className="text-[#382E07]">
                      Read More
                    </Typography>
                    <ArrowUpRight className="size-3.5 sm:size-4 xl:size-5 text-[#382E07] shrink-0" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Bottom Centered Pagination Navigation Arrows matching patient-stories */}
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          className="mt-8 sm:mt-10"
        />
      </section>

      <div id="donate-form">
        <DonateForm />
      </div>
    </main>
  );
}
