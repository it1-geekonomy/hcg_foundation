/** Written by Navbar; read by the home hero so copy/tile start below the fixed bar. */
export const SITE_NAV_BOTTOM_CSS_VAR = "--site-navbar-bottom";
export const SITE_NAV_BOTTOM_FALLBACK_PX = 112;
export const SITE_NAV_BOTTOM_GAP_PX = 12;

export function publishSiteNavbarBottom(px: number) {
  if (typeof document === "undefined") return;
  document.documentElement.style.setProperty(SITE_NAV_BOTTOM_CSS_VAR, `${px}px`);
}

export function measureSiteNavbarBottom(): number {
  if (typeof window === "undefined") return SITE_NAV_BOTTOM_FALLBACK_PX;
  const nav = document.getElementById("site-navbar");
  if (!nav) return SITE_NAV_BOTTOM_FALLBACK_PX;
  const rect = nav.getBoundingClientRect();
  if (rect.bottom <= 0 || rect.height <= 0) return SITE_NAV_BOTTOM_FALLBACK_PX;
  return Math.ceil(rect.bottom + SITE_NAV_BOTTOM_GAP_PX);
}

/** CSS `max()` for panel inset + story height (always clears the navbar). */
export function heroNavInsetCss(floorPx: number): string {
  return `max(${floorPx}px, var(${SITE_NAV_BOTTOM_CSS_VAR}, ${SITE_NAV_BOTTOM_FALLBACK_PX}px))`;
}
