"use client";

import React, { useState, useEffect } from "react";
import { PanInfo } from "framer-motion";
import Typography from "@/lib/Typography";
import Banner from "@/shared/components/Herobannersection";
import DonateForm from "@/shared/components/DonateForm";
import { PATIENT_TESTIMONIALS, PatientTestimonial } from "@/domains/journey-of-hope/constants/testimonials";
import TestimonialCard from "@/domains/journey-of-hope/components/TestimonialCard";
import TestimonialControls from "@/domains/journey-of-hope/components/TestimonialControls";
import TestimonialVideoModal from "@/domains/journey-of-hope/components/TestimonialVideoModal";

const CONTAINER = "max-w-[90rem] 2xl:max-w-[100rem] mx-auto px-4 sm:px-6 lg:px-8";

export default function TestimonialsPage() {
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
    const swipeThreshold = 25;
    if (info.offset.x < -swipeThreshold || info.velocity.x < -150) {
      handleNext();
    } else if (info.offset.x > swipeThreshold || info.velocity.x > 150) {
      handlePrev();
    }
  };

  // Compute circular cyclic offset relative to active center index
  const getRelativeOffset = (index: number) => {
    const total = testimonials.length;
    let diff = index - currentIndex;
    if (diff > total / 2) diff -= total;
    if (diff < -total / 2) diff += total;
    return diff;
  };

  return (
    <main className="min-h-screen bg-[#FFFBEA] text-[#2F2707] font-manrope overflow-x-hidden">
      <Banner
        bgImage="/journey-of-hope/Journey of Hope banner image.png"
        bgImageAlt="Patient Testimonials"
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Journey of Hope" },
        ]}
        title="Patient Testimonials"
      />

      {/* Main Section matching Figma Node 1342:32240 */}
      <section className={`${CONTAINER} py-8 sm:py-12 lg:py-16`}>
        {/* Header Title & Subtitle matching Figma specs */}
        <div className="w-full text-left">
          <Typography
            variant="heading-2"
            as="h2"
            className="font-tiempos-headline font-normal italic text-left text-[#0D2838]"
          >
            Patient Testimonials
          </Typography>
          <div className="mt-3 sm:mt-4 max-w-full md:max-w-[51.25rem] lg:max-w-[86.25rem]">
            <Typography
              variant="body-10"
              as="p"
              className="font-argestadisplay font-normal text-justify text-[#596D79]"
            >
              Every journey is filled with courage, compassion, and resilience. Explore inspiring patient stories, community initiatives, and life-changing moments that reflect HCG Foundation&apos;s commitment to bringing hope, healing, and support to those who need it most.
            </Typography>
          </div>
        </div>

        {/* Horizontal 3D Carousel Stage with Hardware-Accelerated 60fps Motion */}
        <div className="relative mt-10 sm:mt-14 w-full h-[16.25rem] sm:h-[21.25rem] lg:h-[26.25rem] overflow-visible flex items-center justify-center">
          {testimonials.map((item, idx) => (
            <TestimonialCard
              key={item.id}
              item={item}
              diff={getRelativeOffset(idx)}
              isDesktop={isDesktop}
              isTablet={isTablet}
              onDragEnd={handleDragEnd}
              onNext={handleNext}
              onPrev={handlePrev}
              onPlayVideo={(url) => setActiveVideoUrl(url)}
            />
          ))}
        </div>

        {/* Bottom Centered Pagination Navigation Arrows + Dots matching Figma */}
        <TestimonialControls
          currentIndex={currentIndex}
          total={testimonials.length}
          onPrev={handlePrev}
          onNext={handleNext}
          onSelect={setCurrentIndex}
        />
      </section>

      {/* Video Modal Player */}
      <TestimonialVideoModal
        videoUrl={activeVideoUrl}
        onClose={() => setActiveVideoUrl(null)}
      />

      {/* Donate Section at the Bottom */}
      <div id="donate-form">
        <DonateForm />
      </div>
    </main>
  );
}
