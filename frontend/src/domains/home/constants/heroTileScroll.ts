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