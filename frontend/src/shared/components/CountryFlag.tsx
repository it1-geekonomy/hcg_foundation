"use client";

import type { ReactElement } from "react";
import * as FlagIcons from "country-flag-icons/react/3x2";
import { hasFlag } from "country-flag-icons";

type FlagComponent = (props: { className?: string }) => ReactElement;

export default function CountryFlag({
  code,
  className,
}: {
  code: string;
  title?: string;
  className?: string;
}) {
  if (!hasFlag(code)) {
    return <span className={className}>{code}</span>;
  }

  const Flag = (FlagIcons as Record<string, FlagComponent>)[code];
  if (!Flag) {
    return <span className={className}>{code}</span>;
  }

  return <Flag className={className} />;
}
