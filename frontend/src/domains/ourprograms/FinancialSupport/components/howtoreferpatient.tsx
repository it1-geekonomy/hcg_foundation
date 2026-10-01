"use client";

import Image from "next/image";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
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
  "A clear, compassionate 9-step process ensures every eligible patient receives the support they need — quickly and with dignity.";

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
      className="group relative h-full rounded-xl border border-[#FFECB3] bg-[#FFFAEC] p-4 transition-colors duration-300 ease-out hover:border-[#FCCC2D] hover:bg-[#FFE39D] sm:p-5"
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

  const reduce = useReducedMotion();
  const skip = reduce === true;

  /* ---------- Heading blur reveal (plays once) ---------- */
  const headingRef = useRef<HTMLDivElement | null>(null);
  const [headingVisible, setHeadingVisible] = useState(false);

  useEffect(() => {
    const node = headingRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setHeadingVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  /* ---------- Description blur reveal (plays once) ---------- */
  const descRevealRef = useRef<HTMLDivElement | null>(null);
  const [descVisible, setDescVisible] = useState(false);

  useEffect(() => {
    const node = descRevealRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setDescVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  /* ---------- Description: scroll-driven line-by-line fill ---------- */
  const descWrapRef = useRef<HTMLSpanElement | null>(null);
  const wordRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const rafRef = useRef<number | null>(null);

  const [progress, setProgress] = useState(0);
  const [lineIndexForWord, setLineIndexForWord] = useState<number[]>([]);
  const [lineCount, setLineCount] = useState(1);

  const words = DESC_TEXT.split(" ");

  // Group words into visual lines by their rendered offsetTop.
  // Recomputed on resize because wrapping changes with viewport width.
  const measureLines = useCallback(() => {
    const tops = wordRefs.current.map((el) => el?.offsetTop ?? 0);
    if (tops.length === 0) return;

    let currentTop = tops[0];
    let currentLine = 0;
    const indices: number[] = [];

    tops.forEach((top) => {
      if (top > currentTop + 2) {
        currentLine += 1;
        currentTop = top;
      }
      indices.push(currentLine);
    });

    setLineIndexForWord(indices);
    setLineCount(currentLine + 1);
  }, []);

  useLayoutEffect(() => {
    measureLines();
    const t = setTimeout(measureLines, 100); // catch late font loads
    window.addEventListener("resize", measureLines);
    return () => {
      clearTimeout(t);
      window.removeEventListener("resize", measureLines);
    };
  }, [measureLines]);

  const updateProgress = useCallback(() => {
    const node = descWrapRef.current;
    rafRef.current = null;
    if (!node) return;

    const rect = node.getBoundingClientRect();
    const vh = window.innerHeight;

    // fill starts when the text is 90% down the viewport,
    // completes when it reaches 40% from the top
    const startPx = vh * 0.9;
    const endPx = vh * 0.4;

    const raw = (startPx - rect.top) / (startPx - endPx);
    setProgress(Math.min(1, Math.max(0, raw)));
  }, []);

  const onScroll = useCallback(() => {
    if (rafRef.current != null) return;
    rafRef.current = requestAnimationFrame(updateProgress);
  }, [updateProgress]);

  useEffect(() => {
    updateProgress();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, [onScroll, updateProgress]);

  const scrollPerLine = 1 / lineCount;

  function opacityForLine(lineIdx: number): number {
    if (skip) return 1;
    const lineStart = lineIdx * scrollPerLine;
    const raw = (progress - lineStart) / scrollPerLine;
    return Math.min(1, Math.max(0, raw));
  }

  const headingShown = headingVisible || skip;
  const descShown = descVisible || skip;

  return (
    <section
      ref={sectionRef}
      className={`w-full overflow-x-hidden bg-[#FFFCF2] px-8 py-10 sm:px-20 md:px-6 lg:px-6 lg:py-20 xl:px-6 2xl:px-40 ${className}`}
    >
      {/* Heading: blur reveal */}
      <div ref={headingRef}>
        <Typography
          variant="heading-3"
          as="h2"
          className="text-center font-tiempos-headline text-[#382E07]"
          style={{
            opacity: headingShown ? 1 : 0,
            filter: headingShown ? "blur(0px)" : "blur(14px)",
            transform: headingShown
              ? "translate3d(0,0,0)"
              : "translate3d(0,32px,0)",
            transition: skip
              ? "none"
              : "opacity 700ms ease-out, filter 500ms ease-out, transform 1100ms cubic-bezier(0.22, 1, 0.36, 1)",
            willChange: "opacity, filter, transform",
          }}
        >
          How to Refer a Patient to HCG Foundation
        </Typography>
      </div>

      {/* Description: blur reveal + scroll-driven line fill */}
      <div
        ref={descRevealRef}
        className="mx-auto mt-3 max-w-xl"
        style={{
          opacity: descShown ? 1 : 0,
          filter: descShown ? "blur(0px)" : "blur(14px)",
          transform: descShown
            ? "translate3d(0,0,0)"
            : "translate3d(0,32px,0)",
          transition: skip
            ? "none"
            : "opacity 700ms ease-out 150ms, filter 500ms ease-out 150ms, transform 1100ms cubic-bezier(0.22, 1, 0.36, 1) 150ms",
          willChange: "opacity, filter, transform",
        }}
      >
        <Typography
          variant="body-6"
          as="p"
          className="text-center font-manrope font-normal text-[#6B6660]"
        >
          <span ref={descWrapRef} className="inline">
            {words.map((word, i) => (
              <span
                key={i}
                ref={(el) => {
                  wordRefs.current[i] = el;
                }}
                className="transition-opacity duration-150 ease-out"
                style={{ opacity: opacityForLine(lineIndexForWord[i] ?? 0) }}
              >
                {word}
                {i < words.length - 1 ? " " : ""}
              </span>
            ))}
          </span>
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
                  <div key={step.id} className="contents">
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
                  </div>
                );
              })}
          </div>
        ))}
      </div>
    </section>
  );
}