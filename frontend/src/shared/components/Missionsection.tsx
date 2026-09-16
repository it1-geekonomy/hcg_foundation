import type { ReactNode } from "react";
import Image from "next/image";
import Typography from "@/lib/Typography";

export interface MissionHighlightProps {
  /** Small eyebrow label with a leading dot, e.g. "Our Mission" */
  label: string;
  /** Main heading. Accepts a string or JSX (e.g. with a <br /> line break) */
  heading: ReactNode;
  /** One or more paragraphs of supporting copy, rendered in order */
  paragraphs: ReactNode[];
  /** Path or URL to the image shown on the right */
  image: string;
  /** Alt text for the image (accessibility / SEO) */
  imageAlt?: string;
  /** How the image should fit its container. Defaults to "cover". */
  imageFit?: "cover" | "contain";
  /** Override the section background color/class if needed */
  className?: string;
}

export default function MissionHighlight({
  label,
  heading,
  paragraphs,
  image,
  imageAlt = "",
  imageFit = "cover",
  className = "",
}: MissionHighlightProps) {
  return (
    <section
      className={`w-full overflow-x-hidden bg-[#FFF8E2] pt-8 px-8 sm:px-12 md:px-16 lg:py-14 xl:py-20 lg:px-6 xl:px-6 2xl:px-40 ${className}`}
    >
      <div className="grid w-full grid-cols-1 items-center gap-6 lg:grid-cols-2 lg:items-stretch lg:gap-4 xl:gap-20">
        {/* Left: label, heading, paragraphs */}
        <div className="min-w-0">
          <div className="mb-6 flex items-center gap-2">
            <span aria-hidden className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#FCCC2D]" />
            <Typography variant="text-1" as="span" className="font-light font-manrope text-[#6F5E09]">
              {label}
            </Typography>
          </div>

          <Typography
            variant="heading-2"
            as="h2"
            className="font-tiempos-headline text-[#382E07] font-normal"
          >
            {heading}
          </Typography>

          <div className="mt-8 space-y-6">
            {paragraphs.map((paragraph, index) => (
              <Typography
                key={index}
                variant="body-3"
                as="p"
                className="font-normal font-argestadisplay text-[#293239]"
              >
                {paragraph}
              </Typography>
            ))}
          </div>
        </div>

        {/* Right: image */}
        <div className="relative aspect-[4/3] max-h-64 w-full min-w-0 overflow-hidden bg-[#FFF8E2] sm:max-h-72 md:max-h-80 lg:aspect-auto lg:h-full lg:max-h-none lg:min-h-0">
          <Image
            src={image}
            alt={imageAlt}
            fill
            className={`object-top ${imageFit === "cover" ? "object-contain lg:object-cover" : "object-contain"}`}
          />
        </div>
      </div>
    </section>
  );
}