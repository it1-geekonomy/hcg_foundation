"use client";

import React from "react";
import Link from "next/link";
import { Calendar, ArrowUpRight } from "lucide-react";
import Typography from "@/lib/Typography";
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
      href={`/resources/projects/${project.id}`}
      className={`group relative block aspect-[16/10] w-full overflow-hidden rounded-xl bg-[#EFEAD8] shadow-xs transition duration-300 hover:shadow-md hover:-translate-y-1 ${className}`}
    >
      <img
        src={project.imageUrl}
        alt={project.title}
        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        loading="lazy"
      />

      {/* Glassmorphic Overlay matching Figma Frame 9 & 10 */}
      <div className="absolute inset-x-3 bottom-3 sm:inset-x-4 sm:bottom-4 p-4 sm:p-5 lg:p-6 flex items-center justify-between gap-4 rounded-lg border border-white/10 bg-[#8D8D8D]/40 backdrop-blur-md text-white transition duration-300 group-hover:bg-[#8D8D8D]/50">
        <div className="flex-1 min-w-0 flex flex-col justify-center gap-1.5">
          <div className="truncate drop-shadow-xs">
            <Typography
              variant="body-1"
              as={headingTag}
              className="font-argestadisplay font-normal text-left text-white"
            >
              {project.title}
            </Typography>
          </div>

          <div className="flex items-center gap-2 min-w-0">
            <Calendar className="size-4 text-white shrink-0" />
            <div className="truncate">
              <Typography variant="body-8" as="span" className="font-manrope font-medium text-white">
                Project Date: {project.date}
              </Typography>
            </div>
          </div>
        </div>

        <div className="shrink-0">
          <span className="flex items-center justify-center whitespace-nowrap gap-2 px-4 py-2.5 rounded-md border border-white/10 bg-[#FCCC2D] text-[#2D2D2D] shadow-xs transition duration-300 group-hover:bg-[#E9B510] group-hover:scale-105 cursor-pointer">
            <Typography variant="button-3" as="span" className="font-manrope font-semibold text-[#2D2D2D]">
              Read More
            </Typography>
            <ArrowUpRight className="size-4 text-[#2D2D2D] shrink-0" />
          </span>
        </div>
      </div>
    </Link>
  );
}
