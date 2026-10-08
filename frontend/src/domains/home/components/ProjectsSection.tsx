"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  COLLAPSED_WIDTH,
  MOBILE_COLLAPSED_HEIGHT,
  PROJECT_FROM_HOME_KEY,
  type CardData,
} from "@/domains/home/constants/project";
import Typography from "@/lib/Typography";
import {
  slideWords,
  useSlideInLines,
} from "./slideInWords";

gsap.registerPlugin(ScrollTrigger);

const HEADING_TEXT = "Changing Lives Through HCG Foundation Projects";
const DESC_TEXT =
  "Explore the programs and community initiatives that are creating meaningful impact across healthcare, awareness, education, and patient support.";

function ArrowIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className={`shrink-0 ${className || "size-4"}`}
      aria-hidden="true"
    >
      <path d="M7 17L17 7M9 7h8v8" />
    </svg>
  );
}

function ChevronLeftIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.25"
      className={`size-3.5 shrink-0 ${className}`}
      aria-hidden="true"
    >
      <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChevronRightIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.25"
      className={`size-3.5 shrink-0 ${className}`}
      aria-hidden="true"
    >
      <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * Vertical title marquee (lg+), bottom → top, seamless loop.
 * Works with the `.project-vertical-marquee-*` CSS in globals.css
 * (track: flex column, gap 2.5rem, translateY 0 → -50%).
 *
 * Both copies live inside ONE inner wrapper (a single child of the track),
 * so the track's CSS `gap` is never inserted between them. Each copy has its
 * own `pb-10` (= 2.5rem), so the wrapper height is exactly 2 × (H + gap) and
 * -50% lands exactly on one copy → no jump, no extra gap.
 */
