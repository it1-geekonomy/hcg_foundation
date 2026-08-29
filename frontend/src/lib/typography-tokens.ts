/**
 * typography-tokens.ts
 * ------------------------------------------------------------------
 * Two INDEPENDENT concerns, kept in two separate tables:
 *
 *  1. `typography`   — the SHAPE of a text style: fluid size, weight,
 *                       italic/normal, line-height, letter-spacing,
 *                       alignment, transform. Nothing here mentions a
 *                       font. This is "how big and how it sits on the
 *                       page", not "in what typeface".
 *
 *  2. `fontFamilies` — a registry of CSS font stacks, keyed by a
 *                       friendly token. This is the only place a real
 *                       font name is written down.
 *
 * WHY SPLIT THEM
 * You're mixing fonts across the same design (Poppins, Manrope,
 * Tiempos Text, Tiempos Fine, Argesta Display) and reusing the same
 * *size role* — e.g. "a subheading" — with different faces depending
 * on context. If family were baked into each size token like before,
 * swapping the font for one instance meant either overriding inline
 * every time or duplicating the whole token just to change one field.
 * With family pulled out, `<Typography variant="subheading" family="poppins">`
 * and `<Typography variant="subheading" family="tiempos-text">` both
 * just work — the scale (size/rhythm) is identical, only the face
 * changes. And if you don't pass `family` at all, nothing is set and
 * the element inherits whatever font-family is already active from a
 * parent or your global stylesheet — fully decoupled, no assumption.
 *
 * HOW EACH CLAMP WAS DERIVED
 * Your Figma specs give one size per style — the DESKTOP value
 * (assumed at a 1440px viewport). For each style I picked a MOBILE
 * floor (at a 375px viewport) as a percentage of the desktop size:
 *   - Large display sizes shrink more (~55-65%) — a 62px headline is
 *     unusable on a 375px phone.
 *   - Body copy barely shrinks (~85-95%) — legibility matters more
 *     than matching the display's scale.
 *   - Sizes already under ~16px are kept nearly flat.
 * These floors are a professional default, NOT a Figma export —
 * adjust `sizeRange` per style if your team has explicit mobile specs.
 *
 * UNIT CHOICES
 * - font-size:      clamp() in rem — still respects browser zoom / OS
 *                    text-size settings.
 * - line-height:     unitless ratio (1.5, not "24px" or "150%"). This
 *                    scales proportionally with font-size on its own —
 *                    essential here because the size itself is fluid.
 * - letter-spacing:  em, not px. Figma expresses spacing as a % of
 *                    font-size; 1em = current font-size in CSS, so it
 *                    stays correct at every point along the clamp,
 *                    not just at the one px value Figma showed you.
 */

export type FontFamilyToken =
  | "manrope"
  | "poppins"
  | "tiempos-text"
  | "tiempos-fine"
  | "argesta-display";

/**
 * Real CSS font stacks, kept completely separate from the type scale.
 * Add/remove/rename entries here without touching a single size token.
 * Fill in the two custom faces once you have licensed @font-face files
 * (the "Test " prefix in Figma is a trial-webfont artifact and
 * shouldn't ship — dropped here).
 */
export const fontFamilies: Record<FontFamilyToken, string> = {
  manrope: "'Manrope', sans-serif",
  poppins: "'Poppins', sans-serif",
  "tiempos-text": "'Tiempos Text', Georgia, serif",
  "tiempos-fine": "'Tiempos Fine', Georgia, serif",
  "argesta-display": "'Argesta Display', serif",
};

export interface TypeStyle {
  /** Figma frame this was sourced from, for traceability */
  source: string;
  weight: number;
  fontStyle: "normal" | "italic";
  /** clamp(min, preferred, max) — applied only at lg (1024px+) */
  size: string;
  /** base = mobile (< sm), sm/md = fixed tablet steps, max = lg clamp ceiling */
  sizeRange: { minPx: number; maxPx: number };
  lineHeight: number; // unitless
  letterSpacing: string; // em
  textAlign?: "left" | "center" | "right";
  textTransform?: "capitalize" | "uppercase" | "lowercase" | "none";
}

/** Convert px to rem for fixed breakpoint sizes */
export function pxToRem(px: number): string {
  return `${(px / 16).toFixed(4)}rem`;
}

