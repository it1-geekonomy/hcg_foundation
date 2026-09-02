export interface Reel {
  id: string;
  videoSrc: string;
}

const PLACEHOLDER_VIDEO1 = "/Reels/HCGreel1.mp4";
const PLACEHOLDER_VIDEO2 = "/Reels/HCGreel2.mp4";
const PLACEHOLDER_VIDEO3 = "/Reels/HCGreel3.mp4";
const PLACEHOLDER_VIDEO4 = "/Reels/HCGreel4.mp4";

export const reels: Reel[] = [
  { id: "reel-1", videoSrc: PLACEHOLDER_VIDEO1 },
  { id: "reel-2", videoSrc: PLACEHOLDER_VIDEO2 },
  { id: "reel-3", videoSrc: PLACEHOLDER_VIDEO3 },
  { id: "reel-4", videoSrc: PLACEHOLDER_VIDEO4 },
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