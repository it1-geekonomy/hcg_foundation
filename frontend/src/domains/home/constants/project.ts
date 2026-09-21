export type CardData = {
  id?: string;
  number: string;
  title: string;
  date: string;
  description: string;
  /** Desktop accordion image (homepage lg+) */
  image: string;
  /** Mobile stack image; falls back to `image` when empty */
  mobileImage?: string;
  href?: string;
};

export const COLLAPSED_WIDTH = 130;

/**
 * Exact CMS upload size for homepage projects — desktop / web banner.
 * Matches the design accordion assets (~2:1 landscape). Website uses
 * `object-cover` in a fixed-height row (480 / 600px), so keep the subject
 * centered — edges crop when the card is collapsed to a narrow strip.
 *
 * Why 1105×560:
 * - Same pixel size as the Figma / public design exports (`p1`–`p4`)
 * - ~2:1 matches the expanded accordion card proportions
 */
export const PROJECT_BANNER_SIZE = { width: 1105, height: 560 } as const;

/**
 * Exact CMS upload size for homepage projects — mobile banner.
 * Mobile stack expands to roughly full width × ~420–480px tall; this
 * portrait frame keeps faces/subjects readable under `object-cover`.
 */
export const PROJECT_MOBILE_BANNER_SIZE = {
  width: 780,
  height: 960,
} as const;

export function formatProjectCardDate(value?: string | null): string {
  if (!value?.trim()) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function mapProjectToCard(
  project: {
    id?: string;
    title: string;
    slug?: string;
    projectBanner?: string | null;
    projectMobileBanner?: string | null;
    projectDate?: string | null;
    shortDescription?: string | null;
    displayOrder?: number | null;
  },
  index: number
): CardData {
  const desktop =
    project.projectBanner?.trim() ||
    project.projectMobileBanner?.trim() ||
    "";
  const mobile =
    project.projectMobileBanner?.trim() ||
    project.projectBanner?.trim() ||
    "";

  return {
    id: project.id,
    number: String(project.displayOrder ?? index + 1),
    title: project.title,
    date: formatProjectCardDate(project.projectDate),
    description: project.shortDescription?.trim() || "No description yet.",
    image: desktop,
    mobileImage: mobile,
    href: project.slug ? `/resources/projects/${project.slug}` : undefined,
  };
}
