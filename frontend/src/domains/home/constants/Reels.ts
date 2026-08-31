export interface Reel {
  id: string;
}

// Placeholder reel entries — no video sources / external URLs.
// Each card renders as a plain light-yellow placeholder tile.
export const reels: Reel[] = [
  { id: "reel-1" },
  { id: "reel-2" },
  { id: "reel-3" },
  { id: "reel-4" },
  { id: "reel-5" },
  { id: "reel-6" },
];

export const reelsTheme = {
  cardBg: "#FFF3CA",
  arrowBg: "#DAC47B",
  arrowColor: "#FFFFFF",
};