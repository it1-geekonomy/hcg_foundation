import type { TypographySection } from "./constants";
import type { FontFamilyToken } from "./fonts";

/** Authoring shape — what you edit in specs.ts */
export interface TypographySpecDefinition {
  section: TypographySection | string;
  label: string;
  sample: string;
  family: FontFamilyToken;
  weight: number;
  fontStyle: "normal" | "italic";
  desktopPx: number;
  mobilePx: number;
  lineHeight: number;
  letterSpacing: string;
  color: string;
  textAlign?: "left" | "center" | "right";
  textTransform?: "capitalize" | "uppercase" | "lowercase" | "none";
}

/** Flat spec record used by /fonts showcase and traceability */
export interface TypographySpecInput extends TypographySpecDefinition {
  id: string;
  fontFamily: string;
  fontClass?: string;
  loaded: boolean;
}

/** Resolved token consumed by <Typography /> and CSS vars */
export interface TypeStyle extends Omit<TypographySpecDefinition, "family" | "desktopPx" | "mobilePx"> {
  fontFamily: string;
  fontClass?: string;
  loaded: boolean;
  size: string;
  sizeRange: { minPx: number; maxPx: number };
}

export type TypographyStyleProperties = Pick<
  TypeStyle,
  "fontFamily" | "fontClass" | "weight" | "fontStyle" | "lineHeight" | "letterSpacing" | "textAlign" | "textTransform"
>;
