"use client";

import React, { useState } from "react";
import Banner from "@/shared/components/Herobannersection";
import DonateForm from "@/shared/components/DonateForm";
import PaginationControls from "@/shared/components/PaginationControls";
import ProjectCard from "@/domains/resources/components/ProjectCard";
import { PROJECTS_DATA, ProjectItem } from "@/domains/resources/constants/projects";

const CONTAINER = "max-w-[90rem] 2xl:max-w-[97.5rem] mx-auto px-4 sm:px-6 lg:px-8";
const CARDS_PER_PAGE = 6;

export default function ProjectsPage() {
  const [projects] = useState<ProjectItem[]>(PROJECTS_DATA);
  const [currentPage, setCurrentPage] = useState(1);

  // Group projects into pages of CARDS_PER_PAGE cards each
  const totalPages = Math.ceil(projects.length / CARDS_PER_PAGE);
  const pages = Array.from({ length: totalPages }, (_, pageIndex) => {
    const start = pageIndex * CARDS_PER_PAGE;
    if (start + CARDS_PER_PAGE > projects.length && projects.length >= CARDS_PER_PAGE) {
      return projects.slice(-CARDS_PER_PAGE);
    }
    return projects.slice(start, start + CARDS_PER_PAGE);
  });

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <main className="min-h-screen bg-[#FFFBEA]">
      <Banner
        bgImage="/Resources/Resources banner image.png"
        bgImageAlt="Projects"
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Resources" },
        ]}
        title="Projects"
      />

      <section className={`${CONTAINER} py-8 sm:py-12 lg:py-16`}>
        {/* Smooth Horizontal Sliding Track */}
        <div className="overflow-hidden w-full">
          <div
            className="flex transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${(currentPage - 1) * 100}%)` }}
          >
            {pages.map((pageProjects, pageIdx) => (
              <div
                key={pageIdx}
                className="w-full shrink-0 grid grid-cols-1 md:grid-cols-2 gap-[1.5rem] sm:gap-[2rem] lg:gap-[2.5rem]"
              >
                {pageProjects.map((projectItem) => (
                  <ProjectCard
                    key={`${pageIdx}-${projectItem.id}`}
                    project={projectItem}
                    headingTag="h2"
                  />
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Centered Pagination Navigation Dots */}
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          className="mt-[2rem] sm:mt-[2.5rem]"
          showArrows={false}
          showDots={true}
        />
      </section>

      <div id="donate-form">
        <DonateForm />
      </div>
    </main>
  );
}
