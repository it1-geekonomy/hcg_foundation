"use client";

import React, { useState, useEffect } from "react";
import Banner from "@/shared/components/Herobannersection";
import DonateForm from "@/shared/components/DonateForm";
import PaginationControls from "@/shared/components/PaginationControls";
import ProjectCard from "@/domains/resources/components/ProjectCard";
import { ProjectItem } from "@/domains/resources/constants/projects";
import { publicProjectsApi } from "@/domains/cms/lib/api";

const CONTAINER = "max-w-[90rem] 2xl:max-w-[97.5rem] mx-auto px-4 sm:px-6 lg:px-8";
const CARDS_PER_PAGE = 6;

export default function ProjectsPage() {
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await publicProjectsApi.listPublished({
          page: currentPage,
          limit: CARDS_PER_PAGE,
        });
        if (!cancelled) {
          const mapped: ProjectItem[] = (res.data ?? []).map((p) => ({
            id: p.id ?? "",
            slug: p.slug ?? "",
            title: p.title ?? "",
            date: p.projectDate ? new Date(p.projectDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "",
            category: "Projects",
            summary: p.shortDescription ?? "",
            fullStory: p.content ?? "",
            imageUrl: p.projectBanner || p.projectMobileBanner || "https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=800&auto=format&fit=crop",
          }));
          setProjects(mapped);
          setTotalPages(res.meta?.totalPages ?? 1);
        }
      } catch (err) {
        if (!cancelled) setProjects([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [currentPage]);

  // Group projects into pages of CARDS_PER_PAGE cards each
  // The API directly returns the correct page of items, so we just use `projects`
  // We still keep the same layout (mapping through rows if needed, or just rendering the grid)
  const pages = [projects]; 

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
          <div className={`flex transition-opacity duration-500 ease-in-out ${loading ? "opacity-50" : "opacity-100"}`}>
            <div className="w-full shrink-0 grid grid-cols-1 md:grid-cols-2 gap-[1.5rem] sm:gap-[2rem] lg:gap-[2.5rem]">
              {projects.map((projectItem) => (
                <ProjectCard
                  key={projectItem.id}
                  project={projectItem}
                  headingTag="h2"
                />
              ))}
              {!loading && projects.length === 0 && (
                <div className="col-span-full py-12 text-center text-neutral-500">
                  No projects available at the moment.
                </div>
              )}
            </div>
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
