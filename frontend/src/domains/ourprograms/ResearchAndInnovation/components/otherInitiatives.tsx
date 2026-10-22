"use client";

import Typography from "@/lib/Typography";
import PuzzleImage from "@/shared/components/Puzzleimage"; // adjust path/alias if needed
import { OTHER_INITIATIVES_CONTENT } from "@/domains/ourprograms/ResearchAndInnovation/constants/otherInitiatives";

/** width / height of the milestone image (~1.22 from the screenshots). Set to the real value. */
const IMAGE_ASPECT = 1.22;

const PARA_CLASS =
  "font-normal font-argestadisplay text-[#293239] !text-left";

export default function OtherInitiatives() {
  const { heading, introParagraphs, image, milestoneParagraphs } =
    OTHER_INITIATIVES_CONTENT;

  // First 3 paras go beside the image on lg; the rest sit below it.
  const firstParas = milestoneParagraphs.slice(0, 3);
  const restParas = milestoneParagraphs.slice(3);

  return (
    <section className="w-full overflow-x-hidden bg-[#FFF8E2] py-2 md:py-2 px-8 sm:px-12 md:px-16 lg:py-4 xl:py-4 lg:px-6 xl:px-6 2xl:px-40">
      {/* Heading + 2 intro paragraphs */}
      <div className="flex flex-col gap-4">
        <div>
          <Typography
            variant="heading-7"
            as="h2"
            className="font-tiempos-headline font-normal italic text-[#000000]"
          >
            {heading}
          </Typography>
        </div>

        <div className="flex min-w-0 flex-col gap-4 md:gap-6">
          {introParagraphs.map((text, i) => (
            <Typography
              key={i}
              variant="body-3"
              as="p"
              className="font-normal font-argestadisplay text-[#293239]"
            >
              {text}
            </Typography>
          ))}
        </div>
      </div>

      {/*
        Layouts:
        - below lg : single column -> image (centered, small), paras 1-3, para 4
        - lg only  : image on the left, paras 1-3 on the right, para 4 below (full width)
        - xl and up: image on the left (centered against the text), all paras on the right
      */}
      <div className="mt-[clamp(2rem,5vw,4rem)] grid grid-cols-1 gap-x-[clamp(1.25rem,2.5vw,2rem)] gap-y-4 md:gap-y-6 lg:max-xl:grid-cols-[auto_1fr] xl:grid-cols-[auto_1fr]">
        {/* Image */}
        <div
          className="w-[clamp(220px,50vw,380px)] max-w-full justify-self-center lg:max-xl:w-[clamp(300px,42vw,420px)] lg:max-xl:justify-self-start lg:max-xl:self-start lg:max-xl:[grid-area:1/1] xl:w-[clamp(380px,32vw,520px)] xl:justify-self-start xl:self-center xl:[grid-area:1/1/3/2]"
          style={{ aspectRatio: IMAGE_ASPECT }}
        >
          <PuzzleImage src={image.src} alt={image.alt} fit="contain" />
        </div>

        {/* Paras 1-3 */}
        <div className="flex min-w-0 flex-col gap-4 md:gap-6 lg:max-xl:[grid-area:1/2] xl:[grid-area:1/2]">
          {firstParas.map((text, i) => (
            <Typography key={i} variant="body-3" as="p" className={PARA_CLASS}>
              {text}
            </Typography>
          ))}
        </div>

        {/* Para 4: full width below the image on lg, right column on xl+ */}
        {restParas.length > 0 && (
          <div className="flex min-w-0 flex-col gap-4 md:gap-6 lg:max-xl:[grid-area:2/1/3/3] xl:[grid-area:2/2]">
            {restParas.map((text, i) => (
              <Typography key={i} variant="body-3" as="p" className={PARA_CLASS}>
                {text}
              </Typography>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}