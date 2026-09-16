"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
};

/**
 * Renders website sections at full browser width so Tailwind breakpoints
 * match the public site, then scales down to fit the CMS content column.
 */
export default function CmsWebsitePreview({ children, className = "" }: Props) {
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
  );
}
