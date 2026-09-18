"use client";

import React, { useState } from "react";
import Typography from "@/lib/Typography";
import DonateForm from "@/shared/components/DonateForm";
import PaginationControls from "@/shared/components/PaginationControls";
import ProjectCard from "@/domains/resources/components/ProjectCard";
import { PROJECTS_DATA, ProjectItem } from "@/domains/resources/constants/projects";

const CONTAINER = "max-w-[90rem] 2xl:max-w-[97.5rem] mx-auto px-4 sm:px-6 lg:px-8";
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
    <main className="min-h-screen bg-[#FFFBEA] pt-24 sm:pt-28 lg:pt-32">
      <section className={`${CONTAINER} py-8 sm:py-12 lg:py-16`}>
        <div className="mb-8 sm:mb-12">
          <Typography
            variant="heading-2"
            as="h1"
            className="font-tiempos-headline font-normal italic text-left text-[#0D2838]"
          >
            Projects
          </Typography>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 lg:gap-10">
          {currentProjects.map((projectItem) => (
            <ProjectCard
              key={projectItem.id}
              project={projectItem}
              headingTag="h2"
            />
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
