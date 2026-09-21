"use client";

import React, { use, useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Calendar, Link as LinkIcon, ArrowUpRight } from "lucide-react";
import Typography from "@/lib/Typography";
import Banner from "@/shared/components/Herobannersection";
import DonateForm from "@/shared/components/DonateForm";
import PaginationControls from "@/shared/components/PaginationControls";
import {
  FacebookIcon,
  InstagramIcon,
  WhatsappIcon,
} from "@/shared/components/icons/SocialIcons";
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

            <div className="mt-3 sm:mt-4 flex items-center gap-2">
              <Calendar className="size-4 text-[#C08600] shrink-0" />
              <Typography variant="body-10" as="span" className="font-argestadisplay font-normal text-[#C08600]">
                Project Date: {projectItem.date}
              </Typography>
            </div>

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

            <div className="mt-6 sm:mt-8 flex flex-wrap items-center gap-2.5 sm:gap-3">
              <Typography variant="body-10" as="span" className="font-argestadisplay font-normal text-[#C08600]">
                Share this story
              </Typography>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  title="Share on Facebook"
                  className="flex size-8 sm:size-9 items-center justify-center rounded-full bg-[#FDC61D] text-[#382E07] shadow-xs transition hover:bg-[#E9B510] active:scale-95 cursor-pointer"
                >
                  <FacebookIcon className="size-4 fill-current" />
                </button>
                <button
                  type="button"
                  title="Share on Instagram"
                  className="flex size-8 sm:size-9 items-center justify-center rounded-full bg-[#FDC61D] text-[#382E07] shadow-xs transition hover:bg-[#E9B510] active:scale-95 cursor-pointer"
                >
                  <InstagramIcon className="size-4 fill-current" />
                </button>
                <button
                  type="button"
                  title="Share on WhatsApp"
                  className="flex size-8 sm:size-9 items-center justify-center rounded-full bg-[#FDC61D] text-[#382E07] shadow-xs transition hover:bg-[#E9B510] active:scale-95 cursor-pointer"
                >
                  <WhatsappIcon className="size-4 fill-current" />
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {currentRelated.map((item) => (
            <ProjectCard
              key={item.id}
              project={item}
              headingTag="h3"
            />
          ))}
        </div>

        {/* Bottom Centered Pagination Navigation Arrows */}
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
