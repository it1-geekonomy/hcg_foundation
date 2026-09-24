"use client";

import React from "react";
import Link from "next/link";
import Typography from "@/lib/Typography";
import { DiagonalArrowIcon } from "@/shared/components/icons/ArrowIcons";
import type { ProjectItem } from "@/domains/resources/constants/projects";

interface ProjectCardProps {
  project: ProjectItem;
  headingTag?: "h2" | "h3";
  className?: string;
}

export default function ProjectCard({
  project,
  headingTag = "h2",
  className = "",
}: ProjectCardProps) {
  return (
    <Link
      href={`/resources/projects/${project.slug || project.id}`}
      className={`group relative block aspect-[16/11] sm:aspect-[788.39/454.09] w-full overflow-hidden rounded-[6px] bg-[#EFEAD8] shadow-xs transition duration-300 hover:shadow-md hover:-translate-y-1 ${className}`}
    >
      <picture className="h-full w-full block">
        {project.mobileImageUrl && (
          <source media="(max-width: 767px)" srcSet={project.mobileImageUrl} />
        )}
        <img
          src={project.imageUrl}
          alt={project.title}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          loading="lazy"
        />
      </picture>

      {/* Linear Gradient Overlay matching Figma Frame 109: #000000 35% to #666666 0% */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-black/10 to-transparent pointer-events-none" />

      {/* Floating Glassmorphic Overlay:
          - Desktop Large (xl:): Exact Figma Frame 105 (176px button, 42px right padding, 135.58px height)
          - Desktop Medium (lg:): Proportional side-by-side with button shifted right to prevent hiding date
          - Tablet (< lg:) when 1 col: Roomy side-by-side
          - Mobile (< sm:): Stacked with Read More button below date
      */}
      <div className="absolute left-[0.75rem] right-[0.75rem] bottom-[0.75rem] xl:left-[1.1rem] xl:right-[1.28rem] xl:bottom-[1.51rem] h-auto sm:h-[8.47375rem] flex flex-col sm:flex-row sm:items-center justify-between gap-[0.5rem] sm:gap-[0.75rem] xl:gap-[1rem] p-[0.75rem] sm:p-0 sm:pl-[1.25rem] xl:pl-[1.74rem] sm:pr-[1rem] xl:pr-[2.61rem] rounded-[6px] border border-white/10 bg-[#838383]/40 backdrop-blur-[55px] text-white transition duration-300 group-hover:bg-[#838383]/50">
        {/* Left: Title + Date stacked */}
        <div className="flex flex-col justify-center items-start min-w-0 flex-1 text-left gap-[0.35rem] sm:gap-[0.65rem] xl:gap-[0.93rem]">
          <div className="w-full drop-shadow-xs text-left min-w-0 overflow-hidden">
            <Typography
              variant="heading-7"
              as={headingTag}
              title={project.title}
              className="font-argestadisplay font-normal text-white block truncate w-full"
            >
              {project.title}
            </Typography>
          </div>
          <div className="flex items-center gap-[0.35rem] sm:gap-[0.5rem] xl:gap-[0.7rem] min-w-0 text-left">
            <img
              src="/Resources/calendar.png"
              alt="Calendar"
              className="size-[0.875rem] sm:size-[1.15rem] xl:size-[1.39rem] shrink-0 object-contain"
            />
            <div className="text-left min-w-0 overflow-hidden">
              <Typography variant="body-8" as="span" className="text-white block truncate">
                Project Date: {project.date}
              </Typography>
            </div>
          </div>
        </div>

        {/* Read More button: Lower than project date on mobile, side-by-side and shifted right on sm+ */}
        <div className="shrink-0 flex items-center self-start sm:self-center pt-[0.25rem] sm:pt-0">
          <span className="inline-flex items-center justify-center whitespace-nowrap h-[2rem] sm:h-[2.85rem] xl:h-[3.5625rem] w-auto xl:w-[11rem] px-[0.75rem] sm:px-[1rem] xl:px-[1.1rem] gap-[0.35rem] sm:gap-[0.45rem] xl:gap-[0.52rem] rounded-[6px] border border-white/10 bg-[#FCCC2D] text-[#2D2D2D] backdrop-blur-[42px] shadow-xs cursor-pointer shrink-0 transition duration-300 group-hover:bg-[#E9B510] group-hover:scale-105">
            <Typography variant="button-1" as="span" className="text-[#2D2D2D]">
              Read More
            </Typography>
            <DiagonalArrowIcon className="w-[1rem] h-[0.85rem] sm:w-[1.2rem] sm:h-[0.95rem] xl:w-[1.375rem] xl:h-[1.1rem] text-[#2D2D2D] shrink-0" />
          </span>
        </div>
      </div>
    </Link>
  );
}
