"use client";

import { Fragment, useEffect, useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { ABOUT_CONTENT } from "@/domains/home/constants/hope";
import Typography from "@/lib/Typography";

const LINE_STEP_MS = 120; // delay between consecutive lines
const DESC_DELAY_MS = 250; // same base delay as the projects description
const SLIDE_TRANSITION =
  "opacity 700ms ease-out, transform 1000ms cubic-bezier(0.22, 1, 0.36, 1)";

type Word = { w: string; group: number; last: boolean };

export default function AboutSection() {
  const headWrapRef = useRef<HTMLDivElement | null>(null);
  const descWrapRef = useRef<HTMLDivElement | null>(null);
  const [headVisible, setHeadVisible] = useState(false);
  const [descVisible, setDescVisible] = useState(false);

  // Heading: each array entry is its own group (forced line break).
  const headWords: Word[] = ABOUT_CONTENT.heading.flatMap((line, gi) => {
    const parts = line.split(" ");
    return parts.map((w, wi) => ({ w, group: gi, last: wi === parts.length - 1 }));
  });
  // Paragraphs: each paragraph is its own group.
  const descWords: Word[] = ABOUT_CONTENT.paragraphs.flatMap((p, gi) => {
    const parts = p.split(" ");
    return parts.map((w, wi) => ({ w, group: gi, last: wi === parts.length - 1 }));
  });

  const headRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const descRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const [headLines, setHeadLines] = useState<number[]>([]);
  const [descLines, setDescLines] = useState<number[]>([]);
  const [descLineCount, setDescLineCount] = useState(1);

  // Group words into the visual lines they actually wrap into.
  useLayoutEffect(() => {
    const compute = (
      refs: (HTMLSpanElement | null)[],
      words: Word[],
    ): { lines: number[]; count: number } => {
      let line = -1;
      let prevGroup = -1;
      let prevTop = -Infinity;
      const lines = words.map((f, i) => {
        const top = refs[i]?.offsetTop ?? 0;
        if (f.group !== prevGroup || top > prevTop + 2) {
          line += 1;
          prevGroup = f.group;
          prevTop = top;
        }
        return line;
      });
      return { lines, count: line + 1 };
    };

    const measure = () => {
      setHeadLines(compute(headRefs.current, headWords).lines);
      const d = compute(descRefs.current, descWords);
      setDescLines(d.lines);
      setDescLineCount(d.count);
    };

    measure();
    const t = setTimeout(measure, 150); // late font loads
    window.addEventListener("resize", measure);
    return () => {
      clearTimeout(t);
      window.removeEventListener("resize", measure);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Each block plays once, when it first scrolls into view.
  useEffect(() => {
    const watch = (
      node: HTMLElement | null,
      set: (v: boolean) => void,
    ): (() => void) | undefined => {
      if (!node) return;
      const obs = new IntersectionObserver(
        (entries) => {
          if (entries[0]?.isIntersecting) {
            set(true);
            obs.disconnect();
          }
        },
        { threshold: 0.25 },
      );
      obs.observe(node);
      return () => obs.disconnect();
    };
    const c1 = watch(headWrapRef.current, setHeadVisible);
    const c2 = watch(descWrapRef.current, setDescVisible);
    return () => {
      c1?.();
      c2?.();
    };
  }, []);

  // Direction comes from the wrapper's --slide-x CSS variable.
  const slideStyle = (visible: boolean, delayMs: number): React.CSSProperties => ({
    opacity: visible ? 1 : 0,
    transform: visible ? "translate3d(0,0,0)" : "translate3d(var(--slide-x),0,0)",
    transition: SLIDE_TRANSITION,
    transitionDelay: `${delayMs}ms`,
    willChange: "opacity, transform",
  });

  return (
    <section className="pt-8 pb-8 px-8 sm:px-12 md:px-16 lg:py-14 xl:py-30 lg:px-6 xl:px-6 2xl:px-40">
      <div className="w-full grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] lg:gap-16">
        {/* LEFT: heading, from the left, line by line */}
        <div
          ref={headWrapRef}
          className="overflow-x-clip [--slide-x:-80px]"
        >
          <Typography
            variant="heading-2"
            as="h2"
            className="text-[#382E07] lg:text-nowrap font-tiempos-headline"
          >
            {ABOUT_CONTENT.heading.map((_, gi) => (
              <span key={gi} className="block">
                {headWords.map((f, i) =>
                  f.group !== gi ? null : (
                    <Fragment key={i}>
                      <span
                        ref={(el) => {
                          headRefs.current[i] = el;
                        }}
                        className="inline-block motion-reduce:!transition-none"
                        style={slideStyle(headVisible, (headLines[i] ?? 0) * LINE_STEP_MS)}
                      >
                        {f.w}
                      </span>
                      {f.last ? "" : " "}
                    </Fragment>
                  ),
                )}
              </span>
            ))}
          </Typography>
        </div>

        {/* RIGHT: paragraphs, left on mobile / right on lg, line by line */}
        <div
          ref={descWrapRef}
          className="flex flex-col gap-5 overflow-x-clip [--slide-x:-80px] lg:[--slide-x:80px]"
        >
          {ABOUT_CONTENT.paragraphs.map((paragraph, gi) => (
            <Typography
              key={paragraph}
              variant="heading-8"
              as="p"
              className="text-[#293239] font-normal font-argestadisplay"
            >
              {descWords.map((f, i) =>
                f.group !== gi ? null : (
                  <Fragment key={i}>
                    <span
                      ref={(el) => {
                        descRefs.current[i] = el;
                      }}
                      className="inline-block motion-reduce:!transition-none"
                      style={slideStyle(
                        descVisible,
                        DESC_DELAY_MS + (descLines[i] ?? 0) * LINE_STEP_MS,
                      )}
                    >
                      {f.w}
                    </span>
                    {f.last ? "" : " "}
                  </Fragment>
                ),
              )}
            </Typography>
          ))}

          <Link
            href={ABOUT_CONTENT.cta.href}
            className="mt-2 inline-flex h-12 w-fit items-stretch overflow-hidden rounded border border-[#FCCC2D] bg-[#FCCC2D] motion-reduce:!transition-none"
            style={slideStyle(descVisible, DESC_DELAY_MS + descLineCount * LINE_STEP_MS)}
          >
            <span className="flex h-full items-center px-4">
              <Typography variant="button-1" as="span" className="text-[#212121] font-semibold font-manrope">
                {ABOUT_CONTENT.cta.label}
              </Typography>
            </span>

            <span className="flex h-full w-12 shrink-0 items-center justify-center border-[3px] border-[#FCCC2D] bg-black">
              <ArrowUpRight className="h-4 w-4 text-[#FCCC2D]" />
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}