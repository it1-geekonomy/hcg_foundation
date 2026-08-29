import {
  FIXED_MD_RATIO,
  FIXED_SM_RATIO,
  FLUID_MAX_VIEWPORT,
  FLUID_MIN_VIEWPORT,
  MOBILE_SCALE_BODY,
  MOBILE_SCALE_DISPLAY,
  MOBILE_SCALE_HEADING,
  ROOT_FONT_PX,
} from "./constants";

export function pxToRem(px: number): string {
  return `${(px / ROOT_FONT_PX).toFixed(4)}rem`;
}

/** Effective mobile floor — larger desktop styles compress more on small screens */
export function resolveMobilePx(mobilePx: number, desktopPx: number): number {
  let scale = 1;
  if (desktopPx >= 55) scale = MOBILE_SCALE_DISPLAY;
  else if (desktopPx >= 38) scale = MOBILE_SCALE_HEADING;
  else if (desktopPx >= 22) scale = MOBILE_SCALE_BODY;
  return Math.round(mobilePx * scale * 10) / 10;
}

/** lg+ fluid clamp between mobile floor and desktop ceiling */
export function figmaClamp(mobilePx: number, maxPx: number): string {
  const minPx = resolveMobilePx(mobilePx, maxPx);
  const minRem = pxToRem(minPx);
  const maxRem = pxToRem(maxPx);
  const slope = ((maxPx - minPx) / (FLUID_MAX_VIEWPORT - FLUID_MIN_VIEWPORT)) * 100;
  const intercept = minPx - (slope / 100) * FLUID_MIN_VIEWPORT;
  const interceptRem = pxToRem(intercept);
  const slopeVw = slope.toFixed(4);
  return `clamp(${minRem}, ${interceptRem} + ${slopeVw}vw, ${maxRem})`;
}

export function getBreakpointFontSizes(mobilePx: number, maxPx: number, clamp: string) {
  const minPx = resolveMobilePx(mobilePx, maxPx);
  const smPx = Math.round(minPx + (maxPx - minPx) * FIXED_SM_RATIO);
  const mdPx = Math.round(minPx + (maxPx - minPx) * FIXED_MD_RATIO);

  return {
    base: pxToRem(minPx),
    sm: pxToRem(smPx),
    md: pxToRem(mdPx),
    lgClamp: clamp,
    px: { base: minPx, sm: smPx, md: mdPx, max: maxPx },
  };
}

/** CSS custom properties for [data-typo-fluid] — see globals.css */
export function fluidTypoVars(
  minPx: number,
  maxPx: number,
  clamp: string,
): Record<string, string> {
  const sizes = getBreakpointFontSizes(minPx, maxPx, clamp);
  return {
    "--typo-size-base": sizes.base,
    "--typo-size-sm": sizes.sm,
    "--typo-size-md": sizes.md,
    "--typo-clamp": sizes.lgClamp,
  };
}
