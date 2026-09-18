"use client";

import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import Typography from "@/lib/Typography";

type CmsWebsitePreviewProps = {
  children: ReactNode;
  /** Optional frame label above the scaled website section */
  label?: string;
  className?: string;
};

/**
 * Renders website sections at full browser width so Tailwind breakpoints
 * match the public site, then scales down to fit the CMS content column.
 */
export default function CmsWebsitePreview({
  children,
  label = "Website preview",
  className = "",
}: CmsWebsitePreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [viewportWidth, setViewportWidth] = useState(1280);
  const [containerWidth, setContainerWidth] = useState(0);
  const [contentHeight, setContentHeight] = useState(0);

  useEffect(() => {
    const sync = () => setViewportWidth(window.innerWidth);
    sync();
    window.addEventListener("resize", sync);
    return () => window.removeEventListener("resize", sync);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const ro = new ResizeObserver(([entry]) => {
      setContainerWidth(entry.contentRect.width);
    });
    ro.observe(container);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const inner = innerRef.current;
    if (!inner) return;

    const measure = () => setContentHeight(inner.offsetHeight);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(inner);
    return () => ro.disconnect();
  }, [children, viewportWidth]);

  const scale =
    containerWidth > 0 && viewportWidth > 0
      ? Math.min(1, containerWidth / viewportWidth)
      : 1;

  return (
    <section className="overflow-hidden rounded-2xl ring-1 ring-black/5">
      <div className="border-b border-black/5 bg-white px-4 py-3 sm:px-5">
        <Typography
          variant="caption-1"
          as="h3"
          className="font-semibold tracking-[0.16em] text-[#9A9A9A] uppercase"
        >
          {label}
        </Typography>
      </div>
      <div
        ref={containerRef}
        className={`w-full overflow-hidden ${className}`}
        style={contentHeight > 0 ? { height: contentHeight * scale } : undefined}
      >
        <div
          ref={innerRef}
          style={{
            width: viewportWidth,
            transform: scale < 1 ? `scale(${scale})` : undefined,
            transformOrigin: "top left",
          }}
        >
          {children}
        </div>
      </div>
    </section>
  );
}
