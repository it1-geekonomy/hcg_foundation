"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Typography from "@/lib/Typography"; 
import {
  referralSteps,
  type ReferralStep,
} from "@/domains/ourprograms/FinancialSupport/constants/howtoreferpatient";

/* =====================================================
   POP-IN & SETTLE ANIMATION
   The SECTION (not each card) is watched. The moment the
   section enters the viewport, every card pops in one by
   one (staggered by its index). It plays once per page
   load — scrolling away and back does NOT replay it.
===================================================== */
const POP_IN_STYLES = `
  @keyframes popInSettle {
    0% {
      opacity: 0;
      transform: scale(0.55) translateY(24px);
    }
    55% {
      opacity: 1;
      transform: scale(1.06) translateY(-6px);
    }
    75% {
      transform: scale(0.97) translateY(2px);
    }
    100% {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
  }

  .pop-in-hidden {
    opacity: 0;
    transform: scale(0.55) translateY(24px);
  }

  .pop-in-active {
    animation-name: popInSettle;
    animation-duration: 0.65s;
    animation-timing-function: cubic-bezier(0.34, 1.56, 0.64, 1);
    /* "both" holds the 0% keyframe (opacity 0, scaled down) during the
       stagger delay too, so each card stays hidden until its turn,
       instead of sitting visible-but-still while it waits. */
    animation-fill-mode: both;
  }

  @media (prefers-reduced-motion: reduce) {
    .pop-in-hidden,
    .pop-in-active {
      animation: none;
      opacity: 1;
      transform: none;
    }
  }
`;

const POP_IN_STAGGER_SECONDS = 0.12;

/* Watches ONE element (the whole section) and reports whether
   it has entered the viewport. Fires once on first entry (on
   initial mount/refresh, whenever that first entry happens),
   then stops observing — so scrolling back up/down again does
   NOT reset or replay the animation. */
function useSectionVisible<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          // Stop watching once it has animated in — prevents
          // reset/replay when scrolling back up and down again.
          observer.disconnect();
        }
      },
      {
        threshold: 0.15,
      }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { ref, visible };
}

function StepCard({
  step,
  animationIndex = 0,
  sectionVisible,
}: {
  step: ReferralStep;
  animationIndex?: number;
  sectionVisible: boolean;
}) {
  return (
    <div
      className={`group relative h-full rounded-xl border border-[#FFECB3] bg-[#FFFAEC] p-4 transition-colors duration-300 ease-out hover:border-[#FCCC2D] hover:bg-[#FFE39D] sm:p-5 ${
        sectionVisible ? "pop-in-active" : "pop-in-hidden"
      }`}
      style={
        sectionVisible
          ? { animationDelay: `${animationIndex * POP_IN_STAGGER_SECONDS}s` }
          : undefined
      }
    >
      {/* Number */}
      <span className="absolute left-3 top-0 flex h-5 min-w-5 -translate-y-1/2 items-center justify-center rounded-md bg-[#FCCC2D] px-1.5 py-4 leading-none text-black sm:left-4 sm:h-6 sm:min-w-6">
        <Typography
          variant="body-9"
          as="span"
          className="font-manrope font-bold"
        >
          {step.id}
        </Typography>
      </span>

      {/* Icon + Text */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Vertical icon container — enlarged, outlined style; fills solid + icon turns white on hover */}
        <div className="flex h-[72px] w-[56px] shrink-0 items-center justify-center rounded-xl border-2 border-[#FCCC2D] bg-transparent transition-colors duration-300 group-hover:bg-yellow-500 sm:h-20 sm:w-16">
          <Image
            src={step.icon}
            alt=""
            width={36}
            height={36}
            className="h-8 w-8 object-contain transition duration-300 group-hover:brightness-0 group-hover:invert sm:h-9 sm:w-9"
          />
        </div>
 
        {/* Heading + Description */}
        <div className="min-w-0 flex-1">
          <Typography
            variant="body-3"
            as="h3"
            className="font-tiempos-fine text-black font-light whitespace-nowrap"
          >
            {step.title}
          </Typography>
 
          <Typography
            variant="body-7"
            as="p"
            className="mt-1 font-argestadisplay font-light text-[#596D79]"
          >
            {step.description}
          </Typography>
        </div>
      </div>
    </div>
  );
}
 
function StepArrow({
  visible,
  animationIndex = 0,
  sectionVisible,
}: {
  visible: {
    mobile: boolean;
    desktop: boolean;
  };
  animationIndex?: number;
  sectionVisible: boolean;
}) {
  if (!visible.mobile && !visible.desktop) return null;
 
  return (
    <div
      className={`items-center justify-center py-2 lg:py-0 ${
        visible.mobile ? "flex" : "hidden"
      } ${visible.desktop ? "lg:flex" : "lg:hidden"} ${
        sectionVisible ? "pop-in-active" : "pop-in-hidden"
      }`}
      style={
        sectionVisible
          ? { animationDelay: `${animationIndex * POP_IN_STAGGER_SECONDS}s` }
          : undefined
      }
    >
      <Image
        src="/financialbanner/arrows.png"
        alt=""
        width={24}
        height={24}
        className="h-6 w-6 rotate-90 object-contain lg:rotate-0"
      />
    </div>
  );
}
 
