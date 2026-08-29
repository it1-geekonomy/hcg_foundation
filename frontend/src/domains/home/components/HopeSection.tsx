import { ArrowUpRight } from "lucide-react";
import { ABOUT_CONTENT } from "@/domains/home/constants/hope";
import Typography from "@/lib/Typography";

export default function AboutSection() {
  return (
    <section className="py-6 md:py-10 lg:py-30 px-4 md:px-10 lg:px-16 xl:px-30 lg:py-20">
      <div className="grid max-w-full grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] lg:gap-16">
        <Typography variant="heading-1"
          as="h2"
          className="text-[#382E07] lg:text-nowrap"
        >
          {ABOUT_CONTENT.heading.map((line) => (
            <span key={line} className="block">
              {line}
            </span>
          ))}
        </Typography>

        <div className="flex flex-col gap-5">
          {ABOUT_CONTENT.paragraphs.map((paragraph) => (
            <Typography key={paragraph} variant="body-2" as="p" className="text-[#293239]">
              {paragraph}
            </Typography>
          ))}

          <a
            href={ABOUT_CONTENT.cta.href}
            className="mt-2 inline-flex w-fit items-stretch overflow-hidden bg-[#FCCC2D]"
          >
            <span className="flex items-center px-5 py-2">
              <Typography variant="button-3" as="span" className="text-[#212121]">
                {ABOUT_CONTENT.cta.label}
              </Typography>
            </span>

            <span className="flex items-center p-2">
              <span className="flex h-full w-full items-center justify-center bg-black px-1">
                <ArrowUpRight className="h-5 w-5 text-[#FCCC2D]" />
              </span>
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}
