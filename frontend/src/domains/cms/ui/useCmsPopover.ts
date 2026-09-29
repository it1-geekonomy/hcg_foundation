"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type CmsPopoverPlacement = {
  side: "bottom" | "top";
  align: "start" | "end";
};

/**
 * Open/close state for an anchored popover: closes on outside click or Escape,
 * and flips up / right-aligns when the panel would overflow the viewport.
 */
export function useCmsPopover(panelSize: { width: number; height: number }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [placement, setPlacement] = useState<CmsPopoverPlacement>({
    side: "bottom",
    align: "start",
  });

  const measure = useCallback(() => {
    const rect = rootRef.current?.getBoundingClientRect();
    if (!rect) return;
    const spaceBelow = window.innerHeight - rect.bottom;
    const side =
      spaceBelow < panelSize.height + 12 && rect.top > spaceBelow
        ? "top"
        : "bottom";
    const align =
      rect.left + panelSize.width > window.innerWidth - 12 &&
      rect.right - panelSize.width > 12
        ? "end"
        : "start";
    setPlacement({ side, align });
  }, [panelSize.height, panelSize.width]);

  const openPopover = useCallback(() => {
    measure();
    setOpen(true);
  }, [measure]);

  const toggle = useCallback(() => {
    if (open) setOpen(false);
    else openPopover();
  }, [open, openPopover]);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("mousedown", onPointer);
    window.addEventListener("keydown", onKey);
    window.addEventListener("resize", measure);
    return () => {
      window.removeEventListener("mousedown", onPointer);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", measure);
    };
  }, [open, measure]);

  return { rootRef, open, setOpen, toggle, placement };
}

export function cmsPopoverPositionClass(placement: CmsPopoverPlacement) {
  return [
    placement.side === "bottom"
      ? "top-[calc(100%+6px)] origin-top"
      : "bottom-[calc(100%+6px)] origin-bottom",
    placement.align === "start" ? "left-0" : "right-0",
  ].join(" ");
}
