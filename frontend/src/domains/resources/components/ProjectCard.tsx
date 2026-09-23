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
      className={`group relative block aspect-[1/1] min-[450px]:aspect-[788/454] md:aspect-[1/1] lg:aspect-[1/1] xl:aspect-[6/5] 2xl:aspect-[788/454] w-full overflow-hidden rounded-[0.5rem] bg-[#EFEAD8] shadow-xs transition duration-300 hover:shadow-md hover:-translate-y-1 ${className}`}
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

      {/* Floating Glassmorphic Overlay */}
      <div className="absolute inset-x-[0.375rem] bottom-[0.375rem] sm:inset-x-[0.625rem] sm:bottom-[0.625rem] lg:inset-x-[0.75rem] lg:bottom-[0.75rem] flex flex-col justify-between gap-[0.375rem] sm:gap-[0.5rem] px-[0.625rem] py-[0.5rem] sm:px-[0.75rem] sm:py-[0.625rem] lg:px-[0.875rem] lg:py-[0.75rem] rounded-[0.5rem] sm:rounded-[0.625rem] border border-white/20 bg-[#8D8D8D]/40 backdrop-blur-md text-white transition duration-300 group-hover:bg-[#8D8D8D]/50">
        <div className="w-full flex flex-col justify-center gap-[0.25rem] text-left">
          <div className="drop-shadow-xs text-left">
            <Typography
              variant="body-2"
              as={headingTag}
              title={project.title}
              className="text-left text-white block [text-wrap:balance]"
            >
              {project.title}
            </Typography>
          </div>
        </div>

        {/* Date & Read More row: Mobile < 450px: Read More down in middle; >= 450px: Parallel */}
        <div className="flex flex-col min-[450px]:flex-row min-[450px]:items-center min-[450px]:justify-between gap-[0.375rem] sm:gap-[0.5rem] w-full pt-[0.1rem]">
          <div className="flex items-center gap-[0.35rem] sm:gap-[0.5rem] min-w-0 text-left">
            <img
              src="/Resources/calendar.png"
              alt="Calendar"
              className="size-[0.8125rem] sm:size-[1rem] shrink-0 object-contain"
            />
            <div className="text-left">
              <Typography variant="body-8" as="span" className="text-white">
                Project Date: {project.date}
              </Typography>
            </div>
          </div>

          <div className="flex justify-center min-[450px]:justify-end w-full min-[450px]:w-auto pt-[0.15rem] min-[450px]:pt-0">
            <span className="inline-flex items-center justify-center whitespace-nowrap h-[2.125rem] sm:h-[2.375rem] px-[0.875rem] sm:px-[1rem] gap-[0.35rem] sm:gap-[0.5rem] rounded-[0.25rem] sm:rounded-[0.3125rem] border border-white/10 bg-[#FCCC2D] text-[#2D2D2D] shadow-xs cursor-pointer shrink-0 transition duration-300 group-hover:bg-[#E9B510]">
              <Typography variant="button-3" as="span" className="text-[#2D2D2D]">
                Read More
              </Typography>
              <DiagonalArrowIcon className="w-[1.25rem] h-[1rem] sm:w-[1.375rem] sm:h-[1.1rem] text-[#2D2D2D] shrink-0" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
