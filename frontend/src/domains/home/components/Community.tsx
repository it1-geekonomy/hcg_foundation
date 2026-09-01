"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import Typography from "@/lib/Typography";
import {
  communityContent,
  communityTagRows,
  communityTheme,
} from "@/domains/home/constants/community";

export default function CommunitySection() {
  const mediaRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = mediaRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting);
      },
      { threshold: 0.2 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const scrollToDonateForm = () => {
    document.getElementById("donate-form")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="w-full px-6 sm:px-10 md:px-14 lg:px-16 lg:py-16 xl:px-24 2xl:px-32">
      <div className="mx-auto max-w-[1400px]">
        {/* Tags left · heading + body right · vertically centered (Figma) */}
        <div className="mb-10 flex flex-col gap-8 md:mb-14 lg:mb-14 lg:flex-row lg:items-center lg:justify-between lg:gap-12 xl:gap-20">
          <div className="order-2 flex flex-col gap-2 md:gap-5 lg:order-1 lg:max-w-[min(100%,32rem)] lg:shrink-0">
            {communityTagRows.map((row, rowIndex) => (
              <div key={rowIndex} className="flex flex-wrap gap-2 md:gap-3">
                {row.map((tag) => (
                  <Typography
                    key={tag}
                    variant="label-2"
                    as="span"
                    className="rounded-xs px-3 py-1.5 text-center font-manrope font-normal whitespace-nowrap md:px-4 md:py-2"
                    style={{
                      backgroundColor: communityTheme.tagBg,
                      color: communityTheme.tagText,
                    }}
                  >
                    {tag}
                  </Typography>
                ))}
              </div>
            ))}
          </div>

          <div className="order-1 lg:order-2 max-w-4xl lg:text-left font-tiempos-text">
            <Typography variant="heading-2"
              as="h2"
              className="text-[#382E07] font-medium"
            >
              {communityContent.heading}
            </Typography>
            <Typography variant="body-2" as="p" className="text-[#2D2300C2] mt-3 md:mt-4 font-light font-argestadisplay">
              {communityContent.description}
            </Typography>
          </div>
        </div>

        <div
          ref={mediaRef}
          className="relative w-full h-[500px] md:h-auto md:aspect-[16/8] overflow-hidden rounded"
        >
          <Image
            src="/community/communitymobile.png"
            alt={communityContent.image.alt}
            fill
            className="object-cover object-top block md:hidden"
            priority
          />

          <Image
            src={communityContent.image.src}
            alt={communityContent.image.alt}
            fill
            className="hidden object-cover object-center md:block"
            priority
          />

          <div
            className={`absolute bottom-4 left-4 right-4 w-auto max-w-none rounded-xl border border-white/10 bg-white/[0.12] p-4 backdrop-blur-sm transition-all duration-700 ease-out md:bottom-8 md:left-8 md:right-auto md:max-w-xs lg:bottom-12 lg:max-w-lg lg:p-6 xl:bottom-20 xl:max-w-lg xl:p-6 ${inView
              ? "translate-y-0 scale-100 opacity-100"
              : "translate-y-10 scale-95 opacity-0"
              }`}
          >
            <div className="mb-2 flex items-center gap-2 md:mb-3 lg:mb-16">
              <span className="h-3 w-3 rounded-full bg-white" />
              <Typography
                variant="body-3"
                as="span"
                className="font-argestadisplay font-light text-white"
              >
                {communityContent.overlay.label}
              </Typography>
            </div>

            <Typography
              variant="heading-6"
              as="h3"
              className="mb-2 font-tiempos-fine font-normal text-white md:mb-3 lg:mb-6"
            >
              {communityContent.overlay.heading}
            </Typography>

            <Typography
              variant="body-7"
              as="p"
              className="mb-4 font-argestadisplay font-light text-white md:mb-5 lg:mb-6"
            >
              {communityContent.overlay.description}
            </Typography>

            <button
              type="button"
              onClick={scrollToDonateForm}
              className="inline-flex items-center gap-2 bg-[#FCCC2D] px-5 py-2 transition-colors hover:bg-[#e0b410] md:px-6 md:py-2.5 lg:py-3"
            >
              <Typography
                variant="button-1"
                as="span"
                className="font-manrope font-medium text-[#373737]"
              >
                {communityContent.overlay.buttonText}
              </Typography>
              <ArrowUpRight className="h-5 w-5 text-[#373737]" strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
