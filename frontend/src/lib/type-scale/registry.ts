import { DEFAULT_TYPOGRAPHY_VARIANT } from "./constants";
import { resolveFontFamily } from "./fonts";
import { figmaClamp, fluidTypoVars, getBreakpointFontSizes, resolveMobilePx } from "./fluid";
import { typographySpecDefinitions, type TypographyVariant } from "./specs";
import { typographyAliases, type TypographyAlias } from "./aliases";
import type { TypeStyle, TypographySpecDefinition, TypographySpecInput } from "./types";

function buildTypeStyle(id: string, definition: TypographySpecDefinition): TypeStyle {
  const { family, desktopPx, mobilePx, ...rest } = definition;
  const { fontFamily, fontClass, loaded } = resolveFontFamily(family);
  const clamp = figmaClamp(mobilePx, desktopPx);
  const effectiveMobilePx = resolveMobilePx(mobilePx, desktopPx);

  return {
    ...rest,
    fontFamily,
    fontClass,
    loaded,
    size: clamp,
    sizeRange: { minPx: effectiveMobilePx, maxPx: desktopPx },
  };
}

function toSpecInput(id: string, definition: TypographySpecDefinition): TypographySpecInput {
  const { fontFamily, fontClass, loaded } = resolveFontFamily(definition.family);
  return { id, ...definition, fontFamily, fontClass, loaded };
}

/** Resolved tokens keyed by variant id — used by <Typography /> */
export const typography = Object.fromEntries(
  Object.entries(typographySpecDefinitions).map(([id, definition]) => [
    id,
    buildTypeStyle(id, definition),
  ]),
) as Record<TypographyVariant, TypeStyle>;

/** Flat list for /fonts showcase — derived, never edited directly */
export const typographySpecInputs: TypographySpecInput[] = Object.entries(typographySpecDefinitions).map(
  ([id, definition]) => toSpecInput(id, definition),
);

export function isTypographyVariant(value: string): value is TypographyVariant {
  return value in typographySpecDefinitions;
}

export function resolveTypographyVariant(variant: string): TypographyVariant | undefined {
  if (isTypographyVariant(variant)) return variant;
  if (variant in typographyAliases) return typographyAliases[variant as TypographyAlias];
  return undefined;
}

export function getVariantFontSizes(variant: TypographyVariant) {
  const scale = typography[variant];
  return getBreakpointFontSizes(scale.sizeRange.minPx, scale.sizeRange.maxPx, scale.size);
}

export function getTypographyStyles(variant: TypographyVariant | string) {
  const resolved = resolveTypographyVariant(variant) ?? DEFAULT_TYPOGRAPHY_VARIANT;
  const scale = typography[resolved];

  if (!isTypographyVariant(variant) && process.env.NODE_ENV === "development") {
    console.warn(`[Typography] Unknown variant "${variant}", using "${resolved}"`);
  }

  return {
    scale,
    variant: resolved,
    style: {
      ...fluidTypoVars(scale.sizeRange.minPx, scale.sizeRange.maxPx, scale.size),
      lineHeight: scale.lineHeight,
      letterSpacing: scale.letterSpacing,
      ...(scale.textAlign ? { textAlign: scale.textAlign } : {}),
      ...(scale.textTransform ? { textTransform: scale.textTransform } : {}),
    } satisfies Record<string, string | number>,
  };
}

/** Suggested HTML element per variant — override with `as` prop when needed */
export const typographyDefaultTags: Partial<Record<TypographyVariant, string>> = {
  "display-1": "h1",
  "heading-1": "h2",
  "heading-2": "h2",
  "heading-3": "h2",
  "heading-4": "h2",
  "heading-5": "h3",
  "heading-6": "h2",
  "heading-7": "h3",
  "label-3": "h3",
  "body-8": "p",
  "body-9": "span",
  "body-7": "p",
  "body-10": "p",
  "body-6": "p",
  "body-2": "p",
  "body-1": "p",
  "body-3": "p",
  "body-4": "p",
  "heading-9": "p",
};
