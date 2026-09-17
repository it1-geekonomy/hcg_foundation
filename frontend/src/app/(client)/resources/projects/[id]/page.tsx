"use client";

import React, { use, useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Calendar,
  Link as LinkIcon,
  ArrowUpRight,
} from "lucide-react";
import Typography from "@/lib/Typography";
import DonateForm from "@/shared/components/DonateForm";
import PaginationControls from "@/shared/components/PaginationControls";
import { PROJECTS_DATA, ProjectItem } from "@/domains/resources/constants/projects";

const CONTAINER = "max-w-[107.625rem] mx-auto px-4 sm:px-8 lg:px-[4.5rem]";

function FacebookIcon() {
  return (
    <svg className="size-4 fill-current" viewBox="0 0 24 24">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg className="size-4 fill-current" viewBox="0 0 24 24">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
}

function WhatsappIcon() {
  return (
    <svg className="size-4 fill-current" viewBox="0 0 24 24">
      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-0.999 3.648 3.742-.981zm11.387-5.464c-.301-.15-1.785-.881-2.062-.981-.276-.101-.477-.15-.677.15-.199.301-.776.981-.951 1.18-.175.201-.35.226-.651.076-.301-.15-1.272-.469-2.424-1.498-.897-.801-1.502-1.791-1.677-2.091-.176-.301-.019-.464.13-.613.136-.135.301-.351.451-.526.15-.176.201-.301.301-.501.101-.201.051-.376-.025-.526-.076-.15-.677-1.631-.927-2.233-.243-.587-.49-.508-.677-.517-.175-.008-.376-.01-.576-.01-.201 0-.526.076-.802.376-.276.301-1.053 1.028-1.053 2.507 0 1.479 1.077 2.907 1.227 3.107.15.201 2.119 3.236 5.134 4.538.717.31 1.277.495 1.714.634.72.229 1.376.197 1.895.12.579-.087 1.785-.729 2.036-1.431.25-.701.25-1.303.175-1.43-.075-.128-.276-.201-.577-.351z" />
    </svg>
  );
}

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
  const RELATED_STEP = 2;

  // Sliding window ensures a full 2-card grid on every page (never leaves a single lonely card)
  const maxRelatedStartIndex = Math.max(0, allRelatedProjects.length - RELATED_PER_PAGE);
  const totalRelatedPages =
    allRelatedProjects.length <= RELATED_PER_PAGE
      ? 1
      : Math.ceil((allRelatedProjects.length - RELATED_PER_PAGE) / RELATED_STEP) + 1;

  const relatedStartIndex = Math.min((relatedPage - 1) * RELATED_STEP, maxRelatedStartIndex);
  const currentRelated = allRelatedProjects.slice(
    relatedStartIndex,
    relatedStartIndex + RELATED_PER_PAGE
  );

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  return (
    <main className="min-h-screen bg-[#FFFBEA] text-[#2F2707] font-manrope pt-24 sm:pt-28 lg:pt-32">
      <section className={`${CONTAINER} py-8 sm:py-12 lg:py-16`}>
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-12 sm:gap-10 lg:gap-14 items-start">
          <div className="sm:col-span-7 flex flex-col">
            <Typography variant="heading-1" as="h1" className="text-[#2E1C12]">
              {projectItem.title}
            </Typography>

            <div className="mt-3 sm:mt-4 flex items-center gap-2">
              <Calendar className="size-4 text-[#B88700] shrink-0" />
              <Typography variant="body-8" as="span" className="text-[#B88700]">
                Project Date: {projectItem.date}
              </Typography>
            </div>

            <div className="mt-5 sm:mt-6 space-y-3.5 text-justify">
              {projectItem.fullStory.split("\n\n").map((paragraph, index) => (
                <Typography key={index} variant="body-6" as="p" className="text-[#343E43]">
                  {paragraph}
                </Typography>
              ))}
            </div>

            <div className="mt-6 sm:mt-8 flex flex-wrap items-center gap-2.5 sm:gap-3">
              <Typography variant="body-8" as="span" className="text-[#8B7355]">
                Share this project
              </Typography>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  title="Share on Facebook"
                  className="flex size-8 sm:size-9 items-center justify-center rounded-full bg-[#FDC61D] text-[#382E07] shadow-xs transition hover:bg-[#E9B510] active:scale-95 cursor-pointer"
                >
                  <FacebookIcon />
                </button>
                <button
                  type="button"
                  title="Share on Instagram"
                  className="flex size-8 sm:size-9 items-center justify-center rounded-full bg-[#FDC61D] text-[#382E07] shadow-xs transition hover:bg-[#E9B510] active:scale-95 cursor-pointer"
                >
                  <InstagramIcon />
                </button>
                <button
                  type="button"
                  title="Share on WhatsApp"
                  className="flex size-8 sm:size-9 items-center justify-center rounded-full bg-[#FDC61D] text-[#382E07] shadow-xs transition hover:bg-[#E9B510] active:scale-95 cursor-pointer"
                >
                  <WhatsappIcon />
                </button>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  title="Copy Link"
                  className="flex size-8 sm:size-9 items-center justify-center rounded-full bg-[#FDC61D] text-[#382E07] shadow-xs transition hover:bg-[#E9B510] active:scale-95 cursor-pointer"
                >
                  <LinkIcon className="size-4 text-[#382E07]" />
                </button>
              </div>
            </div>
          </div>

          <div className="sm:col-span-5 flex flex-col items-start w-full order-first sm:order-last">
            <div className="relative aspect-[4/3] sm:aspect-[600/440] w-full max-w-[37.5rem] overflow-hidden rounded-md sm:rounded-lg bg-[#EFEAD8] shadow-md">
              <img
                src={projectItem.imageUrl}
                alt={projectItem.title}
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      <section className={`${CONTAINER} py-8 sm:py-12 border-t border-[#E8DFC5]`}>
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <Typography variant="heading-2" as="h2" className="text-[#2E1C12]">
            Related Articles
          </Typography>
          <Link
            href="/resources/projects"
            className="inline-flex items-center gap-1 transition hover:text-[#B88700]"
          >
            <Typography variant="body-7" as="span" className="text-[#2E1C12]">
              View All
            </Typography>
            <ArrowUpRight className="size-4 text-[#2E1C12]" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {currentRelated.map((item) => (
            <Link
              key={item.id}
              href={`/resources/projects/${item.id}`}
              className="group relative block aspect-[16/11] sm:aspect-[16/10] xl:aspect-[600/380] w-full min-h-[16.25rem] sm:min-h-[18.75rem] overflow-hidden rounded-lg sm:rounded-[0.625rem] bg-[#EFEAD8] shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
            >
              <img
                src={item.imageUrl}
                alt={item.title}
                className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                loading="lazy"
              />

              <div className="absolute inset-x-3 bottom-3 sm:inset-x-4 sm:bottom-4 xl:inset-x-5 xl:bottom-5 p-3 sm:p-4 lg:p-5 xl:pt-[1.8rem] xl:pr-[2.6125rem] xl:pb-[1.74375rem] xl:pl-[1.74375rem] flex items-center justify-between gap-3 sm:gap-4 rounded-md border border-white/10 bg-[#8D8D8D]/40 backdrop-blur-[1.75rem] text-white transition duration-300 group-hover:bg-[#8D8D8D]/50">
                <div className="flex-1 min-w-0 flex flex-col justify-center gap-1 sm:gap-1.5 xl:gap-[0.581rem]">
                  <div className="truncate drop-shadow-xs">
                    <Typography variant="heading-3" as="h3" className="text-white group-hover:text-[#FCCC2D] transition">
                      {item.title}
                    </Typography>
                  </div>

                  <div className="flex items-center gap-1.5 min-w-0">
                    <Calendar className="size-3 sm:size-3.5 xl:size-4 text-white/90 shrink-0" />
                    <div className="truncate">
                      <Typography variant="body-8" as="span" className="text-white/90">
                        Project Date: {item.date}
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
          currentPage={relatedPage}
          totalPages={totalRelatedPages}
          onPageChange={(page) => setRelatedPage(page)}
          className="mt-8 sm:mt-10"
        />
      </section>

      <div id="donate-form">
        <DonateForm />
      </div>
    </main>
  );
}
