"use client";

/**
 * Home hero — pinned scroll, one CMS banner per step.
 *
 * Layout: phone panel (≤1023px wide, or short viewport below 1280px) vs laptop vs desktop.
 * Profile tile transform is applied imperatively in moveTile() (not via React style) so scroll
 * steps stay in sync without reconciliation flicker.
 */

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
  HERO_OVERLAY_BG,
  HERO_SHORT_VIEWPORT_PX,
  getHeroTileYFraction,
  type HeroTileStep,
} from "@/domains/home/constants/heroTileScroll";
import {
  heroNavInsetCss,
  measureSiteNavbarBottom,
  publishSiteNavbarBottom,
} from "@/domains/home/constants/siteNavClearance";
import {
  HERO_RESET_EVENT,
  type HeroResetDetail,
} from "@/domains/home/utils/heroScrollReset";

// ============================================================================
// CONSTANTS (keep in sync with Tailwind HERO_PANEL* classes below)
// ============================================================================

const XL_BREAKPOINT_PX = 1280;
/** Widths at or below this use the wide text panel + mobile tile track. */
const HERO_COMPACT_MAX_WIDTH_PX = 1023;
const MOBILE_PANEL_WIDTH = "55%";
const DESKTOP_PANEL_WIDTH = "50%";

const MIN_TEXT_FIT = 0.8;
const MIN_TEXT_FIT_MOBILE = 0.92;
const MOBILE_CONTENT_TOP_PX = 72;
const MOBILE_TILE_BOTTOM_GAP_PX = 64;
const MOBILE_TILE_PANEL_OVERLAP = 0.15;
const MOBILE_TILE_TRANSLATE_X = `${Math.round(MOBILE_TILE_PANEL_OVERLAP * 100)}%`;
const WIDE_COMPACT_COPY_GAP_PX = 16;
/** Fixed vertical Donate Now tab (see DonateButton) + margin so hero copy never sits under it. */
const HERO_SIDE_TAB_CLEARANCE_PX = 76;

function heroPanelRightInsetPx(basePx: number): number {
  return Math.max(basePx, HERO_SIDE_TAB_CLEARANCE_PX);
}

/** Wide gold panel (55%): scaled right inset — not the 76px donate min (narrows copy too much). */
function widePanelContentRightPx(viewportWidth: number, panelFraction = 0.55): number {
  const panelPx = viewportWidth * panelFraction;
  return Math.round(Math.min(50, Math.max(36, panelPx * 0.17)));
}

const HERO_OVERLAY_BG_MOBILE =
  "linear-gradient(180deg, rgba(153,115,0,0.74) 0%, rgba(122,92,0,0.86) 100%)";

/** Fallback SSR / first paint; exact width comes from layout inline styles. */
const HERO_PANEL = "w-[55%] xl:w-[50%]";
const HERO_PANEL_RIGHT = "right-[55%] xl:right-[50%]";

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
  /** Short viewport: top copy anchor, text shrink-to-fit, no word animation. */
  compactText: boolean;
  /** Copy column starts under the profile tile (wide + short viewports). */
  textBelowTile: boolean;
  overlayWidth: string;
  tileWidth: number;
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

function usesPhoneHeroLayout(width: number, height: number): boolean {
  const isShort = height < HERO_SHORT_VIEWPORT_PX;
  return width <= HERO_COMPACT_MAX_WIDTH_PX || (isShort && width < XL_BREAKPOINT_PX);
}

function heroCopyTopPx(height: number, isShort: boolean, phoneLayout: boolean): number {
  if (phoneLayout || isShort) return MOBILE_CONTENT_TOP_PX;
  return height * HERO_CONTENT_TOP_FRACTION;
}

function phonePanelContentTop(
  wideCompact: boolean,
  tileWidth: number,
  height: number,
  isShort: boolean
): number {
  if (wideCompact) {
    return MOBILE_CONTENT_TOP_PX + tileWidth + WIDE_COMPACT_COPY_GAP_PX;
  }
  return heroCopyTopPx(height, isShort, true);
}