/**
 * Below lg: fixed sizes per breakpoint (no clamp).
 * At lg (1024px+): fluid clamp between min and max.
 */
export function getBreakpointFontSizes(minPx: number, maxPx: number, clamp: string) {
  const smPx = Math.round(minPx + (maxPx - minPx) * 0.2);
  const mdPx = Math.round(minPx + (maxPx - minPx) * 0.45);

  return {
    base: pxToRem(minPx),
    sm: pxToRem(smPx),
    md: pxToRem(mdPx),
    lgClamp: clamp,
    px: { base: minPx, sm: smPx, md: mdPx, max: maxPx },
  };
}

export function getVariantFontSizes(variant: TypographyVariant) {
  const scale = typography[variant];
  return getBreakpointFontSizes(scale.sizeRange.minPx, scale.sizeRange.maxPx, scale.size);
}

/** CSS custom properties for data-typo-fluid (see globals.css) */
export function fluidTypoVars(
  minPx: number,
  maxPx: number,
  clamp: string,
): Record<string, string> {
  const sizes = getBreakpointFontSizes(minPx, maxPx, clamp);
  return {
    "--typo-size-base": sizes.base,
    "--typo-size-sm": sizes.sm,
    "--typo-size-md": sizes.md,
    "--typo-clamp": sizes.lgClamp,
  };
}

export const TYPO_FLUID_ATTR = "data-typo-fluid";

/**
 * The type scale — no `family` field anywhere. Pair any of these with
 * any entry in `fontFamilies` (or any raw font string) at the call site.
 */
