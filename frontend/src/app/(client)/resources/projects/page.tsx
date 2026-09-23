"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Banner from "@/shared/components/Herobannersection";
import DonateForm from "@/shared/components/DonateForm";
import PaginationControls from "@/shared/components/PaginationControls";
import ProjectCard from "@/domains/resources/components/ProjectCard";
import { ProjectItem } from "@/domains/resources/constants/projects";
import { publicProjectsApi } from "@/domains/cms/lib/api";

const CONTAINER = "mx-[clamp(1rem,8vw,8rem)] xl:mx-[clamp(0.5rem,3vw,4rem)] 2xl:mx-[clamp(1rem,10vw,10rem)]";

function chunkIntoPages<T>(items: T[], pageSize: number): T[][] {
  if (items.length === 0) return [];
  if (items.length <= pageSize) return [items];

  const totalPages = Math.ceil(items.length / pageSize);
  const result: T[][] = [];

  for (let i = 0; i < totalPages; i++) {
    if (i === totalPages - 1) {
      // Last page: always take the last `pageSize` items so 3 rows x 2 cols is completely filled and never left empty!
      result.push(items.slice(-pageSize));
    } else {
      result.push(items.slice(i * pageSize, (i + 1) * pageSize));
    }
  }

  return result;
}

export default function ProjectsPage() {
  const [allProjects, setAllProjects] = useState<ProjectItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(6);
  const [loading, setLoading] = useState(true);

  // Touch swipe support
  const touchStartXRef = useRef<number | null>(null);

  // Responsive itemsPerPage: 6 on desktop & tablet (3 rows x 2 columns), 2 on mobile (2 rows x 1 column)
  useEffect(() => {
    const updateItemsPerPage = () => {
      if (window.innerWidth < 768) {
        setItemsPerPage(2);
      } else {
        setItemsPerPage(6);
      }
    };
    updateItemsPerPage();
    window.addEventListener("resize", updateItemsPerPage);
    return () => window.removeEventListener("resize", updateItemsPerPage);
  }, []);

  // Fetch all published projects once so smooth horizontal sliding works instantly with 0 latency
  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    (async () => {
      try {
        const res = await publicProjectsApi.listPublished({
          limit: 100,
        });
        if (!cancelled) {
          const mapped: ProjectItem[] = (res.data ?? []).map((p) => ({
            id: p.id ?? "",
            slug: p.slug ?? "",
            title: p.title ?? "",
            date: p.projectDate
              ? new Date(p.projectDate).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })
              : "",
            category: "Projects",
            summary: p.shortDescription ?? "",
            fullStory: p.content ?? "",
            imageUrl:
              p.projectBanner ||
              p.projectMobileBanner ||
              "/Resources/Resources banner image.png",
            mobileImageUrl:
              p.projectMobileBanner ||
              p.projectBanner ||
              "/Resources/Resources banner image.png",
          }));
          setAllProjects(mapped);
        }
      } catch (err) {
        if (!cancelled) setAllProjects([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // Compute pages with full items (last page is never left empty!)
  const pages = useMemo(() => {
    return chunkIntoPages(allProjects, itemsPerPage);
  }, [allProjects, itemsPerPage]);

  const totalPages = Math.max(1, pages.length);
  const safePage = Math.min(currentPage, totalPages);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null) return;
    const diff = touchStartXRef.current - e.changedTouches[0].clientX;
    if (diff > 50 && safePage < totalPages) {
      setCurrentPage((p) => Math.min(totalPages, p + 1));
    } else if (diff < -50 && safePage > 1) {
      setCurrentPage((p) => Math.max(1, p - 1));
    }
    touchStartXRef.current = null;
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
        <div
          className="overflow-hidden w-full touch-pan-y"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div
            className="flex w-full transition-transform duration-500 ease-out"
            style={{ transform: `translateX(-${(safePage - 1) * 100}%)` }}
          >
            {pages.map((pageItems, pageIdx) => (
              <div
                key={pageIdx}
                className="w-full shrink-0 grid grid-cols-1 md:grid-cols-2 gap-x-[1.25rem] lg:gap-x-[1.5rem] gap-y-[1.5rem] sm:gap-y-[2rem] lg:gap-y-[2.5rem]"
              >
                {pageItems.map((projectItem, itemIdx) => (
                  <ProjectCard
                    key={`${projectItem.id}-${pageIdx}-${itemIdx}`}
                    project={projectItem}
                    headingTag="h2"
                  />
                ))}
              </div>
            ))}
          </div>

          {!loading && allProjects.length === 0 && (
            <div className="py-12 text-center text-neutral-500">
              No projects available at the moment.
            </div>
          )}
        </div>

        {/* Bottom Centered Pagination Navigation matching Patient Stories */}
        {totalPages > 1 && (
          <PaginationControls
            currentPage={safePage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            className="mt-12 sm:mt-16"
            showArrows={true}
            showNumbers={true}
          />
        )}
      </section>

      <div id="donate-form">
        <DonateForm />
      </div>
    </main>
  );
}
