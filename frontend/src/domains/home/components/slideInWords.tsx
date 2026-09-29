"use client";

import { Fragment, useEffect, useLayoutEffect, useRef, useState } from "react";

const SLIDE_DISTANCE = 80;
const SLIDE_LINE_STAGGER = 180;
const SLIDE_THRESHOLD = 0.3;

export type SlideInState = ReturnType<typeof useSlideInLines>;

/**
 * Tracks when an element scrolls into view (once) and groups the words of
 * `text` into their real visual lines, so each line can animate as a unit.
 * `active` should be false while the element isn't rendered.
 */
export function useSlideInLines(text: string, active: boolean) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const wordRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const [visible, setVisible] = useState(false);
  const [lineForWord, setLineForWord] = useState<number[]>([]);

  // Trigger once, when scrolled into view.
  useEffect(() => {
    const node = wrapRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: SLIDE_THRESHOLD },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [active]);

  // Group words into visual lines by their rendered offsetTop.
  useLayoutEffect(() => {
    if (!active) return;

    const measure = () => {
      const tops = wordRefs.current.map((el) => el?.offsetTop ?? 0);
      if (!tops.length) return;
      let currentTop = tops[0];
      let line = 0;
      const indices = tops.map((top) => {
        if (top > currentTop + 2) {
          line += 1;
          currentTop = top;
        }
        return line;
      });
      setLineForWord((prev) =>
        prev.length === indices.length && prev.every((v, i) => v === indices[i])
          ? prev
          : indices,
      );
    };

    measure();
    const t = setTimeout(measure, 150); // catch late font loads
    window.addEventListener("resize", measure);
    return () => {
      clearTimeout(t);
      window.removeEventListener("resize", measure);
    };
  }, [text, active]);

  return { wrapRef, wordRefs, visible, lineForWord };
}

/**
 * Renders `text` word by word so each visual line slides in from the side.
 * from: "left" | "right" | "responsive"
 * "responsive" reads the starting offset from a --slide-x CSS variable set
 * on the wrapper (e.g. `[--slide-x:-80px] lg:[--slide-x:80px]`).
 */
export function slideWords(
  text: string,
  slide: SlideInState,
  from: "left" | "right" | "responsive",
  baseDelay = 0,
  breakAfter?: number,
  breakClassName?: string,
) {
  const words = text.split(" ");
  const hiddenX =
    from === "responsive"
      ? "var(--slide-x)"
      : `${from === "left" ? -SLIDE_DISTANCE : SLIDE_DISTANCE}px`;

  return (
    <>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {words.map((word, i) => (
          <Fragment key={i}>
            <span
              ref={(el) => {
                slide.wordRefs.current[i] = el;
              }}
              className="inline-block motion-reduce:!transition-none"
              style={{
                opacity: slide.visible ? 1 : 0,
                transform: slide.visible
                  ? "translate3d(0,0,0)"
                  : `translate3d(${hiddenX},0,0)`,
                transition:
                  "transform 900ms cubic-bezier(0.22, 1, 0.36, 1), opacity 700ms ease-out",
                transitionDelay: `${baseDelay + (slide.lineForWord[i] ?? 0) * SLIDE_LINE_STAGGER}ms`,
                willChange: "transform, opacity",
              }}
            >
              {word}
            </span>
            {i < words.length - 1 ? " " : ""}
            {breakAfter === i ? <br className={breakClassName} /> : null}
          </Fragment>
        ))}
      </span>
    </>
  );
}