export interface HowToReferProps {
  className?: string;
}
 
export default function HowToRefer({
  className = "",
}: HowToReferProps) {
  const { ref: sectionRef, visible: sectionVisible } =
    useSectionVisible<HTMLElement>();

  return (
    <section
      ref={sectionRef}
      className={`w-full overflow-x-hidden bg-[#FFFCF2] px-8 py-10 sm:px-20 md:px-6 lg:px-6 lg:py-20 xl:px-6 2xl:px-40 ${className}`}
    >
      {/* Animation keyframes/classes — scoped to this section only */}
      <style>{POP_IN_STYLES}</style>

      <Typography
        variant="heading-3"
        as="h2"
        className="text-center font-tiempos-headline text-[#382E07]"
      >
        How to Refer a Patient to HCG Foundation
      </Typography>
 
      <Typography
        variant="body-6"
        as="p"
        className="mx-auto mt-3 max-w-xl text-center font-manrope font-normal text-[#6B6660]"
      >
       A clear, compassionate 9-step process ensures every eligible patient receives the support they need — quickly and with dignity.
      </Typography>
 
      {/* =====================================================
          MOBILE — BELOW 768px
          1 COLUMN + VERTICAL ARROWS
      ===================================================== */}
      <div className="mt-10 flex flex-col gap-4 md:hidden">
        {referralSteps.map((step, index) => (
          <div key={step.id} className="flex flex-col">
            <StepCard
              step={step}
              animationIndex={index * 2}
              sectionVisible={sectionVisible}
            />
 
            {index !== referralSteps.length - 1 && (
              <StepArrow
                visible={{
                  mobile: true,
                  desktop: false,
                }}
                animationIndex={index * 2 + 1}
                sectionVisible={sectionVisible}
              />
            )}
          </div>
        ))}
      </div>
 
      {/* =====================================================
          TABLET — md (768px) up to lg
          2 COLUMNS + HORIZONTAL ARROWS IN THE MIDDLE
      ===================================================== */}
      <div className="mt-10 hidden flex-col gap-6 md:flex lg:hidden">
        {Array.from({
          length: Math.ceil(referralSteps.length / 2),
        }).map((_, rowIndex) => {
          const firstIndex = rowIndex * 2;
          const firstStep = referralSteps[firstIndex];
          const secondStep = referralSteps[firstIndex + 1];
 
          return (
            <div
              key={firstStep.id}
              className="grid grid-cols-[1fr_auto_1fr] items-stretch gap-4"
            >
              {/* First Card */}
              <StepCard
                step={firstStep}
                animationIndex={firstIndex * 2}
                sectionVisible={sectionVisible}
              />
 
              {/* Middle Arrow */}
              {secondStep ? (
                <div
                  className={`flex items-center justify-center ${
                    sectionVisible ? "pop-in-active" : "pop-in-hidden"
                  }`}
                  style={
                    sectionVisible
                      ? {
                          animationDelay: `${
                            (firstIndex * 2 + 1) * POP_IN_STAGGER_SECONDS
                          }s`,
                        }
                      : undefined
                  }
                >
                  <Image
                    src="/financialbanner/arrows.png"
                    alt=""
                    width={24}
                    height={24}
                    className="h-6 w-6 object-contain"
                  />
                </div>
              ) : (
                <div />
              )}
 
              {/* Second Card */}
              {secondStep && (
                <StepCard
                  step={secondStep}
                  animationIndex={(firstIndex + 1) * 2}
                  sectionVisible={sectionVisible}
                />
              )}
            </div>
          );
        })}
      </div>
 
      {/* =====================================================
          DESKTOP — lg+
          3 COLUMNS + HORIZONTAL ARROWS
      ===================================================== */}
      <div className="mt-16 hidden flex-col gap-22 lg:flex">
        {[0, 3, 6].map((rowStart) => (
          <div
            key={rowStart}
            className="grid grid-cols-[1fr_auto_1fr_auto_1fr] items-stretch gap-4"
          >
            {referralSteps
              .slice(rowStart, rowStart + 3)
              .map((step, i) => {
                const isLastInRow = i === 2;
 
                return (
                  <div key={step.id} className="contents">
                    <StepCard
                      step={step}
                      animationIndex={(rowStart + i) * 2}
                      sectionVisible={sectionVisible}
                    />
 
                    {!isLastInRow && (
                      <StepArrow
                        visible={{
                          mobile: false,
                          desktop: true,
                        }}
                        animationIndex={(rowStart + i) * 2 + 1}
                        sectionVisible={sectionVisible}
                      />
                    )}
                  </div>
                );
              })}
          </div>
        ))}
      </div>
    </section>
  );
}