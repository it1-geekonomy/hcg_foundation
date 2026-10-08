"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import Typography from "@/lib/Typography";
import { PatientStory } from "../constants/stories";
import PatientStoryCard from "./PatientStoryCard";

export function RelatedPatientStories({ stories }: { stories: PatientStory[] }) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const isDraggingOverThreshold = useRef<boolean>(false);

  if (stories.length === 0) return null;

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!scrollContainerRef.current) return;
    setIsDragging(true);
    isDraggingOverThreshold.current = false;
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeft(scrollContainerRef.current.scrollLeft);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || !scrollContainerRef.current) return;
    if (e.pointerType === "mouse" && e.buttons !== 1) {
      handlePointerUp(e);
      return;
    }
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    if (Math.abs(x - startX) > 6) {
      isDraggingOverThreshold.current = true;
      e.preventDefault();
      try {
        if (!scrollContainerRef.current.hasPointerCapture(e.pointerId)) {
          scrollContainerRef.current.setPointerCapture(e.pointerId);
        }
      } catch {}
      scrollContainerRef.current.scrollLeft = scrollLeft - walk;
    }
  };

  const handlePointerUp = (e?: React.PointerEvent) => {
    setIsDragging(false);
    if (e && scrollContainerRef.current) {
      try {
        if (scrollContainerRef.current.hasPointerCapture(e.pointerId)) {
          scrollContainerRef.current.releasePointerCapture(e.pointerId);
        }
      } catch {}
    }
    setTimeout(() => {
      isDraggingOverThreshold.current = false;
    }, 50);
  };

  const handleLinkClick = (e: React.MouseEvent) => {
    if (isDraggingOverThreshold.current) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <Typography variant="body-9" as="h2" className="font-manrope font-medium text-[#161A1D]">
          Read More Stories
        </Typography>
        <Link
          href="/patient-stories"
          className="inline-flex items-center gap-1 transition hover:text-[#B88700]"
        >
          <Typography variant="body-9" as="span" className="font-manrope font-semibold text-[#2D2D2D]">
            View All
          </Typography>
          <ArrowUpRight className="size-4 text-[#2D2D2D]" />
        </Link>
      </div>

      <div 
        ref={scrollContainerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onDragStart={(e) => e.preventDefault()}
        className={`mt-6 flex overflow-x-auto gap-4 sm:gap-6 md:gap-7 no-scrollbar pb-4 sm:pb-0 touch-pan-y ${isDragging ? "cursor-grabbing scroll-auto" : "cursor-grab snap-x snap-mandatory scroll-smooth"}`}
      >
        {stories.map((relStory) => (
          <PatientStoryCard
            key={relStory.id}
            story={relStory}
            onClick={handleLinkClick}
            className="shrink-0 w-[250px] sm:w-[280px] md:w-[310px] lg:w-[320px] xl:w-[340px] snap-center select-none"
          />
        ))}
      </div>
    </div>
  );
}
