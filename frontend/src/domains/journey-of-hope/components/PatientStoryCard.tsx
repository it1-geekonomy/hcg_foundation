"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Calendar } from "lucide-react";
import Typography from "@/lib/Typography";
import { DiagonalArrowIcon } from "@/shared/components/icons/ArrowIcons";
import FlipCard from "@/shared/components/FlipCard";
import MirrorReveal from "@/shared/components/MirrorReveal";
import { cn } from "@/lib/utils";
import type { PatientStory } from "@/domains/journey-of-hope/constants/stories";

export interface PatientStoryCardProps {
  story: PatientStory;
  className?: string;
  style?: React.CSSProperties;
  onClick?: (e: React.MouseEvent) => void;
}

export default function PatientStoryCard({
  story,
  className = "",
  style,
  onClick,
}: PatientStoryCardProps) {
  const router = useRouter();
  const [isFlipped, setIsFlipped] = useState(false);
  const detailUrl = `/patient-stories/${story.slug || story.id}`;

  const handleCardClick = (e: React.MouseEvent) => {
    if (onClick) {
      onClick(e);
      if (e.defaultPrevented) return;
    }
    router.push(detailUrl);
  };

  const frontContent = (
    <div className="group relative flex flex-col justify-between h-full w-full overflow-hidden rounded-[1.2643rem] border-[0.0527rem] border-[rgba(255,255,255,0.55)] bg-[rgba(0,0,0,0.23)] backdrop-blur-[1.30625rem] pt-[1.4223rem] pl-[1.475rem] pr-[1.4223rem] pb-0 transition-all duration-500 hover:border-[rgba(255,255,255,0.75)]">
      {/* Inner Image: Rectangle 31 in Figma (21.177rem x 23.021rem, radius 1.2643rem) */}
      <div className="relative z-10 w-full aspect-[21.177/23.021] overflow-hidden rounded-[1.2643rem] shadow-xs pointer-events-none bg-black/10">
        {story.imageUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={story.imageUrl}
            alt={story.patientName}
            className="h-full w-full object-cover rounded-[1.2643rem] transition duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : null}
      </div>

      {/* 4. Bottom Info Bar: Name & Date (Left) */}
      <div
        onClick={(e) => {
          e.stopPropagation();
          handleCardClick(e);
        }}
        className="relative z-10 h-[6.375rem] flex items-center justify-between pointer-events-auto cursor-pointer"
      >
        {/* Left: Patient Name & Date */}
        <div className="flex flex-col text-white min-w-0">
          <Typography
            variant="heading-8"
            as="h3"
            className="font-manrope font-bold text-white"
          >
            {story.patientName}
          </Typography>
          {story.date && story.date.trim() ? (
            <div className="mt-1 flex items-center gap-1.5 text-white">
              <Calendar className="size-3.5 sm:size-4 text-white shrink-0" />
              <Typography
                variant="body-8"
                as="span"
                className="font-manrope font-medium text-white"
              >
                {story.date}
              </Typography>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );

  const renderBackContent = (flipped: boolean) => (
    <MirrorReveal isOpen={flipped} delay={0} duration={0.82}>
      <div className="relative h-full w-full flex flex-col justify-between items-center p-[1.425rem] rounded-[1.2643rem] border-[0.0527rem] border-[#E0D4AE] shadow-sm overflow-hidden bg-[#FFF8E2]">
        {/* Scrollable Story Description matching Team & Trustees pattern */}
        <div className="min-h-0 flex-1 overflow-y-auto pr-1.5 space-y-2.5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {(story.excerpt || story.quote) ? (
            (story.excerpt || story.quote || "")
              .split("\n\n")
              .map((paragraph, idx) => (
                <Typography
                  key={idx}
                  variant="body-9"
                  as="p"
                  className="font-manrope leading-relaxed font-normal !text-[#0D2838] text-left"
                >
                  {paragraph}
                </Typography>
              ))
          ) : null}
        </div>

        {/* Read More Button Constant at Bottom Center */}
        <div className="relative z-10 w-full flex justify-center shrink-0 pt-3 border-t border-[#E0D4AE]/50 mt-2">
          <div
            onClick={(e) => {
              e.stopPropagation();
              handleCardClick(e);
            }}
            className="inline-flex items-center justify-center whitespace-nowrap h-[2rem] lg:h-[2.35rem] w-auto px-4 lg:px-5 gap-[0.45rem] rounded-[0.375rem] border border-black/5 bg-[#FCCC2D] text-[#2D2D2D] shadow-xs shrink-0 transition duration-300 hover:bg-[#E9B510] hover:scale-105 cursor-pointer"
          >
            <Typography variant="button-1" as="span" className="text-[#2D2D2D]">
              Read More
            </Typography>
            <DiagonalArrowIcon className="w-[0.95rem] h-[0.8rem] lg:w-[1.05rem] lg:h-[0.88rem] text-[#2D2D2D] shrink-0" />
          </div>
        </div>
      </div>
    </MirrorReveal>
  );

  return (
    <div
      style={style}
      className={cn(
        "sticky top-[var(--mobile-top)] lg:top-auto lg:relative aspect-[24.0744/30.8173] w-full max-w-[28rem] mx-auto lg:max-w-none rounded-[1.2643rem]",
        className
      )}
    >
      <FlipCard
        className="h-full w-full rounded-[1.2643rem]"
        roundedClassName="rounded-[1.2643rem]"
        isFlipped={isFlipped}
        onFlipChange={setIsFlipped}
        onClick={handleCardClick}
        flipOnHover={true}
        duration={0.42}
        front={frontContent}
        back={renderBackContent}
      />
    </div>
  );
}
