import React from "react";
import { cn } from "./utils";
import {
  DEFAULT_TYPOGRAPHY_VARIANT,
  TYPO_FLUID_ATTR,
  getTypographyStyles,
  getWeightClass,
  getFontStyleClass,
  typographyDefaultTags,
  type TypographyVariant,
} from "./type-scale";

export interface TypographyProps {
  children: React.ReactNode;
  /** Figma text style id from typography/specs.ts */
  variant?: TypographyVariant;
  as?: React.ElementType;
  className?: string;
  style?: React.CSSProperties;
}

const Typography = ({
  children,
  variant = DEFAULT_TYPOGRAPHY_VARIANT,
  as,
  className,
  style,
}: TypographyProps) => {
  const { scale, style: variantStyle } = getTypographyStyles(variant);
  const Tag: React.ElementType =
    as ?? (typographyDefaultTags[variant as TypographyVariant] as React.ElementType | undefined) ?? "span";

  const weightClass = getWeightClass(scale.weight);
  const fontStyleClass = getFontStyleClass(scale.fontStyle);

  return (
    <Tag
      {...{ [TYPO_FLUID_ATTR]: "" }}
      className={cn(scale.fontClass, weightClass, fontStyleClass, className)}
      style={{ ...variantStyle, ...style }}
    >
      {children}
    </Tag>
  );
};

export default Typography;
