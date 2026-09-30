"use client";

import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
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
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const sync = () => setViewportWidth(window.innerWidth);
    sync();
    window.addEventListener("resize", sync);
    return () => window.removeEventListener("resize", sync);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const container = containerRef.current;
    if (!container) return;
    const ro = new ResizeObserver(([entry]) => {
      setContainerWidth(entry.contentRect.width);
    });
    ro.observe(container);
    return () => ro.disconnect();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const inner = innerRef.current;
    if (!inner) return;

    const measure = () => setContentHeight(inner.offsetHeight);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(inner);
    return () => ro.disconnect();
  }, [children, viewportWidth, isOpen]);

  const scale =
    containerWidth > 0 && viewportWidth > 0
      ? Math.min(1, containerWidth / viewportWidth)
      : 1;

  return (
    <section className="overflow-hidden rounded-xl border border-cms-border bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
      <div className="flex items-center justify-between gap-3 border-b border-cms-border px-5 py-3.5">
        <div className="min-w-0">
          <Typography variant="heading-7" as="h3" className="text-cms-ink">
            {label}
          </Typography>
          <p className="mt-0.5 text-xs text-cms-muted">
            How this content appears on the public website.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsOpen((v) => !v)}
          className="inline-flex h-8 shrink-0 items-center justify-center gap-1.5 rounded-lg border border-cms-border bg-white px-3 text-[13px] font-medium text-cms-body transition-colors hover:bg-cms-subtle hover:text-cms-ink"
        >
          {isOpen ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          {isOpen ? "Hide preview" : "Show preview"}
        </button>
      </div>

      {!isOpen && (
        <div className="flex flex-col items-center justify-center gap-1 bg-cms-subtle/60 px-6 py-10 text-center">
          <Eye className="mb-2 size-5 text-cms-faint" />
          <p className="text-sm font-medium text-cms-body">Preview is hidden</p>
          <p className="text-xs text-cms-muted">
            Open it to check the layout at desktop width.
          </p>
        </div>
      )}

      {isOpen && (
        <div
          data-site-preview
          ref={containerRef}
          className={`w-full bg-[#FAFAFA] ${className}`}
        >
          <div
            ref={innerRef}
            style={
              scale < 1
                ? ({
                    width: viewportWidth,
                    zoom: scale,
                  } as React.CSSProperties)
                : { width: viewportWidth }
            }
          >
            {children}
          </div>
        </div>
      )}
    </section>
  );
}