/** Short viewports: profile tile sits high on the panel seam — copy starts under it. */
function shortViewportCopyTopPx(tileWidth: number): number {
  return MOBILE_CONTENT_TOP_PX + tileWidth + WIDE_COMPACT_COPY_GAP_PX;
}

function getResponsiveValues(width: number, height: number): HeroResponsiveLayout {
  const isShort = height < HERO_SHORT_VIEWPORT_PX;
  const phoneLayout = usesPhoneHeroLayout(width, height);

  // Compact (phones + narrow tablets/devtools). Word-by-word animation and the desktop 50% copy anchor
  // break in a narrow panel (~671px was clipping text and merging words).
  if (phoneLayout) {
    const small = height < 700;
    const wideCompact = width > HERO_COMPACT_MAX_WIDTH_PX;
    const tileWidth = wideCompact ? 96 : small ? 84 : 96;
    return {
      isMobile: true,
      compactText: true,
      textBelowTile: wideCompact,
      overlayWidth: MOBILE_PANEL_WIDTH,
      tileWidth,
      contentTopPx: phonePanelContentTop(wideCompact, tileWidth, height, isShort),
      contentLeft: Math.round(tileWidth * MOBILE_TILE_PANEL_OVERLAP) + 8,
      contentRight: widePanelContentRightPx(width),
      contentBottom: 168,
      gapAfterTile: 12,
      accentGap: 7,
      nameSize: small ? 18 : 20,
      taglineSize: small ? 13 : 14,
      bodySize: wideCompact ? 14 : small ? 13 : 14,
      bodyLineHeight: 1.5,
      nameGap: wideCompact ? 10 : small ? 7 : 9,
      taglineGap: wideCompact ? 10 : small ? 8 : 10,
      wordSpacing: "0.2em",
    };
  }

  // Laptop 1024–1279 — interpolated between compact and desktop (tall viewports only)
  if (width < 1280) {
    const t = clamp01((width - 1024) / (1280 - 1024));
    const mult = HERO_CONTENT_INSET_MULTIPLIER.laptop;
    const tileWidth = Math.round(lerp(76, 92, t));
    const paddingLeft = Math.round(lerp(15, 18, t));
    const paddingRight = Math.round(lerp(22, 24, t));

    return {
      isMobile: false,
      compactText: isShort,
      textBelowTile: isShort,
      overlayWidth: `${lerp(55, 50, t).toFixed(1)}%`,
      tileWidth,
      contentTopPx: isShort
        ? shortViewportCopyTopPx(tileWidth)
        : height * HERO_CONTENT_TOP_FRACTION,
      contentLeft: paddingLeft * mult,
      contentRight: widePanelContentRightPx(width, parseFloat(lerp(55, 50, t).toFixed(1)) / 100),
      contentBottom: isShort ? 168 : 120,
      gapAfterTile: isShort ? 14 : 16,
      accentGap: 12,
      bodyLineHeight: isShort ? 1.5 : undefined,
      nameSize: Math.round(lerp(22, 26, t)),
      taglineSize: Math.round(lerp(15, 17, t)),
      bodySize: Math.round(lerp(14, 15, t)),
      nameGap: isShort ? 22 : Math.round(lerp(24, 28, t)),
      taglineGap: isShort ? 14 : Math.round(lerp(14, 16, t)),
      wordSpacing: "0.2em",
    };
  }

  // Desktop 1280+
  const mult = HERO_CONTENT_INSET_MULTIPLIER.desktop;
  const tileWidth = isShort ? 88 : 96;

  return {
    isMobile: false,
    compactText: isShort,
    // Wide + short (e.g. 1536×538): tile sits on the panel seam — copy must start under it, not at 72px.
    textBelowTile: isShort,
    overlayWidth: DESKTOP_PANEL_WIDTH,
    tileWidth,
    contentTopPx: isShort
      ? shortViewportCopyTopPx(tileWidth)
      : height * HERO_CONTENT_TOP_FRACTION,
    contentLeft: 18 * mult,
    contentRight: heroPanelRightInsetPx(Math.round(24 * mult)),
    contentBottom: isShort ? 160 : 32,
    gapAfterTile: isShort ? 14 : 16,
    accentGap: 14,
    nameSize: isShort ? 24 : 28,
    taglineSize: isShort ? 16 : 18,
    bodySize: isShort ? 14 : 16,
    bodyLineHeight: isShort ? 1.5 : undefined,
    nameGap: isShort ? 22 : 28,
    taglineGap: isShort ? 14 : 16,
    wordSpacing: "0.2em",
  };
}

