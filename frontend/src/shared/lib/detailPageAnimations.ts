"use client";

import { useEffect, useLayoutEffect } from "react";

/* ------------------------------------------------------------------ */
/* Slide-in animations for the resource detail pages (events,          */
/* projects). Same timings as the Let's Connect section.               */
/* Works on all screen sizes.                                          */
/*                                                                     */
/* Expected markup inside <main>:                                      */
/*   .sm:col-span-7 story column                                       */
/*     h1 title                                                        */
/*     optional metadata row (icon + text pairs)                       */
/*     .no-scrollbar story body                                        */
/*     share buttons (revealed after the body)                         */
/*   "Related ..." heading and "View All" link anywhere below          */
/*                                                                     */
/* Any other block can opt in with data-detail-anim:                   */
/*   "lines" - text slides in line by line                             */
/*   "slide" - the whole element slides in (use for underlined text,   */
/*             which inline-block word spans would break)              */
/*   data-detail-anim-delay="<ms>" staggers it.                        */
/* ------------------------------------------------------------------ */

const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

type StyledEl = HTMLElement | SVGElement;

function startDetailPageAnimations(): () => void {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return () => {};

  const T = "opacity 700ms ease-out, transform 1000ms cubic-bezier(0.22, 1, 0.36, 1)";
  const X = -80; // default: from the left
  const X_RIGHT = 80; // "View all": from the right
  const STEP = 120;
  const MAXD = 1200;
  const DUR = 700; // when a line is visually settled (opacity finished; the easing tail is barely visible)

  const hide = (el: StyledEl, x: number = X) => {
    el.style.opacity = "0";
    el.style.transform = `translate3d(${x}px,0,0)`;
    el.style.transition = "none";
    el.style.willChange = "opacity, transform";
  };

  // The trigger is an element that stays on screen. The animated element
  // itself starts off-screen (translated), so it can't trigger itself.
  const watch = (el: Element, cb: () => void) => {
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          io.disconnect();
          cb();
        }
      },
      { threshold: 0.01, rootMargin: "0px 0px -5% 0px" },
    );
    io.observe(el);
  };

  const wrap = (root: HTMLElement): HTMLSpanElement[] => {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const nodes: Text[] = [];
    while (walker.nextNode()) nodes.push(walker.currentNode as Text);
    const spans: HTMLSpanElement[] = [];
    nodes.forEach((n) => {
      const t = n.nodeValue || "";
      if (!t.trim()) return;
      const frag = document.createDocumentFragment();
      t.split(/(\s+)/).forEach((p) => {
        if (!p) return;
        if (/^\s+$/.test(p)) {
          frag.appendChild(document.createTextNode(p));
          return;
        }
        const s = document.createElement("span");
        s.textContent = p;
        s.style.display = "inline-block";
        frag.appendChild(s);
        spans.push(s);
      });
      n.parentNode?.replaceChild(frag, n);
    });
    return spans;
  };

  // Line-by-line slide-in. onDone fires once the last line has finished animating.
  const lineText = (root: HTMLElement | null, delay: number, onDone?: () => void) => {
    if (!root) {
      onDone?.();
      return;
    }
    const spans = wrap(root);
    spans.forEach((s) => hide(s));
    void root.getBoundingClientRect();
    watch(root, () => {
      let line = -1;
      let top0 = -Infinity;
      const lines = spans.map((s) => {
        const top = s.getBoundingClientRect().top;
        if (Math.abs(top - top0) > 4) {
          line += 1;
          top0 = top;
        }
        return line;
      });
      spans.forEach((s, i) => {
        s.style.transition = T;
        s.style.transitionDelay = `${delay + Math.min(lines[i] * STEP, MAXD)}ms`;
        s.style.opacity = "1";
        s.style.transform = "translate3d(0,0,0)";
      });
      if (onDone) {
        const total = delay + Math.min(Math.max(line, 0) * STEP, MAXD) + DUR;
        window.setTimeout(onDone, total);
      }
    });
  };

  // Whole-element slide-in. Optional x (direction) and gate (wait for a promise before revealing).
  const slide = (
    el: StyledEl | null,
    delay: number,
    trigger?: Element | null,
    x: number = X,
    gate?: Promise<void>,
  ) => {
    if (!el) return;
    if (getComputedStyle(el).display === "inline") el.style.display = "inline-block";
    hide(el, x);
    void el.getBoundingClientRect();
    watch(trigger || el.parentElement || el, () => {
      const reveal = () => {
        el.style.transition = T;
        el.style.transitionDelay = `${delay}ms`;
        el.style.opacity = "1";
        el.style.transform = "translate3d(0,0,0)";
        window.setTimeout(() => {
          // give hover styles back
          el.style.opacity = "";
          el.style.transform = "";
          el.style.transition = "";
          el.style.transitionDelay = "";
          el.style.willChange = "";
        }, 1000 + delay + 100);
      };
      if (gate) gate.then(reveal);
      else reveal();
    });
  };

  const main = document.querySelector<HTMLElement>("main");
  const col = main?.querySelector<HTMLElement>('[class*="sm:col-span-7"]');
  if (!col || !main) return () => {};

  main.style.overflowX = "clip"; // slide offsets must not create a horizontal scrollbar

  // Story column (runs once per mounted content)
  if (!col.dataset.leftAnim) {
    col.dataset.leftAnim = "1";

    // Title: line by line
    const h1 = col.querySelector<HTMLElement>("h1");
    lineText(h1, 0);

    // Metadata rows: icon + text come in together
    const meta = h1?.nextElementSibling as HTMLElement | null;
    if (meta && !meta.classList.contains("no-scrollbar") && meta.querySelector("svg")) {
      meta.querySelectorAll("svg").forEach((svg, i) => {
        const row = svg.parentElement as HTMLElement | null;
        if (!row) return;
        const d = 150 + i * 100;
        slide(svg, d, row);
        lineText(row.querySelector<HTMLElement>("span"), d);
      });
    }

    // Story body: line by line. Resolves the gate when the description finishes.
    const body = col.querySelector<HTMLElement>(".no-scrollbar");
    let resolveBody: () => void = () => {};
    const bodyDone = new Promise<void>((r) => {
      resolveBody = r;
    });
    lineText(body, 300, resolveBody);

    // Share story: starts only AFTER the description animation is done
    if (body) {
      let sib = body.nextElementSibling as HTMLElement | null;
      while (sib) {
        slide(sib, 0, body, X, bodyDone);
        sib = sib.nextElementSibling as HTMLElement | null;
      }
    }
  }

  // "Related..." heading (from left) and "View all" (from right, all screens):
  // scan now, and again if the related section renders late.
  const RELATED = /^related\b/i;
  const VIEW_ALL = /^view\s*all/i;

  const scanRelated = () => {
    const found = Array.from(
      main.querySelectorAll<HTMLElement>("h1, h2, h3, h4, h5, h6, a, button, span, p, div"),
    ).filter((el) => {
      if (col.contains(el)) return false;
      if (el.closest("[data-left-btn]")) return false;
      const t = (el.textContent || "").trim();
      // a row holding both texts is skipped so each animates on its own
      if (/^related\b/i.test(t) && /view\s*all/i.test(t)) return false;
      return t.length <= 40 && (RELATED.test(t) || VIEW_ALL.test(t));
    });
    found
      .filter((el) => !found.some((o) => o !== el && o.contains(el)))
      .forEach((el) => {
        el.setAttribute("data-left-btn", "1");
        const isViewAll = VIEW_ALL.test((el.textContent || "").trim());
        slide(el, isViewAll ? 150 : 0, null, isViewAll ? X_RIGHT : X);
      });
  };

  const scanMarked = () => {
    main
      .querySelectorAll<HTMLElement>("[data-detail-anim]:not([data-detail-anim-started])")
      .forEach((el) => {
        el.setAttribute("data-detail-anim-started", "1");
        const delay = Number(el.dataset.detailAnimDelay) || 0;
        // A horizontal offset keeps the element in the viewport, so it can be its own trigger.
        if (el.dataset.detailAnim === "slide") slide(el, delay, el);
        else lineText(el, delay);
      });
  };

  const scan = () => {
    scanRelated();
    scanMarked();
  };

  scan();
  let raf: number | null = null;
  const mo = new MutationObserver(() => {
    if (raf != null) return;
    raf = requestAnimationFrame(() => {
      raf = null;
      scan();
    });
  });
  mo.observe(main, { childList: true, subtree: true });
  const stop = window.setTimeout(() => mo.disconnect(), 10000);

  return () => {
    mo.disconnect();
    window.clearTimeout(stop);
    if (raf != null) cancelAnimationFrame(raf);
  };
}

/** Runs the detail-page slide-ins once the content for `contentKey` has rendered. */
export function useDetailPageAnimations(ready: boolean, contentKey?: string) {
  useIsoLayoutEffect(() => {
    if (!ready) return;
    return startDetailPageAnimations();
  }, [ready, contentKey]);
}
