import { ArrowUpRight } from "lucide-react";
import { ABOUT_CONTENT } from "@/domains/home/constants/hope";
import Typography from "@/lib/Typography";

export default function AboutSection() {
  return (
    <section className="py-10 md:py-10 px-8 sm:px-12 md:px-16 lg:py-14 xl:py-30 lg:px-6 xl:px-6 2xl:px-40">
      <div className="w-full grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] lg:gap-16">
        <Typography variant="heading-2"
          as="h2"
          className="text-[#382E07] lg:text-nowrap font-tiempos-headline"
        >
          {ABOUT_CONTENT.heading.map((line) => (
            <span key={line} className="block">
              {line}
            </span>
          ))}
        </Typography>

        <div className="flex flex-col gap-5">
          {ABOUT_CONTENT.paragraphs.map((paragraph) => (
            <Typography key={paragraph} variant="body-2" as="p" className="text-[#293239] font-normal font-argestadisplay">
              {paragraph}
            </Typography>
          ))}

          <a
            href={ABOUT_CONTENT.cta.href}
            className="mt-2 inline-flex h-12 w-fit items-stretch overflow-hidden rounded border border-[#FCCC2D] bg-[#FCCC2D]"
          >
            <span className="flex h-full items-center px-4">
              <Typography variant="button-1" as="span" className="text-[#212121] font-semibold font-manrope">
                {ABOUT_CONTENT.cta.label}
              </Typography>
            </span>

            <span className="flex h-full w-12 shrink-0 items-center justify-center border-[3px] border-[#FCCC2D] bg-black">
              <ArrowUpRight className="h-4 w-4 text-[#FCCC2D]" />
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}
