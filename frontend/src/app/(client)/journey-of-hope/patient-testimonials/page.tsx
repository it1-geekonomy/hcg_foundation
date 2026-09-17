"use client";

import React, { useState, useEffect } from "react";
import { Play, X, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, PanInfo } from "framer-motion";
import Typography from "@/lib/Typography";
import DonateForm from "@/shared/components/DonateForm";
import { PATIENT_TESTIMONIALS, PatientTestimonial } from "@/domains/journey-of-hope/constants/testimonials";

const CONTAINER = "max-w-[90rem] 2xl:max-w-[100rem] mx-auto px-4 sm:px-6 lg:px-8";

export default function PatientTestimonialsPage() {
  const [testimonials] = useState<PatientTestimonial[]>(PATIENT_TESTIMONIALS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeVideoUrl, setActiveVideoUrl] = useState<string | null>(null);

  // Screen size detection for responsive transform values
  const [windowWidth, setWindowWidth] = useState<number>(1200);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isDesktop = windowWidth >= 1024;
  const isTablet = windowWidth >= 640 && windowWidth < 1024;

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x < -40) handleNext();
    else if (info.offset.x > 40) handlePrev();
  };

  // Compute circular cyclic offset relative to active center index
  const getRelativeOffset = (index: number) => {
    const total = testimonials.length;
    let diff = index - currentIndex;
    if (diff > total / 2) diff -= total;
    if (diff < -total / 2) diff += total;
    return diff;
  };

  // Hardware-accelerated GPU scale & translate transform variants for 60fps smooth sliding
  const getCardStyles = (diff: number) => {
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

  return (
    <main className="min-h-screen bg-[#FFFBEA] text-[#2F2707] font-manrope pt-24 sm:pt-28 lg:pt-32 overflow-x-hidden">
      {/* ========================================================================= */}
      {/* TEAMMATE HERO BANNER SLOT                                                 */}
      {/* Un-comment / import when teammate pushes their Hero Banner component:    */}
      {/* <PatientTestimonialsHeroBanner />                                         */}
      {/* ========================================================================= */}

      {/* Main Section matching Figma Node 1342:32240 */}
      <section className={`${CONTAINER} py-8 sm:py-12 lg:py-16`}>
        {/* Header Title & Subtitle matching Figma specs (2 lines on tablet & desktop) */}
        <div className="w-full text-left">
          <Typography variant="heading-1" as="h1" className="text-[#2E1C12] italic">
            Patient Testimonials
          </Typography>
          <div className="mt-3 sm:mt-4 max-w-full md:max-w-[51.25rem] lg:max-w-[86.25rem]">
            <Typography variant="body-6" as="p" className="text-[#596D79]">
              Every journey is filled with courage, compassion, and resilience. Explore inspiring patient stories, community initiatives, and life-changing moments that reflect HCG Foundation&apos;s commitment to bringing hope, healing, and support to those who need it most.
            </Typography>
          </div>
        </div>

        {/* Horizontal 3D Carousel Stage with Hardware-Accelerated 60fps Motion */}
        <div className="relative mt-10 sm:mt-14 w-full h-[16.25rem] sm:h-[21.25rem] lg:h-[26.25rem] overflow-visible flex items-center justify-center">
          {testimonials.map((item, idx) => {
            const diff = getRelativeOffset(idx);
            const isCenter = diff === 0;

            return (
              <motion.div
                key={item.id}
                initial={false}
                animate={getCardStyles(diff)}
                transition={{
                  type: "spring",
                  stiffness: 260,
                  damping: 28,
                  mass: 0.9,
                }}
                drag={isCenter ? "x" : false}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.2}
                onDragEnd={handleDragEnd}
                onClick={() => {
                  if (diff === 1) handleNext();
                  else if (diff === -1) handlePrev();
                  else if (diff === 0) setActiveVideoUrl(item.videoUrl);
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
                <div className="absolute left-6 right-6 bottom-6 flex items-center gap-3.5 z-10 font-manrope pointer-events-none">
                  <div className="w-1.5 h-10 sm:h-12 bg-[#FDC61D] rounded-full shrink-0" />
                  <div className="flex flex-col text-white font-manrope min-w-0">
                    <Typography variant="heading-2" as="h3" className="text-white truncate">
                      {item.patientName}
                    </Typography>
                    <Typography variant="body-8" as="span" className="text-white/85">
                      {item.role}
                    </Typography>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom Centered Pagination Navigation Arrows + Dots matching Figma */}
        <div className="mt-8 sm:mt-10 flex flex-col items-center justify-center gap-3">
          <div className="flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Previous testimonial"
              className="flex size-10 sm:size-11 items-center justify-center rounded-full bg-[#EFE4C8] text-[#382E07] shadow-xs transition hover:bg-[#E9B510] active:scale-95 cursor-pointer"
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              aria-label="Next testimonial"
              className="flex size-10 sm:size-11 items-center justify-center rounded-full bg-[#FDC61D] text-[#382E07] shadow-xs transition hover:bg-[#E9B510] active:scale-95 cursor-pointer"
            >
              <ChevronRight className="size-5" />
            </button>
          </div>

          {/* Testimonial Indicator Dots */}
          <div className="mt-1 flex items-center justify-center gap-2">
            {testimonials.map((_, idx) => {
              const isActive = idx === currentIndex;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrentIndex(idx)}
                  aria-label={`Go to testimonial ${idx + 1}`}
                  className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                    isActive
                      ? "w-8 bg-[#FDC61D]"
                      : "w-2.5 bg-[#EFE4C8] hover:bg-[#E9B510]/60"
                  }`}
                />
              );
            })}
          </div>
        </div>
      </section>

      {/* Video Modal Player */}
      {activeVideoUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-4xl aspect-video rounded-2xl bg-black overflow-hidden shadow-2xl">
            <button
              onClick={() => setActiveVideoUrl(null)}
              className="absolute top-4 right-4 z-10 flex size-10 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/40 transition"
              aria-label="Close video"
            >
              <X className="size-6" />
            </button>
            <iframe
              src={`${activeVideoUrl}?autoplay=1`}
              title="Patient Testimonial Video"
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}

      {/* Donate Section at the Bottom */}
      <div id="donate-form">
        <DonateForm />
      </div>
    </main>
  );
}


