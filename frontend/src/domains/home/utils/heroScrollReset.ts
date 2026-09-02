export const HERO_RESET_EVENT = "hcg-hero-reset";

export type HeroResetDetail = {
  smooth?: boolean;
};

/** Scroll to hero top and reset tile to step 0 (same page). Navigates to `/` from other routes. */
export function scrollHomeToHero(options?: HeroResetDetail) {
  if (typeof window === "undefined") return;

  const smooth = options?.smooth !== false;

  if (window.location.pathname !== "/") {
    window.location.href = "/";
    return;
  }

  window.dispatchEvent(
    new CustomEvent<HeroResetDetail>(HERO_RESET_EVENT, {
      detail: { smooth },
    })
  );

  if (window.location.hash) {
    window.history.replaceState(null, "", "/");
  }
}
