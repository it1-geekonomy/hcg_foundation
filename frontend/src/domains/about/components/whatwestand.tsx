"use client";

import { useLayoutEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Typography from "@/lib/Typography";
import { pillars } from "@/domains/about/constants/pillars";

gsap.registerPlugin(ScrollTrigger);

export interface WhatWeStandForProps {
  className?: string;
}

export default function WhatWeStandFor({ className = "" }: WhatWeStandForProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  useLayoutEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 85%", // Starts animation when the top of section hits 85% of screen
          toggleActions: "play none none reverse", // Plays forward on enter, reverses on leave backwards
        },
      });

      // Animate the heading in
      tl.fromTo(headerRef.current, {
        y: 40,
        opacity: 0,
      }, {
        y: 0,
        opacity: 1,
        duration: 0.8,
        ease: "power3.out",
      })
      // Stagger the cards in with a springy overshoot (back.out)
      .fromTo(
        cardsRef.current.filter(Boolean), // Filter out nulls safely
        {
          y: 100,
          opacity: 0,
          scale: 0.9,
          rotateX: -25,
        },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          rotateX: 0,
          duration: 0.9,
          stagger: 0.12,
          ease: "back.out(1.4)",
          transformOrigin: "center bottom",
        },
        "-=0.4" // Starts 0.4s before the heading finishes
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className={`w-full overflow-x-hidden bg-[#FFFCF2] pt-6 pb-6 px-8 sm:px-12 md:px-16 lg:py-20 lg:px-6 xl:px-6 2xl:px-40 ${className}`}
      style={{ perspective: "1200px" }}
    >
      <div ref={headerRef}>
        <Typography
          variant="heading-3"
          as="h2"
          className="text-center font-tiempos-headline text-[#382E07]"
        >
          What We Stand For
        </Typography>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
        {pillars.map((pillar, index) => (
          <div
            key={index}
            ref={(el) => {
              cardsRef.current[index] = el;
            }}
            className="group relative cursor-pointer overflow-hidden rounded-xl bg-[#FFF3CD] p-8 border border-transparent transition-all duration-500 ease-out hover:scale-[1.02] hover:-translate-y-2 hover:bg-[#FFF8DF] hover:border-[#FCCC2D]/40 hover:shadow-[0_20px_40px_-10px_rgba(56,46,7,0.08)]"
          >
            {/* Animated background glow on hover */}
            <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-[#FCCC2D]/30 blur-3xl transition-transform duration-700 ease-out group-hover:scale-[2.5]" />

            <div className="relative z-10 flex flex-col items-start">
              <div className="mb-4">
                <Image
                  src={pillar.icon}
                  alt=""
                  width={40}
                  height={40}
                  className="h-8 w-8 object-contain sm:h-9 sm:w-9"
                />
              </div>

              <Typography
                variant="body-2"
                as="h3"
                className="font-medium font-tiempos-headline text-[#1C1C1C]"
              >
                {pillar.title}
              </Typography>

              <Typography
                variant="body-3"
                as="p"
                className="mt-3 font-normal font-argestadisplay leading-relaxed text-[#6B6660]"
              >
                {pillar.description}
              </Typography>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}