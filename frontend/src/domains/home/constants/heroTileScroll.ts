/**
 * HERO TILE SCROLL CONSTANTS
 *
 * Clean, responsive-first approach:
 * - No complex clamp functions
 * - Simple asset references
 * - Breakpoint logic handled in component via getResponsiveValues()
 */

export type HeroTileStep = {
  name: string;
  location: string;
  tagline: string;
  body: string;
  backgroundSrc: string;
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

export const HERO_TILE_STEPS: HeroTileStep[] = [
  {
    name: "Ananya Nair",
    location: "Bengaluru, Karnataka",
    tagline: "With courage in her heart and hope ahead.",
    body: "Ananya faced her cancer journey with quiet strength and unwavering hope. With access to timely treatment, financial assistance, and compassionate care, she continues to move forward surrounded by a community that believes in her recovery.",
    backgroundSrc: HOME_BG_1,
    tileImageSrc: HOME_TILE_1,
  },
  {
    name: "Meera Sreekumar",
    location: "Bengaluru, Karnataka",
    tagline: "A journey of courage, care, and hope.",
    body: "Meera was diagnosed with breast cancer and faced the challenges of treatment with determination. With access to timely care, financial assistance, and emotional support, she continues her journey toward recovery with renewed confidence.",
    backgroundSrc: HOME_BG_2,
    tileImageSrc: HOME_TILE_2,
  },
  {
    name: "Rahul Sharma",
    location: "Bengaluru, Karnataka",
    tagline: "With courage in her heart and hope ahead.",
    body: "Rahul is undergoing treatment for colorectal cancer and requires continued medical care and regular follow-ups. The increasing cost of treatment has placed financial pressure on his family. Timely support can help him continue his treatment and focus on his recovery.",
    backgroundSrc: HOME_BG_3,
    tileImageSrc: HOME_TILE_3,
  },
  {
    name: "Rohit Kumar",
    location: "Bengaluru, Karnataka",
    tagline: "Strength through treatment, hope for tomorrow.",
    body: "Rohit is receiving treatment for oral cancer and needs ongoing medical care, medication, and follow-up support. Managing treatment expenses has become challenging for his family. Community support can help him continue his care and move forward with renewed hope.",
    backgroundSrc: HOME_BG_4,
    tileImageSrc: HOME_TILE_4,
  },
];

export const HERO_TILE_COUNT = HERO_TILE_STEPS.length;

// ============================================================================
// SCROLL ANIMATION POSITIONS
// ============================================================================

/**
 * Y position of each tile as fraction of viewport height
 * Step 0: 6% from top
 * Step 1: 30% from top
 * Step 2: 54% from top
 * Step 3: 78% from top
 */
export const HERO_TILE_Y_FRACTIONS = [0.06, 0.3, 0.54, 0.78] as const;

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