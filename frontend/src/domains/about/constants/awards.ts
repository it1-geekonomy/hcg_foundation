export interface AwardItem {
  id?: string;
  /** Award image URL (CMS CDN) or path under /public */
  image: string;
  title: string;
  description: string;
}

/**
 * Exact CMS upload size for About Us awards.
 * Website frame is always aspect 4/5 (`object-cover`) on mobile + desktop,
 * so one portrait asset fits both — no separate mobile crop.
 *
 * Why 1920×2400:
 * - 4:5 matches the on-page frame (no unexpected cut)
 * - 1920 width covers a sharp 2× half-column on a 1920px desktop
 * - Mobile (< md) uses the same ratio at a smaller box
 */
export const AWARD_IMAGE_SIZE = { width: 1920, height: 2400 } as const;

/** Map a published CMS award → About Us awards carousel item. */
export function mapCmsAwardToItem(award: {
  id?: string;
  title: string;
  description?: string | null;
  awardImageUrl?: string | null;
}): AwardItem {
  return {
    id: award.id,
    image: award.awardImageUrl?.trim() || "",
    title: award.title?.trim() || "",
    description: award.description?.trim() || "",
  };
}
