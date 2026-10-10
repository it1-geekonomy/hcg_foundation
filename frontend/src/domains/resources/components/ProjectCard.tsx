"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import Typography from "@/lib/Typography";
import { DiagonalArrowIcon } from "@/shared/components/icons/ArrowIcons";
import FlipCard from "@/shared/components/FlipCard";
import MirrorReveal from "@/shared/components/MirrorReveal";
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
  const router = useRouter();
  const [isFlipped, setIsFlipped] = useState(false);
  const detailUrl = `/projects/${project.slug || project.id}`;

  const handleCardClick = () => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const frontContent = (
    <div className="relative h-full w-full overflow-hidden rounded-[6px] bg-[#EFEAD8] shadow-xs transition duration-300">
      {project.imageUrl ? (
        <>
          <picture className="h-full w-full block">
            {project.mobileImageUrl && (
              <source media="(max-width: 767px)" srcSet={project.mobileImageUrl} />
            )}
            <img
              src={project.imageUrl}
              alt={project.title}
              className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
              loading="lazy"
            />
          </picture>

          {/* Linear Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-transparent pointer-events-none" />
        </>
      ) : null}

      {/* Floating Glassmorphic Overlay */}
      <div
        data-no-flip="true"
        onClick={(e) => {
          e.stopPropagation();
          handleCardClick();
        }}
        className="absolute left-[0.75rem] right-[0.75rem] bottom-[0.75rem] xl:left-[1.1rem] xl:right-[1.28rem] xl:bottom-[1.51rem] flex flex-col justify-center gap-[0.5rem] p-[1rem] lg:py-[1.25rem] lg:px-[1.5rem] xl:pl-[1.74rem] xl:pr-[2rem] rounded-[6px] border border-white/10 bg-[#838383]/40 backdrop-blur-[55px] text-white transition duration-300 group-hover:bg-[#838383]/50 cursor-pointer"
      >
        <div className="w-full text-left">
          <Typography
            variant="heading-8"
            as={headingTag}
            title={project.title}
            className="font-argestadisplay font-normal text-white block w-full !leading-[1.15]"
          >
            {project.title}
          </Typography>
        </div>
      </div>
    </div>
  );

  const renderBackContent = (flipped: boolean) => (
    <MirrorReveal isOpen={flipped} delay={0} duration={0.82}>
      <div className="relative h-full w-full flex flex-col justify-between items-center p-6 sm:p-8 lg:p-10 rounded-[6px] border border-[#E0D4AE] shadow-sm overflow-hidden bg-[#FFF8E2]">
        {/* Pure, Centered Short Description */}
        <div className="relative z-10 flex-1 flex items-center justify-center text-center my-auto px-2 sm:px-6 w-full">
          {project.summary ? (
            <Typography
              variant="body-1"
              as="p"
              className="text-[#0D2838] max-w-xl"
            >
              {project.summary}
            </Typography>
          ) : null}
        </div>

        {/* Read More Button Constant at Bottom Center */}
        <div className="relative z-10 w-full flex justify-center shrink-0 pt-3">
          <Link
            href={detailUrl}
            data-no-drag="true"
            onClick={(e) => {
              e.stopPropagation();
              if (typeof window !== "undefined") {
                window.scrollTo({ top: 0, behavior: "smooth" });
              }
            }}
            className="inline-flex items-center justify-center whitespace-nowrap h-[1.75rem] lg:h-[2.5rem] xl:h-[3rem] w-auto xl:w-[9.5rem] px-[0.75rem] lg:px-[1.25rem] gap-[0.45rem] rounded-[6px] border border-black/5 bg-[#FCCC2D] text-[#2D2D2D] shadow-xs shrink-0 transition duration-300 hover:bg-[#E9B510] hover:scale-105 cursor-pointer"
          >
            <Typography variant="button-1" as="span" className="text-[#2D2D2D]">
              Read More
            </Typography>
            <DiagonalArrowIcon className="w-[1rem] h-[0.85rem] sm:w-[1.2rem] sm:h-[0.95rem] xl:w-[1.375rem] xl:h-[1.1rem] text-[#2D2D2D] shrink-0" />
          </Link>
        </div>
      </div>
    </MirrorReveal>
  );

  return (
    <>
      <a href={detailUrl} className="sr-only">
        View details for {project.title}
      </a>
      <Link 
        href={detailUrl} 
        onClick={handleCardClick}
        className={`block w-full aspect-[4/3.5] sm:aspect-[4/3] xl:aspect-[4/3] ${className}`}
        aria-label={`View details for ${project.title}`}
      >
        <FlipCard
          className="h-full w-full"
          roundedClassName="rounded-[0.375rem]"
          isFlipped={isFlipped}
          onFlipChange={setIsFlipped}
          flipOnHover={true}
          duration={0.42}
          front={frontContent}
          back={renderBackContent}
        />
      </Link>
    </>
  );
}
