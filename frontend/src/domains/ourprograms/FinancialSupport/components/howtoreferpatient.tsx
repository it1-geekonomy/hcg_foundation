"use client";

import Image from "next/image";
import { Fragment, type ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import Typography from "@/lib/Typography";
import {
  referralSteps,
  type ReferralStep,
} from "@/domains/ourprograms/FinancialSupport/constants/howtoreferpatient";
import { STAGGER_SECONDS, useSectionVisible } from "./howToReferAnimation";

const EASE_OUT = [0.22, 1, 0.36, 1] as const;
const SPRING = { type: "spring", stiffness: 320, damping: 14 } as const;

const DESC_TEXT =
  "A clear, compassionate 9-step process ensures every eligible patient receives the support they need quickly and with dignity.";

/* ---------- Step card ---------- */
function StepCard({
  step,
  animationIndex = 0,
  sectionVisible,
}: {
  step: ReferralStep;
  animationIndex?: number;
  sectionVisible: boolean;
}) {
  const reduce = useReducedMotion();
  const skip = reduce === true;
  const play = sectionVisible || skip;
  const delay = animationIndex * STAGGER_SECONDS;

  return (
    <motion.div
      className="group relative min-w-0 self-stretch rounded-xl border border-[#FFECB3] bg-[#FFFAEC] p-4 transition-colors duration-300 ease-out hover:border-[#FCCC2D] hover:bg-[#FFE39D] sm:p-5"
      initial={
        skip
          ? false
          : { opacity: 0, y: 40 }
      }
      animate={
        play
          ? { opacity: 1, y: 0 }
          : { opacity: 0, y: 40 }
      }
      transition={
        skip ? { duration: 0 } : { duration: 0.8, ease: EASE_OUT, delay }
      }
    >
      {/* Number: outer span handles position, motion span handles animation */}
      <span className="absolute left-3 top-0 -translate-y-1/2 sm:left-4">
        <motion.span
          className="flex h-5 min-w-5 items-center justify-center rounded-md bg-[#FCCC2D] px-1.5 py-4 leading-none text-black sm:h-6 sm:min-w-6 shadow-sm"
          initial={skip ? false : { scale: 0.8, opacity: 0, y: 10 }}
          animate={
            play
              ? { scale: 1, opacity: 1, y: 0 }
              : { scale: 0.8, opacity: 0, y: 10 }
          }
          transition={
            skip
              ? { duration: 0 }
              : {
                  ...SPRING,
                  delay: delay + 0.2,
                }
          }
        >
          <Typography
            variant="body-9"
            as="span"
            className="font-manrope font-bold"
          >
            {step.id}
          </Typography>
        </motion.span>
      </span>

      {/* Icon + Text */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Icon box: clean scale-up without spinning */}
        <motion.div
          className="flex h-[72px] w-[56px] shrink-0 items-center justify-center rounded-xl border-2 border-[#FCCC2D] bg-transparent transition-colors duration-300 group-hover:bg-yellow-500 sm:h-20 sm:w-16"
          initial={skip ? false : { scale: 0.8, opacity: 0 }}
          animate={
            play
              ? { scale: 1, opacity: 1 }
              : { scale: 0.8, opacity: 0 }
          }
          transition={
            skip
              ? { duration: 0 }
              : {
                  ...SPRING,
                  delay: delay + 0.15,
                }
          }
        >
          <Image
            src={step.icon}
            alt=""
            width={36}
            height={36}
            className="h-8 w-8 object-contain transition duration-300 group-hover:brightness-0 group-hover:invert sm:h-9 sm:w-9"
          />
        </motion.div>

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
    </motion.div>
  );
}

/* ---------- Looping "next step" nudge (one axis) ---------- */
function Nudge({
  axis,
  play,
  delay,
  skip,
  children,
}: {
  axis: "x" | "y";
  play: boolean;
  delay: number;
  skip: boolean;
  children: ReactNode;
}) {
  const rest = axis === "x" ? { x: -3 } : { y: -3 };
  const loop = axis === "x" ? { x: [-3, 5, -3] } : { y: [-3, 5, -3] };

  return (
    <motion.div
      initial={rest}
      animate={play && !skip ? loop : rest}
      transition={{
        duration: 1.6,
        ease: "easeInOut",
        repeat: Infinity,
        delay: delay + 0.6,
      }}
    >
      {children}
    </motion.div>
  );
}

/* ---------- Arrow between steps ---------- */
function StepArrow({
  visible,
  animationIndex = 0,
  sectionVisible,
  horizontalOnly = false,
}: {
  visible: {
    mobile: boolean;
    desktop: boolean;
  };
  animationIndex?: number;
  sectionVisible: boolean;
  /** Tablet layout: arrow always points right, no responsive rotation */
  horizontalOnly?: boolean;
}) {
  const reduce = useReducedMotion();
  const skip = reduce === true;
  const play = sectionVisible || skip;
  const delay = animationIndex * STAGGER_SECONDS;

  if (!visible.mobile && !visible.desktop) return null;

  return (
    <motion.div
      className={`items-center justify-center ${
        horizontalOnly ? "flex" : "py-2 lg:py-0"
      } ${
        horizontalOnly
          ? ""
          : `${visible.mobile ? "flex" : "hidden"} ${
              visible.desktop ? "lg:flex" : "lg:hidden"
            }`
      }`}
      initial={skip ? false : { scale: 0.2, opacity: 0 }}
      animate={
        play
          ? { scale: [0.2, 1.3, 1], opacity: [0, 1, 1] }
          : { scale: 0.2, opacity: 0 }
      }
      transition={
        skip
          ? { duration: 0 }
          : { duration: 0.5, times: [0, 0.6, 1], ease: "easeOut", delay }
      }
    >
      {horizontalOnly ? (
        <Nudge axis="x" play={play} delay={delay} skip={skip}>
          <Image
            src="https://pub-bbab4b37d630465e8c49b68c7d045302.r2.dev/website/1790836614763-72lki-_x34_1_arrow_right.webp"
            alt=""
            width={24}
            height={24}
            className="h-6 w-6 object-contain"
          />
        </Nudge>
      ) : (
        <>
          {/* Below lg: points DOWN, nudges vertically */}
          <div className="lg:hidden">
            <Nudge axis="y" play={play} delay={delay} skip={skip}>
              <Image
                src="https://pub-bbab4b37d630465e8c49b68c7d045302.r2.dev/website/1790836614763-72lki-_x34_1_arrow_right.webp"
                alt=""
                width={24}
                height={24}
                className="h-6 w-6 rotate-90 object-contain"
              />
            </Nudge>
          </div>

          {/* lg and up: points RIGHT, nudges horizontally */}
          <div className="hidden lg:block">
            <Nudge axis="x" play={play} delay={delay} skip={skip}>
              <Image
                src="https://pub-bbab4b37d630465e8c49b68c7d045302.r2.dev/website/1790836614763-72lki-_x34_1_arrow_right.webp"
                alt=""
                width={24}
                height={24}
                className="h-6 w-6 object-contain"
              />
            </Nudge>
          </div>
        </>
      )}
    </motion.div>
  );
}

export interface HowToReferProps {
  className?: string;
}

export default function HowToRefer({ className = "" }: HowToReferProps) {
  const { ref: sectionRef, visible: sectionVisible } =
    useSectionVisible<HTMLElement>();

  return (
    <section
      ref={sectionRef}
      /*
        antialiased + text-size-adjust: macOS renders text with sub-pixel
        smoothing by default, which makes light-weight fonts slightly wider and
        bolder than on Windows. That makes the card descriptions wrap onto an
        extra line, so the cards (and their whole grid row) grow taller.
        `antialiased` only affects macOS, so other platforms are unchanged.
      */
      className={`w-full overflow-x-hidden bg-[#FFFCF2] px-8 py-10 antialiased [-webkit-text-size-adjust:100%] [text-size-adjust:100%] sm:px-20 md:px-6 lg:px-6 lg:py-20 xl:px-6 2xl:px-40 ${className}`}
    >
      {/* Heading */}
      <div>
        <Typography
          variant="heading-3"
          as="h2"
          className="text-center font-tiempos-headline text-[#382E07]"
        >
          How to Refer a Patient to HCG Foundation
        </Typography>
      </div>

      {/* Description */}
      <div className="mx-auto mt-3 max-w-xl">
        <Typography
          variant="body-6"
          as="p"
          className="text-center font-manrope font-normal text-[#6B6660]"
        >
          {DESC_TEXT}
        </Typography>
      </div>

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
                visible={{ mobile: true, desktop: false }}
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
              <StepCard
                step={firstStep}
                animationIndex={firstIndex * 2}
                sectionVisible={sectionVisible}
              />

              {secondStep ? (
                <StepArrow
                  visible={{ mobile: true, desktop: true }}
                  horizontalOnly
                  animationIndex={firstIndex * 2 + 1}
                  sectionVisible={sectionVisible}
                />
              ) : (
                <div />
              )}

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
                  <Fragment key={step.id}>
                    <StepCard
                      step={step}
                      animationIndex={(rowStart + i) * 2}
                      sectionVisible={sectionVisible}
                    />

                    {!isLastInRow && (
                      <StepArrow
                        visible={{ mobile: false, desktop: true }}
                        animationIndex={(rowStart + i) * 2 + 1}
                        sectionVisible={sectionVisible}
                      />
                    )}
                  </Fragment>
                );
              })}
          </div>
        ))}
      </div>
    </section>
  );
}