"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Typography from "@/lib/Typography";
import { DiagonalArrowIcon } from "@/shared/components/icons/ArrowIcons";
import FlipCard from "@/shared/components/FlipCard";
import MirrorReveal from "@/shared/components/MirrorReveal";
import type { EventItem } from "@/domains/resources/constants/events";

interface EventCardProps {
  event: EventItem;
  headingTag?: "h2" | "h3";
  className?: string;
}

export default function EventCard({
  event,
  headingTag = "h2",
  className = "",
}: EventCardProps) {
  const router = useRouter();
  const [isFlipped, setIsFlipped] = useState(false);
  const detailUrl = `/resources/events/${event.slug || event.id}`;

  const handleCardClick = () => {
    router.push(detailUrl);
  };

  const frontContent = (
    <div className="relative h-full w-full overflow-hidden rounded-[6px] bg-[#EFEAD8] shadow-xs transition duration-300">
      <picture className="h-full w-full block">
        {event.mobileImageUrl && (
          <source media="(max-width: 767px)" srcSet={event.mobileImageUrl} />
        )}
        <img
          src={event.imageUrl}
          alt={event.title}
          className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
          loading="lazy"
        />
      </picture>

      {/* Linear Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-transparent pointer-events-none" />

      {/* Floating Glassmorphic Overlay (Exact original layout & dimensions) */}
      <div
        data-no-flip="true"
        onClick={(e) => {
          e.stopPropagation();
          handleCardClick();
        }}
        className="absolute left-[0.75rem] right-[0.75rem] bottom-[0.75rem] xl:left-[1.1rem] xl:right-[1.28rem] xl:bottom-[1.51rem] h-auto lg:h-[9.5rem] xl:h-[11rem] flex flex-col lg:flex-row lg:items-center justify-between gap-[0.75rem] lg:gap-[1rem] p-[1rem] lg:py-[1rem] lg:px-[1.5rem] xl:pl-[1.74rem] xl:pr-[2.61rem] rounded-[6px] border border-white/10 bg-[#838383]/40 backdrop-blur-[55px] text-white transition duration-300 group-hover:bg-[#838383]/50 cursor-pointer"
      >
        {/* Left: Title + Date stacked */}
        <div className="flex flex-col justify-center items-start min-w-0 flex-1 text-left gap-[0.5rem] lg:gap-[0.65rem] overflow-hidden">
          <div className="w-full drop-shadow-xs text-left min-w-0 h-auto overflow-y-auto no-scrollbar max-h-full">
            <Typography
              variant="heading-8"
              as={headingTag}
              title={event.title}
              className="font-argestadisplay font-normal text-white block w-full !leading-[1.15]"
            >
              {event.title}
            </Typography>
          </div>
          <div className="flex items-center gap-[0.35rem] sm:gap-[0.5rem] xl:gap-[0.7rem] min-w-0 text-left pt-1">
            <img
              src="/Resources/calendar.png"
              alt="Calendar"
              className="size-[0.875rem] sm:size-[1.15rem] xl:size-[1.39rem] shrink-0 object-contain"
            />
            <div className="text-left min-w-0 overflow-hidden">
              <Typography variant="body-8" as="span" className="text-white block truncate">
                Event Date: {event.date}
              </Typography>
            </div>
          </div>
        </div>

        {/* Read More button: navigates on click */}
        <div className="shrink-0 flex items-center self-center pt-[0.5rem] lg:pt-0">
          <div className="inline-flex items-center justify-center whitespace-nowrap h-[1.75rem] lg:h-[2.5rem] xl:h-[3rem] w-auto xl:w-[9.5rem] px-[0.75rem] lg:px-[1.25rem] gap-[0.45rem] rounded-[6px] border border-white/10 bg-[#FCCC2D] text-[#2D2D2D] backdrop-blur-[42px] shadow-xs shrink-0 transition duration-300 hover:bg-[#E9B510] hover:scale-105 relative z-20 cursor-pointer">
            <Typography variant="button-1" as="span" className="text-[#2D2D2D]">
              Read More
            </Typography>
            <DiagonalArrowIcon className="w-[1rem] h-[0.85rem] sm:w-[1.2rem] sm:h-[0.95rem] xl:w-[1.375rem] xl:h-[1.1rem] text-[#2D2D2D] shrink-0" />
          </div>
        </div>
      </div>
    </div>
  );

  const renderBackContent = (flipped: boolean) => (
    <MirrorReveal isOpen={flipped} delay={0} duration={0.82}>
      <div className="relative h-full w-full flex flex-col justify-between items-center p-6 sm:p-8 lg:p-10 rounded-[6px] border border-[#E0D4AE] shadow-sm overflow-hidden bg-[#FFF8E2]">
        {/* Pure, Centered Short Description */}
        <div className="relative z-10 flex-1 flex items-center justify-center text-center my-auto px-2 sm:px-6 w-full">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={
              flipped
                ? { opacity: 1, y: 0 }
                : { opacity: 0, y: 8 }
            }
            transition={{
              duration: flipped ? 0.38 : 0.15,
              delay: flipped ? 0.42 : 0, // Fades in smoothly as doors open wide
              ease: [0.25, 1, 0.5, 1],
            }}
          >
            <Typography
              variant="body-1"
              as="p"
              className="text-[#0D2838] max-w-xl"
            >
              {event.summary || "Explore the full event details, agenda, and speakers."}
            </Typography>
          </motion.div>
        </div>

        {/* Read More Button Constant at Bottom Center */}
        <motion.div
          className="relative z-10 w-full flex justify-center shrink-0 pt-3"
          initial={{ opacity: 0, y: 8 }}
          animate={
            flipped
              ? { opacity: 1, y: 0 }
              : { opacity: 0, y: 8 }
          }
          transition={{
            duration: flipped ? 0.38 : 0.15,
            delay: flipped ? 0.46 : 0,
            ease: [0.25, 1, 0.5, 1],
          }}
        >
          <div
            onClick={(e) => {
              e.stopPropagation();
              handleCardClick();
            }}
            className="inline-flex items-center justify-center whitespace-nowrap h-[1.75rem] lg:h-[2.5rem] xl:h-[3rem] w-auto xl:w-[9.5rem] px-[0.75rem] lg:px-[1.25rem] gap-[0.45rem] rounded-[6px] border border-black/5 bg-[#FCCC2D] text-[#2D2D2D] shadow-xs shrink-0 transition duration-300 hover:bg-[#E9B510] hover:scale-105 cursor-pointer"
          >
            <Typography variant="button-1" as="span" className="text-[#2D2D2D]">
              Read More
            </Typography>
            <DiagonalArrowIcon className="w-[1rem] h-[0.85rem] sm:w-[1.2rem] sm:h-[0.95rem] xl:w-[1.375rem] xl:h-[1.1rem] text-[#2D2D2D] shrink-0" />
          </div>
        </motion.div>
      </div>
    </MirrorReveal>
  );

  return (
    <FlipCard
      className={`aspect-[4/3.5] sm:aspect-[4/3] xl:aspect-[4/3] w-full ${className}`}
      roundedClassName="rounded-[0.375rem]"
      isFlipped={isFlipped}
      onFlipChange={setIsFlipped}
      onClick={handleCardClick}
      flipOnHover={true}
      duration={0.42}
      front={frontContent}
      back={renderBackContent}
    />
  );
}
