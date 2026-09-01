"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { STATS } from "@/domains/home/constants/stat";
import Typography from "@/lib/Typography";
import StatCard from "./Statcard";

const DESC_LEAD =
  "Every number represents a life touched, a family supported, and a community strengthened ";
const DESC_HIGHLIGHT = "through hope, compassion, and care.";

const TOTAL_LENGTH = DESC_LEAD.length + DESC_HIGHLIGHT.length;
const LEAD_END = DESC_LEAD.length / TOTAL_LENGTH;

const BASE_COLOR = "rgba(38,38,38,0.35)"; // unfilled text color (matches your old /55-ish fade)
const FILL_COLOR = "#262626"; // fully filled text color

export default function StatSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [active, setActive] = useState(false);

  // scroll-fill tracking for the description
  const descWrapRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const [progress, setProgress] = useState(0);

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

  // per-segment progress derived from overall scroll progress
  const leadProgress = Math.min(1, Math.max(0, progress / LEAD_END));
  const highlightProgress = Math.min(
    1,
    Math.max(0, (progress - LEAD_END) / (1 - LEAD_END)),
  );

  const leadPercent = leadProgress * 100;
  const highlightPercent = highlightProgress * 100;

  return (
    <section ref={sectionRef} className="relative overflow-hidden px-6 py-6 lg:py-10">
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

      {/* wrapper div only for scroll measurement — no visual/layout impact */}
      <div ref={descWrapRef} className="relative mx-auto mt-14 max-w-4xl">
        <Typography variant="body-1" as="p">
          <span
            style={{
              backgroundImage: `linear-gradient(to right, ${FILL_COLOR} ${leadPercent}%, ${BASE_COLOR} ${leadPercent}%)`,
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            {DESC_LEAD}
          </span>
          <span
            style={{
              backgroundImage: `linear-gradient(to right, ${FILL_COLOR} ${highlightPercent}%, ${BASE_COLOR} ${highlightPercent}%)`,
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            {DESC_HIGHLIGHT}
          </span>
        </Typography>
      </div>
    </section>
  );
}