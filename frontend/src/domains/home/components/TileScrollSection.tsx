"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import {
  HERO_CONTENT_INSET_MULTIPLIER,
  HERO_CONTENT_TOP_FRACTION,
  HERO_NAME_ACCENT_COLOR,
  HERO_OVERLAY_BG,
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

  // Mobile — wider panel + fixed insets so accent line has room on the left
  if (width < 640) {
    const tileWidth = isShort ? 48 : 52;
    return {
      isMobile: true,
      overlayWidth: "65%",
      tileWidth,
      tileBorder: 2,
      // Small phones start the copy higher so the longest stories still fit above the fold.
      contentTopPx: height < 720 ? height * 0.4 : contentTopPx,
      contentLeft: 30,
      // Clears the fixed "Donate Now" side tab (~34px wide on phones).
      contentRight: 44,
      contentBottom: isShort ? 18 : 22,
      gapAfterTile: isShort ? 8 : 10,
      accentGap: 10,
      nameSize: isShort ? 18 : 20,
      taglineSize: isShort ? 13 : 14,
      bodySize: isShort ? 13 : 14,
      bodyLineHeight: height < 700 ? 1.4 : isShort ? 1.45 : 1.55,
      nameGap: isShort ? 10 : 16,
      taglineGap: isShort ? 8 : 12,
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

  const mobileExtra = w < 640 ? 48 : 0;
  const tabletExtra = w >= 640 && w < 1024 ? 28 : 0;
  const belowXlOffset = w < XL_BREAKPOINT_PX ? 12 : 0;

  const rawY =
    getHeroTileYFraction(step, count) * vh + belowXlOffset + mobileExtra + tabletExtra;

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
  wordSpacing: string
) {
  const lines = text
    .trim()
    .split(/\r?\n/)
    .map((line) => line.split(/\s+/).filter(Boolean));
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
  // The phone panel is narrow and sits over busy photos, so text gets a soft shadow there for legibility.
  const mobileShadow: CSSProperties = layout.isMobile
    ? { textShadow: "0 1px 3px rgba(0,0,0,0.28)" }
    : {};
  const textStyle = (size: number, weight: number, color: string, extra?: CSSProperties) => ({
    fontSize: size,
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

  return (
    <div
      className="pointer-events-none absolute inset-0 flex flex-col justify-start overflow-hidden font-manrope"
      style={{
        paddingTop: layout.gapAfterTile,
        paddingBottom: layout.contentBottom,
        paddingLeft: layout.contentLeft,
        paddingRight: layout.contentRight,
        marginTop: layout.contentTopPx,
      }}
    >
      <div className="w-full max-w-full">
        {hasHeading ? (
          <div className="flex items-stretch" style={{ gap: layout.accentGap }}>
            <span
              className="w-1 shrink-0 self-stretch rounded-full"
              style={{ backgroundColor: HERO_NAME_ACCENT_COLOR }}
              aria-hidden
            />
            <div
              className="min-w-0 flex-1"
              style={textStyle(layout.nameSize, 700, "white", { lineHeight: 1.2 })}
            >
              {renderWordLines(heading, active, exiting, direction, layout.wordSpacing)}
            </div>
          </div>
        ) : null}

        {subheading ? (
          <div
            style={{
              paddingLeft: textColumnOffset,
              ...textStyle(layout.taglineSize, 700, "white", {
                marginTop: layout.nameGap,
                lineHeight: 1.4,
              }),
            }}
          >
            {renderWordLines(subheading, active, exiting, direction, layout.wordSpacing)}
          </div>
        ) : null}

        <div
          style={{
            paddingLeft: textColumnOffset,
            ...textStyle(layout.bodySize, layout.isMobile ? 500 : 400, layout.isMobile ? "white" : "rgba(255,255,255,0.95)", {
              marginTop: subheading ? layout.taglineGap : layout.nameGap,
              lineHeight: layout.bodyLineHeight ?? 1.65,
            }),
          }}
        >
          {renderWordLines(step.body, active, exiting, direction, layout.wordSpacing)}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN
// ============================================================================

type PinMode = "before" | "pinned" | "after";

export default function TileScrollSection({ steps }: { steps: HeroTileStep[] }) {
  const stepCount = steps.length;
  const wrapperRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const tileRef = useRef<HTMLDivElement>(null);

  const [pinMode, setPinMode] = useState<PinMode>("before");
  const [activeStep, setActiveStep] = useState(0);
  const [exitStep, setExitStep] = useState<number | null>(null);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [layout, setLayout] = useState<HeroResponsiveLayout>(() =>
    getResponsiveValues(
      typeof window !== "undefined" ? window.innerWidth : 1280,
      typeof window !== "undefined" ? window.innerHeight : 900
    )
  );

  const currentStepRef = useRef(0);
  const isAnimatingRef = useRef(false);
  const isResettingRef = useRef(false);
  const isPinnedRef = useRef(false);
  const navClearanceRef = useRef(getNavbarClearancePx());
  const layoutRef = useRef(layout);

  const syncLayout = useCallback(() => {
    if (typeof window === "undefined") return;
    const next = getResponsiveValues(window.innerWidth, window.innerHeight);
    layoutRef.current = next;
    setLayout(next);
    navClearanceRef.current = getNavbarClearancePx();
  }, []);

  const moveTile = useCallback((step: number) => {
    const tile = tileRef.current;
    if (!tile) return;
    const vh = window.innerHeight;
    const tileH = tile.offsetHeight;
    const newY = getTileTranslateY(step, stepCount, vh, tileH, navClearanceRef.current);
    tile.style.transform = `translateX(50%) translateY(${newY}px)`;
  }, [stepCount]);

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

  const scrollToStep = useCallback(
    (step: number) => {
      const wrapper = wrapperRef.current;
      if (!wrapper || stepCount <= 1) return;
      const vh = window.innerHeight;
      const total = wrapper.offsetHeight - vh;
      const targetScrollY = wrapper.offsetTop + (step / (stepCount - 1)) * total;
      window.scrollTo({ top: targetScrollY, behavior: "smooth" });
    },
    [stepCount]
  );

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
      }, 700);
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    return () => window.removeEventListener("wheel", onWheel);
  }, [applyStep, scrollToStep, stepCount]);

  useEffect(() => {
    let touchStartY = 0;
    let touchLastY = 0;
    let touchAccumulated = 0;

    const onTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
      touchLastY = touchStartY;
      touchAccumulated = 0;
    };

    const advanceFromTouch = (e: TouchEvent, delta: number) => {
      if (isDonationOverlayOpen()) return false;
      if (!isPinnedRef.current) return false;
      if (isAnimatingRef.current) {
        e.preventDefault();
        return true;
      }

      if (Math.abs(delta) < 30) return false;

      const dir = delta > 0 ? 1 : -1;
      const current = currentStepRef.current;
      const next = Math.min(stepCount - 1, Math.max(0, current + dir));
      if (next === current) return false;

      e.preventDefault();
      isAnimatingRef.current = true;
      applyStep(next);
      scrollToStep(next);
      setTimeout(() => {
        isAnimatingRef.current = false;
      }, 700);
      return true;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (isDonationOverlayOpen()) return;
      if (!isPinnedRef.current) return;

      const currentY = e.touches[0].clientY;
      const frameDelta = touchLastY - currentY;
      touchLastY = currentY;
      touchAccumulated += frameDelta;

      if (isAnimatingRef.current) {
        e.preventDefault();
        return;
      }

      if (Math.abs(touchAccumulated) < 50) return;

      const consumed = advanceFromTouch(e, touchAccumulated);
      if (consumed) touchAccumulated = 0;
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (isDonationOverlayOpen()) return;
      if (!isPinnedRef.current || isAnimatingRef.current) return;
      const diff = touchStartY - e.changedTouches[0].clientY;
      advanceFromTouch(e, diff);
      touchAccumulated = 0;
    };

    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onTouchEnd, { passive: false });
    return () => {
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [applyStep, scrollToStep, stepCount]);

  const handleScroll = useCallback(() => {
    if (isDonationOverlayOpen()) return;
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    const rect = wrapper.getBoundingClientRect();
    const vh = window.innerHeight;

    if (rect.top > 0) {
      isPinnedRef.current = false;
      setPinMode("before");
      if (!isResettingRef.current) applyStep(0);
    } else if (rect.bottom > vh + 1) {
      isPinnedRef.current = true;
      setPinMode("pinned");
    } else {
      isPinnedRef.current = false;
      setPinMode("after");
      if (!isResettingRef.current) applyStep(Math.max(0, stepCount - 1));
    }
  }, [applyStep, stepCount]);

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

  useEffect(() => {
    syncLayout();
    moveTile(0);
    applyStep(0, true);
  }, [moveTile, applyStep, syncLayout]);

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
      style={{ height: `${Math.max(1, stepCount) * 100}vh` }}
    >
      <div
        ref={heroRef}
        className={cn(
          "h-screen w-full overflow-hidden bg-black",
          pinMode === "pinned" && "fixed top-0 left-0 right-0 z-0 pointer-events-none",
          pinMode === "after" && "absolute bottom-0 left-0 right-0 z-0",
          pinMode === "before" && "relative z-0"
        )}
      >
        {steps.map((step, i) => (
          <Image
            key={`bg-${i}`}
            src={
              layout.isMobile && step.mobileBackgroundSrc
                ? step.mobileBackgroundSrc
                : step.backgroundSrc
            }
            alt=""
            fill
            priority={i === 0}
            sizes="100vw"
            className={cn(
              "absolute inset-0 z-0 object-cover transition-opacity duration-700",
              activeStep === i ? "opacity-100" : "opacity-0"
            )}
          />
        ))}

        <div className="pointer-events-none absolute bottom-4 left-4 z-10 sm:bottom-5 sm:left-5 md:bottom-6 md:left-6">
          <Image
            src="/HCG Logo/TITLE.png"
            alt="HCG Foundation"
            width={120}
            height={40}
            className="h-auto w-16 opacity-65 brightness-0 invert sm:w-20 md:w-24"
          />
        </div>

        <div
          className="absolute top-0 right-0 z-10 h-full"
          style={{
            width: layout.overlayWidth,
            backgroundColor: HERO_OVERLAY_BG,
          }}
        >
          {steps.map((step, i) => (
            <StoryTextBlock
              key={`story-${i}`}
              step={step}
              active={activeStep === i}
              exiting={exitStep === i}
              direction={direction}
              layout={layout}
            />
          ))}
        </div>

        <div
          ref={tileRef}
          className="absolute top-0 z-20 aspect-square will-change-transform"
          style={{
            width: layout.tileWidth,
            borderWidth: layout.tileBorder,
            borderStyle: "solid",
            borderColor: "white",
            backgroundColor: "white",
            boxShadow: "0 8px 24px rgba(0,0,0,0.35)",
            transition: "transform 600ms cubic-bezier(0.4,0,0.2,1)",
            right: layout.overlayWidth,
            transform: "translateX(50%) translateY(0)",
          }}
        >
          {steps.map((step, i) => (
            <Image
              key={`tile-${i}`}
              src={step.tileImageSrc}
              alt={step.name || step.tagline}
              fill
              className={cn(
                "object-cover transition-opacity duration-500",
                activeStep === i ? "opacity-100" : "opacity-0"
              )}
              sizes={`${layout.tileWidth}px`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
