"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import Typography from "@/lib/Typography";
import { reels, reelsTheme } from "@/domains/home/constants/Reels";

/**
 * Native scroll-snap strip (swipe works by itself).
 * Corner controls only call step(±1) → scrollTo the next snap card.
 */
export default function ReelsSection() {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const syncEdges = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setAtStart(el.scrollLeft <= 2);
    setAtEnd(max <= 2 || el.scrollLeft >= max - 2);
  }, []);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    syncEdges();
    el.addEventListener("scroll", syncEdges, { passive: true });
    const ro = new ResizeObserver(syncEdges);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", syncEdges);
      ro.disconnect();
    };
  }, [reels.length, syncEdges]);

  const step = (delta: -1 | 1) => {
    const el = scrollerRef.current;
    if (!el) return;
    const cards = Array.from(el.children) as HTMLElement[];
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

    const target =
      cards[Math.max(0, Math.min(cards.length - 1, active + delta))];
    el.scrollTo({ left: target.offsetLeft, behavior: "smooth" });
  };

  // z-20 keeps controls above reel cards (cards were stealing edge clicks)
  const controlClass =
    "relative z-20 mb-1 flex h-6 w-6 shrink-0 touch-manipulation items-center justify-center rounded-full transition-opacity";

  return (
    <section
      id="homereels"
      className="relative z-[101] w-full py-2 px-3 md:px-4 lg:px-8 bg-[#FFF6D8]"
    >
      <div className="mx-auto flex max-w-[1400px] flex-col items-center gap-6 rounded-3xl p-3 md:gap-8 md:p-4 lg:gap-10 lg:p-6">
        <Typography
          variant="heading-1"
          as="h2"
          className="w-full font-medium font-tiempos-headline text-[#382E07] !tracking-[0.1em] lg:mb-8"
        >
          Hope.Care.Impact.
        </Typography>

        {/* Design: controls outside the strip, bottom-aligned, small gap.
            md uses a fluid center column (minmax(0,1fr)) instead of a fixed
            px width so the side arrow columns never get squeezed against
            the viewport edge on tablet widths. */}
        <div className="isolate grid w-full max-w-[360px] grid-cols-[2rem_minmax(0,1fr)_2rem] items-end gap-3 md:w-auto md:max-w-none md:grid-cols-[2.5rem_476px_2.5rem] md:gap-4 lg:grid-cols-[2rem_812px_2rem] xl:grid-cols-[2rem_872px_2rem] lg:mb-20">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              step(-1);
            }}
            aria-label="Show previous reels"
            className={`${controlClass} ${atStart ? "opacity-35" : "opacity-100"}`}
            style={{ backgroundColor: reelsTheme.arrowBg }}
          >
            <Chevron dir="prev" color={reelsTheme.arrowColor} />
          </button>

          <div className="min-w-0 overflow-hidden">
            <div
              ref={scrollerRef}
              className="relative flex snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain scroll-smooth md:gap-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
              style={{ WebkitOverflowScrolling: "touch" }}
            >
              {reels.map((reel) => (
                <div
                  key={reel.id}
                  className="relative aspect-[9/16] w-full min-w-full shrink-0 snap-start overflow-hidden shadow-lg md:w-[230px] md:min-w-[230px] lg:w-[260px] lg:min-w-[260px] xl:w-[280px] xl:min-w-[280px]"
                  style={{ backgroundColor: reelsTheme.cardBg }}
                >
                  <div className="flex h-full w-full items-center justify-center">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke={reelsTheme.arrowBg}
                      strokeWidth={1.5}
                      className="h-10 w-10 opacity-40 md:h-12 md:w-12"
                      aria-hidden
                    >
                      <polygon points="5 3 19 12 5 21 5 3" />
                    </svg>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              step(1);
            }}
            aria-label="Show more reels"
            className={`${controlClass} ${atEnd ? "opacity-35" : "opacity-100"}`}
            style={{ backgroundColor: reelsTheme.arrowBg }}
          >
            <Chevron dir="next" color={reelsTheme.arrowColor} />
          </button>
        </div>
      </div>
    </section>
  );
}

function Chevron({
  dir,
  color,
}: {
  dir: "prev" | "next";
  color: string;
}) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {dir === "prev" ? (
        <polyline points="15 18 9 12 15 6" />
      ) : (
        <polyline points="9 18 15 12 9 6" />
      )}
    </svg>
  );
}