function getNavbarClearancePx(): number {
  return measureSiteNavbarBottom();
}

function minTileTopPx(navClearance: number): number {
  return Math.max(navClearance, MOBILE_CONTENT_TOP_PX);
}

/** Never start hero copy under the fixed navbar (all breakpoints). */
function withNavClearance(
  layout: HeroResponsiveLayout,
  navClearance: number
): HeroResponsiveLayout {
  const navFloor = minTileTopPx(navClearance);
  let contentTopPx = Math.max(layout.contentTopPx, navFloor);
  if (layout.textBelowTile) {
    contentTopPx = Math.max(
      contentTopPx,
      navFloor + layout.tileWidth + WIDE_COMPACT_COPY_GAP_PX
    );
  }
  if (contentTopPx === layout.contentTopPx) return layout;
  return { ...layout, contentTopPx };
}

function normalizeStorySpaces(text: string): string {
  return text
    .replace(/\u00a0/g, " ")
    .replace(/[^\S\r\n]+/g, " ")
    .replace(/,(\S)/g, ", $1")
    .replace(/;(\S)/g, "; $1")
    .replace(/\.([A-Za-z(])/g, ". $1");
}

/** CMS: title in accent row, name on the line below (tagline size). */
function resolveStoryCopy(step: HeroTileStep): { heading: string; subheading: string } {
  const name = step.name.trim();
  const title = step.tagline.trim();
  return {
    heading: title || name,
    subheading: title && name ? name : "",
  };
}

/**
 * PERF: picks the phone or desktop photo with <picture> media queries, and preloads only the one that
 * will be used. Previously the server preloaded the desktop photo and phones then downloaded a second
 * (mobile) photo after hydration.
 */
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
  // The outgoing photo stays on top and fades out over the new one, so the change looks the same
  // scrolling down as scrolling up (otherwise a later story's photo would pop in on top).
  const layer = active ? "z-0" : "z-[1]";
  const className = cn(
    "absolute inset-0 h-full w-full object-cover transition-opacity duration-700",
    layer,
    active ? "opacity-100" : "opacity-0"
  );

  if (!mobileSrc || mobileSrc === desktopSrc) {
    return (
      <Image
        src={desktopSrc}
        alt=""
        fill
        priority={priority}
        fetchPriority={priority ? "high" : undefined}
        quality={75}
        sizes="100vw"
        className={className}
      />
    );
  }

  const shared = { alt: "", fill: true as const, sizes: "100vw" };
  const {
    props: { srcSet: desktopSet },
  } = getImageProps({ ...shared, quality: 75, src: desktopSrc });
  const {
    props: { srcSet: mobileSet, ...mobileProps },
  } = getImageProps({ ...shared, quality: 65, src: mobileSrc });

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
        media: `(max-width: ${HERO_COMPACT_MAX_WIDTH_PX}px)`,
      });
    }
    if (desktopHref && desktopSet) {
      preload(desktopHref, {
        as: "image",
        fetchPriority: "high",
        imageSrcSet: desktopSet,
        imageSizes: "100vw",
        media: `(min-width: ${HERO_COMPACT_MAX_WIDTH_PX + 1}px)`,
      });
    }
  }

  return (
    <picture className={cn("absolute inset-0 block", layer)}>
      <source media={`(max-width: ${HERO_COMPACT_MAX_WIDTH_PX}px)`} srcSet={mobileSet} sizes="100vw" />
      <source media={`(min-width: ${HERO_COMPACT_MAX_WIDTH_PX + 1}px)`} srcSet={desktopSet} sizes="100vw" />
      <img
        {...mobileProps}
        alt=""
        width={1920}
        height={1080}
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
  const belowXlOffset =
    typeof window !== "undefined" && window.innerWidth < XL_BREAKPOINT_PX ? 12 : 0;
  const rawY = getHeroTileYFraction(step, count) * vh + belowXlOffset;
  const minY = minTileTopPx(navClearance);
  return Math.min(Math.max(rawY, minY), vh - tileH - 24);
}

