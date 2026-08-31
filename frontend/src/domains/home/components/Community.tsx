"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import Typography from "@/lib/Typography";
import { communityTags, communityContent } from "@/domains/home/constants/community";

const tagRows = [communityTags.slice(0, 3), communityTags.slice(3, 6)];

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
    <section className="w-full py-10 md:py-10 px-8 sm:px-12 md:px-16 lg:py-14 xl:py-30 lg:px-6 xl:px-6 2xl:px-40">
      <div className="max-w-full">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8 lg:gap-12 mb-10 md:mb-14">
          <div className="order-2 lg:order-1 lg:w-auto shrink-0">
            <div className="flex sm:hidden flex-wrap gap-2 font-manrope">
              {communityTags.map((tag, i) => (
                <Typography variant="label-1"
                  as="span"
                  key={i}
                  className="px-3 py-1.5 bg-[#876900] text-white text-center whitespace-nowrap font-light"
                >
                  {tag}
                </Typography>
              ))}
            </div>

            <div className="hidden sm:flex flex-col gap-2 md:gap-3">
              {tagRows.map((row, rowIndex) => (
                <div key={rowIndex} className="flex gap-2 md:gap-3 font-manrope">
                  {row.map((tag, i) => (
                    <Typography variant="label-1"
                      as="span"
                      key={i}
                      className="px-3 md:px-4 py-1.5 md:py-2 bg-[#876900] text-white text-center whitespace-nowrap font-light"
                    >
                      {tag}
                    </Typography>
                  ))}
                </div>
              ))}
            </div>
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
            className="object-cover object-center hidden md:block"
            priority
          />

          <div
            className={`absolute left-4 right-4 bottom-4 w-auto max-w-none p-4 md:left-8 md:right-auto md:top-auto md:bottom-8 md:max-w-xs lg:bottom-12 lg:max-w-lg lg:p-6 xl:bottom-20 xl:max-w-lg xl:p-6 bg-white/[0.12] backdrop-blur-sm border border-white/10 rounded-xl transition-all duration-700 ease-out ${inView
              ? "opacity-100 scale-100 translate-y-0"
              : "opacity-0 scale-95 translate-y-10"
              }`}
          >
            <div className="flex items-center gap-2 mb-2 md:mb-3 lg:mb-16">
              <span className="w-3 h-3 rounded-full bg-white" />
              <Typography variant="body-3" as="span" className="text-white font-argestadisplay font-light">
                {communityContent.overlay.label}
              </Typography>
            </div>

            <Typography variant="heading-6"
              as="h3"
              className="text-white mb-2 md:mb-3 lg:mb-6 font-tiempos-fine font-normal"
            >
              {communityContent.overlay.heading}
            </Typography>

            <Typography variant="body-7" as="p" className="text-white mb-4 md:mb-5 lg:mb-6 font-light font-argestadisplay">
              {communityContent.overlay.description}
            </Typography>

            <button
              type="button"
              onClick={scrollToDonateForm}
              className="inline-flex items-center gap-2 px-5 py-2 md:px-6 md:py-2.5 lg:py-3 bg-[#FCCC2D] hover:bg-[#e0b410] transition-colors"
            >
              <Typography variant="button-1" as="span" className="text-[#373737] font-manrope font-medium">
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