function VerticalMarqueeTitle({ title }: { title: string }) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLSpanElement>(null);
  const [animate, setAnimate] = useState(false);
  const [durationSec, setDurationSec] = useState(14);

  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    const measure = measureRef.current;
    if (!viewport || !measure) return;

    const check = () => {
      const available = viewport.clientHeight;
      const needed = measure.getBoundingClientRect().height;
      // Any overflow (0.5px for sub-pixel rounding) starts the marquee.
      const overflows = needed - available > 0.5;
      setAnimate(overflows);
      if (overflows) {
        // ~40px per second, clamp 10–28s
        setDurationSec(Math.min(28, Math.max(10, needed / 40)));
      }
    };

    check();
    const ro = new ResizeObserver(check);
    ro.observe(viewport);
    ro.observe(measure);

    // Re-measure once web fonts finish loading — sizes change.
    let cancelled = false;
    if (typeof document !== "undefined" && "fonts" in document) {
      (document as Document & { fonts: FontFaceSet }).fonts.ready.then(() => {
        if (!cancelled) check();
      });
    }

    return () => {
      cancelled = true;
      ro.disconnect();
    };
  }, [title]);

  const label = (
    <Typography
      variant="body-2"
      as="span"
      className="whitespace-nowrap font-manrope font-medium text-white"
      style={{ writingMode: "vertical-rl", transform: "rotate(360deg)" }}
    >
      {title}
    </Typography>
  );

  return (
    <div
      ref={viewportRef}
      className={`card-vertical-label absolute inset-x-0 top-14 bottom-6 z-20 flex flex-col items-center overflow-hidden ${
        animate ? "justify-start" : "justify-end"
      }`}
    >
      <div
        className="project-vertical-marquee-track shrink-0"
        data-animate={animate ? "true" : "false"}
        style={animate ? { animationDuration: `${durationSec}s` } : undefined}
      >
        {/* Single child → track `gap` is not applied between the copies */}
        <div className="flex shrink-0 flex-col items-center">
          <span className={`inline-flex shrink-0 ${animate ? "pb-10" : ""}`}>
            <span ref={measureRef} className="inline-flex">
              {label}
            </span>
          </span>
          {animate ? (
            <span className="inline-flex shrink-0 pb-10" aria-hidden="true">
              {label}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}

/**
 * Mobile counterpart of VerticalMarqueeTitle (below lg).
 * Same overflow check and duplicate-track loop, but horizontal, right → left.
 * Any overflow starts the marquee, so a title is never hidden or truncated.
 * Short titles stay still. Paused while the card is expanded.
 * Needs the `.project-horizontal-marquee-*` CSS in globals.css.
 */
function HorizontalMarqueeTitle({
  title,
  paused = false,
}: {
  title: string;
  paused?: boolean;
}) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLSpanElement>(null);
  const [animate, setAnimate] = useState(false);
  const [durationSec, setDurationSec] = useState(10);

  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    const measure = measureRef.current;
    if (!viewport || !measure) return;

    const check = () => {
      const available = viewport.clientWidth;
      const needed = measure.getBoundingClientRect().width;
      // Any overflow at all (0.5px for sub-pixel rounding) starts the marquee.
      const overflows = needed - available > 0.5;
      setAnimate(overflows);
      if (overflows) {
        // ~40px per second, clamp 8–24s
        setDurationSec(Math.min(24, Math.max(8, needed / 40)));
      }
    };

    check();
    const ro = new ResizeObserver(check);
    ro.observe(viewport);
    ro.observe(measure);

    // Re-measure once web fonts finish loading — widths change.
    let cancelled = false;
    if (typeof document !== "undefined" && "fonts" in document) {
      (document as Document & { fonts: FontFaceSet }).fonts.ready.then(() => {
        if (!cancelled) check();
      });
    }

    return () => {
      cancelled = true;
      ro.disconnect();
    };
  }, [title]);

  const label = (
    <Typography
      variant="heading-7"
      as="span"
      className="whitespace-nowrap font-manrope font-semibold text-white [text-overflow:clip] overflow-visible"
    >
      {title}
    </Typography>
  );

  return (
    <div
      ref={viewportRef}
      className="project-horizontal-marquee-viewport min-w-0 flex-1 overflow-hidden"
    >
      <div
        className="project-horizontal-marquee-track"
        data-animate={animate ? "true" : "false"}
        style={
          animate
            ? {
                animationDuration: `${durationSec}s`,
                animationPlayState: paused ? "paused" : "running",
              }
            : undefined
        }
      >
        <span className={`inline-flex shrink-0 ${animate ? "pr-10" : ""}`}>
          <span ref={measureRef} className="inline-flex">
            {label}
          </span>
        </span>
        {animate ? (
          <span
            className="project-horizontal-marquee-copy inline-flex shrink-0 pr-10"
            aria-hidden="true"
          >
            {label}
          </span>
        ) : null}
      </div>
    </div>
  );
}

/**
 * "More details" button.
 *  - `compact` is the desktop (lg+) card panel variant — unchanged.
 *  - Non-compact is the mobile / tablet variant (below lg). Padding and icon
 *    are smaller on small screens; the label typography is unchanged.
 */
function MoreDetailsButton({
  className = "",
  href,
  previewMode,
  compact = false,
}: {
  className?: string;
  href?: string;
  previewMode?: boolean;
  compact?: boolean;
}) {
  const classes = `inline-flex w-fit shrink-0 items-center justify-center overflow-visible bg-[#FFD43B] uppercase tracking-wider text-neutral-900 transition-colors hover:bg-[#f0c527] ${
    compact
      ? "gap-1.5 px-3 py-2"
      : "gap-1 px-2.5 py-1.5 sm:gap-1.5 sm:px-3 sm:py-2"
  } ${className}`;
  const label = (
    <Typography
      variant="button-3"
      as="span"
      className="uppercase text-neutral-900"
    >
      More details
    </Typography>
  );
  const icon = (
    <ArrowIcon className={compact ? "size-3.5" : "size-3 sm:size-3.5"} />
  );

  if (previewMode || !href) {
    return (
      <span className={`${classes} cursor-default opacity-90`}>
        {label}
        {icon}
      </span>
    );
  }

  return (
    <Link
      href={href}
      className={classes}
      onClick={() => sessionStorage.setItem(PROJECT_FROM_HOME_KEY, "1")}
    >
      {label}
      {icon}
    </Link>
  );
}