export const typography = {
  /** 600 · 62px · Figma "Typography" panel (image 7) */
  hero: {
    source: "image-7",
    weight: 600,
    fontStyle: "normal",
    size: "clamp(2.1313rem, 1.5173rem + 0.1637vw, 3.875rem)",
    sizeRange: { minPx: 34.1, maxPx: 62 },
    lineHeight: 1.5,
    letterSpacing: "0.01em",
  },

  /** Italic 400 · 48px, LH 140% (image 6) */
  "editorial-xl": {
    source: "image-6",
    weight: 400,
    fontStyle: "italic",
    size: "clamp(1.86rem, 1.4586rem + 0.107vw, 3rem)",
    sizeRange: { minPx: 29.76, maxPx: 48 },
    lineHeight: 1.4,
    letterSpacing: "0.01em",
  },

  /** Italic 400 · 46px, LH 150% (image 4) */
  "editorial-lg": {
    source: "image-4",
    weight: 400,
    fontStyle: "italic",
    size: "clamp(1.7537rem, 1.3589rem + 0.1053vw, 2.875rem)",
    sizeRange: { minPx: 28.06, maxPx: 46 },
    lineHeight: 1.5,
    letterSpacing: "0.01em",
  },

  /** Italic 400 · 29.48px, LH 120% (new image 2) */
  "editorial-sm": {
    source: "image-14",
    weight: 400,
    fontStyle: "italic",
    size: "clamp(1.3266rem, 1.145rem + 0.0484vw, 1.8425rem)",
    sizeRange: { minPx: 21.226, maxPx: 29.48 },
    lineHeight: 1.2,
    letterSpacing: "0.01em",
  },

  /** Italic 400 · 35px, LH 150% (image 3) */
  "editorial-md": {
    source: "image-3",
    weight: 400,
    fontStyle: "italic",
    size: "clamp(1.5094rem, 1.2706rem + 0.0637vw, 2.1875rem)",
    sizeRange: { minPx: 24.15, maxPx: 35 },
    lineHeight: 1.5,
    letterSpacing: "0.02em",
  },

  /** Medium Italic · 32px, centered, title case (image 13) */
  "callout-quote": {
    source: "image-13",
    weight: 500,
    fontStyle: "italic",
    size: "clamp(1.38rem, 1.1617rem + 0.0582vw, 2rem)",
    sizeRange: { minPx: 22.08, maxPx: 32 },
    lineHeight: 1.2,
    letterSpacing: "0.02em",
    textAlign: "center",
    textTransform: "capitalize",
  },

  /** 500 · 26px, centered (image 8) */
  "heading-center": {
    source: "image-8",
    weight: 500,
    fontStyle: "normal",
    size: "clamp(1.2512rem, 1.1196rem + 0.0351vw, 1.625rem)",
    sizeRange: { minPx: 20.02, maxPx: 26 },
    lineHeight: 1.5,
    letterSpacing: "0.01em",
    textAlign: "center",
  },

  /** 400 · 22px (image 5) */
  subheading: {
    source: "image-5",
    weight: 400,
    fontStyle: "normal",
    size: "clamp(1.1275rem, 1.0404rem + 0.0232vw, 1.375rem)",
    sizeRange: { minPx: 18.04, maxPx: 22 },
    lineHeight: 1.5,
    letterSpacing: "0.02em",
  },

  /** 400 · 18px (image 2) */
  "body-lg": {
    source: "image-2",
    weight: 400,
    fontStyle: "normal",
    size: "clamp(1.0012rem, 0.9577rem + 0.0116vw, 1.125rem)",
    sizeRange: { minPx: 16.02, maxPx: 18 },
    lineHeight: 1.5,
    letterSpacing: "0em",
  },

  /** 600 · 18px (added for footer heading) */
  "footer-heading": {
    source: "footer-specs",
    weight: 600,
    fontStyle: "normal",
    size: "clamp(1.0012rem, 0.9577rem + 0.0116vw, 1.125rem)",
    sizeRange: { minPx: 16.02, maxPx: 18 },
    lineHeight: 1.5,
    letterSpacing: "0em",
  },

  /** 600 · 17.78px, centered (images 9 & 11 — identical spec) */
  label: {
    source: "image-9 / image-11",
    weight: 600,
    fontStyle: "normal",
    size: "clamp(0.9446rem, 0.8859rem + 0.0157vw, 1.1113rem)",
    sizeRange: { minPx: 15.113, maxPx: 17.78 },
    lineHeight: 1.5,
    letterSpacing: "0.01em",
    textAlign: "center",
  },

  /** 400 · 16px, LH 30.31px (image 1) */
  body: {
    source: "image-1",
    weight: 400,
    fontStyle: "normal",
    size: "clamp(0.875rem, 0.831rem + 0.0117vw, 1rem)",
    sizeRange: { minPx: 14, maxPx: 16 },
    lineHeight: 1.8944, // 30.31 / 16 — unusually tall on purpose, per spec
    letterSpacing: "0em",
  },

  /** 500 · 16px (added for footer body-medium) */
  "body-medium": {
    source: "footer-specs",
    weight: 500,
    fontStyle: "normal",
    size: "clamp(0.875rem, 0.831rem + 0.0117vw, 1rem)",
    sizeRange: { minPx: 14, maxPx: 16 },
    lineHeight: 1.5,
    letterSpacing: "0em",
  },

  /** 400 · 14px (added for footer specification) */
  "body-sm": {
    source: "footer-specs",
    weight: 400,
    fontStyle: "normal",
    size: "clamp(0.8125rem, 0.7907rem + 0.0058vw, 0.875rem)", // 13px to 14px
    sizeRange: { minPx: 13, maxPx: 14 },
    lineHeight: 1.5,
    letterSpacing: "0em",
  },

  /** 400 · 15px, centered (image 12) */
  eyebrow: {
    source: "image-12",
    weight: 400,
    fontStyle: "normal",
    size: "clamp(0.8156rem, 0.7727rem + 0.0114vw, 0.9375rem)",
    sizeRange: { minPx: 13.05, maxPx: 15 },
    lineHeight: 1.5,
    letterSpacing: "0.03em",
    textAlign: "center",
  },

  /** Medium 500 · 12.14px, LH 130%, LS 2% (new image 1) */
  meta: {
    source: "image-15",
    weight: 500,
    fontStyle: "normal",
    size: "clamp(0.7208rem, 0.7075rem + 0.0036vw, 0.7588rem)",
    sizeRange: { minPx: 11.533, maxPx: 12.14 },
    lineHeight: 1.3,
    letterSpacing: "0.02em",
  },

  /** 400 · 11.72px (image 10) */
  caption: {
    source: "image-10",
    weight: 400,
    fontStyle: "normal",
    size: "clamp(0.6959rem, 0.683rem + 0.0034vw, 0.7325rem)",
    sizeRange: { minPx: 11.134, maxPx: 11.72 },
    lineHeight: 1.5,
    letterSpacing: "0.04em",
  },
} as const satisfies Record<string, TypeStyle>;

export type TypographyVariant = keyof typeof typography;
