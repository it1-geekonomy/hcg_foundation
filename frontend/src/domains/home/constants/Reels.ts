export interface Reel {
  id: string;
}

export const reels: Reel[] = [
  { id: "reel-1" },
  { id: "reel-2" },
  { id: "reel-3" },
  { id: "reel-4" },
  { id: "reel-5" },
  { id: "reel-6" },
];

/** Portrait reel ratio — height = width × (16/9) */
export const REEL_CARD_ASPECT = 16 / 9;

export function reelCardHeight(widthPx: number): number {
  return Math.round(widthPx * REEL_CARD_ASPECT);
}

/**
 * Single layout spec — all sizes derived here to avoid clipping / breakpoint bugs.
 */
export const reelsLayout = {
  controlSizePx: 62,
  controlIconPx: 28,
  controlStrokePx: 3.5,
  gapPx: 32,
  cardWidthPx: {
    default: 220,
    md: 260,
    lg: 288,
    xl: 300,
  },
} as const;

export const reelsTheme = {
  cardBg: "#FFF3CA",
  arrowBg: "#D9C88B",
  arrowColor: "#FFFFFF",
  ...reelsLayout,
} as const;
