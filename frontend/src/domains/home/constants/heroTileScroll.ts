/**
 * HERO TILE SCROLL CONSTANTS
 *
 * Clean, responsive-first approach:
 * - No complex clamp functions
 * - Simple asset references
 * - Breakpoint logic handled in component via getResponsiveValues()
 */

import type { HomeBanner } from "@/domains/cms/lib/types";

export type HeroTileStep = {
  name: string;
  tagline: string;
  body: string;
  backgroundSrc: string;
  mobileBackgroundSrc?: string;
  tileImageSrc: string;
};

// ============================================================================
// ASSETS
// ============================================================================

const HOME_BG_1 = "/home/bg1.png";
const HOME_BG_2 = "/home/bg2.png";
const HOME_TILE_1 = "/home/dr1.png";
const HOME_TILE_2 = "/home/dr2.png";
const HOME_BG_3 = "/home/bg3.png";
const HOME_TILE_3 = "/home/dr3.png";
const HOME_BG_4 = "/home/bg4.png";
const HOME_TILE_4 = "/home/dr4.png";

// ============================================================================
// HERO TILE STEPS - Story data
// ============================================================================

/** Shown only when the CMS has no active home banners or the API is unreachable. */
export const HERO_FALLBACK_STEPS: HeroTileStep[] = [
  {
    name: "Ananya Nair",
    tagline: "With courage in her heart and hope ahead.",
    body: "Ananya faced her cancer journey with quiet strength and unwavering hope. With access to timely treatment, financial assistance, and compassionate care, she continues to move forward surrounded by a community that believes in her recovery.",
    backgroundSrc: HOME_BG_1,
    tileImageSrc: HOME_TILE_1,
  },
  {
    name: "Meera Sreekumar",
    tagline: "A journey of courage, care, and hope.",
    body: "Meera was diagnosed with breast cancer and faced the challenges of treatment with determination. With access to timely care, financial assistance, and emotional support, she continues her journey toward recovery with renewed confidence.",
    backgroundSrc: HOME_BG_2,
    tileImageSrc: HOME_TILE_2,
  },
  {
    name: "Rahul Sharma",
    tagline: "With courage in her heart and hope ahead.",
    body: "Rahul is undergoing treatment for colorectal cancer and requires continued medical care and regular follow-ups. The increasing cost of treatment has placed financial pressure on his family. Timely support can help him continue his treatment and focus on his recovery.",
    backgroundSrc: HOME_BG_3,
    tileImageSrc: HOME_TILE_3,
  },
  {
    name: "Rohit Kumar",
    tagline: "Strength through treatment, hope for tomorrow.",
    body: "Rohit is receiving treatment for oral cancer and needs ongoing medical care, medication, and follow-up support. Managing treatment expenses has become challenging for his family. Community support can help him continue his care and move forward with renewed hope.",
    backgroundSrc: HOME_BG_4,
    tileImageSrc: HOME_TILE_4,
  },
];

const NON_IMAGE_FILE = /\.(pdf|docx?|pptx?|xlsx?|mp4|webm|mov|zip)(\?|#|$)/i;

/** next/image throws on anything but a root-relative or http(s) image URL, which would break the whole hero. */
function usableImageSrc(url?: string | null): string {
  const src = url?.trim() ?? "";
  if (!src || NON_IMAGE_FILE.test(src)) return "";
  return src.startsWith("/") || /^https?:\/\//i.test(src) ? src : "";
}

export function mapHomeBannerToHeroStep(banner: HomeBanner): HeroTileStep {
  const background = usableImageSrc(banner.bannerImageUrl);
  return {
    name: banner.name?.trim() ?? "",
    tagline: banner.title?.trim() ?? "",
    body: banner.shortDescription?.trim() ?? "",
    backgroundSrc: background,
    mobileBackgroundSrc: usableImageSrc(banner.mobileBannerImageUrl) || undefined,
    tileImageSrc: usableImageSrc(banner.profileImageUrl) || background,
  };
}

// ============================================================================
// SCROLL ANIMATION POSITIONS
// ============================================================================

/** Tile Y range as a fraction of viewport height (first step → last step). */
const HERO_TILE_Y_START = 0.06;
const HERO_TILE_Y_END = 0.78;

/** Evenly spaces the tile between start and end (4 steps → 6%, 30%, 54%, 78%). */
export function getHeroTileYFraction(step: number, count: number): number {
  if (count <= 1) return HERO_TILE_Y_START;
  return (
    HERO_TILE_Y_START +
    (step / (count - 1)) * (HERO_TILE_Y_END - HERO_TILE_Y_START)
  );
}

// ============================================================================
// STYLING CONSTANTS
// ============================================================================

/** Right overlay background — semi-transparent brown (#997300 @ 70%) */
export const HERO_OVERLAY_BG = "rgba(153, 115, 0, 0.7)";

/** Vertical accent line color (gold) before name */
export const HERO_NAME_ACCENT_COLOR = "#FCCC2D";

/** Gap between tile bottom and content top (50% line) */
export const HERO_TILE_TEXT_GAP_PX = 16;

/** Content always starts at this fraction of viewport height */
export const HERO_CONTENT_TOP_FRACTION = 0.5;

/** Horizontal inset multiplier on base padding (scales per breakpoint) */
export const HERO_CONTENT_INSET_MULTIPLIER = {
  mobile: 2.5,
  tablet: 3,
  laptop: 3.25,
  desktop: 3.5,
} as const;

/** Short viewport — tighten vertical gaps */
export const HERO_SHORT_VIEWPORT_PX = 820;