"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import Typography from "@/lib/Typography";
import { reels, reelsTheme } from "@/domains/home/constants/Reels";

/**
 * Reel carousel — nav bottom-aligned with cards; strip width fits whole cards only.
 */
export default function ReelsSection() {
  const rowRef = useRef<HTMLDivElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);
  const [stripWidthPx, setStripWidthPx] = useState<number | null>(null);

  const syncEdges = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setAtStart(el.scrollLeft <= 2);
    setAtEnd(max <= 2 || el.scrollLeft >= max - 2);
  }, []);

  const measureStrip = useCallback(() => {
    const row = rowRef.current;
    const track = trackRef.current;
    const card = track?.querySelector<HTMLElement>(".reel-card");
    if (!row || !track || !card) return;

    const cardW = card.offsetWidth;
    if (cardW === 0) return;

    const gap = reelsTheme.gapPx;
    const rowStyle = getComputedStyle(row);
    const rowGap = parseFloat(rowStyle.columnGap || rowStyle.gap || "0") || 0;
    const btn = reelsTheme.controlSizePx;

    const available = row.clientWidth - btn * 2 - rowGap * 2;
    const visible = Math.max(1, Math.floor((available + gap) / (cardW + gap)));
    const width = visible * cardW + (visible - 1) * gap;

    setStripWidthPx(width);
    syncEdges();
  }, [syncEdges]);

  useEffect(() => {
    measureStrip();
    const row = rowRef.current;
    if (!row) return;

    const ro = new ResizeObserver(measureStrip);
    ro.observe(row);
    if (trackRef.current) ro.observe(trackRef.current);

    window.addEventListener("resize", measureStrip);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measureStrip);
    };
  }, [measureStrip, reels.length]);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    syncEdges();
    el.addEventListener("scroll", syncEdges, { passive: true });
    return () => el.removeEventListener("scroll", syncEdges);
  }, [stripWidthPx, syncEdges]);

  const step = (delta: -1 | 1) => {
    const el = scrollerRef.current;
    if (!el) return;
    const cards = Array.from(el.querySelectorAll<HTMLElement>(".reel-card"));
    if (!cards.length) return;

    let active = 0;
    let best = Infinity;
    for (let i = 0; i < cards.length; i++) {
      const d = Math.abs(cards[i].offsetLeft - el.scrollLeft);
      if (d < best) {
        best = d;
        active = i;
      }
    }

    const target = cards[Math.max(0, Math.min(cards.length - 1, active + delta))];
    el.scrollTo({ left: target.offsetLeft, behavior: "smooth" });
  };

  return (
    <section id="homereels" className="w-full bg-[#FFF6D8] px-4 py-10 md:px-6 md:py-14 lg:px-8 lg:py-16">
      <div className="mx-auto flex max-w-[1400px] flex-col items-center gap-8 md:gap-10 lg:gap-12">
        <Typography
          variant="heading-1"
          as="h2"
          className="w-full text-center font-medium font-tiempos-headline text-[#382E07] tracking-widest lg:mb-4"
        >
          Hope.Care.Impact.
        </Typography>

        {/* items-end: nav buttons sit on card bottom baseline */}
        <div
          ref={rowRef}
          className="flex w-full max-w-[1200px] items-end justify-center gap-4 md:gap-5 lg:gap-6"
        >
          <ReelNavButton direction="prev" dimmed={atStart} onClick={() => step(-1)} />

          <div
            ref={scrollerRef}
            className="shrink-0 snap-x snap-mandatory overflow-x-auto overflow-y-visible scroll-smooth [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
            style={{
              width: stripWidthPx ?? undefined,
              maxWidth: "100%",
              WebkitOverflowScrolling: "touch",
            }}
          >
            <div
              ref={trackRef}
              className="flex w-max items-start"
              style={{ gap: reelsTheme.gapPx }}
            >
              {reels.map((reel) => (
                <ReelCard key={reel.id} />
              ))}
            </div>
          </div>

          <ReelNavButton direction="next" dimmed={atEnd} onClick={() => step(1)} />
        </div>
      </div>
    </section>
  );
}

function ReelCard() {
  return (
    <article
      className="reel-card shrink-0 snap-start shadow-lg"
      style={{ backgroundColor: reelsTheme.cardBg }}
    >
      <div className="flex h-full w-full items-center justify-center">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke={reelsTheme.arrowBg}
          strokeWidth={1.5}
          className="h-10 w-10 opacity-40 sm:h-12 sm:w-12 lg:h-14 lg:w-14"
          aria-hidden
        >
          <polygon points="5 3 19 12 5 21 5 3" />
        </svg>
      </div>
    </article>
  );
}

function ReelNavButton({
  direction,
  dimmed,
  onClick,
}: {
  direction: "prev" | "next";
  dimmed: boolean;
  onClick: () => void;
}) {
  const size = reelsTheme.controlSizePx;

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      aria-label={direction === "prev" ? "Show previous reels" : "Show more reels"}
      className={`relative z-10 flex shrink-0 touch-manipulation items-center justify-center rounded-full transition-opacity ${dimmed ? "opacity-35" : "opacity-100"}`}
      style={{
        width: size,
        height: size,
        backgroundColor: reelsTheme.arrowBg,
      }}
    >
      <Chevron dir={direction === "prev" ? "prev" : "next"} color={reelsTheme.arrowColor} />
    </button>
  );
}

function Chevron({ dir, color }: { dir: "prev" | "next"; color: string }) {
  return (
    <svg
      width={reelsTheme.controlIconPx}
      height={reelsTheme.controlIconPx}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={reelsTheme.controlStrokePx}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {dir === "prev" ? (
        <polyline points="16 20 8 12 16 4" />
      ) : (
        <polyline points="8 20 16 12 8 4" />
      )}
    </svg>
  );
}
