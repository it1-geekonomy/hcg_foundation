"use client";

import React from "react";
import { Play } from "lucide-react";
import { motion, PanInfo } from "framer-motion";
import Typography from "@/lib/Typography";
import { PatientTestimonial } from "@/domains/journey-of-hope/constants/testimonials";

interface TestimonialCardProps {
  item: PatientTestimonial;
  diff: number;
  windowWidth: number;
  onDragEnd: (_: unknown, info: PanInfo) => void;
  onNext: () => void;
  onPrev: () => void;
  onPlayVideo: (url: string) => void;
}

const getCardDimensions = (windowWidth: number) => {
  if (windowWidth >= 1536) {
    return {
      width: "36rem",
      height: "20.25rem",
      offset: "31.5rem",
      scale: 0.65,
    };
  }
  if (windowWidth >= 1366) {
    return {
      width: "32rem",
      height: "18rem",
      offset: "28rem",
      scale: 0.62,
    };
  }
  if (windowWidth >= 1200) {
    return {
      width: "28rem",
      height: "15.75rem",
      offset: "24.5rem",
      scale: 0.62,
    };
  }
  if (windowWidth >= 1024) {
    return {
      width: "23.5rem",
      height: "13.25rem",
      offset: "20.625rem",
      scale: 0.62,
    };
  }
  if (windowWidth >= 640) {
    return {
      width: "28rem",
      height: "15.75rem",
      offset: "24rem",
      scale: 0.58,
    };
  }
  return {
    width: "calc(100vw - 2rem)",
    height: "13.75rem",
    offset: "82%",
    scale: 0.75,
  };
};

const getCardStyles = (diff: number, windowWidth: number) => {
  const { offset, scale } = getCardDimensions(windowWidth);
  const isMobile = windowWidth < 640;

  if (diff === 0) {
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
    return {
      x: `calc(-50% + ${offset})`,
      y: "-50%",
      scale,
      opacity: isMobile ? 0.35 : 0.85,
      zIndex: 20,
      filter: "brightness(0.85)",
      pointerEvents: "auto" as const,
    };
  }

  if (diff === -1) {
    return {
      x: `calc(-50% - ${offset})`,
      y: "-50%",
      scale,
      opacity: isMobile ? 0.35 : 0.85,
      zIndex: 20,
      filter: "brightness(0.85)",
      pointerEvents: "auto" as const,
    };
  }

  return {
    x: diff > 0 ? "calc(-50% + 55rem)" : "calc(-50% - 55rem)",
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
  windowWidth,
  onDragEnd,
  onNext,
  onPrev,
  onPlayVideo,
}: TestimonialCardProps) {
  const isCenter = diff === 0;
  const isDraggingRef = React.useRef(false);
  const { width, height } = getCardDimensions(windowWidth);

  const handleCardDragStart = () => {
    isDraggingRef.current = false;
  };

  const handleCardDrag = () => {
    isDraggingRef.current = true;
  };

  const handleCardDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    onDragEnd(event, info);
    setTimeout(() => {
      isDraggingRef.current = false;
    }, 150);
  };

  const handleCardClick = () => {
    if (isDraggingRef.current) return;
    if (diff === 1) {
      onNext();
      setTimeout(() => {
        onPlayVideo(item.videoUrl);
      }, 300);
    } else if (diff === -1) {
      onPrev();
      setTimeout(() => {
        onPlayVideo(item.videoUrl);
      }, 300);
    } else if (diff === 0) {
      onPlayVideo(item.videoUrl);
    }
  };

  return (
    <motion.div
      initial={false}
      animate={getCardStyles(diff, windowWidth)}
      transition={{
        type: "spring",
        stiffness: 260,
        damping: 28,
        mass: 0.9,
      }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.6}
      onDragStart={handleCardDragStart}
      onDrag={handleCardDrag}
      onDragEnd={handleCardDragEnd}
      onClick={handleCardClick}
      style={{
        width,
        height,
        transformOrigin: "center center",
      }}
      className={`group absolute top-1/2 left-1/2 overflow-hidden rounded-[1.1rem] bg-[#EFEAD8] shadow-lg transition-shadow duration-300 cursor-grab active:cursor-grabbing ${
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
            isCenter ? "size-13 sm:size-16 lg:size-18" : "size-10 sm:size-12 lg:size-13"
          }`}
        >
          <Play
            className={`fill-current text-white ml-0.5 ${
              isCenter ? "size-6 sm:size-8 lg:size-9" : "size-5 sm:size-6"
            }`}
          />
        </div>
      </div>

      {/* Bottom Overlay: Yellow Accent Bar + Patient Name & Role */}
      <div className="absolute left-4 sm:left-5 lg:left-6 right-4 sm:right-5 lg:right-6 bottom-4 sm:bottom-5 lg:bottom-6 flex items-center gap-3 z-10 pointer-events-none">
        <div className="w-1.5 h-8 sm:h-10 lg:h-11 bg-[#FCCC2D] rounded-full shrink-0" />
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
