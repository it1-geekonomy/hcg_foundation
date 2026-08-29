/** Root font-size assumption — matches browser default / Tailwind config */
export const ROOT_FONT_PX = 16;

/** Viewports used to derive fluid clamp slope (Figma desktop frame) */
export const FLUID_MIN_VIEWPORT = 375;
export const FLUID_MAX_VIEWPORT = 1440;

/** Fixed-size steps below lg — see globals.css [data-typo-fluid] */
export const BREAKPOINT_SM = 640;
export const BREAKPOINT_MD = 768;
export const BREAKPOINT_LG = 1024;

/** Interpolation toward desktop size at sm / md (no clamp below lg) */
export const FIXED_SM_RATIO = 0.08;
export const FIXED_MD_RATIO = 0.28;

/**
 * Mobile floor compression by style size — large display/headings shrink more on phones.
 * Spec mobilePx values stay as Figma reference; these scales apply at runtime only.
 */
export const MOBILE_SCALE_DISPLAY = 0.82;
export const MOBILE_SCALE_HEADING = 0.88;
export const MOBILE_SCALE_BODY = 0.93;

export const TYPO_FLUID_ATTR = "data-typo-fluid";

/** Safe default when variant is missing or invalid */
export const DEFAULT_TYPOGRAPHY_VARIANT = "body-8" as const;

/** Showcase groupings — role-based, not page-specific */
export const TYPOGRAPHY_SECTIONS = [
  "Display",
  "Headings",
  "Body",
  "UI",
  "Brand",
] as const;

export type TypographySection = (typeof TYPOGRAPHY_SECTIONS)[number];
