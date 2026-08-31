/**
 * Figma typography — re-exports from the type-scale module.
 * Used by the /fonts showcase page.
 */

import {
  typographySpecInputs,
  getTypographyStyles,
  TYPOGRAPHY_SECTIONS,
  type TypographyVariant,
  type TypeStyle,
  type TypographySpecInput,
} from "./type-scale";

export {
  typography,
  typographySpecInputs,
  typographySpecDefinitions,
  figmaClamp,
  fluidTypoVars,
  getBreakpointFontSizes,
  getVariantFontSizes,
  getTypographyStyles,
  TYPO_FLUID_ATTR,
  TYPOGRAPHY_SECTIONS,
  type TypographyVariant,
  type TypeStyle,
  type TypographySpecInput,
} from "./type-scale";

export type FigmaTextSpec = TypographySpecInput;
export type FigmaSpecId = TypographyVariant;

export const FIGMA_SECTIONS = TYPOGRAPHY_SECTIONS;
export type FigmaSection = (typeof FIGMA_SECTIONS)[number];

export const figmaTypographySpecs = typographySpecInputs;

export const figmaSpecsById = Object.fromEntries(
  typographySpecInputs.map((spec) => [spec.id, spec]),
) as Record<FigmaSpecId, FigmaTextSpec>;

export function getFigmaSpecStyles(specId: FigmaSpecId) {
  const spec = figmaSpecsById[specId];
  const { style } = getTypographyStyles(specId);
  return { spec, style };
}
