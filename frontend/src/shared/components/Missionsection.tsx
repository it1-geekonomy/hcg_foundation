import type { ReactNode } from "react";
import Image from "next/image";
import Typography from "@/lib/Typography";

export interface MissionListBlock {
  /** Optional label above the list, e.g. "Mission:" or "Vision:" */
  title?: string;
  /** Bullet items under this block */
  items: ReactNode[];
}

/** Either a plain paragraph (string/JSX) or a titled bullet list block */
export type MissionContentBlock = ReactNode | MissionListBlock;

export interface MissionHighlightProps {
  /** Small eyebrow label with a leading dot, e.g. "Our Mission" */
  label: string;
  /** Main heading. Accepts a string or JSX (e.g. with a <br /> line break) */
  heading: ReactNode;
  /**
   * Content blocks, rendered in order. Each entry is either a plain
   * paragraph (string/ReactNode) or a { title?, items } bullet-list block.
   */
  paragraphs: MissionContentBlock[];
  /** Path or URL to the image shown on the right */
  image: string;
  /** Alt text for the image (accessibility / SEO) */
  imageAlt?: string;
  /** Override the section background color/class if needed */
  className?: string;
}

function isListBlock(block: MissionContentBlock): block is MissionListBlock {
  return (
    typeof block === "object" &&
    block !== null &&
    !Array.isArray(block) &&
    "items" in block &&
    Array.isArray((block as MissionListBlock).items)
  );
}
export default function MissionHighlight({
  label,
  heading,
  paragraphs,
  image,
  imageAlt = "",
  className = "",
}: MissionHighlightProps) {
  return (
    <section
      className={`w-full overflow-x-hidden bg-[#FFF8E2] pt-8 pb-8 px-8 sm:px-12 md:px-16 lg:py-14 xl:py-20 lg:px-6 xl:px-6 2xl:px-40 ${className}`}
    >
      <div className="grid w-full grid-cols-1 items-center lg:grid-cols-2 lg:items-stretch lg:gap-x-4 xl:gap-x-20">
        {/* Label */}
        <div className="order-1 mb-6 flex items-center gap-2 lg:order-none lg:col-span-2 lg:row-start-1">
          <span aria-hidden className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#FCCC2D]" />
          <Typography variant="text-1" as="span" className="font-light font-manrope text-[#6F5E09]">
            {label}
          </Typography>
        </div>

        {/* Heading */}
        <div className="order-2 min-w-0 lg:order-none lg:col-start-1 lg:row-start-2">
          <Typography
            variant="heading-2"
            as="h2"
            className="font-tiempos-headline text-[#382E07] font-normal lg:whitespace-nowrap min-[1920px]:whitespace-normal"
          >
            {heading}
          </Typography>
        </div>

        {/* Image — row placement:
            - below lg (<1024px): reordered to appear right after the heading (order-3)
            - lg to <1920px: starts at the content/description row
            - 1920px+: starts at the heading row (spans heading+content), regardless of bullet list */}
        <div
          className="relative order-3 mt-6 w-full min-w-0 overflow-hidden bg-[#FFF8E2]
            lg:aspect-auto lg:h-full lg:max-h-none lg:min-h-0 lg:self-stretch lg:justify-self-stretch
            lg:order-none lg:col-start-2 lg:mt-0
            lg:row-start-3 lg:row-span-1
            min-[1920px]:!row-start-2 min-[1920px]:!row-span-2"
        >
          {/* Mobile/tablet: natural aspect ratio, no crop, no leftover space */}
          <Image
            src={image}
            alt={imageAlt}
            width={800}
            height={600}
            className="block h-auto w-full max-h-64 object-contain object-top sm:max-h-72 md:max-h-80 lg:hidden"
          />
          {/* Desktop (lg+): fills the stretched grid cell */}
          <Image
            src={image}
            alt={imageAlt}
            fill
            className="hidden object-contain object-center lg:block"
          />
        </div>

        {/* Content / paragraphs */}
        <div className="order-4 mt-2 sm:mt-8 min-w-0 space-y-6 lg:order-none lg:col-start-1 lg:row-start-3">
          {paragraphs.map((block, index) => {
            if (isListBlock(block)) {
              return (
                <div key={index}>
                  {block.title && (
                    <Typography
                      variant="body-3"
                      as="p"
                      className="mb-2 font-semibold font-argestadisplay text-[#293239] underline underline-offset-2"
                    >
                      {block.title}
                    </Typography>
                  )}
                  <ul className="list-disc space-y-1 pl-5">
                    {block.items.map((item, itemIndex) => (
                      <Typography
                        key={itemIndex}
                        variant="body-3"
                        as="li"
                        className="font-normal font-argestadisplay text-[#293239]"
                      >
                        {item}
                      </Typography>
                    ))}
                  </ul>
                </div>
              );
            }

            return (
              <Typography
                key={index}
                variant="body-3"
                as="p"
                className="font-normal font-argestadisplay text-[#293239]"
              >
                {block}
              </Typography>
            );
          })}
        </div>
      </div>
    </section>
  );
}