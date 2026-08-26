import { ArrowUpRight } from "lucide-react";
import { ABOUT_CONTENT } from "@/domains/home/constants/hope";
import Typography from "@/lib/Typography";

export default function AboutSection() {
  return (
    <section className="bg-gradient-to-b from-[#FFF6D8] to-white px-6 py-6 md:py-10 lg:py-20">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] lg:gap-16">
        <Typography
          variant="editorial-lg"
          as="h2"
          className="font-tiempos-headline leading-tight text-[#382E07]"
        >
          {ABOUT_CONTENT.heading.map((line) => (
            <span key={line} className="block">
              {line}
            </span>
          ))}
        </Typography>

        <div className="flex flex-col gap-5">
          {ABOUT_CONTENT.paragraphs.map((paragraph) => (
            <Typography
              key={paragraph}
              variant="subheading"
              as="p"
              className="font-argestadisplay font-normal text-[#293239]"
            >
              {paragraph}
            </Typography>
          ))}

          <a
            href={ABOUT_CONTENT.cta.href}
            className="mt-2 inline-flex w-fit items-stretch overflow-hidden bg-[#FCCC2D]"
          >
            <span className="flex items-center px-5 py-2">
              <Typography
                variant="body"
                as="span"
                className="font-manrope font-bold tracking-wide text-[#090909]"
              >
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