const MOBILE_EXPANDED_EXTRA = 200;
const MOBILE_EXPANDED_MAX = 480;
// How many project cards are visible at once. Once there are more
// projects than this, the carousel arrows appear.
const VISIBLE_COUNT = 4;
// Gap between desktop cards in px (matches the old `gap-3`).
const CARD_GAP = 12;
// Duration of the arrow slide.
const SLIDE_DURATION = 0.6;

const SCROLL_DESC_CLASS =
  "min-h-0 overflow-y-auto overscroll-contain [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden";

export type ProjectsSectionProps = {
  cards: CardData[];
  /** When true, "More details" does not navigate (CMS preview). */
  previewMode?: boolean;
  className?: string;
  showHeader?: boolean;
  defaultActiveIndex?: number;
};

export default function ProjectsSection({
  cards,
  previewMode = false,
  className = "",
  showHeader = true,
  defaultActiveIndex = 0,
}: ProjectsSectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const reduceMotionRef = useRef(false);

  // Header slide-in animations (only active when the header is rendered).
  const headerActive = showHeader && cards.length > 0;
  const headingSlide = useSlideInLines(HEADING_TEXT, headerActive);
  const descSlide = useSlideInLines(DESC_TEXT, headerActive);

  const timelineRefs = useRef<(gsap.core.Timeline | null)[]>([]);

  // Carousel window: which slice of `cards` is currently on screen.
  const [windowStart, setWindowStart] = useState(0);
  const maxWindowStart = Math.max(cards.length - VISIBLE_COUNT, 0);
  const clampedWindowStart = Math.min(windowStart, maxWindowStart);
  const hasCarousel = cards.length > VISIBLE_COUNT;
  const visibleCards = hasCarousel
    ? cards.slice(clampedWindowStart, clampedWindowStart + VISIBLE_COUNT)
    : cards;

  const safeDefault = Math.min(
    Math.max(defaultActiveIndex, 0),
    Math.max(visibleCards.length - 1, 0)
  );
  const [activeIndex, setActiveIndex] = useState<number>(safeDefault);

  const mobileCardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const mobileTimelineRefs = useRef<(gsap.core.Timeline | null)[]>([]);
  const mobilePanelContentRefs = useRef<(HTMLDivElement | null)[]>([]);
  const mobileHasMounted = useRef(false);

  const [mobileActiveIndex, setMobileActiveIndex] =
    useState<number>(safeDefault);
  const [mobileContentHeights, setMobileContentHeights] = useState<number[]>(
    []
  );

  const trackRef = useRef<HTMLDivElement>(null);

  // Desktop renders ALL cards in one track. The track is wider than the
  // viewport by the width of the off-screen cards, so the active card
  // keeps exactly the same width as before.
  const trackExtra =
    Math.max(cards.length - VISIBLE_COUNT, 0) * (COLLAPSED_WIDTH + CARD_GAP);
  // Desktop activeIndex is an ABSOLUTE index into `cards`.
  const resetIndex = clampedWindowStart + safeDefault;

  const shift = (direction: 1 | -1) => {
    const newStart =
      direction === 1
        ? Math.min(clampedWindowStart + 1, maxWindowStart)
        : Math.max(clampedWindowStart - 1, 0);
    if (newStart === clampedWindowStart) return;
    setWindowStart(newStart);
    setActiveIndex(newStart + safeDefault);
    // The arrows sit below the cards, so bring the heading back into view to
    // show the new set from the top (its scroll-margin clears the navbar).
    (headerRef.current ?? sectionRef.current)?.scrollIntoView({
      behavior: reduceMotionRef.current ? "auto" : "smooth",
      block: "start",
    });
  };

  const handlePrev = () => shift(-1);
  const handleNext = () => shift(1);

  // One continuous slide of the track. No swapping, no second phase.
  useLayoutEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    gsap.to(track, {
      x: -clampedWindowStart * (COLLAPSED_WIDTH + CARD_GAP),
      duration: reduceMotionRef.current ? 0.001 : SLIDE_DURATION,
      ease: "power3.inOut",
      overwrite: "auto",
    });
  }, [clampedWindowStart]);

  useEffect(() => {
    const next = Math.min(
      Math.max(defaultActiveIndex, 0),
      Math.max(Math.min(cards.length, VISIBLE_COUNT) - 1, 0)
    );
    setActiveIndex(next);
    setMobileActiveIndex(next);
    setWindowStart(0);
    mobileHasMounted.current = false;
  }, [cards, defaultActiveIndex]);

  useLayoutEffect(() => {
    const checkAll = () => {
      const blocks = mobilePanelContentRefs.current;
      const heights = blocks.map((block) => (block ? block.scrollHeight : 0));
      setMobileContentHeights((prev) => {
        if (
          prev.length === heights.length &&
          prev.every((h, i) => h === heights[i])
        ) {
          return prev;
        }
        return heights;
      });
    };

    const ro = new ResizeObserver(checkAll);
    mobilePanelContentRefs.current.forEach((block) => {
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
  }, [cards, windowStart]);

  // Detect prefers-reduced-motion once on mount (still used by the
  // hover/expand animations below). No entrance animation is played.
  useLayoutEffect(() => {
    reduceMotionRef.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
  }, []);

  // On desktop the section starts edge-to-edge and its side padding grows
  // back in as it scrolls into view.
  const hasCards = cards.length > 0;
  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const mm = gsap.matchMedia();
    mm.add(
      "(min-width: 1024px) and (prefers-reduced-motion: no-preference)",
      () => {
        gsap.from(section, {
          paddingLeft: 0,
          paddingRight: 0,
          scrollTrigger: {
            trigger: section,
            start: "top 90%",
            end: "top 15%",
            scrub: 1.5,
            invalidateOnRefresh: true,
          },
        });
      }
    );

    return () => mm.revert();
  }, [hasCards]);

  useEffect(() => {
    const els = cardsRef.current.filter(
      (c): c is HTMLDivElement => c !== null
    );
    const reduceMotion = reduceMotionRef.current;

    els.forEach((card, index) => {
      const tint = card.querySelector<HTMLElement>(".card-tint");
      const image = card.querySelector<HTMLElement>(".card-image");
      const badgeCollapsed = card.querySelector<HTMLElement>(
        ".card-badge-collapsed"
      );
      const verticalLabel = card.querySelector<HTMLElement>(
        ".card-vertical-label"
      );
      const panel = card.querySelector<HTMLElement>(".card-panel");
      const panelBadge = card.querySelector<HTMLElement>(".panel-badge");
      const title = card.querySelector<HTMLElement>(".panel-title");
      const desc = card.querySelector<HTMLElement>(".panel-desc");
      const cta = card.querySelector<HTMLElement>(".panel-cta");
      if (
        !tint ||
        !image ||
        !badgeCollapsed ||
        !verticalLabel ||
        !panel ||
        !panelBadge ||
        !title ||
        !desc ||
        !cta
      )
        return;

      const isActive = index === activeIndex;
      const d = reduceMotion ? 0.001 : 0.65;

      timelineRefs.current[index]?.kill();

      const tl = gsap.timeline({
        defaults: { ease: "power3.out", overwrite: "auto", duration: d },
      });
      timelineRefs.current[index] = tl;

      tl.to(
        card,
        {
          flexGrow: isActive ? 1 : 0,
          flexShrink: isActive ? 1 : 0,
          flexBasis: isActive ? "0px" : `${COLLAPSED_WIDTH}px`,
        },
        0
      )
        .to(
          image,
          {
            scale: isActive ? 1 : 1.1,
            duration: reduceMotion ? 0.001 : 1.2,
            ease: "power2.out",
          },
          0
        )
        .to(
          tint,
          { opacity: isActive ? 0 : 1, duration: reduceMotion ? 0.001 : 0.5 },
          0
        );

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
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: reduceMotion ? 0.001 : 0.5,
          },
          panelStart
        )
          .fromTo(
            panelBadge,
            { opacity: 0, y: 10 },
            { opacity: 1, y: 0, duration: reduceMotion ? 0.001 : 0.35 },
            panelStart + 0.08
          )
          .fromTo(
            title,
            { opacity: 0, y: 16 },
            { opacity: 1, y: 0, duration: reduceMotion ? 0.001 : 0.4 },
            panelStart + 0.12
          )
          .fromTo(
            desc,
            { opacity: 0, y: 12 },
            { opacity: 1, y: 0, duration: reduceMotion ? 0.001 : 0.35 },
            panelStart + 0.18
          )
          .fromTo(
            cta,
            { opacity: 0, y: 10 },
            { opacity: 1, y: 0, duration: reduceMotion ? 0.001 : 0.35 },
            panelStart + 0.24
          )
          .call(() => {
            panel.style.pointerEvents = "auto";
          });
      } else {
        const panelOutDuration = reduceMotion ? 0.001 : 0.26;
        tl.to(
          panel,
          {
            opacity: 0,
            y: 16,
            scale: 0.97,
            duration: panelOutDuration,
            ease: "power2.in",
          },
          0
        ).set(panel, { pointerEvents: "none" });

        const collapsedStart = reduceMotion ? 0.001 : panelOutDuration + 0.04;
        tl.to(
          [badgeCollapsed, verticalLabel],
          { opacity: 1, duration: reduceMotion ? 0.001 : 0.25 },
          collapsedStart
        );
      }
    });

    return () => {
      timelineRefs.current.forEach((tl) => tl?.kill());
    };
  }, [activeIndex, cards]);

  useEffect(() => {
    const reduceMotion = reduceMotionRef.current;
    const els = mobileCardsRef.current;
    const skipAnim =
      !mobileHasMounted.current && mobileContentHeights.length === 0;

    els.forEach((card, index) => {
      if (!card) return;

      const tint = card.querySelector<HTMLElement>(".m-card-tint");
      const image = card.querySelector<HTMLElement>(".m-card-image");
      const collapsedRow = card.querySelector<HTMLElement>(".m-card-collapsed");
      const panel = card.querySelector<HTMLElement>(".m-card-panel");
      const panelBadge = card.querySelector<HTMLElement>(".m-panel-badge");
      const title = card.querySelector<HTMLElement>(".m-panel-title");
      const desc = card.querySelector<HTMLElement>(".m-panel-desc");
      const cta = card.querySelector<HTMLElement>(".m-panel-cta");
      if (
        !tint ||
        !image ||
        !collapsedRow ||
        !panel ||
        !panelBadge ||
        !title ||
        !desc ||
        !cta
      )
        return;

      const isActive = index === mobileActiveIndex;
      const contentHeight = mobileContentHeights[index] || 0;
      const naturalHeight = contentHeight + MOBILE_EXPANDED_EXTRA;
      const targetHeight = isActive
        ? Math.min(Math.max(naturalHeight, 420), MOBILE_EXPANDED_MAX)
        : MOBILE_COLLAPSED_HEIGHT;
      const instant = reduceMotion || skipAnim;
      const d = instant ? 0.001 : 0.6;

      mobileTimelineRefs.current[index]?.kill();

      const tl = gsap.timeline({
        defaults: { ease: "power3.out", overwrite: "auto" },
      });
      mobileTimelineRefs.current[index] = tl;

      tl.to(card, { height: targetHeight, duration: d }, 0)
        .to(
          image,
          {
            scale: isActive ? 1 : 1.08,
            duration: instant ? 0.001 : 0.9,
            ease: "power2.out",
          },
          0
        )
        .to(
          tint,
          { opacity: isActive ? 0 : 1, duration: instant ? 0.001 : 0.4 },
          0
        );

      if (isActive) {
        tl.to(collapsedRow, { opacity: 0, duration: instant ? 0.001 : 0.15 }, 0);

        const panelStart = instant ? 0.001 : 0.18;
        tl.fromTo(
          panel,
          { opacity: 0, y: 20, scale: 0.98 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: instant ? 0.001 : 0.42,
          },
          panelStart
        )
          .fromTo(
            panelBadge,
            { opacity: 0, y: 8 },
            { opacity: 1, y: 0, duration: instant ? 0.001 : 0.3 },
            panelStart + 0.05
          )
          .fromTo(
            title,
            { opacity: 0, y: 12 },
            { opacity: 1, y: 0, duration: instant ? 0.001 : 0.3 },
            panelStart + 0.09
          )
          .fromTo(
            desc,
            { opacity: 0, y: 10 },
            { opacity: 1, y: 0, duration: instant ? 0.001 : 0.28 },
            panelStart + 0.14
          )
          .fromTo(
            cta,
            { opacity: 0, y: 8 },
            { opacity: 1, y: 0, duration: instant ? 0.001 : 0.28 },
            panelStart + 0.19
          )
          .call(() => {
            panel.style.pointerEvents = "auto";
          });
      } else {
        const panelOut = instant ? 0.001 : 0.2;
        tl.to(
          panel,
          {
            opacity: 0,
            y: 12,
            scale: 0.98,
            duration: panelOut,
            ease: "power2.in",
          },
          0
        ).set(panel, { pointerEvents: "none" });

        const collapsedStart = instant ? 0.001 : panelOut + 0.03;
        tl.to(
          collapsedRow,
          { opacity: 1, duration: instant ? 0.001 : 0.2 },
          collapsedStart
        );
      }
    });

    if (mobileContentHeights.length > 0) {
      mobileHasMounted.current = true;
    }

    return () => {
      mobileTimelineRefs.current.forEach((tl) => tl?.kill());
    };
  }, [mobileActiveIndex, mobileContentHeights, cards, windowStart]);

  if (!cards.length) {
    return (
      <section
        className={`bg-[#FFF6D8] px-8 py-8 text-black sm:px-12 md:px-16 lg:px-6 lg:py-14 xl:px-6 xl:py-30 2xl:px-40 ${className}`}
      >
        {showHeader ? (
          <div id="projects" className="mb-6 scroll-mt-24">
            <Typography
              variant="heading-2"
              as="h2"
              className="font-tiempos-headline font-medium text-[#382E07]"
            >
              Changing Lives Through HCG Foundation Projects
            </Typography>
            <Typography
              variant="body-2"
              as="p"
              className="mt-3 max-w-xl font-argestadisplay text-black/60"
            >
              Published projects will appear here.
            </Typography>
          </div>
        ) : null}
      </section>
    );
  }

  return (
    <section
      ref={sectionRef}
      className={`bg-[#FFF6D8] px-8 py-6 text-black sm:px-12 md:px-16 lg:px-6 lg:py-8 xl:px-6 xl:py-20 2xl:px-40 ${className}`}
    >
      <div className="max-w-full">
        {showHeader ? (
          <div ref={headerRef} id="projects" className="mb-10 flex flex-col gap-4 overflow-x-clip lg:mb-14 lg:flex-row lg:items-start lg:justify-between lg:gap-8 scroll-mt-24">
            <div ref={headingSlide.wrapRef} className="w-full">
              <Typography
                variant="heading-2"
                as="h2"
                className="text-left font-tiempos-headline font-medium text-[#382E07]"
              >
                {slideWords(
                  HEADING_TEXT,
                  headingSlide,
                  "left",
                  0,
                  2,
                  "hidden 2xl:block",
                )}
              </Typography>
            </div>
            <div
              ref={descSlide.wrapRef}
              className="w-full [--slide-x:-80px] lg:max-w-md lg:pt-2 lg:[--slide-x:80px] xl:max-w-xl"
            >
              <Typography
                variant="body-2"
                as="p"
                className="font-argestadisplay font-normal leading-6 text-black/60 lg:text-left"
              >
                {slideWords(DESC_TEXT, descSlide, "responsive", 250)}
              </Typography>
            </div>
          </div>
        ) : null}

        <div
          ref={containerRef}
          className="hidden h-[420px] w-full overflow-hidden rounded-2xl lg:block xl:h-[520px] 2xl:h-[600px]"
          onMouseLeave={() => setActiveIndex(resetIndex)}
        >
          <div
            ref={trackRef}
            className="flex h-full will-change-transform"
            style={{ gap: CARD_GAP, width: `calc(100% + ${trackExtra}px)` }}
          >
          {cards.map((card, index) => (
            <div
              key={index}
              ref={(el) => {
                cardsRef.current[index] = el;
              }}
              role="button"
              tabIndex={
                index >= clampedWindowStart &&
                index < clampedWindowStart + VISIBLE_COUNT
                  ? 0
                  : -1
              }
              aria-expanded={index === activeIndex}
              aria-label={card.title}
              onMouseEnter={() => setActiveIndex(index)}
              onFocus={() => setActiveIndex(index)}
              className="group relative min-w-0 cursor-pointer overflow-hidden rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-white/70"
              style={{ willChange: "flex-grow, flex-basis" }}
            >
              {card.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={card.image}
                  alt=""
                  aria-hidden="true"
                  className="card-image absolute inset-0 h-full w-full object-cover will-change-transform"
                />
              ) : (
                <div
                  className="card-image absolute inset-0 h-full w-full bg-[#2A2410] will-change-transform"
                  aria-hidden="true"
                />
              )}

              <div className="card-tint absolute inset-0 bg-[#FFD43B6E]" />

              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-black/0 to-black/10" />

              <div className="card-badge-collapsed absolute top-4 left-4 z-20 flex h-7 w-7 items-center justify-center rounded-full bg-black/70 text-white">
                <Typography
                  variant="caption-1"
                  as="span"
                  className="text-white"
                >
                  {card.number}
                </Typography>
              </div>

              <VerticalMarqueeTitle title={card.title} />

              <div
                className="card-panel pointer-events-none absolute top-8 right-4 bottom-8 z-30 flex w-[min(15.5rem,42%)] flex-col overflow-hidden rounded-2xl bg-[#8D8D8D66] p-4 opacity-0 shadow-2xl backdrop-blur-xl xl:top-10 xl:right-5 xl:bottom-10 xl:w-[min(17.5rem,32%)] 2xl:w-[min(26rem,46%)]"
                style={{ transformOrigin: "top right" }}
              >
                <div className="panel-badge mb-3 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-black/70 text-white">
                  <Typography
                    variant="caption-1"
                    as="span"
                    className="text-white"
                  >
                    {card.number}
                  </Typography>
                </div>

                <Typography
                  variant="heading-7"
                  as="h3"
                  className="panel-title mb-3 shrink-0 break-words font-manrope font-bold text-white"
                >
                  {card.title}
                </Typography>

                {/* Short title → sits low (design). Long title → sits under title. Only desc scrolls. */}
                <div className="mt-auto flex min-h-0 max-h-[55%] flex-col">
                  <Typography
                    variant="body-7"
                    as="p"
                    className={`panel-desc mb-3 min-h-0 flex-1 font-manrope font-light text-white ${SCROLL_DESC_CLASS}`}
                  >
                    {card.description}
                  </Typography>

                  <MoreDetailsButton
                    compact
                    className="panel-cta shrink-0 font-manrope font-semibold pointer-events-auto"
                    href={card.href}
                    previewMode={previewMode}
                  />
                </div>
              </div>
            </div>
          ))}
          </div>
        </div>

        <div className="flex flex-col gap-3 lg:hidden">
          {visibleCards.map((card, index) => (
            <div
              key={index}
              ref={(el) => {
                mobileCardsRef.current[index] = el;
              }}
              role="button"
              tabIndex={0}
              aria-expanded={index === mobileActiveIndex}
              aria-label={card.title}
              onClick={() => setMobileActiveIndex(index)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setMobileActiveIndex(index);
                }
              }}
              className={`group relative w-full cursor-pointer overflow-hidden rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-white/70 ${
                index === mobileActiveIndex
                  ? "h-[min(72vh,480px)] min-h-[420px]"
                  : "h-20"
              }`}
              style={{ willChange: "height" }}
            >
              {card.mobileImage || card.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={card.mobileImage || card.image}
                  alt=""
                  aria-hidden="true"
                  className="m-card-image absolute inset-0 h-full w-full object-cover will-change-transform"
                />
              ) : (
                <div
                  className="m-card-image absolute inset-0 h-full w-full bg-[#2A2410] will-change-transform"
                  aria-hidden="true"
                />
              )}

              <div className="m-card-tint absolute inset-0 bg-[#FFD43B6E]" />

              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/10" />

              <div className="m-card-collapsed absolute inset-0 z-20 flex items-center gap-3 px-4">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-black/70 text-white">
                  <Typography
                    variant="caption-1"
                    as="span"
                    className="text-white"
                  >
                    {card.number}
                  </Typography>
                </div>
                <HorizontalMarqueeTitle
                  title={card.title}
                  paused={index === mobileActiveIndex}
                />
              </div>

              <div
                className="m-card-panel pointer-events-none absolute inset-x-4 bottom-4 z-30 flex max-h-[calc(100%-2rem)] flex-col overflow-y-auto rounded-2xl bg-[#8D8D8D66] p-4 opacity-0 shadow-2xl backdrop-blur-xl [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
                style={{ transformOrigin: "bottom center" }}
              >
                <div
                  ref={(el) => {
                    mobilePanelContentRefs.current[index] = el;
                  }}
                >
                  <div className="mb-4 flex items-center gap-3">
                    <div className="m-panel-badge flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-black/70 text-white">
                      <Typography
                        variant="caption-1"
                        as="span"
                        className="text-white"
                      >
                        {card.number}
                      </Typography>
                    </div>

                    <Typography
                      variant="heading-7"
                      as="h3"
                      className="m-panel-title min-w-0 font-manrope font-bold text-white"
                    >
                      {card.title}
                    </Typography>
                  </div>

                  <Typography
                    variant="body-7"
                    as="p"
                    className={`m-panel-desc mb-3 max-h-[7.5rem] font-manrope font-light text-white ${SCROLL_DESC_CLASS}`}
                    onClick={(e) => e.stopPropagation()}
                    onTouchStart={(e) => e.stopPropagation()}
                  >
                    {card.description}
                  </Typography>

                  <MoreDetailsButton
                    className="m-panel-cta font-manrope font-semibold"
                    href={card.href}
                    previewMode={previewMode}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {hasCarousel ? (
          <div className="mt-6 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={handlePrev}
              disabled={clampedWindowStart === 0}
              aria-label="Previous projects"
              className="flex h-7 w-7 items-center justify-center rounded-full bg-[#FFD43B] text-neutral-900 transition-colors hover:bg-[#f0c527] disabled:cursor-not-allowed disabled:bg-[#FFE9A0]"
            >
              <ChevronLeftIcon />
            </button>
            <button
              type="button"
              onClick={handleNext}
              disabled={clampedWindowStart >= maxWindowStart}
              aria-label="Next projects"
              className="flex h-7 w-7 items-center justify-center rounded-full bg-[#FFD43B] text-neutral-900 transition-colors hover:bg-[#f0c527] disabled:cursor-not-allowed disabled:bg-[#FFE9A0]"
            >
              <ChevronRightIcon />
            </button>
          </div>
        ) : null}
      </div>
    </section>
  );
}