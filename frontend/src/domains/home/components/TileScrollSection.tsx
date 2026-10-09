"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import Image, { getImageProps } from "next/image";
import { preload } from "react-dom";
import { cn } from "@/lib/utils";
import {
  HERO_CONTENT_INSET_MULTIPLIER,
  HERO_CONTENT_TOP_FRACTION,
  HERO_NAME_ACCENT_COLOR,
  HERO_SHORT_VIEWPORT_PX,
  getHeroTileYFraction,
  type HeroTileStep,
} from "@/domains/home/constants/heroTileScroll";
import {
  HERO_RESET_EVENT,
  type HeroResetDetail,
} from "@/domains/home/utils/heroScrollReset";

// ============================================================================
// RESPONSIVE LAYOUT
// ============================================================================

function clamp01(value: number) {
  return Math.min(1, Math.max(0, value));
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

export type HeroResponsiveLayout = {
  isMobile: boolean;
  overlayWidth: string;
  tileWidth: number;
  tileBorder: number;
  contentTopPx: number;
  contentLeft: number;
  contentRight: number;
  contentBottom: number;
  gapAfterTile: number;
  accentGap: number;
  nameSize: number;
  taglineSize: number;
  bodySize: number;
  bodyLineHeight?: number;
  nameGap: number;
  taglineGap: number;
  wordSpacing: string;
};

function getResponsiveValues(width: number, height: number): HeroResponsiveLayout {
  const isShort = height < HERO_SHORT_VIEWPORT_PX;
  const contentTopPx = height * HERO_CONTENT_TOP_FRACTION;

  // Phones — same right-hand panel as desktop, kept to about half the width so the photo stays visible;
  // the tile slides down the photo side of the panel edge.
  if (width < 640) {
    const small = height < 700;
    const tileWidth = small ? 84 : 96;
    return {
      isMobile: true,
      overlayWidth: "58%",
      tileWidth,
      tileBorder: 0,
      // Copy starts just under the navbar so the longest stories fit above the chatbot.
      contentTopPx: MOBILE_CONTENT_TOP_PX,
      contentLeft: Math.round(tileWidth * MOBILE_TILE_PANEL_OVERLAP) + 10,
      // Clears the fixed "Donate Now" side tab (~34px wide on phones).
      contentRight: 40,
      // Clears the chatbot launcher (60px tall, 64px above the bottom edge).
      contentBottom: 132,
      gapAfterTile: 0,
      accentGap: 7,
      nameSize: small ? 17 : 19,
      taglineSize: small ? 12.5 : 13.5,
      bodySize: small ? 12 : 13,
      bodyLineHeight: 1.55,
      nameGap: small ? 7 : 9,
      taglineGap: small ? 8 : 10,
      wordSpacing: "0.25em",
    };
  }

  // Tablet
  if (width < 1024) {
    const mult = HERO_CONTENT_INSET_MULTIPLIER.tablet;
    const tileWidth = isShort ? 68 : 72;
    return {
      isMobile: false,
      overlayWidth: "42%",
      tileWidth,
      tileBorder: 2,
      contentTopPx,
      contentLeft: 14 * mult,
      contentRight: 20 * mult,
      contentBottom: isShort ? 24 : 28,
      gapAfterTile: isShort ? 12 : 14,
      accentGap: 12,
      nameSize: isShort ? 18 : 20,
      taglineSize: isShort ? 12 : 13,
      bodySize: isShort ? 11 : 12,
      nameGap: isShort ? 20 : 24,
      taglineGap: isShort ? 12 : 14,
      wordSpacing: "0.25em",
    };
  }

  // Laptop 1024–1279 — interpolated between tablet and desktop
  if (width < 1280) {
    const t = clamp01((width - 1024) / (1280 - 1024));
    const mult = HERO_CONTENT_INSET_MULTIPLIER.laptop;
    const tileWidth = Math.round(lerp(76, 92, t));
    const paddingLeft = Math.round(lerp(15, 18, t));
    const paddingRight = Math.round(lerp(22, 24, t));

    return {
      isMobile: false,
      overlayWidth: `${lerp(40, 36, t).toFixed(1)}%`,
      tileWidth,
      tileBorder: 1,
      contentTopPx,
      contentLeft: paddingLeft * mult,
      contentRight: paddingRight * mult,
      contentBottom: isShort ? 28 : 32,
      gapAfterTile: isShort ? 14 : 16,
      accentGap: 12,
      nameSize: Math.round(lerp(22, 26, t)),
      taglineSize: Math.round(lerp(15, 17, t)),
      bodySize: Math.round(lerp(14, 15, t)),
      nameGap: isShort ? 22 : Math.round(lerp(24, 28, t)),
      taglineGap: isShort ? 14 : Math.round(lerp(14, 16, t)),
      wordSpacing: "0.28em",
    };
  }

  // Desktop 1280+
  const mult = HERO_CONTENT_INSET_MULTIPLIER.desktop;
  const tileWidth = isShort ? 88 : 96;

  return {
    isMobile: false,
    overlayWidth: "35%",
    tileWidth,
    tileBorder: 1,
    contentTopPx,
    contentLeft: 18 * mult,
    contentRight: 24 * mult,
    contentBottom: isShort ? 28 : 32,
    gapAfterTile: isShort ? 14 : 16,
    accentGap: 14,
    nameSize: isShort ? 24 : 28,
    taglineSize: isShort ? 16 : 18,
    bodySize: isShort ? 14 : 16,
    nameGap: isShort ? 22 : 28,
    taglineGap: isShort ? 14 : 16,
    wordSpacing: "0.3em",
  };
}

function getNavbarClearancePx(): number {
  if (typeof window === "undefined") return 96;
  const nav = document.getElementById("site-navbar");
  if (!nav) return 96;
  const rect = nav.getBoundingClientRect();
  return rect.bottom > 0 ? rect.bottom + 8 : 96;
}

const XL_BREAKPOINT_PX = 1280;
const MIN_TEXT_FIT = 0.8;
/** Phones: just below the ~57px navbar. */
const MOBILE_CONTENT_TOP_PX = 72;
/** Phones: lowest tile stop stays above the HCG title mark in the bottom-left corner. */
const MOBILE_TILE_BOTTOM_GAP_PX = 64;
/** Phones: share of the tile that sits over the panel — just a lip, so the narrow panel keeps its width for the copy. */
const MOBILE_TILE_PANEL_OVERLAP = 0.15;
const MOBILE_TILE_TRANSLATE_X = `${Math.round(MOBILE_TILE_PANEL_OVERLAP * 100)}%`;

/** Phone / tablet / desktop panel width. CSS, so the first paint matches the screen and does not shift. */
const HERO_PANEL =
  "w-[58%] sm:w-[42%] lg:w-[38%] xl:w-[35%]";
const HERO_PANEL_RIGHT =
  "right-[58%] sm:right-[42%] lg:right-[38%] xl:right-[35%]";

function HeroBackground({
  desktopSrc,
  mobileSrc,
  active,
  priority,
}: {
  desktopSrc: string;
  mobileSrc?: string;
  active: boolean;
  priority: boolean;
}) {
  const className = cn(
    "absolute inset-0 z-0 h-full w-full object-cover transition-opacity duration-700",
    active ? "opacity-100" : "opacity-0"
  );

  if (!mobileSrc || mobileSrc === desktopSrc) {
    return (
      <Image
        src={desktopSrc}
        alt=""
        fill
        priority={priority}
        quality={65}
        sizes="100vw"
        className={className}
      />
    );
  }

  const shared = { alt: "", fill: true as const, quality: 65, sizes: "100vw" };
  const {
    props: { srcSet: desktopSet },
  } = getImageProps({ ...shared, src: desktopSrc });
  const {
    props: { srcSet: mobileSet, ...mobileProps },
  } = getImageProps({ ...shared, src: mobileSrc });

  if (priority) {
    const first = (srcSet?: string) => srcSet?.split(",")[0]?.trim().split(" ")[0];
    const mobileHref = first(mobileSet);
    const desktopHref = first(desktopSet);
    if (mobileHref && mobileSet) {
      preload(mobileHref, {
        as: "image",
        fetchPriority: "high",
        imageSrcSet: mobileSet,
        imageSizes: "100vw",
        media: "(max-width: 639px)",
      });
    }
    if (desktopHref && desktopSet) {
      preload(desktopHref, {
        as: "image",
        fetchPriority: "high",
        imageSrcSet: desktopSet,
        imageSizes: "100vw",
        media: "(min-width: 640px)",
      });
    }
  }

  return (
    <picture className="absolute inset-0 z-0 block">
      <source media="(max-width: 639px)" srcSet={mobileSet} sizes="100vw" />
      <source media="(min-width: 640px)" srcSet={desktopSet} sizes="100vw" />
      <img
        {...mobileProps}
        alt=""
        fetchPriority={priority ? "high" : "low"}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        className={className}
      />
    </picture>
  );
}

function isDonationOverlayOpen(): boolean {
  return typeof document !== "undefined" &&
    document.body.dataset.donationOverlayOpen === "true";
}

function getTileTranslateY(
  step: number,
  count: number,
  vh: number,
  tileH: number,
  navClearance: number
): number {
  const w = typeof window !== "undefined" ? window.innerWidth : 1280;

  const tabletExtra = w >= 640 && w < 1024 ? 28 : 0;
  const belowXlOffset = w < XL_BREAKPOINT_PX ? 12 : 0;

  const rawY =
    getHeroTileYFraction(step, count) * vh + belowXlOffset + tabletExtra;

  return Math.min(Math.max(rawY, navClearance), vh - tileH - 24);
}

// ============================================================================
// ANIMATED TEXT
// ============================================================================

function renderWordLines(
  text: string,
  active: boolean,
  exiting: boolean,
  direction: 1 | -1,
  wordSpacing: string,
  animateWords = true
) {
  const lines = text
    .trim()
    .split(/\r?\n/)
    .map((line) => line.split(/\s+/).filter(Boolean));

  if (!animateWords) {
    return (
      <span className="block">
        {lines.map((words, lineIdx) => (
          <span key={lineIdx} className="block">
            {words.length === 0 ? <br /> : words.join(" ")}
          </span>
        ))}
      </span>
    );
  }

  const translateIn = direction === 1 ? "translateY(110%)" : "translateY(-110%)";
  const translateOut = direction === 1 ? "translateY(-110%)" : "translateY(110%)";
  let wordIndex = 0;

  return (
    <span className="block">
      {lines.map((words, lineIdx) => (
        <span key={lineIdx} className="block">
          {words.length === 0 ? <br /> : null}
          {words.map((word, idx) => {
            const order = wordIndex++;
            const delay = active
              ? `${Math.min(order * 18, 300)}ms`
              : `${Math.min(order * 8, 120)}ms`;

            return (
              <span
                key={idx}
                style={{ display: "inline-block", overflow: "hidden", verticalAlign: "bottom" }}
              >
                <span
                  style={{
                    display: "inline-block",
                    transform: active ? "translateY(0)" : exiting ? translateOut : translateIn,
                    opacity: active ? 1 : exiting ? 0 : 0,
                    transition: `transform 650ms cubic-bezier(0.16, 1, 0.3, 1), opacity 400ms ease`,
                    transitionDelay: delay,
                    filter: active ? "blur(0px)" : exiting ? "blur(2px)" : "blur(0px)",
                  }}
                >
                  {word}
                </span>
                {/* A real space (collapsed inside the fixed-width box) so copied and indexed text keeps word breaks */}
                {idx < words.length - 1 && (
                  <span style={{ display: "inline-block", width: wordSpacing }}> </span>
                )}
              </span>
            );
          })}
        </span>
      ))}
    </span>
  );
}

function StoryTextBlock({
  step,
  active,
  exiting,
  direction,
  layout,
}: {
  step: HeroTileStep;
  active: boolean;
  exiting: boolean;
  direction: 1 | -1;
  layout: HeroResponsiveLayout;
}) {
  const frameRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Long CMS stories shrink (down to MIN_TEXT_FIT) instead of running past the panel.
  useLayoutEffect(() => {
    const frame = frameRef.current;
    const content = contentRef.current;
    if (!frame || !content) return;
    const fit = () => {
      const cs = getComputedStyle(frame);
      const available =
        frame.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
      let scale = 1;
      frame.style.setProperty("--fit", "1");
      for (let i = 0; i < 6; i++) {
        const needed = content.offsetHeight;
        if (needed <= available || scale <= MIN_TEXT_FIT) break;
        scale = Math.max(MIN_TEXT_FIT, scale * Math.max(0.9, Math.sqrt(available / needed)));
        frame.style.setProperty("--fit", scale.toFixed(3));
      }
    };
    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(frame);
    return () => observer.disconnect();
  }, [layout, step]);

  // The phone panel sits over busy photos, so text gets a soft shadow there for legibility.
  const mobileShadow: CSSProperties = layout.isMobile
    ? { textShadow: "0 1px 3px rgba(0,0,0,0.28)" }
    : {};
  const textStyle = (size: number, weight: number, color: string, extra?: CSSProperties) => ({
    fontSize: `calc(var(--fit, 1) * ${size}px)`,
    fontWeight: weight,
    color,
    ...mobileShadow,
    ...extra,
  });

  // Without a name, the title takes the heading slot so it isn't left at tagline size.
  const heading = step.name || step.tagline;
  const subheading = step.name ? step.tagline : "";
  const hasHeading = Boolean(heading);
  const textColumnOffset = hasHeading ? 4 + layout.accentGap : 0;

  // Phones animate the story as one block: a per-word cascade over 60+ words stutters and hides text mid-read.
  const animateWords = !layout.isMobile;
  const words = (text: string) =>
    renderWordLines(text, active, exiting, direction, layout.wordSpacing, animateWords);
  const blockShift = 14 * direction;
  const blockMotion: CSSProperties = animateWords
    ? {}
    : {
        opacity: active ? 1 : 0,
        transform: active
          ? "translateY(0)"
          : `translateY(${exiting ? -blockShift : blockShift}px)`,
        transition: active
          ? "opacity 420ms ease 140ms, transform 560ms cubic-bezier(0.22,1,0.36,1) 140ms"
          : "opacity 220ms ease, transform 300ms ease",
      };

  return (
    <div
      ref={frameRef}
      className={cn(
        "pointer-events-none absolute inset-x-0 top-0 flex flex-col overflow-hidden font-manrope",
        layout.isMobile ? "justify-center" : "justify-start"
      )}
      style={{
        // Sized to the small viewport so mobile toolbars never cover the copy or its chatbot clearance.
        height: `calc(100svh - ${layout.contentTopPx}px)`,
        paddingTop: layout.gapAfterTile,
        paddingBottom: layout.contentBottom,
        paddingLeft: layout.contentLeft,
        paddingRight: layout.contentRight,
        marginTop: layout.contentTopPx,
      }}
    >
      <div ref={contentRef} className="w-full max-w-full" style={blockMotion}>
        {hasHeading ? (
          <div className="flex items-stretch" style={{ gap: layout.accentGap }}>
            <span
              className="w-1 shrink-0 self-stretch rounded-full"
              style={{ backgroundColor: HERO_NAME_ACCENT_COLOR }}
              aria-hidden
            />
            <div
              className="min-w-0 flex-1 text-balance"
              style={textStyle(layout.nameSize, 700, "white", { lineHeight: 1.2 })}
            >
              {words(heading)}
            </div>
          </div>
        ) : null}

        {subheading ? (
          <div
            className="text-balance"
            style={{
              paddingLeft: textColumnOffset,
              ...textStyle(layout.taglineSize, layout.isMobile ? 600 : 700, "white", {
                marginTop: layout.nameGap,
                lineHeight: 1.4,
              }),
            }}
          >
            {words(subheading)}
          </div>
        ) : null}

        <div
          style={{
            paddingLeft: textColumnOffset,
            ...textStyle(layout.bodySize, layout.isMobile ? 500 : 400, layout.isMobile ? "rgba(255,255,255,0.92)" : "rgba(255,255,255,0.95)", {
              marginTop: subheading ? layout.taglineGap : layout.nameGap,
              lineHeight: layout.bodyLineHeight ?? 1.65,
              ...(layout.isMobile
                ? { overflowWrap: "break-word", hyphens: "auto", WebkitHyphens: "auto" }
                : {}),
            }),
          }}
        >
          {words(step.body)}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN
// ============================================================================

export default function TileScrollSection({
  steps,
  initialIsMobile = false,
}: {
  steps: HeroTileStep[];
  initialIsMobile?: boolean;
}) {
  const stepCount = steps.length;
  const wrapperRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const tileRef = useRef<HTMLDivElement>(null);
  // 100svh: the viewport with mobile browser toolbars shown. Layout keys off it so the toolbar
  // sliding in and out mid-scroll doesn't resize or reflow the hero.
  const viewportProbeRef = useRef<HTMLDivElement>(null);

  const [activeStep, setActiveStep] = useState(0);
  const [exitStep, setExitStep] = useState<number | null>(null);
  const [direction, setDirection] = useState<1 | -1>(1);
  // Same value on the server and the first client render. Reading the window here
  // made the hero HTML differ on phones and React threw away the server page.
  const [layout, setLayout] = useState<HeroResponsiveLayout>(() =>
    initialIsMobile ? getResponsiveValues(390, 800) : getResponsiveValues(1280, 900)
  );

  const currentStepRef = useRef(0);
  const isAnimatingRef = useRef(false);
  const isResettingRef = useRef(false);
  const isPinnedRef = useRef(false);
  const navClearanceRef = useRef(getNavbarClearancePx());
  const layoutRef = useRef(layout);
  const layoutSizeRef = useRef("");

  const getViewportHeight = useCallback(
    () => viewportProbeRef.current?.offsetHeight || window.innerHeight,
    []
  );

  const syncLayout = useCallback(() => {
    if (typeof window === "undefined") return;
    navClearanceRef.current = getNavbarClearancePx();
    const width = window.innerWidth;
    const height = getViewportHeight();
    const size = `${width}x${height}`;
    if (size === layoutSizeRef.current) return;
    layoutSizeRef.current = size;
    const next = getResponsiveValues(width, height);
    layoutRef.current = next;
    setLayout(next);
  }, [getViewportHeight]);

  const moveTile = useCallback((step: number) => {
    const tile = tileRef.current;
    if (!tile) return;
    const vh = getViewportHeight();
    const tileH = tile.offsetHeight;

    // Phones: evenly spaced stops from just under the navbar down to just above the bottom corner.
    if (layoutRef.current.isMobile) {
      const top = MOBILE_CONTENT_TOP_PX;
      const bottom = Math.max(top, vh - tileH - MOBILE_TILE_BOTTOM_GAP_PX);
      const y = top + (stepCount > 1 ? (step / (stepCount - 1)) * (bottom - top) : 0);
      tile.style.transform = `translateX(${MOBILE_TILE_TRANSLATE_X}) translateY(${Math.round(y)}px)`;
      return;
    }

    const newY = getTileTranslateY(step, stepCount, vh, tileH, navClearanceRef.current);
    tile.style.transform = `translateX(50%) translateY(${newY}px)`;
  }, [stepCount, getViewportHeight]);

  const applyStep = useCallback(
    (step: number, force = false) => {
      if (step === currentStepRef.current && !force) return;
      const prev = currentStepRef.current;
      const dir: 1 | -1 = step > prev ? 1 : -1;
      currentStepRef.current = step;

      setDirection(dir);
      setExitStep(prev);
      setActiveStep(step);
      setTimeout(() => setExitStep(null), 500);

      moveTile(step);
    },
    [moveTile]
  );

  /** Scroll distance over which the hero stays pinned; each story owns an equal share of it. */
  const getPinnedRange = useCallback(() => {
    const wrapper = wrapperRef.current;
    const hero = heroRef.current;
    if (!wrapper || !hero) return 0;
    return Math.max(0, wrapper.offsetHeight - hero.offsetHeight);
  }, []);

  const scrollToStep = useCallback(
    (step: number) => {
      const wrapper = wrapperRef.current;
      if (!wrapper || stepCount <= 1) return;
      const wrapperTop = wrapper.getBoundingClientRect().top + window.scrollY;
      const targetScrollY = wrapperTop + (step / (stepCount - 1)) * getPinnedRange();
      window.scrollTo({ top: targetScrollY, behavior: "smooth" });
    },
    [stepCount, getPinnedRange]
  );

  // Touch screens scroll natively (a touch scroll can't be cancelled once momentum starts, so hijacking it
  // fights the browser). Snap points at each story make one swipe land on the next story; proximity
  // snapping releases the page once the visitor scrolls on past the hero.
  useEffect(() => {
    if (!window.matchMedia("(pointer: coarse)").matches) return;
    const root = document.documentElement;
    const previous = root.style.scrollSnapType;
    root.style.scrollSnapType = "y proximity";
    return () => {
      root.style.scrollSnapType = previous;
    };
  }, []);

  // The scroll position decides the story, so touch, keyboard, scrollbar and wheel all stay in sync.
  const handleScroll = useCallback(() => {
    if (isDonationOverlayOpen()) return;
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    const scrolled = -wrapper.getBoundingClientRect().top;
    const range = getPinnedRange();
    const lastStep = Math.max(0, stepCount - 1);

    isPinnedRef.current = scrolled >= 0 && scrolled < range - 1;
    if (isResettingRef.current || isAnimatingRef.current) return;

    if (scrolled <= 0 || range <= 0) applyStep(0);
    else if (scrolled >= range) applyStep(lastStep);
    else applyStep(Math.round((scrolled / range) * lastStep));
  }, [applyStep, stepCount, getPinnedRange]);

  // Mouse wheels and trackpads step one story per gesture while the hero is pinned.
  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      if (isDonationOverlayOpen()) return;
      if (!isPinnedRef.current) return;
      if (isAnimatingRef.current) {
        e.preventDefault();
        return;
      }

      const dir = e.deltaY > 0 ? 1 : -1;
      const current = currentStepRef.current;
      const next = Math.min(stepCount - 1, Math.max(0, current + dir));
      if (next === current) return;

      e.preventDefault();
      isAnimatingRef.current = true;
      applyStep(next);
      scrollToStep(next);
      setTimeout(() => {
        isAnimatingRef.current = false;
        handleScroll();
      }, 700);
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    return () => window.removeEventListener("wheel", onWheel);
  }, [applyStep, scrollToStep, handleScroll, stepCount]);

  const resetToTop = useCallback(
    (smooth = true) => {
      isResettingRef.current = true;
      isAnimatingRef.current = true;

      applyStep(0, true);
      handleScroll();

      window.scrollTo({ top: 0, left: 0, behavior: smooth ? "smooth" : "auto" });
      if (!smooth) {
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
      }

      const finish = () => {
        isResettingRef.current = false;
        isAnimatingRef.current = false;
        handleScroll();
      };

      window.setTimeout(finish, smooth ? 900 : 50);
    },
    [applyStep, handleScroll]
  );

  useEffect(() => {
    const onHeroReset = (event: Event) => {
      const detail = (event as CustomEvent<HeroResetDetail>).detail;
      resetToTop(detail?.smooth !== false);
    };

    window.addEventListener(HERO_RESET_EVENT, onHeroReset);
    return () => window.removeEventListener(HERO_RESET_EVENT, onHeroReset);
  }, [resetToTop]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    queueMicrotask(() => handleScroll());
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  useLayoutEffect(() => {
    syncLayout();
    moveTile(0);
    applyStep(0, true);
  }, [moveTile, applyStep, syncLayout]);

  // Re-place the tile once React has applied the new layout (tile size changes per breakpoint).
  useEffect(() => {
    moveTile(currentStepRef.current);
  }, [layout, moveTile]);

  useEffect(() => {
    const onResize = () => {
      syncLayout();
      moveTile(currentStepRef.current);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [moveTile, syncLayout]);

  return (
    <div
      ref={wrapperRef}
      className="relative z-0"
      // Each story gets one small-viewport height of scroll; the hero itself is a large-viewport tall,
      // so mobile toolbars never uncover a gap beneath it.
      style={{ height: `calc(${Math.max(0, stepCount - 1)} * 100svh + 100lvh)` }}
    >
      {steps.map((_, i) => (
        <div
          key={`snap-${i}`}
          aria-hidden
          className="pointer-events-none absolute left-0 h-px w-px"
          style={{ top: `calc(${i} * 100svh)`, scrollSnapAlign: "start", scrollSnapStop: "always" }}
        />
      ))}
      <div
        aria-hidden
        className="pointer-events-none absolute top-full left-0 h-px w-px"
        style={{ scrollSnapAlign: "start" }}
      />

      <div
        ref={heroRef}
        className="sticky top-0 z-0 h-lvh w-full overflow-hidden bg-black"
      >
        <div
          ref={viewportProbeRef}
          aria-hidden
          className="pointer-events-none invisible absolute top-0 left-0 h-svh w-px"
        />
        {steps.map((step, i) =>
          i === activeStep || i === exitStep ? (
            <HeroBackground
              key={`bg-${i}`}
              desktopSrc={step.backgroundSrc}
              mobileSrc={step.mobileBackgroundSrc}
              active={activeStep === i}
              priority={i === 0}
            />
          ) : null
        )}

        <div className="pointer-events-none absolute inset-x-0 top-0 z-20 h-svh">
          <div className="absolute bottom-4 left-4 sm:bottom-5 sm:left-5 md:bottom-6 md:left-6">
            <Image
              src="/HCG Logo/TITLE.png"
              alt="HCG Foundation"
              width={120}
              height={40}
              className="h-auto w-16 opacity-65 brightness-0 invert sm:w-20 md:w-24"
            />
          </div>
        </div>

        <div
          className={cn(
            "absolute top-0 right-0 z-10 h-full bg-[linear-gradient(180deg,rgba(153,115,0,0.74)_0%,rgba(122,92,0,0.86)_100%)] sm:bg-none sm:bg-[rgba(153,115,0,0.7)]",
            HERO_PANEL
          )}
        >
          {steps.map((step, i) =>
            i === activeStep || i === exitStep ? (
              <StoryTextBlock
                key={`story-${i}`}
                step={step}
                active={activeStep === i}
                exiting={exitStep === i}
                direction={direction}
                layout={layout}
              />
            ) : null
          )}
        </div>

        <div
          ref={tileRef}
          className={cn(
            "absolute top-0 z-20 aspect-square will-change-transform",
            HERO_PANEL_RIGHT,
            "translate-x-[15%] sm:translate-x-1/2",
            layout.isMobile ? "overflow-hidden" : "border border-white bg-white"
          )}
          style={
            layout.isMobile
              ? {
                  width: layout.tileWidth,
                  boxShadow: "0 12px 30px rgba(0,0,0,0.45)",
                  backgroundColor: "#2B2410",
                  transition: "transform 650ms cubic-bezier(0.22,1,0.36,1)",
                }
              : {
                  width: layout.tileWidth,
                  borderWidth: layout.tileBorder,
                  boxShadow: "0 8px 24px rgba(0,0,0,0.35)",
                  transition: "transform 600ms cubic-bezier(0.4,0,0.2,1)",
                }
          }
        >
          {steps.map((step, i) =>
            i === activeStep || i === exitStep ? (
            <Image
              key={`tile-${i}`}
              src={step.tileImageSrc}
              alt={step.name || step.tagline}
              fill
              quality={65}
              className={cn(
                "object-cover transition-[opacity,transform] duration-500",
                activeStep === i ? "opacity-100" : "opacity-0",
                layout.isMobile && (activeStep === i ? "scale-100" : "scale-110")
              )}
              sizes={`${layout.tileWidth * 2}px`}
            />
            ) : null
          )}
        </div>
      </div>
    </div>
  );
}
