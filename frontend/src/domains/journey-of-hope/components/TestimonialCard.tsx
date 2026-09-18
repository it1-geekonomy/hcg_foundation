"use client";

import React from "react";
import { Play } from "lucide-react";
import { motion, PanInfo } from "framer-motion";
import Typography from "@/lib/Typography";
import { PatientTestimonial } from "@/domains/journey-of-hope/constants/testimonials";

interface TestimonialCardProps {
  item: PatientTestimonial;
  diff: number;
  isDesktop: boolean;
  isTablet: boolean;
  onDragEnd: (_: unknown, info: PanInfo) => void;
  onNext: () => void;
  onPrev: () => void;
  onPlayVideo: (url: string) => void;
}

// Hardware-accelerated GPU scale & translate transform variants for 60fps smooth sliding
const getCardStyles = (diff: number, isDesktop: boolean, isTablet: boolean) => {
  if (diff === 0) {
    // CENTER ACTIVE CARD (Figma: 698.85px x 397.19px)
    return {
      x: "-50%",
      y: "-50%",
      scale: 1,
      opacity: 1,
      zIndex: 30,
      filter: "brightness(1)",
      pointerEvents: "auto" as const,
    };
  }

  if (diff === 1) {
    // RIGHT CARD (Figma: 415px x 236px with exact ~33px gap)
    return {
      x: isDesktop ? "calc(-50% + 36.875rem)" : isTablet ? "calc(-50% + 26.875rem)" : "calc(-50% + 82%)",
      y: "-50%",
      scale: isDesktop ? 0.594 : isTablet ? 0.6 : 0.75,
      opacity: isDesktop || isTablet ? 0.85 : 0.35,
      zIndex: 20,
      filter: "brightness(0.85)",
      pointerEvents: "auto" as const,
    };
  }

  if (diff === -1) {
    // LEFT CARD (Figma: 415px x 236px with exact ~33px gap)
    return {
      x: isDesktop ? "calc(-50% - 36.875rem)" : isTablet ? "calc(-50% - 26.875rem)" : "calc(-50% - 82%)",
      y: "-50%",
      scale: isDesktop ? 0.594 : isTablet ? 0.6 : 0.75,
      opacity: isDesktop || isTablet ? 0.85 : 0.35,
      zIndex: 20,
      filter: "brightness(0.85)",
      pointerEvents: "auto" as const,
    };
  }

  // HIDDEN / OFF-SCREEN CARDS SLIDING IN/OUT
  return {
    x: diff > 0
      ? isDesktop ? "calc(-50% + 65rem)" : "calc(-50% + 50rem)"
      : isDesktop ? "calc(-50% - 65rem)" : "calc(-50% - 50rem)",
    y: "-50%",
    scale: 0.5,
    opacity: 0,
    zIndex: 10,
    filter: "brightness(0.4)",
    pointerEvents: "none" as const,
  };
};

export default function TestimonialCard({
  item,
  diff,
  isDesktop,
  isTablet,
  onDragEnd,
  onNext,
  onPrev,
  onPlayVideo,
}: TestimonialCardProps) {
  const isCenter = diff === 0;

  return (
    <motion.div
      initial={false}
      animate={getCardStyles(diff, isDesktop, isTablet)}
      transition={{
        type: "spring",
        stiffness: 260,
        damping: 28,
        mass: 0.9,
      }}
      drag={isCenter ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.2}
      onDragEnd={onDragEnd}
      onClick={() => {
        if (diff === 1) onNext();
        else if (diff === -1) onPrev();
        else if (diff === 0) onPlayVideo(item.videoUrl);
      }}
      style={{
        width: isDesktop ? "43.678rem" : isTablet ? "32.5rem" : "calc(100vw - 2rem)",
        height: isDesktop ? "24.824rem" : isTablet ? "18.4375rem" : "13.75rem",
        transformOrigin: "center center",
      }}
      className={`group absolute top-1/2 left-1/2 overflow-hidden rounded-[1.1rem] bg-[#EFEAD8] shadow-lg cursor-pointer transition-shadow duration-300 ${
        isCenter ? "shadow-2xl ring-1 ring-black/5" : "hover:brightness-95"
      }`}
    >
      {/* Thumbnail Image */}
      <img
        src={item.thumbnailUrl}
        alt={item.patientName}
        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 select-none"
        draggable={false}
      />

      {/* Dark Overlay matching Figma rgba(0,0,0,0.28) */}
      <div className="absolute inset-0 bg-black/28 transition duration-300 group-hover:bg-black/35" />

      {/* Center Play Button Icon */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div
          className={`flex items-center justify-center rounded-full bg-white/35 backdrop-blur-xs text-white shadow-xl transition-all duration-300 group-hover:scale-110 group-hover:bg-white/50 ${
            isCenter ? "size-16 sm:size-20" : "size-14 sm:size-16"
          }`}
        >
          <Play
            className={`fill-current text-white ml-0.5 ${
              isCenter ? "size-8 sm:size-10" : "size-7 sm:size-8"
            }`}
          />
        </div>
      </div>

      {/* Bottom Overlay: Yellow Accent Bar + Patient Name & Role */}
      <div className="absolute left-6 right-6 bottom-6 flex items-center gap-3.5 z-10 pointer-events-none">
        <div className="w-1.5 h-10 sm:h-12 bg-[#FCCC2D] rounded-full shrink-0" />
        <div className="flex flex-col text-white min-w-0">
          <div className="truncate">
            <Typography
              variant="heading-7"
              as="h3"
              className="font-manrope font-semibold text-white"
            >
              {item.patientName}
            </Typography>
          </div>
          <Typography
            variant="body-9"
            as="span"
            className="font-manrope font-normal text-white"
          >
            {item.role}
          </Typography>
        </div>
      </div>
    </motion.div>
  );
}
