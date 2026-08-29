import React from "react";
import { cn } from "./utils";
import {
  typography,
  TYPO_FLUID_ATTR,
  fluidTypoVars,
  type TypographyVariant,
} from "./typography-tokens";

export interface TypographyProps {
  children: React.ReactNode;
  /** Controls size / weight / line-height / letter-spacing / alignment.
   *  Font-family is NOT handled here — set it via `className`
   *  (e.g. `font-[Manrope]`, or your own font utility class). */
  variant?: TypographyVariant;
  /** Override the element rendered, e.g. render "hero" as an <h1> */
  as?: React.ElementType;
  className?: string;
  style?: React.CSSProperties;
}

/** Sensible default tag per variant — override any time with `as` */
const defaultTag: Record<TypographyVariant, React.ElementType> = {
  hero: "h1",
  "editorial-xl": "h2",
  "editorial-lg": "h2",
  "editorial-sm": "h4",
  "editorial-md": "h3",
  "callout-quote": "blockquote",
  "heading-center": "h3",
  subheading: "h4",
  "body-lg": "p",
  "footer-heading": "h3",
  label: "span",
  body: "p",
  "body-medium": "p",
  "body-sm": "p",
  eyebrow: "span",
  caption: "span",
  meta: "span",
};

const Typography = ({
  children,
  variant = "body",
  as,
  className,
  style,
}: TypographyProps) => {
  const scale = typography[variant];
  const Tag: React.ElementType = as ?? defaultTag[variant];

  const computedStyle: React.CSSProperties = {
    ...fluidTypoVars(scale.sizeRange.minPx, scale.sizeRange.maxPx, scale.size),
    fontWeight: scale.weight,
    fontStyle: scale.fontStyle,
    lineHeight: scale.lineHeight,
    letterSpacing: scale.letterSpacing,
    ...style,
  };

  if ("textAlign" in scale && scale.textAlign) {
    computedStyle.textAlign = scale.textAlign;
  }
  if ("textTransform" in scale && scale.textTransform) {
    computedStyle.textTransform = scale.textTransform;
  }

  return (
    <Tag
      {...{ [TYPO_FLUID_ATTR]: "" }}
      className={cn("text-black", className)}
      style={computedStyle}
    >
      {children}
    </Tag>
  );
};

export default Typography;
