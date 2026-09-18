import Image from "next/image";
import Typography from "@/lib/Typography";
import { pillars } from "@/domains/about/constants/pillars";

export interface WhatWeStandForProps {
  /** Override the section background color/class if needed */
  className?: string;
}

/**
 * "What We Stand For" pillars grid (About Us).
 * Content is sourced from `@/domains/about/constants/pillars`.
 */
export default function WhatWeStandFor({ className = "" }: WhatWeStandForProps) {
  return (
    <section
      className={`w-full overflow-x-hidden bg-[#FFFCF2] pt-6 pb-6 px-8 sm:px-12 md:px-16 lg:py-20 lg:px-6 xl:px-6 2xl:px-40 ${className}`}
    >
      <Typography
        variant="heading-3"
        as="h2"
        className="text-center font-tiempos-headline text-[#382E07]"
      >
        What We Stand For
      </Typography>

      <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
        {pillars.map((pillar, index) => (
          <div key={index} className="bg-[#FFF3CD] p-8">
                        <Image
              src={pillar.icon}
              alt=""
              width={40}
              height={40}
              className="h-8 w-8 object-contain sm:h-10 sm:w-10"
            />

            <Typography
              variant="body-2"
              as="h3"
              className="mt-4 font-medium font-tiempos-headline text-[#1C1C1C]"
            >
              {pillar.title}
            </Typography>

            <Typography
              variant="body-3"
              as="p"
              className="mt-3 font-normal font-argestadisplay text-[#6B6660]"
            >
              {pillar.description}
            </Typography>
          </div>
        ))}
      </div>
    </section>
  );
}