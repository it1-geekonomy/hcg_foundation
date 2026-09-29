"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export type TileAnimation = "up" | "next" | "prev";

export type TileImage = { id?: string; src: string; alt: string };

/* ------------------------------------------------------------------ */
/* Styles — render <RevealStyles /> ONCE per section that uses tiles.  */
/* Users with "reduce motion" enabled get no animation.                */
/* ------------------------------------------------------------------ */

const REVEAL_CSS = `
@keyframes tile-in-up {
  from { opacity: 0; transform: translateY(24px) scale(0.97); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}
@keyframes tile-in-next {
  from { opacity: 0; transform: translateX(40px) scale(0.97); }
  to   { opacity: 1; transform: translateX(0) scale(1); }
}
@keyframes tile-in-prev {
  from { opacity: 0; transform: translateX(-40px) scale(0.97); }
  to   { opacity: 1; transform: translateX(0) scale(1); }
}
.tile-anim {
  animation-duration: 1400ms;
  animation-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
  animation-fill-mode: both;
}
.tile-anim-up   { animation-name: tile-in-up; }
.tile-anim-next { animation-name: tile-in-next; }
.tile-anim-prev { animation-name: tile-in-prev; }

@media (prefers-reduced-motion: reduce) {
  .tile-anim { animation: none !important; opacity: 1 !important; transform: none !important; }
}
`;

export function RevealStyles() {
  return <style>{REVEAL_CSS}</style>;
}

/* ------------------------------------------------------------------ */
/* Hook — fires once when the element first scrolls into view          */
/* ------------------------------------------------------------------ */

export function useInViewOnce<T extends HTMLElement>(threshold = 0.15) {
  const [inView, setInView] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const ref = useCallback(
    (node: T | null) => {
      observerRef.current?.disconnect();
      if (!node) return;

      if (typeof IntersectionObserver === "undefined") {
        setInView(true);
        return;
      }

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setInView(true);
            observer.disconnect();
          }
        },
        { threshold }
      );
      observer.observe(node);
      observerRef.current = observer;
    },
    [threshold]
  );

  useEffect(() => () => observerRef.current?.disconnect(), []);

  return [ref, inView] as const;
}

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

type AnimatedImageTileProps = Omit<React.HTMLAttributes<HTMLDivElement>, "children"> & {
  image: TileImage;
  /** Pass the `inView` value from useInViewOnce. Tile stays hidden until true. */
  play: boolean;
  /** Position in the group — used for the stagger delay. */
  index?: number;
  /** Direction the tile enters from. */
  animation?: TileAnimation;
  /** Delay between consecutive tiles, in ms. */
  staggerMs?: number;
  /** next/image `sizes` hint. */
  sizes?: string;
};

export default function AnimatedImageTile({
  image,
  play,
  index = 0,
  animation = "up",
  staggerMs = 220,
  sizes,
  className = "",
  style,
  ...rest
}: AnimatedImageTileProps) {
  return (
    <div
      {...rest}
      className={`tile-anim tile-anim-${animation} group relative overflow-hidden rounded-sm ${className}`}
      style={{
        ...style,
        animationDelay: `${index * staggerMs}ms`,
        // Stays on the first (hidden) keyframe until `play` becomes true
        animationPlayState: play ? "running" : "paused",
      }}
    >
      <Image
        src={image.src}
        alt={image.alt}
        fill
        sizes={sizes}
        className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
      />
    </div>
  );
}