function mobileTileTranslateY(
  step: number,
  stepCount: number,
  vh: number,
  tileH: number,
  navClearance: number
): number {
  const top = minTileTopPx(navClearance);
  const bottom = Math.max(top, vh - tileH - MOBILE_TILE_BOTTOM_GAP_PX);
  if (stepCount <= 1) return top;
  return top + (step / (stepCount - 1)) * (bottom - top);
}

// ============================================================================
// ANIMATED TEXT  (all stories stay mounted so every enter/exit transition plays smoothly)
// ============================================================================

function renderWordLines(
  text: string,
  active: boolean,
  exiting: boolean,
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

  let wordIndex = 0;

  // Transform/opacity/blur/delay per state live in globals.css (.hero-words); each word only carries its index.
  return (
    <span
      className="hero-words block"
      data-state={active ? "active" : exiting ? "exiting" : "idle"}
      style={{ "--hw-gap": wordSpacing } as CSSProperties}
    >
      {lines.map((words, lineIdx) => (
        <span key={lineIdx} className="block">
          {words.length === 0 ? <br /> : null}
          {words.map((word, idx) => (
            <span key={idx} className="hw">
              <span style={{ "--i": wordIndex++ } as CSSProperties}>{word}</span>
              {/* A real space (collapsed inside the fixed-width box) so copied and indexed text keeps word breaks */}
              {idx < words.length - 1 && <span className="hs"> </span>}
            </span>
          ))}
        </span>
      ))}
    </span>
  );
}

