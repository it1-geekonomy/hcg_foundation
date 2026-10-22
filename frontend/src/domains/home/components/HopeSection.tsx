"use client";

import { Fragment } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { ABOUT_CONTENT } from "@/domains/home/constants/hope";
import Typography from "@/lib/Typography";

export default function AboutSection() {
  return (
    <section className="pt-8 pb-8 px-8 sm:px-12 md:px-16 lg:py-14 xl:py-30 lg:px-6 xl:px-6 2xl:px-40">
      <div className="w-full grid grid-cols-1 gap-0 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] lg:gap-16">
        {/* LEFT: heading */}
        <div>
          <Typography
            variant="heading-2"
            as="h2"
            className="text-[#382E07] lg:text-nowrap font-tiempos-headline"
          >
            {ABOUT_CONTENT.heading.map((line, gi) => (
              <Fragment key={gi}>
                {/* < lg: inline (one paragraph, wraps naturally). lg+: block per line. */}
                <span className="inline lg:block">{line}</span>
                {/* Keeps a space between groups when they run together below lg. */}
                {" "}
              </Fragment>
            ))}
          </Typography>
        </div>

        {/* RIGHT: paragraphs and button */}
        <div className="flex flex-col gap-5">
          {ABOUT_CONTENT.paragraphs.map((paragraph) => (
            <Typography
              key={paragraph}
              variant="heading-8"
              as="p"
              className="text-[#293239] font-normal font-argestadisplay"
            >
              {paragraph}
            </Typography>
          ))}

          {/* < 640px: centered. sm+ : left-aligned. Compact size below lg. lg+: original. */}
          <Link
            href={ABOUT_CONTENT.cta.href}
            aria-label="About HCG Foundation"
            className="mt-2 inline-flex w-fit items-stretch max-sm:self-center overflow-hidden rounded border border-[#FFD43B] bg-[#FFD43B] min-h-[44px] lg:min-h-0 lg:h-12 lg:border-[#FCCC2D] lg:bg-[#FCCC2D]"
          >
            <span className="flex items-center px-3.5 py-2 sm:px-3 sm:py-2 lg:h-full lg:px-4 lg:py-0">
              {/* < lg: same type as the "More details" button */}
              <Typography
                variant="button-3"
                as="span"
                className="font-manrope font-semibold text-[#212121] lg:hidden"
              >
                {ABOUT_CONTENT.cta.label}
              </Typography>
              {/* lg+: original */}
              <Typography
                variant="button-1"
                as="span"
                className="hidden font-manrope font-semibold text-[#212121] lg:block"
              >
                {ABOUT_CONTENT.cta.label}
              </Typography>
            </span>

            <span className="flex w-11 sm:w-8 shrink-0 items-center justify-center border-2 border-[#FFD43B] bg-black lg:h-full lg:w-12 lg:border-[3px] lg:border-[#FCCC2D]">
              <ArrowUpRight className="h-3.5 w-3.5 text-[#FFD43B] sm:h-3.5 sm:w-3.5 lg:h-4 lg:w-4 lg:text-[#FCCC2D]" />
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}