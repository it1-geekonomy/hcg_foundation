"use client";

import Link from "next/link";
import Typography from "@/lib/Typography";

const HOURGLASS_SRC =
  "https://pub-bbab4b37d630465e8c49b68c7d045302.r2.dev/website/1791364395843-rws7n-purple-hourglass-with-sand-3d-render-icon-cartoon-plastic-style-minimal-isolated-transparent-white-background-clipping-path-1.webp";

export interface ComingSoonSectionProps {
  title?: string;
  description?: string;
  buttonLabel?: string;
  buttonHref?: string;
  className?: string;
}

export default function ComingSoonSection({
  title = "COMING SOON",
  description = "We're working on this page to bring you important updates soon.",
  buttonLabel = "Back to Home Page",
  buttonHref = "/",
  className = "",
}: ComingSoonSectionProps) {
  return (
    <section
      className={`flex w-full flex-col items-center justify-center bg-[#FFF8E2] px-8 py-16 text-center sm:px-12 md:px-16 lg:py-24 ${className}`}
    >
      {/* Tilted hourglass */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={HOURGLASS_SRC}
        alt=""
        aria-hidden
        draggable={false}
        className="h-20 w-auto rotate-[15deg] select-none sm:h-28 md:h-30"
      />

      {/* Gradient title */}
      <Typography
        variant="display-1"
        as="h1"
        className="mt-4 inline-block bg-gradient-to-r from-[#FCCC2D] to-[#5C4E32] bg-clip-text font-normal text-transparent sm:mt-6 font-bold"
      >
        {title}
      </Typography>

      {/* Description */}
      <Typography
        variant="label-1"
        as="p"
        className="mt-2 max-w-xl font-manrope font-normal text-[#848484] sm:mt-3"
      >
        {description}
      </Typography>

      {/* Button */}
<Link
        href={buttonHref}
        className="mt-6 inline-flex items-center justify-center rounded-[0.125rem] bg-[#FFD43B] px-4 py-2 sm:mt-8"
      >
        <Typography
          variant="button-3"
          as="span"
          className="font-manrope font-medium text-neutral-900"
        >
          {buttonLabel}
        </Typography>
      </Link>
    </section>
  );
}