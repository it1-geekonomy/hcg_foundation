import type { TypographyVariant } from "./specs";

/**
 * Legacy / homepage-specific variant names → current scale ids.
 * Kept so old imports and gradual migration never break at runtime.
 */
export const typographyAliases = {
  // Pre-scale legacy names
  meta: "caption-1",
  hero: "display-2",
  body: "body-8",
  "body-lg": "body-9",
  "body-sm": "body-5",
  subheading: "body-2",
  label: "button-5",
  caption: "caption-1",
  eyebrow: "label-1",
  "editorial-lg": "heading-1",
  "editorial-xl": "heading-2",
  "editorial-md": "heading-4",
  "editorial-sm": "heading-5",
  "callout-quote": "heading-6",
  "heading-center": "body-1",
  "body-medium": "text-2",

  // Homepage / component-specific ids (Figma export names)
  "hero-headline": "display-1",
  "hero-subtitle": "body-10",
  "hero-badge": "label-1",
  "hero-cta": "button-1",
  "donate-card-title": "heading-5",
  "donate-card-body": "body-5",
  "donate-card-cta": "button-2",
  "donate-card-year": "caption-1",
  "section-heading-lg": "heading-1",
  "section-heading-md": "heading-2",
  "section-heading-manrope": "heading-3",
  "section-heading-sdg": "heading-4",
  "body-argesta-22": "body-2",
  "body-argesta-26": "body-1",
  "body-argesta-20": "body-3",
  "body-tiempos-20": "body-4",
  "ui-button": "button-3",
  "ui-tag": "label-2",
  "nav-active": "text-1",
  "nav-link": "text-2",
  "nav-contact-cta": "button-4",
  "footer-heading": "label-3",
  "footer-link": "body-9",
  "footer-body": "body-8",
  "logo-foundation": "brand-1",
  "logo-tagline": "brand-2",
  "footer-copyright": "caption-2",
  "donate-overlay-title": "heading-6",
  "donate-overlay-sub": "body-6",
  "donate-amount": "button-5",
  "donate-submit": "button-6",
  "card-title": "heading-7",
  "card-body": "body-7",
  "stat-number": "display-2",
  "stat-label": "heading-9",
  "story-name": "heading-8",
} as const satisfies Record<string, TypographyVariant>;

export type TypographyAlias = keyof typeof typographyAliases;
