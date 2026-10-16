"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import Typography from "@/lib/Typography";
import {
  INNOVATION_CONTENT,
  INNOVATION_COMPANIES,
  INNOVATION_CARD_STYLE,
} from "@/domains/ourprograms/ResearchAndInnovation/constants/innovation";

/* ------------- card reveal animation (staggered fade-up, plays once) ------------- */

const CARD_STEP_MS = 150;
const CARD_TRANSITION =
  "opacity 700ms ease-out, transform 900ms cubic-bezier(0.22, 1, 0.36, 1)";

function cardStyle(visible: boolean, index: number): CSSProperties {
  return {
    opacity: visible ? 1 : 0,
    transform: visible
      ? "translate3d(0,0,0) scale(1)"
      : "translate3d(0,40px,0) scale(0.97)",
    transition: CARD_TRANSITION,
    transitionDelay: `${index * CARD_STEP_MS}ms`,
    willChange: "opacity, transform",
  };
}

function useInViewOnce<T extends HTMLElement>(threshold = 0.1) {
  const ref = useRef<T | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold },
    );
    obs.observe(node);
    return () => obs.disconnect();
  }, [threshold]);

  return { ref, visible };
}

/* ---------------------------- section ---------------------------- */

export default function InnovationAndTechnology() {
  const { ref: gridRef, visible: cardsVisible } = useInViewOnce<HTMLDivElement>(0.1);

  return (
    <section className="w-full overflow-x-hidden bg-[#FFF8E2] py-2 md:py-2 px-8 sm:px-12 md:px-16 lg:py-4 xl:py-4 lg:px-6 xl:px-6 2xl:px-40">
      {/* Heading + description */}
      <div className="flex flex-col gap-4">
        <div>
          <Typography
            variant="heading-2"
            as="h2"
            className="font-tiempos-headline italic text-[#0D2838]"
          >
            {INNOVATION_CONTENT.heading}
          </Typography>
        </div>

        <div className="flex min-w-0 flex-col gap-4 md:gap-6">
          {INNOVATION_CONTENT.paragraphs.map((text, i) => (
            <Typography
              key={i}
              variant="body-3"
              as="p"
              className="font-normal font-argestadisplay text-[#293239]"
            >
              {text}
            </Typography>
          ))}
        </div>
      </div>

      {/* Companies */}
      <div className="mt-2 sm:mt-4 lg:mt-6 xl:mt-8">
        <div>
          <Typography
            variant="heading-7"
            as="h3"
            className="font-tiempos-headline font-light text-[#000000]"
          >
            {INNOVATION_CONTENT.companiesHeading}
          </Typography>
        </div>

        <div
          ref={gridRef}
          className="mt-[clamp(1rem,2vw,1.5rem)] grid grid-cols-1 gap-[clamp(1rem,2vw,1.5rem)] sm:grid-cols-2 xl:grid-cols-4"
        >
          {INNOVATION_COMPANIES.map((company, idx) => (
            <article
              key={company.id}
              className="flex h-full flex-col gap-4 rounded-sm border border-[#F0E5C1] bg-gradient-to-b p-[clamp(1rem,2vw,1.5rem)] motion-reduce:!transition-none"
              style={{
                borderColor: INNOVATION_CARD_STYLE.border,
                // Tailwind arbitrary gradient stops can't be built dynamically, so set them inline
                backgroundImage: `linear-gradient(to bottom, ${INNOVATION_CARD_STYLE.gradientFrom}, ${INNOVATION_CARD_STYLE.gradientTo})`,
                ...cardStyle(cardsVisible, idx),
              }}
            >
              {/* Fixed-height logo slot so titles line up across cards */}
              <div className="flex h-8 sm:h-10 lg:h-14 items-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={company.logo}
                  alt={`${company.name} logo`}
                  loading="lazy"
                  className="max-h-full w-auto max-w-[70%] object-contain object-left"
                />
              </div>

              <Typography
                variant="heading-7"
                as="h4"
                className="font-manrope font-medium text-[#000000]"
              >
                {company.name}
              </Typography>

              <Typography
                variant="body-6"
                as="p"
                className="font-normal font-argestadisplay text-[#293239] !text-left"
              >
                {company.description}
              </Typography>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}