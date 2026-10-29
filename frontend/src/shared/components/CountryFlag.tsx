"use client";

import { hasFlag } from "country-flag-icons";

/**
 * Flags load as images from the /flags route (src/app/flags/[code]/route.ts). Importing the package's
 * React flags pulls every country's SVG into the page bundle; as images only the visible ones download.
 */
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

  return (
    // eslint-disable-next-line @next/next/no-img-element -- tiny static SVG, the image optimizer adds nothing
    <img
      src={`/flags/${code}.svg`}
      alt=""
      aria-hidden
      loading="lazy"
      decoding="async"
      draggable={false}
      className={className}
    />
  );
}
