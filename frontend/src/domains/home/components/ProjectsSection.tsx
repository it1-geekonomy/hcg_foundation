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
      <Typography variant="button-3" as="span" className="uppercase text-neutral-900">
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
  const titleRowRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [anyBtnOverflows, setAnyBtnOverflows] = useState(false);

  useLayoutEffect(() => {
    const checkAll = () => {
      const rows = titleRowRefs.current;
      const overflowing = rows.some(
        (row) => row && row.scrollWidth > row.clientWidth + 1
      );
      setAnyBtnOverflows((prev) => (prev === overflowing ? prev : overflowing));
    };

    const ro = new ResizeObserver(checkAll);
    titleRowRefs.current.forEach((row) => {
      if (row) ro.observe(row);
    });

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

  // ---- Mobile/tablet grid: equal card height across ALL cards, not just per-row ----
  // CSS Grid's `items-stretch` only equalizes cards within the same row track, so a
  // two-line title in row 2 leaves row 1 shorter. We measure each card's content
  // block (badge + title + date + button) and apply the tallest as a fixed height
  // to every card, so all four stay visually even regardless of which row they're in.
  const cardContentRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [cardContentHeight, setCardContentHeight] = useState<number | null>(null);

  // Extra space reserved above the content panel so photo is still visible
  // (accounts for the panel's own margin + a minimum image reveal).
  const TOP_RESERVE = 190;

  useLayoutEffect(() => {
    const checkAll = () => {
      const blocks = cardContentRefs.current;
      const maxContent = blocks.reduce((max, block) => {
        if (!block) return max;
        // Measure natural height without our own fixed-height override skewing it.
        const prevHeight = block.style.height;
        block.style.height = "auto";
        const natural = block.scrollHeight;
        block.style.height = prevHeight;
        return Math.max(max, natural);
      }, 0);
      if (maxContent > 0) {
        setCardContentHeight((prev) => (prev === maxContent ? prev : maxContent));
      }
    };

    const ro = new ResizeObserver(checkAll);
    cardContentRefs.current.forEach((block) => {
      if (block) ro.observe(block);
    });

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

    return () => {
      gsap.killTweensOf(cards);
      cards.forEach((card) => gsap.killTweensOf(card.querySelectorAll("*")));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    <section ref={sectionRef} className="text-black bg-[#FFF6D8] py-10 md:py-10 px-8 sm:px-12 md:px-16 lg:py-14 xl:py-30 lg:px-6 xl:px-6 2xl:px-40">
      <div className="max-w-full">
        {/* Heading */}
        <div className="mb-10 flex flex-col gap-4 lg:mb-14 lg:flex-row lg:items-start lg:justify-between lg:gap-8">
          <Typography variant="heading-2"
            as="h2"
            className="w-full text-left font-medium font-tiempos-headline text-[#382E07]"
          >
            Changing Lives Through
            <br className="hidden 2xl:block" />
            {" "}
            HCG Foundation Projects
          </Typography>
          <Typography variant="body-2"
            as="p"
            className="w-full lg:max-w-md xl:max-w-xl leading-6 text-black/60 lg:pt-2 lg:text-left font-argestadisplay font-normal"
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
                <Typography variant="caption-1" as="span" className="text-white">
                  {card.number}
                </Typography>
              </div>

              {/* Collapsed-state vertical title */}
              <div className="card-vertical-label absolute inset-x-0 bottom-6 z-20 flex justify-center">
                <span
                  className="whitespace-nowrap font-medium text-white"
                  style={{ writingMode: "vertical-rl", transform: "rotate(360deg)" }}
                >
                  <Typography variant="body-2" as="span" className="text-white font-medium font-manrope">
                    {card.title}
                  </Typography>
                </span>
              </div>

              {/* Expanded-state glass panel — widened so it overlays further onto the image side (lg+ only) */}
              <div
                className="card-panel pointer-events-none absolute bottom-5 right-5 top-5 z-30 flex h-[calc(100%-2.5rem)] w-[clamp(26rem,78%,44rem)] flex-col overflow-y-auto rounded-2xl bg-[#8D8D8D66] p-6 opacity-0 shadow-2xl backdrop-blur-xl xl:w-[clamp(24rem,55%,36rem)]" style={{ transformOrigin: "top right" }}
              >
                <div className="panel-badge mb-4 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-black/70 text-white">
                  <Typography variant="caption-1" as="span" className="text-white">
                    {card.number}
                  </Typography>
                </div>

                <Typography variant="heading-7" as="h3" className="panel-title mb-18 xl:mb-36 text-white font-bold font-manrope">
                  {card.title}
                </Typography>

                <div className="panel-date mb-8 flex items-center gap-2 text-white/90">
                  <CalendarIcon />
                  <Typography variant="text-2" as="span" className="text-white font-normal font-manrope">
                    Project Date: {card.date}
                  </Typography>
                </div>

                <Typography variant="body-7" as="p" className="panel-desc mb-6 text-white font-light font-manrope" >
                  {card.description}
                </Typography>

                <MoreDetailsButton className="panel-cta font-semibold font-manrope" />
              </div>
            </div>
          ))}
        </div>

        {/* ===== Mobile / tablet-portrait: static grid (<1024px) — unchanged ===== */}
        <div className="grid grid-cols-1 items-stretch gap-4 sm:grid-cols-2 sm:gap-4 lg:hidden">
          {CARDS.map((card, index) => {
            const overflows = anyBtnOverflows;
            return (
              <div
                key={card.number}
                className="group relative flex min-h-[260px] flex-col justify-end overflow-hidden rounded-2xl sm:min-h-[300px]"
                style={
                  cardContentHeight
                    ? { height: `${cardContentHeight + TOP_RESERVE}px` }
                    : undefined
                }
              >
                <img
                  src={card.image}
                  alt=""
                  aria-hidden="true"
                  className="absolute inset-0 h-full w-full object-cover"
                />

                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />

                <div
                  ref={(el) => {
                    cardContentRefs.current[index] = el;
                  }}
                  className="relative z-10 m-3 flex flex-col justify-center rounded-2xl bg-[#8D8D8D66] p-3 backdrop-blur-xl sm:m-4 sm:p-4"
                  style={
                    cardContentHeight ? { height: `${cardContentHeight}px` } : undefined
                  }
                >
                  <div className="relative">
                    <div
                      ref={(el) => {
                        titleRowRefs.current[index] = el;
                      }}
                      aria-hidden="true"
                      className="invisible absolute inset-x-0 top-0 flex items-center gap-3 overflow-hidden"
                    >
                      <Typography variant="heading-7" as="span" className="whitespace-nowrap text-white font-semibold font-manrope">
                        {card.title}
                      </Typography>
                      <MoreDetailsButton className="shrink-0 px-4 py-2 font-semibold" />
                    </div>

                    <div className="flex items-start gap-3">
                      <Typography variant="heading-7"
                        as="h3"
                        className="min-w-0 flex-1 leading-tight text-white font-bold font-manrope"
                      >
                        {card.title}
                      </Typography>
                      {!overflows && (
                        <MoreDetailsButton className="shrink-0 px-4 py-2 font-semibold font-manrope" />
                      )}
                    </div>
                  </div>

                  <div className="mt-2 flex items-center gap-1.5 text-white/70 sm:mt-3">
                    <CalendarIcon />
                    <Typography variant="text-2" as="span" className="text-white font-medium font-manrope">
                      Project Date: {card.date}
                    </Typography>
                  </div>

                  {overflows && (
                    <MoreDetailsButton className="mt-3 px-4 py-2 font-semibold font-manrope" />
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