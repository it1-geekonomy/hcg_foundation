"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import gsap from "gsap";
import { CARDS, COLLAPSED_WIDTH } from "@/domains/home/constants/project";
import Typography from "@/lib/Typography";

function CalendarIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className={className}
    >
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M16 3v4M8 3v4M3 10h18" />
    </svg>
  );
}

function ArrowIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      className={className}
    >
      <path d="M7 17L17 7M9 7h8v8" />
    </svg>
  );
}

/**
 * Shared "more details" pill button so desktop + mobile stay pixel-identical
 * in spacing, type, and interaction states.
 */
function MoreDetailsButton({ className = "" }: { className?: string }) {
  return (
    <Link
      href="/#"
      className={`inline-flex w-fit shrink-0 items-center justify-center gap-2 bg-[#FFD43B] px-5 py-2.5 uppercase tracking-wider text-neutral-900 transition-colors hover:bg-[#f0c527] ${className}`}
    >
      <Typography variant="label" as="span" className="text-neutral-900 font-manrope font-semibold">
        More details
      </Typography>
      <ArrowIcon />
    </Link>
  );
}

export default function VerticalCards() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const reduceMotionRef = useRef(false);

  // First card starts open so the interaction reads immediately on load.
  const [activeIndex, setActiveIndex] = useState<number>(0);

  // ---- Mobile/tablet grid: does the button fit next to the title? ----
  // Rather than guessing fixed px breakpoints (which break the moment a
  // title is a character longer or shorter than expected), we measure the
  // actual rendered row for each card. This is a SHARED decision, not
  // per-card: if even one card's title + button don't fit at the current
  // width, every card drops its button below the project date together, so
  // the grid stays visually uniform instead of some cards stacking while
  // others don't.
  const titleRowRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [anyBtnOverflows, setAnyBtnOverflows] = useState(false);

  useLayoutEffect(() => {
    // Read refs live (inside the callback) instead of capturing a snapshot
    // array once — captured snapshots can be stale/incomplete if any row's
    // ref wasn't attached yet at effect-run time (e.g. right after
    // hydration), which was causing some cards' rows to never be measured
    // and their button placement to fall out of sync / not render.
    const checkAll = () => {
      const rows = titleRowRefs.current;
      const overflowing = rows.some(
        (row) => row && row.scrollWidth > row.clientWidth + 1
      );
      setAnyBtnOverflows((prev) => (prev === overflowing ? prev : overflowing));
    };

    // Single observer watching every row, rather than one observer per row.
    const ro = new ResizeObserver(checkAll);
    titleRowRefs.current.forEach((row) => {
      if (row) ro.observe(row);
    });

    // Initial measurement can be wrong if fonts haven't swapped in yet
    // (fallback font metrics differ from the final font), which was the
    // main reason some cards' overflow state came out wrong. Re-check
    // after layout settles and after webfonts finish loading.
    const raf = requestAnimationFrame(checkAll);
    let cancelled = false;
    if (typeof document !== "undefined" && "fonts" in document) {
      (document as Document & { fonts: FontFaceSet }).fonts.ready.then(() => {
        if (!cancelled) checkAll();
      });
    }
    window.addEventListener("resize", checkAll);

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", checkAll);
      ro.disconnect();
    };
  }, []);

  // ---- One-time setup: entrance animation + reduced-motion check ----
  // IMPORTANT: this runs ONCE ([] deps). We never wrap the hover/click
  // animation below in its own gsap.context()+revert() per render — doing
  // that kills the in-flight tween and snaps elements back to their
  // pre-animation state on every single hover, which is what caused the
  // glitchy/snappy behavior. A context (or none at all) that persists for
  // the component's lifetime lets GSAP's overwrite:"auto" redirect tweens
  // smoothly from wherever they currently are, exactly like the plain
  // HTML/JS version.
  useLayoutEffect(() => {
    reduceMotionRef.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const cards = cardsRef.current.filter((c): c is HTMLDivElement => c !== null);

    if (!reduceMotionRef.current && cards.length) {
      gsap.from(cards, {
        opacity: 0,
        y: 32,
        duration: 0.7,
        ease: "power3.out",
        stagger: 0.08,
        clearProps: "opacity,transform",
      });
    }

    // Kill any running tweens on unmount only — not on every activeIndex change.
    return () => {
      gsap.killTweensOf(cards);
      cards.forEach((card) => gsap.killTweensOf(card.querySelectorAll("*")));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- Expand / collapse animation (desktop accordion only) ----
  useEffect(() => {
    const cards = cardsRef.current.filter((c): c is HTMLDivElement => c !== null);
    const reduceMotion = reduceMotionRef.current;

    cards.forEach((card, index) => {
      const tint = card.querySelector<HTMLElement>(".card-tint");
      const image = card.querySelector<HTMLElement>(".card-image");
      const badgeCollapsed = card.querySelector<HTMLElement>(".card-badge-collapsed");
      const verticalLabel = card.querySelector<HTMLElement>(".card-vertical-label");
      const panel = card.querySelector<HTMLElement>(".card-panel");
      const panelBadge = card.querySelector<HTMLElement>(".panel-badge");
      const title = card.querySelector<HTMLElement>(".panel-title");
      const date = card.querySelector<HTMLElement>(".panel-date");
      const desc = card.querySelector<HTMLElement>(".panel-desc");
      const cta = card.querySelector<HTMLElement>(".panel-cta");
      if (!tint || !image || !badgeCollapsed || !verticalLabel || !panel || !panelBadge || !title || !date || !desc || !cta)
        return;

      const isActive = index === activeIndex;
      const d = reduceMotion ? 0.001 : 0.65;

      const tl = gsap.timeline({
        defaults: { ease: "power3.out", overwrite: "auto", duration: d },
      });

      tl.to(
        card,
        {
          flexGrow: isActive ? 1 : 0,
          flexShrink: isActive ? 1 : 0,
          flexBasis: isActive ? "0px" : `${COLLAPSED_WIDTH}px`,
        },
        0
      )
        .to(image, { scale: isActive ? 1 : 1.1, duration: reduceMotion ? 0.001 : 1.2, ease: "power2.out" }, 0)
        .to(tint, { opacity: isActive ? 0 : 1, duration: reduceMotion ? 0.001 : 0.5 }, 0);

      if (isActive) {
        // Collapsed elements must be fully gone BEFORE the panel starts
        // revealing — no shared time window where both are visible.
        tl.to(
          [badgeCollapsed, verticalLabel],
          { opacity: 0, duration: reduceMotion ? 0.001 : 0.16 },
          0
        );

        const panelStart = reduceMotion ? 0.001 : 0.2;
        tl.fromTo(
          panel,
          { opacity: 0, y: 24, scale: 0.97 },
          { opacity: 1, y: 0, scale: 1, duration: reduceMotion ? 0.001 : 0.5 },
          panelStart
        )
          .fromTo(panelBadge, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: reduceMotion ? 0.001 : 0.35 }, panelStart + 0.08)
          .fromTo(title, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: reduceMotion ? 0.001 : 0.4 }, panelStart + 0.12)
          .fromTo(date, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: reduceMotion ? 0.001 : 0.35 }, panelStart + 0.18)
          .fromTo(desc, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: reduceMotion ? 0.001 : 0.35 }, panelStart + 0.24)
          .fromTo(cta, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: reduceMotion ? 0.001 : 0.35 }, panelStart + 0.3);
        panel.style.pointerEvents = "auto";
      } else {
        // Panel must be fully gone BEFORE the collapsed badge/label fade in.
        const panelOutDuration = reduceMotion ? 0.001 : 0.26;
        tl.to(panel, { opacity: 0, y: 16, scale: 0.97, duration: panelOutDuration, ease: "power2.in" }, 0);

        const collapsedStart = reduceMotion ? 0.001 : panelOutDuration + 0.04;
        tl.to(
          [badgeCollapsed, verticalLabel],
          { opacity: 1, duration: reduceMotion ? 0.001 : 0.25 },
          collapsedStart
        );
        panel.style.pointerEvents = "none";
      }
    });
  }, [activeIndex]);

  return (
    <section ref={sectionRef} className="text-black py-6 md:py-10 lg:py-20 px-4 md:px-10 lg:px-16 xl:px-30">
      <div className="max-w-full">
        {/* Heading */}
        <div className="mb-10 flex flex-col gap-4 lg:mb-14 lg:flex-row lg:items-start lg:justify-between lg:gap-8">
          <Typography
            variant="hero"
            as="h2"
            className="max-w-full text-left font-medium font-tiempos-headline text-[#382E07] !tracking-[0.1em]"
          >
            Changing Lives Through
            <br />
            HCG Foundation Projects
          </Typography>
          <Typography
            variant="subheading"
            as="p"
            className="max-w-xl leading-6 text-black/60 lg:pt-2 lg:text-left font-argestadisplay font-regular"
          >
            Explore the programs and community initiatives that are creating
            meaningful impact across healthcare, awareness, education, and
            patient support.
          </Typography>
        </div>

        {/* ===== Desktop / tablet-landscape: hover accordion (>=1024px) ===== */}
        <div
          ref={containerRef}
          className="hidden h-[480px] w-full gap-3 overflow-hidden rounded-2xl lg:flex xl:h-[600px]"
          onMouseLeave={() => setActiveIndex(0)}
        >
          {CARDS.map((card, index) => (
            <div
              key={card.number}
              ref={(el) => {
                cardsRef.current[index] = el;
              }}
              role="button"
              tabIndex={0}
              aria-expanded={index === activeIndex}
              aria-label={card.title}
              onMouseEnter={() => setActiveIndex(index)}
              onFocus={() => setActiveIndex(index)}
              onClick={() => setActiveIndex(index)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setActiveIndex(index);
                }
              }}
              className="group relative min-w-0 cursor-pointer overflow-hidden rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-white/70"
              style={{ willChange: "flex-grow, flex-basis" }}
            >
              {/* Background photo (always present; masked by the tint below when collapsed) */}
              <img
                src={card.image}
                alt=""
                aria-hidden="true"
                className="card-image absolute inset-0 h-full w-full object-cover will-change-transform"
              />

              {/* Flat gold wash — fully covers the photo while collapsed, fades away when active */}
              <div
                className="card-tint absolute inset-0 bg-[#FFD43B6E]"
              />

              {/* Subtle darken over the photo for legibility when expanded */}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-black/0 to-black/10" />

              {/* Collapsed-state number badge, top-left */}
              <div className="card-badge-collapsed absolute left-4 top-4 z-20 flex h-7 w-7 items-center justify-center rounded-full bg-black/70 text-white">
                <Typography variant="caption" as="span" className="font-medium font-manrope text-white">
                  {card.number}
                </Typography>
              </div>

              {/* Collapsed-state vertical title */}
              <div className="card-vertical-label absolute inset-x-0 bottom-6 z-20 flex justify-center">
                <span
                  className="whitespace-nowrap font-medium uppercase tracking-[0.2em] text-white"
                  style={{ writingMode: "vertical-rl", transform: "rotate(360deg)" }}
                >
                  <Typography variant="subheading" as="span" className="text-white font-manrope font-medium">
                    {card.title}
                  </Typography>
                </span>
              </div>

              {/* Expanded-state glass panel */}
              <div
                className="card-panel pointer-events-none absolute bottom-5 right-5 top-5 z-30 flex h-[calc(100%-2.5rem)] w-[clamp(20rem,60%,30rem)] flex-col overflow-y-auto rounded-2xl bg-[#8D8D8D66] p-6 opacity-0 shadow-2xl backdrop-blur-xl"
                style={{ transformOrigin: "top right" }}
              >
                <div className="panel-badge mb-4 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-black/70 text-white">
                  <Typography variant="caption" as="span" className="font-medium font-manrope text-white">
                    {card.number}
                  </Typography>
                </div>

                <Typography variant="subheading" as="h3" className="panel-title mb-18 xl:mb-36 font-manrope font-bold leading-tight text-[#FFFFFF]">
                  {card.title}
                </Typography>

                <div className="panel-date mb-8 flex items-center gap-2 text-white/90">
                  <CalendarIcon />
                  <Typography variant="body-lg" as="span" className="text-[#FFFFFF] font-medium font-manrope">
                    Project Date: {card.date}
                  </Typography>
                </div>

                <Typography variant="body" as="p" className="panel-desc mb-6 leading-5 text-[#FFFFFF] font-normal font-manrope">
                  {card.description}
                </Typography>

                <MoreDetailsButton className="panel-cta" />
              </div>
            </div>
          ))}
        </div>

        {/* ===== Mobile / tablet-portrait: static grid (<1024px) =====
            Hover-to-expand doesn't translate to touch, so every card shows
            only its title, date, and button — no number badge, no
            description. 1 column with a fixed card size below 640px,
            2 columns with an aspect-ratio size from 640px up.

            Layout logic (identical mechanism across the whole ~350px–1024px
            range, not separate hardcoded breakpoint blocks):
              - Title sits on the left of a row, button on the right —
                button right-aligned in the same row as the title.
              - The row is measured (see titleRowRefs / btnOverflows above).
                If title + button don't actually fit side by side at the
                card's current width, the inline button is hidden
                (invisible, not removed — it still holds its layout space
                so the measurement stays accurate on the next resize) and a
                second, real button is rendered on its own line BELOW the
                project date instead of squeezing, wrapping under the
                title, or centering. */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-4 lg:hidden">
          {CARDS.map((card, index) => {
            const overflows = anyBtnOverflows;
            return (
              <div
                key={card.number}
                className="group relative flex min-h-[260px] flex-col justify-end overflow-hidden rounded-2xl sm:min-h-[300px]"
              >
                <img
                  src={card.image}
                  alt=""
                  aria-hidden="true"
                  className="absolute inset-0 h-full w-full object-cover"
                />

                {/* Darken for legibility, same tone as desktop panel gradient */}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />

                {/* Content block, bottom — glass card matching the desktop panel */}
                <div className="relative z-10 m-3 rounded-2xl bg-[#8D8D8D66] p-3 backdrop-blur-xl sm:m-4 sm:p-4">
                  <div className="relative">
                    {/* Hidden measurer — a single-line (nowrap) title +
                        button, invisible and taken out of flow via
                        `absolute`. Its only job is to tell us, via
                        scrollWidth vs clientWidth, whether title + button
                        would fit on one line at the current width. It never
                        affects visible layout and never clips text. */}
                    <div
                      ref={(el) => {
                        titleRowRefs.current[index] = el;
                      }}
                      aria-hidden="true"
                      className="invisible absolute inset-x-0 top-0 flex items-center gap-3 overflow-hidden"
                    >
                      <Typography
                        variant="body-lg"
                        as="span"
                        className="whitespace-nowrap font-manrope font-bold"
                      >
                        {card.title}
                      </Typography>
                      <MoreDetailsButton className="shrink-0 px-4 py-2" />
                    </div>

                    {/* Visible row — title always wraps normally and is
                        never cut off. The button only renders here when it
                        actually fits beside the title. */}
                    <div className="flex items-start gap-3">
                      <Typography
                        variant="body-lg"
                        as="h3"
                        className="min-w-0 flex-1 font-manrope font-bold leading-tight text-white"
                      >
                        {card.title}
                      </Typography>
                      {!overflows && (
                        <MoreDetailsButton className="shrink-0 px-4 py-2" />
                      )}
                    </div>
                  </div>

                  <div className="mt-2 flex items-center gap-1.5 text-white/70 sm:mt-3">
                    <CalendarIcon />
                    <Typography
                      variant="body-lg"
                      as="span"
                      className="font-manrope font-medium text-[#FFFFFF]"
                    >
                      Project Date: {card.date}
                    </Typography>
                  </div>

                  {/* Button didn't fit next to the title — drop it below
                      the project date instead of squeezing or clipping. */}
                  {overflows && (
                    <MoreDetailsButton className="mt-3 px-4 py-2" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}