function StoryTextBlock({
  step,
  active,
  exiting,
  layout,
}: {
  step: HeroTileStep;
  active: boolean;
  exiting: boolean;
  layout: HeroResponsiveLayout;
}) {
  const frameRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Long CMS stories shrink (down to the min fit) instead of running past the panel.
  //
  // PERF: this measures layout (forced reflow). Doing it for every hidden story at load blocks the main
  // thread, so only the visible story (active / exiting) is fitted immediately. Hidden stories are fitted
  // when the browser is idle, and again right away the moment they become active, so a story is always
  // correctly sized before it is shown.
  const needsNow = active || exiting;
  const compactText = layout.compactText;
  const showStory = active || exiting;
  useLayoutEffect(() => {
    const frame = frameRef.current;
    const content = contentRef.current;
    if (!frame || !content || !showStory) return;
    // Phones shrink less, so the copy never turns into fine print.
    const minFit = compactText ? MIN_TEXT_FIT_MOBILE : MIN_TEXT_FIT;
    const fit = () => {
      const cs = getComputedStyle(frame);
      const available =
        frame.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
      if (available <= 0) return;
      frame.style.setProperty("--fit", "1");
      const needed = content.offsetHeight;
      if (needed > available) {
        const ratio = Math.max(minFit, Math.min(1, Math.round((available / needed) * 100) / 100));
        frame.style.setProperty("--fit", ratio.toFixed(2));
      }
    };

    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(frame);
    return () => observer.disconnect();
  }, [layout, step, showStory, compactText]);

  // The phone panel sits over busy photos, so text gets a soft shadow there for legibility.
  const mobileShadow: CSSProperties = layout.compactText
    ? { textShadow: "0 1px 3px rgba(0,0,0,0.28)" }
    : {};

  // Phones: left-aligned, no hyphenation. Justified + hyphenated text in a narrow column gives
  // big word gaps and broken words ("includ-ing").
  const mobileTextFlow: CSSProperties = layout.compactText
    ? {
        textAlign: "left",
        hyphens: "none",
        WebkitHyphens: "none",
        overflowWrap: "break-word",
        wordBreak: "normal",
        whiteSpace: "normal",
      }
    : {};

  const { heading, subheading } = resolveStoryCopy(step);
  const hasHeading = Boolean(heading);
  const textColumnOffset = hasHeading ? 4 + layout.accentGap : 0;

  const animateWords = !layout.compactText;
  const words = (text: string) =>
    renderWordLines(
      normalizeStorySpaces(text),
      active,
      exiting,
      layout.wordSpacing,
      animateWords
    );

  const navInset = heroNavInsetCss(layout.contentTopPx);

  const scaledText = (
    sizePx: number,
    extra?: CSSProperties
  ): CSSProperties =>
    layout.compactText
      ? {
          fontSize: `calc(var(--fit, 1) * ${sizePx}px)`,
          ...mobileShadow,
          ...mobileTextFlow,
          ...extra,
        }
      : { fontSize: sizePx, ...extra };

  // Same motion in both scroll directions: the new story rises in from below, the old one lifts out.
  const blockMotion: CSSProperties = animateWords
    ? {}
    : {
      opacity: active ? 1 : 0,
      transform: active
        ? "translateY(0)"
        : `translateY(${exiting ? -14 : 14}px)`,
      transition: active
        ? "opacity 420ms ease 140ms, transform 560ms cubic-bezier(0.22,1,0.36,1) 140ms"
        : exiting
          ? "opacity 220ms ease, transform 300ms ease"
          : "none",
    };

  return (
    <div
      ref={frameRef}
      className="pointer-events-none absolute inset-x-0 flex flex-col justify-start overflow-hidden font-manrope"
      style={{
        // Absolute children ignore parent padding — inset from the viewport top via `top`, not panel paddingTop.
        top: navInset,
        height: `calc(100svh - ${navInset})`,
        paddingTop: layout.gapAfterTile,
        paddingBottom: layout.contentBottom,
        paddingLeft: layout.contentLeft,
        paddingRight: layout.contentRight,
        // Later steps are later in the DOM; without z-index an idle layer can cover the active story.
        zIndex: active ? 30 : exiting ? 20 : 0,
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
              className="min-w-0 flex-1 break-words font-manrope text-white"
              style={{
                ...scaledText(layout.nameSize, { fontWeight: 700, lineHeight: 1.2 }),
              }}
            >
              {words(heading)}
            </div>
          </div>
        ) : null}

        {subheading ? (
          <div
            className="min-w-0 break-words font-manrope text-white"
            style={{
              paddingLeft: textColumnOffset,
              ...scaledText(layout.taglineSize, {
                fontWeight: 700,
                marginTop: layout.nameGap,
                lineHeight: 1.4,
              }),
            }}
          >
            {words(subheading)}
          </div>
        ) : null}

        <div
          className="min-w-0 w-full max-w-full break-words font-manrope text-[rgba(255,255,255,0.95)]"
          style={{
            paddingLeft: textColumnOffset,
            ...scaledText(layout.bodySize, {
              fontWeight: 400,
              marginTop: subheading ? layout.taglineGap : layout.nameGap,
              lineHeight: layout.compactText ? layout.bodyLineHeight ?? 1.5 : 1.65,
              overflowWrap: "anywhere",
              ...(layout.compactText ? mobileTextFlow : {}),
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
  // Same value on the server and the first client render (hydration-safe).
  // SSR + hydration must match; real viewport is applied in useLayoutEffect below.
  const [layout, setLayout] = useState<HeroResponsiveLayout>(() =>
    initialIsMobile
      ? getResponsiveValues(390, 800)
      : getResponsiveValues(1280, 900)
  );
  // False on the server + hydration render: CSS classes position the panel/tile.
  // True after the first real measurement: exact inline values take over.
  const currentStepRef = useRef(0);
  const isAnimatingRef = useRef(false);
  const isResettingRef = useRef(false);
  const isPinnedRef = useRef(false);
  const exitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scrollRafRef = useRef(0);
  // PERF: the pinned range only changes on resize, so it is measured then instead of on every scroll event.
  const pinnedRangeRef = useRef(0);
  // Measured in syncLayout (layout effect). Calling getNavbarClearancePx() here would force a reflow on every render.
  const navClearanceRef = useRef(96);
  const layoutRef = useRef(layout);
  const layoutSizeRef = useRef("");
  useEffect(() => {
    layoutRef.current = layout;
  }, [layout]);

  const getViewportHeight = useCallback(
    () => viewportProbeRef.current?.offsetHeight || window.innerHeight,
    []
  );

  /** Scroll distance over which the hero stays pinned; each story owns an equal share of it. */
  const measurePinnedRange = useCallback(() => {
    const wrapper = wrapperRef.current;
    const hero = heroRef.current;
    if (!wrapper || !hero) return 0;
    const range = Math.max(0, wrapper.offsetHeight - hero.offsetHeight);
    pinnedRangeRef.current = range;
    return range;
  }, []);

  const getPinnedRange = useCallback(
    () => pinnedRangeRef.current || measurePinnedRange(),
    [measurePinnedRange]
  );

  const commitLayoutFromViewport = useCallback(
    (force = false) => {
      if (typeof window === "undefined") return;
      navClearanceRef.current = getNavbarClearancePx();
      const width = window.innerWidth;
      const height = getViewportHeight();
      const size = `${width}x${height}x${Math.round(navClearanceRef.current)}`;
      if (!force && size === layoutSizeRef.current) return;
      layoutSizeRef.current = size;
      const next = withNavClearance(
        getResponsiveValues(width, height),
        navClearanceRef.current
      );
      publishSiteNavbarBottom(navClearanceRef.current);
      layoutRef.current = next;
      setLayout(next);
    },
    [getViewportHeight]
  );

  const syncLayout = useCallback(() => {
    commitLayoutFromViewport(false);
  }, [commitLayoutFromViewport]);

  const moveTile = useCallback((step: number) => {
    const tile = tileRef.current;
    if (!tile) return;
    navClearanceRef.current = getNavbarClearancePx();
    const vh = getViewportHeight();
    const tileH = tile.offsetHeight;

    // Phones: evenly spaced stops from just under the navbar down to just above the bottom corner.
    const y = layoutRef.current.isMobile
      ? mobileTileTranslateY(step, stepCount, vh, tileH, navClearanceRef.current)
      : getTileTranslateY(step, stepCount, vh, tileH, navClearanceRef.current);

    const translateX = layoutRef.current.isMobile
      ? MOBILE_TILE_TRANSLATE_X
      : "50%";
    tile.style.transform = `translateX(${translateX}) translateY(${Math.round(y)}px)`;
  }, [stepCount, getViewportHeight]);

  const applyStep = useCallback(
    (step: number, force = false) => {
      if (step === currentStepRef.current && !force) return;
      const prev = currentStepRef.current;
      currentStepRef.current = step;

      setExitStep(prev);
      setActiveStep(step);

      // Clearing the previous timer stops an older timeout from ending a newer exit early.
      if (exitTimerRef.current) clearTimeout(exitTimerRef.current);
      exitTimerRef.current = setTimeout(() => setExitStep(null), 500);

      moveTile(step);
    },
    [moveTile]
  );

  useEffect(
    () => () => {
      if (exitTimerRef.current) clearTimeout(exitTimerRef.current);
    },
    []
  );

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
  // fights the browser). Snap points at each story make one swipe land near the next story; proximity
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

  const syncScrollGeometry = useCallback(() => {
    measurePinnedRange();
    moveTile(currentStepRef.current);
    handleScroll();
  }, [measurePinnedRange, moveTile, handleScroll]);

  const refreshNavClearance = useCallback(() => {
    commitLayoutFromViewport(true);
    syncScrollGeometry();
  }, [commitLayoutFromViewport, syncScrollGeometry]);

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

  // PERF: scroll events can fire several times per frame; handle at most once per frame.
  useEffect(() => {
    const onScroll = () => {
      if (scrollRafRef.current) return;
      scrollRafRef.current = requestAnimationFrame(() => {
        scrollRafRef.current = 0;
        handleScroll();
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    queueMicrotask(() => handleScroll());
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (scrollRafRef.current) {
        cancelAnimationFrame(scrollRafRef.current);
        scrollRafRef.current = 0;
      }
    };
  }, [handleScroll]);

  // First paint: replace SSR layout guess with the real viewport (hydration-safe useState above).
  useLayoutEffect(() => {
    commitLayoutFromViewport(true);
  }, [commitLayoutFromViewport]);

  // Wrapper height (70svh vs 100svh) depends on `layout` — remeasure scroll range after it commits.
  useLayoutEffect(() => {
    syncScrollGeometry();
  }, [layout, syncScrollGeometry]);

  // Navbar / svh can settle one frame after load; refresh so first visit matches client nav.
  useEffect(() => {
    let cancelled = false;
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (cancelled) return;
        refreshNavClearance();
      });
    });
    return () => {
      cancelled = true;
      cancelAnimationFrame(id);
    };
  }, [refreshNavClearance]);

  useEffect(() => {
    const onResize = () => {
      syncLayout();
      syncScrollGeometry();
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [syncLayout, syncScrollGeometry]);

  useEffect(() => {
    const nav = document.getElementById("site-navbar");
    if (!nav || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => refreshNavClearance());
    observer.observe(nav);
    return () => observer.disconnect();
  }, [refreshNavClearance]);

  // Phones: 70svh of scroll per story (was 55svh, which let a normal swipe skip a story).
  // Desktop: 100svh per story.
  const stepScrollUnit = layout.isMobile ? "70svh" : "100svh";

  if (stepCount === 0) return null;

  return (
    <div
      ref={wrapperRef}
      className="relative z-0"
      style={{ height: `calc(${Math.max(0, stepCount - 1)} * ${stepScrollUnit} + 100lvh)` }}
    >
      {/* Snap markers. No scroll-snap-stop: "always" — it forces the page to halt at every marker,
          which made fast swipes feel stuck or jerky, especially on iOS Safari. */}
      {steps.map((_, i) => (
        <div
          key={`snap-${i}`}
          aria-hidden
          className="pointer-events-none absolute left-0 h-px w-px"
          style={{ top: `calc(${i} * ${stepScrollUnit})`, scrollSnapAlign: "start" }}
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
              src="/HCG Logo/TITLE.webp"
              alt="HCG Foundation"
              width={224}
              height={165}
              className="h-auto w-16 aspect-[224/165] opacity-65 brightness-0 invert sm:w-20 md:w-24"
            />
          </div>
        </div>

        <div
          className={cn("absolute top-0 right-0 z-10 box-border h-full", HERO_PANEL)}
          style={{
            width: layout.overlayWidth,
            background: layout.isMobile ? HERO_OVERLAY_BG_MOBILE : HERO_OVERLAY_BG,
          }}
        >
          {/* All stories stay mounted so each one animates in/out smoothly. */}
          {steps.map((step, i) => (
            <StoryTextBlock
              key={`story-${i}`}
              step={step}
              active={activeStep === i}
              exiting={exitStep === i}
              layout={layout}
            />
          ))}
        </div>

        {/* Tile: transform is owned by moveTile() (inline).
            No Tailwind translate-* classes here: on Tailwind v4 they use the separate `translate`
            property and would stack with the inline transform, shifting the tile twice. */}
        <div
          ref={tileRef}
          className={cn(
            "absolute top-0 z-20 aspect-square will-change-transform",
            HERO_PANEL_RIGHT,
            layout.isMobile && "overflow-hidden"
          )}
          style={{
            width: layout.tileWidth,
            right: layout.overlayWidth,
            backgroundColor: "#2B2410",
            boxShadow: layout.isMobile
              ? "0 12px 30px rgba(0,0,0,0.45)"
              : "0 8px 24px rgba(0,0,0,0.35)",
            transition: layout.isMobile
              ? "transform 650ms cubic-bezier(0.22,1,0.36,1)"
              : "transform 600ms cubic-bezier(0.4,0,0.2,1)",
          }}
        >
          {steps.map((step, i) =>
            i === activeStep || i === exitStep ? (
              <Image
                key={`tile-${i}`}
                src={step.tileImageSrc}
                alt={step.tagline || step.name}
                fill
                quality={65}
                className={cn(
                  "object-cover transition-[opacity,transform] duration-500",
                  // Outgoing tile on top, fading out over the new one (same in both scroll directions).
                  activeStep === i ? "z-0 opacity-100" : "z-[1] opacity-0",
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