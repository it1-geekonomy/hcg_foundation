"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Typography from "@/lib/Typography";
import { DiagonalArrowIcon } from "@/shared/components/icons/ArrowIcons";
import { X, Sparkles, Calendar, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

export interface GlassDrawerCardProps {
  imageUrl: string;
  mobileImageUrl?: string;
  alt: string;
  title: string;
  date?: string;
  dateLabel?: string;
  category?: string;
  summary?: string;
  detailUrl: string;
  headingTag?: "h2" | "h3";
  className?: string;
}

export default function GlassDrawerCard({
  imageUrl,
  mobileImageUrl,
  alt,
  title,
  date,
  dateLabel = "Date",
  category,
  summary,
  detailUrl,
  headingTag = "h2",
  className = "",
}: GlassDrawerCardProps) {
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(false);

  const handleCardClick = (e: React.MouseEvent) => {
    // If the click happened on an interactive element (button or link), let it handle its own action
    const target = e.target as HTMLElement;
    if (target.closest("a, button, [role='button'], input, textarea")) {
      return;
    }
    setIsExpanded((prev) => !prev);
  };

  const handleNavigate = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(detailUrl);
  };

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(false);
  };

  return (
    <div
      onClick={handleCardClick}
      className={cn(
        "group relative block w-full overflow-hidden rounded-[6px] bg-[#EFEAD8] shadow-md select-none cursor-pointer transition-shadow duration-300 hover:shadow-xl",
        className
      )}
    >
      {/* Background Image with Zoom + Blur on expand */}
      <motion.div
        className="absolute inset-0 h-full w-full pointer-events-none"
        animate={{
          scale: isExpanded ? 1.08 : 1,
          filter: isExpanded ? "brightness(0.6) blur(3px)" : "brightness(1) blur(0px)",
        }}
        transition={{
          duration: 0.55,
          ease: [0.25, 1, 0.5, 1],
        }}
      >
        <picture className="h-full w-full block">
          {mobileImageUrl && (
            <source media="(max-width: 767px)" srcSet={mobileImageUrl} />
          )}
          <img
            src={imageUrl}
            alt={alt}
            className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
            loading="lazy"
          />
        </picture>
      </motion.div>

      {/* Cinematic Vignette Overlay */}
      <div
        className={cn(
          "absolute inset-0 pointer-events-none transition-opacity duration-500",
          isExpanded
            ? "bg-black/45 backdrop-blur-[2px] opacity-100"
            : "bg-gradient-to-t from-black/50 via-black/15 to-transparent opacity-90"
        )}
      />

      {/* Quick Preview Hint Badge (visible when collapsed) */}
      <div
        className={cn(
          "absolute top-3 right-3 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/15 text-white/90 text-[11px] font-manrope font-light transition duration-300 pointer-events-none shadow-xs",
          isExpanded ? "opacity-0" : "opacity-80 group-hover:opacity-100 group-hover:bg-black/60"
        )}
      >
        <ChevronUp className="size-3 text-[#FCCC2D] animate-bounce" />
        <span>Click for summary</span>
      </div>

      {/* Collapsed Glassmorphic Overlay (Exact original layout & dimensions) */}
      <motion.div
        animate={{
          opacity: isExpanded ? 0 : 1,
          y: isExpanded ? 20 : 0,
          pointerEvents: isExpanded ? "none" : "auto",
        }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="absolute left-[0.75rem] right-[0.75rem] bottom-[0.75rem] xl:left-[1.1rem] xl:right-[1.28rem] xl:bottom-[1.51rem] h-auto lg:h-[9.5rem] xl:h-[11rem] flex flex-col lg:flex-row lg:items-center justify-between gap-[0.75rem] lg:gap-[1rem] p-[1rem] lg:py-[1rem] lg:px-[1.5rem] xl:pl-[1.74rem] xl:pr-[2.61rem] rounded-[6px] border border-white/10 bg-[#838383]/40 backdrop-blur-[55px] text-white transition duration-300 group-hover:bg-[#838383]/50"
      >
        {/* Left: Title + Date stacked */}
        <div className="flex flex-col justify-center items-start min-w-0 flex-1 text-left gap-[0.5rem] lg:gap-[0.65rem] overflow-hidden">
          <div className="w-full drop-shadow-xs text-left min-w-0 h-auto overflow-y-auto no-scrollbar max-h-full">
            <Typography
              variant="heading-8"
              as={headingTag}
              title={title}
              className="font-argestadisplay font-normal text-white block w-full !leading-[1.15]"
            >
              {title}
            </Typography>
          </div>
          {date && (
            <div className="flex items-center gap-[0.35rem] sm:gap-[0.5rem] xl:gap-[0.7rem] min-w-0 text-left pt-1">
              <img
                src="/Resources/calendar.png"
                alt="Calendar"
                className="size-[0.875rem] sm:size-[1.15rem] xl:size-[1.39rem] shrink-0 object-contain"
              />
              <div className="text-left min-w-0 overflow-hidden">
                <Typography variant="body-8" as="span" className="text-white block truncate">
                  {dateLabel}: {date}
                </Typography>
              </div>
            </div>
          )}
        </div>

        {/* Read More button: navigates to detail page directly */}
        <div className="shrink-0 flex items-center self-center pt-[0.5rem] lg:pt-0">
          <Link
            href={detailUrl}
            onClick={handleNavigate}
            className="inline-flex items-center justify-center whitespace-nowrap h-[1.75rem] lg:h-[2.5rem] xl:h-[3rem] w-auto xl:w-[9.5rem] px-[0.75rem] lg:px-[1.25rem] gap-[0.45rem] rounded-[6px] border border-white/10 bg-[#FCCC2D] text-[#2D2D2D] backdrop-blur-[42px] shadow-xs shrink-0 transition duration-300 hover:bg-[#E9B510] hover:scale-105 relative z-20 cursor-pointer"
          >
            <Typography variant="button-1" as="span" className="text-[#2D2D2D]">
              Read More
            </Typography>
            <DiagonalArrowIcon className="w-[1rem] h-[0.85rem] sm:w-[1.2rem] sm:h-[0.95rem] xl:w-[1.375rem] xl:h-[1.1rem] text-[#2D2D2D] shrink-0" />
          </Link>
        </div>
      </motion.div>

      {/* Expanded Smooth Glass Slide-Up Drawer */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{
              type: "spring",
              damping: 28,
              stiffness: 260,
              mass: 0.85,
            }}
            className="absolute inset-[0.6rem] sm:inset-[0.85rem] xl:inset-[1rem] z-20 flex flex-col justify-between p-4 sm:p-5 lg:p-6 rounded-[6px] border border-white/20 bg-[#121c24]/90 backdrop-blur-[60px] text-white shadow-2xl overflow-hidden pointer-events-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Bar: Category badge & Close button */}
            <div className="relative z-10 flex items-center justify-between gap-3">
              <span className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-wider font-semibold px-2.5 py-0.5 rounded-full bg-white/10 text-[#FCCC2D] border border-white/15">
                <Sparkles className="size-3 text-[#FCCC2D]" />
                {category || "Overview"}
              </span>

              <button
                type="button"
                aria-label="Close summary"
                onClick={handleClose}
                className="p-1.5 rounded-full bg-white/15 hover:bg-white/30 text-white transition duration-200 cursor-pointer hover:rotate-90"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Title & Date */}
            <div className="relative z-10 mt-2">
              <Typography
                variant="heading-8"
                as={headingTag}
                className="font-argestadisplay font-normal text-white text-lg sm:text-xl lg:text-2xl !leading-tight line-clamp-2"
              >
                {title}
              </Typography>
              {date && (
                <div className="flex items-center gap-1.5 mt-1 text-white/70 text-xs sm:text-sm font-manrope">
                  <Calendar className="size-3.5 text-[#FCCC2D] shrink-0" />
                  <span>{dateLabel}: {date}</span>
                </div>
              )}
            </div>

            {/* Description Summary with Staggered Entrance */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12, duration: 0.3 }}
              className="relative z-10 my-2.5 flex-1 overflow-y-auto no-scrollbar border-t border-white/15 pt-2.5"
            >
              <Typography
                variant="body-8"
                as="p"
                className="font-manrope font-light text-white/90 text-xs sm:text-sm lg:text-[15px] leading-relaxed"
              >
                {summary || "Click below to explore full details and initiatives."}
              </Typography>
            </motion.div>

            {/* Bottom Bar: Quick close hint + Read More CTA */}
            <div className="relative z-10 pt-2 border-t border-white/15 flex items-center justify-between">
              <button
                type="button"
                onClick={handleClose}
                className="text-xs text-white/60 hover:text-white transition duration-200 cursor-pointer hidden sm:inline underline underline-offset-4"
              >
                Close preview
              </button>

              <Link
                href={detailUrl}
                onClick={handleNavigate}
                className="inline-flex items-center justify-center whitespace-nowrap h-[2.25rem] lg:h-[2.5rem] px-4 sm:px-5 gap-2 rounded-[6px] border border-white/10 bg-[#FCCC2D] text-[#2D2D2D] hover:bg-[#E9B510] shadow-[0_4px_14px_rgba(252,204,45,0.3)] transition duration-200 hover:scale-105 ml-auto relative z-20 cursor-pointer font-medium"
              >
                <Typography variant="button-1" as="span" className="text-[#2D2D2D] text-xs sm:text-sm">
                  Read More
                </Typography>
                <DiagonalArrowIcon className="w-3.5 h-3.5 text-[#2D2D2D] shrink-0" />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
