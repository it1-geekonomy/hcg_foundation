"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { STATS } from "@/domains/home/constants/stat";
import Typography from "@/lib/Typography";
import StatCard from "./Statcard";

const DESC_TEXT =
  "Every number represents a life touched, a family supported, and a community strengthened through hope, compassion, and care.";

const BASE_COLOR = "rgba(38,38,38,0.35)"; // unfilled text color
const FILL_COLOR = "#262626"; // fully filled text color

export default function StatSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [active, setActive] = useState(false);

  const descWrapRef = useRef<HTMLParagraphElement | null>(null);
  const wordRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const rafRef = useRef<number | null>(null);

  const [progress, setProgress] = useState(0);
  // lineIndexForWord[i] = which visual line word i belongs to
  const [lineIndexForWord, setLineIndexForWord] = useState<number[]>([]);
  const [lineCount, setLineCount] = useState(1);

  const words = DESC_TEXT.split(" ");

  // Group words into visual lines by comparing their rendered offsetTop.
  // Recomputed on resize since wrapping changes with viewport width.
  const measureLines = useCallback(() => {
    const tops = wordRefs.current.map((el) => el?.offsetTop ?? 0);
    if (tops.length === 0) return;

    let currentTop = tops[0];
    let currentLine = 0;
    const indices: number[] = [];

    tops.forEach((top) => {
      if (top > currentTop + 2) {
        // new visual line detected (allow 2px tolerance for sub-pixel rounding)
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

    // fill starts when element is 90% down the viewport,
    // completes when it reaches 40% from top
    const startPx = vh * 0.9;
    const endPx = vh * 0.4;

    const raw = (startPx - rect.top) / (startPx - endPx);
    const clamped = Math.min(1, Math.max(0, raw));

    setProgress(clamped);
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

  // stat cards reveal (unchanged from your original)
  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setActive(true);
          observer.disconnect();
        }
      },
      { threshold: 0.25 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  // Divide the scroll range evenly across however many visual lines
  // exist, then fill each line as a solid block once progress reaches it.
  const scrollPerLine = 1 / lineCount;

  function colorForLine(lineIdx: number): string {
    const lineStart = lineIdx * scrollPerLine;
    const lineProgress = Math.min(
      1,
      Math.max(0, (progress - lineStart) / scrollPerLine),
    );
    // Snap to fully filled or fully base — whole line changes together,
    // not a left-to-right sweep within the line.
    return lineProgress >= 0.5 ? FILL_COLOR : BASE_COLOR;
  }

  return (
    <section ref={sectionRef} className="relative overflow-hidden px-6 pt-6 lg:py-10">
      <div className="relative max-w-full text-center">
        <Typography variant="heading-1" as="h2" className="text-[#382E07]">
          Our Journey of Impact
        </Typography>
      </div>

      <div className="relative mx-auto mt-16 grid max-w-5xl grid-cols-2 gap-6 md:grid-cols-[repeat(2,max-content)] md:justify-center md:gap-1 lg:grid-cols-4 lg:gap-10">
        {STATS.map((stat, i) => (
          <StatCard key={stat.label} stat={stat} active={active} id={`r${i}`} />
        ))}
      </div>

      <div className="relative mx-auto mt-14 max-w-4xl">
        <Typography variant="body-1" as="p" className="relative">
          <span ref={descWrapRef} className="inline">
            {words.map((word, i) => (
              <span
                key={i}
                ref={(el) => {
                  wordRefs.current[i] = el;
                }}
                className="transition-colors duration-300 ease-out"
                style={{ color: colorForLine(lineIndexForWord[i] ?? 0) }}
              >
                {word}
                {i < words.length - 1 ? " " : ""}
              </span>
            ))}
          </span>
        </Typography>
      </div>
    </section>
  );
}