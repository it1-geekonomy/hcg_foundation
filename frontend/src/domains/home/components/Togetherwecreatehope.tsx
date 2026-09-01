"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import Typography from "@/lib/Typography";
import {
  TOGETHER_CONTENT,
  CAROUSEL_SLIDES,
  AUTO_ADVANCE_MS,
} from "@/domains/home/constants/togetherwehope";

function TogetherCarousel() {
  const [active, setActive] = useState(0);

  const goTo = useCallback((index: number) => {
    setActive(index);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setActive((prev) => (prev === CAROUSEL_SLIDES.length - 1 ? 0 : prev + 1));
    }, AUTO_ADVANCE_MS);

    return () => clearInterval(timer);
  }, [active]);

  return (
    <div className="relative w-full overflow-hidden rounded bg-[#141414] aspect-[3/4] sm:aspect-[16/11] md:aspect-[16/11] lg:h-[700px] lg:aspect-auto">
      {/* Stacked images cross-fading via opacity */}
      {CAROUSEL_SLIDES.map((s, i) => (
        <Image
          key={s.image}
          src={s.image}
          alt={s.title}
          fill
          priority={i === 0}
          className={`object-cover object-center lg:object-top transition-opacity duration-700 ease-in-out ${i === active ? "opacity-100" : "opacity-0"
            }`}
        />
      ))}

      {/* Gradient overlay for text legibility */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/5 to-transparent" />

      {/* Location badge */}
      <div className="absolute left-[clamp(1.5rem,4vw,3rem)] top-[clamp(0.75rem,2vw,2rem)] flex items-center gap-2 bg-[#FCCC2D] px-2.5 py-1.5 rounded">
        <div className="relative h-4 w-4">
          <Image
            src="/location1.png"
            alt=""
            fill
            className="object-contain"
          />
        </div>
        <Typography variant="body-9" as="span" className="font-semibold text-[#090909] font-manrope">
          {CAROUSEL_SLIDES[active].location}
        </Typography>
      </div>

      {/* Text content */}
      <div className="absolute inset-x-0 bottom-0 flex flex-col gap-6 p-[clamp(1.25rem,3vw,2rem)] xl:px-16">
        <Typography
          variant="heading-2"
          as="h3"
          className="font-tiempos-headline font-normal text-white"
        >
          {CAROUSEL_SLIDES[active].title}
        </Typography>
        <Typography variant="body-3" as="p" className="max-w-lg text-white/70 lg:mb-12 font-light font-argestadisplay">
          {CAROUSEL_SLIDES[active].description}
        </Typography>

        {/* Progress / pagination bar — still clickable */}
        <div className="mt-3 flex gap-2">
          {CAROUSEL_SLIDES.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`h-[clamp(4px,0.5vw,8px)] flex-1 rounded-full transition-colors ${i === active ? "bg-[#FCCC2D]" : "bg-white/25"
                }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function TogetherWeCreateHope() {
  return (
    <section className="w-full py-10 md:py-10 px-8 sm:px-12 md:px-16 lg:py-14 xl:py-30 lg:px-6 xl:px-6 2xl:px-40">
      {/* Heading */}
      <div className="flex flex-col items-center gap-2 text-center mb-[clamp(2rem,4vw,3.5rem)]">
        <Typography
          variant="heading-1"
          as="h2"
          className="font-tiempos-headline italic text-[#090909]"
        >
          {TOGETHER_CONTENT.heading}
        </Typography>
        <Typography variant="body-2" as="p" className="max-w-4xl text-[#2D2300C2] font-normal font-argestadisplay">
          {TOGETHER_CONTENT.description}
        </Typography>
      </div>

      {/* Content grid — right column split evenly to match carousel height at lg+ */}
      <div className="mx-auto grid grid-cols-1 items-start gap-[clamp(1.5rem,3vw,2rem)] lg:grid-cols-2 lg:items-stretch">
        {/* Carousel */}
        <TogetherCarousel />

        {/* Right column */}
        <div className="flex flex-col gap-[clamp(1rem,2vw,1.5rem)] lg:grid lg:h-[700px] lg:min-h-0 lg:grid-rows-[minmax(0,2fr)_minmax(0,3fr)]">
          {/* Event stat + event image */}
          <div className="grid min-w-0 grid-cols-2 gap-[clamp(0.75rem,2vw,1.5rem)] lg:h-full lg:min-h-0">
            {/* Stat box — calendar icon top-left, Tailwind gradient bg */}
            <div className="relative flex aspect-square h-auto min-w-0 w-full flex-col items-start justify-end gap-2 overflow-hidden rounded bg-gradient-to-br from-[#E3AE00] to-white p-[clamp(0.75rem,3vw,1.5rem)] max-[475px]:justify-start max-[475px]:pt-12 lg:aspect-auto lg:h-full">
              <div className="absolute left-[clamp(1.25rem,3vw,1.5rem)] top-[clamp(1.25rem,3vw,1.5rem)] h-[clamp(3rem,6vw,3.5rem)] w-[clamp(3rem,6vw,3.5rem)] max-[639px]:h-6 max-[639px]:w-6">
                <Image
                  src={TOGETHER_CONTENT.calendarIcon}
                  alt=""
                  fill
                  className="object-contain"
                />
              </div>

              <div className="relative z-10 mt-auto flex flex-col gap-1 max-[475px]:mt-0">
                <Typography
                  variant="heading-3"
                  as="p"
                  className="!text-left font-manrope font-bold text-[#090909]"
                >
                  {TOGETHER_CONTENT.stat.value}
                </Typography>
                <Typography variant="heading-9" as="p" className="text-[#090909]/70 !text-left font-medium font-manrope">
                  {TOGETHER_CONTENT.stat.label}
                </Typography>
              </div>
            </div>
            {/* Event image */}
            <div className="relative aspect-square h-auto min-w-0 w-full overflow-hidden rounded bg-[#141414] lg:aspect-auto lg:h-full">
              <Image
                src={TOGETHER_CONTENT.eventImage}
                alt="Community event"
                fill
                className="object-cover object-center"
              />
            </div>
          </div>

          {/* Content panel — rectangle, fills remaining space */}
          <div className="flex min-h-0 flex-1 flex-col justify-start gap-4 rounded bg-gradient-to-br from-[#535353] to-[#000000] p-[clamp(1.5rem,4vw,3rem)] lg:pb-10">
            <Typography
              variant="heading-2"
              as="h3"
              className="font-tiempos-headline italic font-light text-white"
            >
              {TOGETHER_CONTENT.content.heading}
            </Typography>
            <Typography variant="body-2" as="p" className="text-white/90 font-light font-argestadisplay">
              {TOGETHER_CONTENT.content.description}
            </Typography>


            <a
              href={TOGETHER_CONTENT.content.cta.href}
              className="mt-2 mb-4 inline-flex h-12 w-fit shrink-0 items-stretch overflow-hidden rounded border border-[#FCCC2D] bg-[#FCCC2D] lg:mb-0"
            >
              <span className="flex h-full items-center px-4">
                <Typography
                  variant="button-1"
                  as="span"
                  className="font-manrope font-bold tracking-wide text-[#090909]"
                >
                  {TOGETHER_CONTENT.content.cta.label}
                </Typography>
              </span>

              <span className="flex h-full w-12 shrink-0 items-center justify-center border-[3px] border-[#FCCC2D] bg-black">
                <ArrowUpRight className="h-4 w-4 text-[#FFFFFF]" />
              </span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}