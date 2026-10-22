"use client";

import type { ReactNode } from "react";
import Typography from "@/lib/Typography";
import {
  DEFAULT_BLOCKS,
  HEART_ICON,
} from "@/domains/ourprograms/PinkHopeSupportGroup/constants/whypatientsjoinus";

/* ---------------------------- types ---------------------------- */

export interface SupportParagraph {
  /** Underlined lead-in, e.g. "A sense of belonging:" */
  label?: string;
  text: ReactNode;
}

export interface SupportGroupBlock {
  heading: ReactNode;
  paragraphs?: SupportParagraph[];
  /** Bullet items rendered with the pink heart icon */
  bullets?: ReactNode[];
}

export interface SupportGroupSectionProps {
  /** Optional. Falls back to the default Pink Hope content. */
  blocks?: SupportGroupBlock[];
  /** Heart icon used for bullets */
  iconSrc?: string;
  className?: string;
}

/* ---------------------------- section ---------------------------- */

export default function SupportGroupSection({
  blocks = DEFAULT_BLOCKS,
  iconSrc = HEART_ICON,
  className = "",
}: SupportGroupSectionProps) {
  return (
    <section
      className={`w-full overflow-x-hidden bg-[#FFF8E2] px-8 sm:px-12 md:px-16 lg:px-6 xl:px-6 2xl:px-40 ${className}`}
    >
      <div className="flex w-full flex-col gap-4 lg:gap-6 xl:gap-14">
        {blocks.map((block, bi) => (
          <div key={bi} className="min-w-0">
            {/* Heading */}
            <div>
              <Typography
                variant="heading-7"
                as="h2"
                className="font-tiempos-headline text-[#000000] font-normal italic"
              >
                {block.heading}
              </Typography>
            </div>

            {/* Paragraphs */}
            {block.paragraphs && block.paragraphs.length > 0 && (
              <div className="mt-4 min-w-0 space-y-4 sm:mt-5 sm:space-y-5">
                {block.paragraphs.map((p, pi) => (
                  <Typography
                    key={pi}
                    variant="body-3"
                    as="p"
                    className="font-normal font-argestadisplay text-[#293239]"
                  >
                    {p.label && <strong className="font-bold">{p.label} </strong>}
                    {p.text}
                  </Typography>
                ))}
              </div>
            )}

            {/* Heart bullets */}
            {block.bullets && block.bullets.length > 0 && (
              <div className="mt-4 min-w-0 sm:mt-5">
                <ul className="space-y-4 sm:space-y-5 lg:space-y-6">
                  {block.bullets.map((item, ii) => (
                    <li key={ii} className="flex items-start gap-3 sm:gap-4">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={iconSrc}
                        alt=""
                        aria-hidden
                        width={18}
                        height={16}
                        className="mt-[0.35em] h-3.5 w-auto shrink-0 sm:h-4"
                      />
                      <Typography
                        variant="body-3"
                        as="span"
                        className="min-w-0 font-normal font-argestadisplay text-[#293239]"
                      >
                        {item}
                      </Typography>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}