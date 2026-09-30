"use client";

import { useEffect, useLayoutEffect, useRef, type ReactNode } from "react";

// useLayoutEffect on the client, useEffect fallback avoids SSR warnings
const useIsoLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

// Main title: first <h1> (falls back to the first heading of any level)
const MAIN_HEADING_SELECTOR = "h1";
const ANY_HEADING_SELECTOR = "h1, h2, h3, h4, h5, h6";

// Everything else: sub-headings, text, tables and divider lines
const SLIDE_SELECTOR =
  "h1, h2, h3, h4, h5, h6, p, li, blockquote, dt, dd, table, hr";

type AnimType = "blur" | "slide";

// Same values as the StatSection heading (blur reveal)
const BLUR_TRANSITION =
  "opacity 700ms ease-out, filter 500ms ease-out, transform 1100ms cubic-bezier(0.22, 1, 0.36, 1)";

// Same values as the Let's Connect text (slide in from left)
const SLIDE_TRANSITION =
  "opacity 700ms ease-out, transform 1000ms cubic-bezier(0.22, 1, 0.36, 1)";

function hide(el: HTMLElement, type: AnimType) {
  el.dataset.animType = type;
  el.style.transition = "none";
  el.style.opacity = "0";
  el.style.willChange =
    type === "blur" ? "opacity, filter, transform" : "opacity, transform";
  if (type === "blur") {
    el.style.filter = "blur(14px)";
    el.style.transform = "translate3d(0,32px,0)";
  } else {
    el.style.transform = "translate3d(-80px,0,0)";
  }
}

function show(el: HTMLElement, type: AnimType, delay: number) {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  el.style.transition = reduce
    ? "none"
    : type === "blur"
      ? BLUR_TRANSITION
      : SLIDE_TRANSITION;
  el.style.transitionDelay = reduce ? "0ms" : `${delay}ms`;
  el.style.opacity = "1";
  el.style.transform = "translate3d(0,0,0)";
  if (type === "blur") el.style.filter = "blur(0px)";
}

// If a table sits inside a horizontally scrollable wrapper
// (e.g. <div class="overflow-x-auto">), animate the wrapper instead so the
// -80px offset doesn't get clipped or create a scrollbar mid-animation.
function resolveTarget(el: HTMLElement, container: HTMLElement): HTMLElement {
  if (el.tagName !== "TABLE") return el;
  const parent = el.parentElement;
  if (!parent || parent === container || !container.contains(parent)) return el;
  const ox = window.getComputedStyle(parent).overflowX;
  const onlyChild = parent.children.length === 1;
  if ((ox === "auto" || ox === "scroll") && onlyChild) return parent;
  return el;
}

export default function AnimatedLegalContent({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useIsoLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const registered = new Set<HTMLElement>();

    const io = new IntersectionObserver(
      (entries) => {
        let order = 0;
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target as HTMLElement;
          const type: AnimType =
            el.dataset.animType === "blur" ? "blur" : "slide";
          // small stagger when several elements enter at once
          show(el, type, order * 120);
          order += 1;
          io.unobserve(el); // plays once, like the reference sections
        });
      },
      // low threshold so very tall tables / long blocks still trigger
      { threshold: 0.05, rootMargin: "0px 0px -5% 0px" },
    );

    const scan = () => {
      // Only ONE main heading gets the blur reveal
      const mainHeading =
        container.querySelector<HTMLElement>(MAIN_HEADING_SELECTOR) ??
        container.querySelector<HTMLElement>(ANY_HEADING_SELECTOR);

      const slides = Array.from(
        container.querySelectorAll<HTMLElement>(SLIDE_SELECTOR),
      ).filter((el) => {
        if (el === mainHeading) return false;

        // Content inside a table is animated together with the table itself
        if (el.tagName !== "TABLE" && el.closest("table")) return false;

        // Skip elements nested inside another animated element (<li><p>)
        const parent = el.parentElement?.closest(SLIDE_SELECTOR);
        return !parent || !container.contains(parent);
      });

      let added = false;
      const register = (el: HTMLElement, type: AnimType) => {
        if (registered.has(el)) return;
        registered.add(el);
        hide(el, type);
        added = true;
        io.observe(el);
      };

      if (mainHeading) register(mainHeading, "blur");
      slides.forEach((el) => register(resolveTarget(el, container), "slide"));

      // Force a style flush so the hidden state is committed BEFORE the
      // observer fires. Without this, elements already in view skip the
      // transition entirely.
      if (added) void container.getBoundingClientRect();
    };

    scan();

    // Pick up content that renders after mount (CMS HTML, lazy children)
    let raf: number | null = null;
    const mo = new MutationObserver(() => {
      if (raf != null) return;
      raf = requestAnimationFrame(() => {
        raf = null;
        scan();
      });
    });
    mo.observe(container, { childList: true, subtree: true });

    return () => {
      mo.disconnect();
      io.disconnect();
      if (raf != null) cancelAnimationFrame(raf);
      registered.forEach((el) => {
        el.style.opacity = "";
        el.style.filter = "";
        el.style.transform = "";
        el.style.transition = "";
        el.style.transitionDelay = "";
        el.style.willChange = "";
        delete el.dataset.animType;
      });
    };
  }, []);

  return (
    // overflow-x: clip stops the -80px slide-in from creating a horizontal scrollbar
    <div ref={containerRef} className={className} style={{ overflowX: "clip" }}>
      {children}
    </div>
  );
}