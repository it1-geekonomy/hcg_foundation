export interface AwardItem {
  id?: string;
  /** Award image URL (CMS CDN) or path under /public */
  image: string;
  title: string;
  description: string;
}

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
