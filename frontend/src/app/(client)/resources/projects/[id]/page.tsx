"use client";

import React, { use, useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import Typography from "@/lib/Typography";
import Banner from "@/shared/components/Herobannersection";
import DonateForm from "@/shared/components/DonateForm";
import PaginationControls from "@/shared/components/PaginationControls";
import ShareStory from "@/shared/components/ShareStory";
import ProjectCard from "@/domains/resources/components/ProjectCard";
import { PROJECTS_DATA } from "@/domains/resources/constants/projects";

const CONTAINER = "max-w-[90rem] 2xl:max-w-[97.5rem] mx-auto px-4 sm:px-6 lg:px-8";

interface ProjectDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const resolvedParams = use(params);
  const projectItem = PROJECTS_DATA.find(
    (e) => e.id === resolvedParams.id || e.slug === resolvedParams.id
  );

  if (!projectItem) {
    notFound();
  }

  const allRelatedProjects = PROJECTS_DATA.filter((e) => e.id !== projectItem.id);
  const [relatedPage, setRelatedPage] = useState(1);
  const RELATED_PER_PAGE = 2;
  const totalRelatedPages = Math.ceil(allRelatedProjects.length / RELATED_PER_PAGE);

  // Group related projects into pages of RELATED_PER_PAGE cards each
  const relatedPages = Array.from({ length: totalRelatedPages }, (_, pageIndex) => {
    const start = pageIndex * RELATED_PER_PAGE;
    if (start + RELATED_PER_PAGE > allRelatedProjects.length && allRelatedProjects.length >= RELATED_PER_PAGE) {
      return allRelatedProjects.slice(-RELATED_PER_PAGE);
    }
    return allRelatedProjects.slice(start, start + RELATED_PER_PAGE);
  });



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
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-12 sm:gap-10 lg:gap-14 items-start">
          <div className="sm:col-span-7 flex flex-col">
            <Typography
              variant="heading-2"
              as="h1"
              className="font-tiempos-headline font-normal italic text-left text-[#0D2838]"
            >
              {projectItem.title}
            </Typography>

            <div className="mt-5 sm:mt-6 space-y-4 text-left">
              {projectItem.fullStory.split("\n\n").map((paragraph, index) => (
                <Typography
                  key={index}
                  variant="body-10"
                  as="p"
                  className="font-argestadisplay font-normal text-justify text-[#596D79]"
                >
                  {paragraph}
                </Typography>
              ))}
            </div>

            {/* Reusable Social Share Buttons */}
            <ShareStory />
          </div>

          <div className="sm:col-span-5 flex flex-col items-start w-full order-first sm:order-last">
            <div className="relative aspect-[4/3] sm:aspect-[4/3] w-full max-w-[37.5rem] overflow-hidden rounded-xl bg-[#EFEAD8] shadow-md">
              <img
                src={projectItem.imageUrl}
                alt={projectItem.title}
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Related Articles Section matching Figma Frame 10 */}
      <section className={`${CONTAINER} py-8 sm:py-12 border-t border-[#E8DFC5]`}>
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <Typography
            variant="heading-6"
            as="h2"
            className="font-tiempos-headline font-normal italic text-left text-[#0D2838]"
          >
            Related Articles
          </Typography>
          <Link
            href="/resources/projects"
            className="inline-flex items-center gap-1 text-[#2D2D2D] transition hover:text-[#B88700]"
          >
            <Typography variant="body-9" as="span" className="font-manrope font-semibold text-[#2D2D2D]">
              View All
            </Typography>
            <ArrowUpRight className="size-4 text-[#2D2D2D]" />
          </Link>
        </div>

        {/* Smooth Horizontal Sliding Track */}
        <div className="overflow-hidden w-full">
          <div
            className="flex transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${(relatedPage - 1) * 100}%)` }}
          >
            {relatedPages.map((pageProjects, pageIdx) => (
              <div
                key={pageIdx}
                className="w-full shrink-0 grid grid-cols-1 md:grid-cols-2 gap-[1.5rem] sm:gap-[2rem]"
              >
                {pageProjects.map((item) => (
                  <ProjectCard
                    key={`${pageIdx}-${item.id}`}
                    project={item}
                    headingTag="h3"
                  />
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Centered Pagination Navigation Dots */}
        <PaginationControls
          currentPage={relatedPage}
          totalPages={totalRelatedPages}
          onPageChange={(page) => setRelatedPage(page)}
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
