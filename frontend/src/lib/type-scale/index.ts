/**
 * Typography design system — public API.
 *
 * Usage:
 *   import Typography from "@/lib/Typography";
 *   <Typography variant="heading-1">Title</Typography>
 *
 * To add or change a style, edit `specs.ts` only.
 */

export {
  ROOT_FONT_PX,
  FLUID_MIN_VIEWPORT,
  FLUID_MAX_VIEWPORT,
  BREAKPOINT_SM,
  BREAKPOINT_MD,
  BREAKPOINT_LG,
  FIXED_SM_RATIO,
  FIXED_MD_RATIO,
  MOBILE_SCALE_DISPLAY,
  MOBILE_SCALE_HEADING,
  MOBILE_SCALE_BODY,
  TYPO_FLUID_ATTR,
  DEFAULT_TYPOGRAPHY_VARIANT,
  TYPOGRAPHY_SECTIONS,
} from "./constants";

export {
  fontFamilies,
  fontClassByToken,
  loadedFontTokens,
  resolveFontFamily,
  type FontFamilyToken,
} from "./fonts";

export {
  pxToRem,
  figmaClamp,
  resolveMobilePx,
  getBreakpointFontSizes,
  fluidTypoVars,
} from "./fluid";

export { defineTypographySpec } from "./define-spec";

export { typographySpecDefinitions, type TypographyVariant } from "./specs";

export {
  typography,
  typographySpecInputs,
  typographyDefaultTags,
  isTypographyVariant,
  resolveTypographyVariant,
  getVariantFontSizes,
  getTypographyStyles,
} from "./registry";

export { typographyAliases, type TypographyAlias } from "./aliases";

export type {
  TypographySpecDefinition,
  TypographySpecInput,
  TypeStyle,
} from "./types";

export type { TypographySection } from "./constants";
