"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import Typography from "@/lib/Typography";
import { reels, reelsTheme, type Reel } from "@/domains/home/constants/Reels";

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

  // Only one reel can be unmuted at a time. null = all muted.
  // Lifting this up (instead of per-card local state) is what lets
  // unmuting one card automatically mute whichever was previously unmuted.
  const [unmutedId, setUnmutedId] = useState<string | null>(null);

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
    <section
      id="homereels"
      className="w-full bg-[#FFF6D8] px-4 pt-10 pb-10 md:px-6 lg:px-8 lg:py-16"
    >
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
            className="[width:var(--strip-w)] max-w-full shrink-0 snap-x snap-mandatory overflow-x-auto overflow-y-visible scroll-smooth [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
            style={
              {
                "--strip-w": stripWidthPx != null ? `${stripWidthPx}px` : "auto",
              } as React.CSSProperties
            }
          >
            <div
              ref={trackRef}
              className="flex w-max items-start [gap:var(--track-gap)]"
              style={{ "--track-gap": `${reelsTheme.gapPx}px` } as React.CSSProperties}
            >
              {reels.map((reel) => (
                <ReelCard
                  key={reel.id}
                  reel={reel}
                  muted={unmutedId !== reel.id}
                  onToggleMute={() =>
                    setUnmutedId((prev) => (prev === reel.id ? null : reel.id))
                  }
                />
              ))}
            </div>
          </div>

          <ReelNavButton direction="next" dimmed={atEnd} onClick={() => step(1)} />
        </div>
      </div>
    </section>
  );
}

function ReelCard({
  reel,
  muted,
  onToggleMute,
}: {
  reel: Reel;
  muted: boolean;
  onToggleMute: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleMute();
  };

  return (
    <article
      className="reel-card relative shrink-0 snap-start overflow-hidden shadow-lg [background-color:var(--card-bg)]"
      style={{ "--card-bg": reelsTheme.cardBg } as React.CSSProperties}
    >
      <video
        ref={videoRef}
        src={reel.videoSrc}
        className="h-full w-full object-cover"
        autoPlay
        muted={muted}
        loop
        playsInline
        preload="metadata"
      />

      <button
        type="button"
        onClick={handleToggle}
        aria-label={muted ? "Unmute video" : "Mute video"}
        aria-pressed={!muted}
        className="absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition-colors hover:bg-black/70"
      >
        <MuteIcon muted={muted} />
      </button>
    </article>
  );
}

function MuteIcon({ muted }: { muted: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-5 w-5"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <polygon points="4 9 8 9 12 5 12 19 8 15 4 15 4 9" fill="currentColor" stroke="none" />
      {muted ? (
        <>
          <line x1="16" y1="9" x2="21" y2="14" />
          <line x1="21" y1="9" x2="16" y2="14" />
        </>
      ) : (
        <path d="M16 8a5 5 0 0 1 0 8" />
      )}
    </svg>
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
      className={`relative z-10 flex shrink-0 touch-manipulation items-center justify-center rounded-full transition-opacity [width:var(--btn-size)] [height:var(--btn-size)] [background-color:var(--btn-bg)] ${
        dimmed ? "opacity-35" : "opacity-100"
      }`}
      style={
        {
          "--btn-size": `clamp(28px, 7vw, ${size * 0.85}px)`,
          "--btn-bg": reelsTheme.arrowBg,
        } as React.CSSProperties
      }
    >
      <Chevron dir={direction === "prev" ? "prev" : "next"} color={reelsTheme.arrowColor} />
    </button>
  );
}

function Chevron({ dir, color }: { dir: "prev" | "next"; color: string }) {
  const iconSize = reelsTheme.controlIconPx;

  return (
    <svg
      className="[width:var(--icon-size)] [height:var(--icon-size)] [stroke:var(--icon-color)] [stroke-width:var(--icon-stroke)]"
      style={
        {
          "--icon-size": `clamp(14px, 3.5vw, ${iconSize * 0.85}px)`,
          "--icon-color": color,
          "--icon-stroke": reelsTheme.controlStrokePx,
        } as React.CSSProperties
      }
      viewBox="0 0 24 24"
      fill="none"
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