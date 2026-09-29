"use client";

import Image from "next/image";
import { useRef } from "react";
import type { PointerEvent, RefObject } from "react";

const ZOOM = 2.4; // magnification inside the blob

const LENS_CSS = `
@keyframes aw-blob {
  0%, 100% { border-radius: 58% 42% 55% 45% / 48% 56% 44% 52%; }
  25%      { border-radius: 44% 56% 46% 54% / 56% 44% 58% 42%; }
  50%      { border-radius: 52% 48% 60% 40% / 42% 58% 42% 58%; }
  75%      { border-radius: 46% 54% 42% 58% / 54% 46% 56% 44%; }
}
.aw-lens {
  position: absolute;
  left: 0;
  top: 0;
  z-index: 5;
  box-sizing: border-box;
  width: 150px;
  height: 150px;
  overflow: hidden;
  pointer-events: none;
  border: 3px solid #ffffff;
  background-color: #ffffff;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.35);
  opacity: 0;
  scale: 0.4;
  transition: opacity 0.25s ease, scale 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  animation: aw-blob 6s ease-in-out infinite;
  will-change: translate;
}
.aw-lens[data-on="true"] { opacity: 1; scale: 1; }
.aw-lens-inner {
  position: absolute;
  left: 0;
  top: 0;
  will-change: translate;
}
@media (hover: none), (prefers-reduced-motion: reduce) {
  .aw-lens { display: none; }
}
`;

/* Hook: refs + pointer handlers that drive the lens */
export function useAwardLens() {
  const boxRef = useRef<HTMLDivElement>(null);
  const lensRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  // Moves the blob lens and shifts the magnified image under it
  const handleMove = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse") return;
    const box = boxRef.current;
    const lens = lensRef.current;
    const inner = innerRef.current;
    if (!box || !lens || !inner) return;

    const r = box.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    const outer = lens.offsetWidth / 2; // includes border
    const inside = lens.clientWidth / 2; // content area

    lens.style.translate = `${x - outer}px ${y - outer}px`;
    inner.style.width = `${r.width * ZOOM}px`;
    inner.style.height = `${r.height * ZOOM}px`;
    inner.style.translate = `${inside - x * ZOOM}px ${inside - y * ZOOM}px`;
    lens.dataset.on = "true";
  };

  const handleLeave = () => {
    if (lensRef.current) lensRef.current.dataset.on = "false";
  };

  return { boxRef, lensRef, innerRef, handleMove, handleLeave };
}

/* Blob-shaped zoom lens markup (mouse only) */
export function AwardLens({
  image,
  lensRef,
  innerRef,
}: {
  image: string;
  lensRef: RefObject<HTMLDivElement | null>;
  innerRef: RefObject<HTMLDivElement | null>;
}) {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: LENS_CSS }} />

      <div ref={lensRef} aria-hidden className="aw-lens" data-on="false">
        <div ref={innerRef} className="aw-lens-inner">
          <Image
            src={image}
            alt=""
            fill
            sizes="1100px"
            quality={95}
            className="object-cover"
            unoptimized={/^https?:\/\//i.test(image)}
            draggable={false}
            onDragStart={(e) => e.preventDefault()}
          />
        </div>
      </div>
    </>
  );
}