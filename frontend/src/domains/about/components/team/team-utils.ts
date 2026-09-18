export function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function personKey(
  person: { id?: string; name: string },
  index: number,
) {
  return person.id ?? `${person.name}-${index}`;
}

export const BACK_PANEL_GLASS_BG =
  "bg-[linear-gradient(90deg,rgba(252,204,45,0.62)_0%,rgba(56,43,0,0.70)_100%)] backdrop-blur-lg";

export const DEFAULT_CARD_WIDTH_CLASS = "w-[clamp(17.5rem,20vw,21.25rem)]";
export const DEFAULT_CARD_TOP_OFFSET_CLASS =
  "-top-[clamp(1.875rem,6vw,3.75rem)]";
export const CARD_IMAGE_BOTTOM_INSET_CLASS = "bottom-[1.875rem]";
export const CAROUSEL_GAP_PX = 24;
export const MOBILE_CARD_GAP_PX = 16;
