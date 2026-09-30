"use client";

import { useEffect, useMemo, useRef, useState } from "react";

export interface PuzzleImageProps {
  /** Image src (path or URL) */
  src: string;
  alt?: string;
  /** Grid density */
  rows?: number;
  cols?: number;
  /** Extra classes for the outer container (control size/position here) */
  className?: string;
  /** How the image is fit inside the container's aspect box */
  fit?: "cover" | "contain";
  /** ms to wait after entering view before the sequence starts */
  delay?: number;
  /** total ms over which all pieces stagger in */
  staggerDuration?: number;
  /** how small each piece starts before scaling up to its full size (0-1) */
  scaleFrom?: number;
  /** only fires once, or every time it re-enters view */
  once?: boolean;
}

/** Deterministic pseudo-random in [0,1), seeded by an integer — avoids
 *  server/client hydration mismatches you'd get from Math.random(). */
function seededRandom(seed: number) {
  const x = Math.sin(seed * 999.9) * 10000;
  return x - Math.floor(x);
}

/** Deterministic shuffle of [0..n-1] using the seeded generator. */
function seededShuffle(n: number, seed: number) {
  const arr = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(seededRandom(seed + i * 17.3) * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/** Round to a fixed number of decimals and return a plain string — keeps
 *  server-rendered and client-applied style strings byte-identical, which
 *  is what avoids the hydration mismatch warning. */
function fix(n: number, decimals = 4) {
  return n.toFixed(decimals);
}

export default function PuzzleImage({
  src,
  alt = "",
  rows = 4,
  cols = 5,
  className = "",
  fit = "contain",
  delay = 0,
  staggerDuration = 900,
  scaleFrom = 0.4,
  once = true,
}: PuzzleImageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          if (once) observer.disconnect();
        } else if (!once) {
          setInView(false);
        }
      },
      { threshold: 0.25 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [once]);

  const total = rows * cols;

  // Only the REVEAL ORDER is randomized (deterministic seed — same on
  // server and client, so no hydration flicker). Pieces never move from
  // their own cell — they just fade/scale in at their own position.
  const revealRank = useMemo(() => {
    const order = seededShuffle(total, 7);
    const rankByIndex = new Array(total);
    order.forEach((pieceIndex, rank) => {
      rankByIndex[pieceIndex] = rank;
    });
    return rankByIndex;
  }, [total]);

  const overlapPx = 1; // slight overlap between neighboring pieces, hides any AA hairline

  const pieces = Array.from({ length: total }, (_, index) => {
    const r = Math.floor(index / cols);
    const c = index % cols;
    const rank = revealRank[index];

    const topPct = (r / rows) * 100;
    const bottomPct = 100 - ((r + 1) / rows) * 100;
    const leftPct = (c / cols) * 100;
    const rightPct = 100 - ((c + 1) / cols) * 100;

    const top = r > 0 ? `calc(${fix(topPct)}% - ${overlapPx}px)` : "0%";
    const bottom = r < rows - 1 ? `calc(${fix(bottomPct)}% - ${overlapPx}px)` : "0%";
    const left = c > 0 ? `calc(${fix(leftPct)}% - ${overlapPx}px)` : "0%";
    const right = c < cols - 1 ? `calc(${fix(rightPct)}% - ${overlapPx}px)` : "0%";

    // This piece's own cell center — the point it grows from/into.
    const originX = fix(((c + 0.5) / cols) * 100, 4);
    const originY = fix(((r + 0.5) / rows) * 100, 4);

    const staggerDelay = fix(delay + (rank / total) * staggerDuration, 2);

    return (
      <div
        key={index}
        className="absolute inset-0 bg-no-repeat"
        style={{
          backgroundImage: `url(${src})`,
          backgroundSize: fit,
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          clipPath: `inset(${top} ${right} ${bottom} ${left})`,
          transformOrigin: `${originX}% ${originY}%`,
          opacity: inView ? 1 : 0,
          transform: inView ? "scale(1)" : `scale(${fix(scaleFrom, 2)})`,
          transitionProperty: "opacity, transform",
          transitionDuration: "600ms",
          transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
          transitionDelay: `${staggerDelay}ms`,
        }}
      />
    );
  });

  return (
    <div
      ref={containerRef}
      className={`relative h-full w-full overflow-hidden ${className}`}
      role="img"
      aria-label={alt}
    >
      {pieces}
    </div>
  );
}