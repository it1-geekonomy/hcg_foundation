"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Typography from "@/lib/Typography";
import { images } from "@/domains/home/constants/float";

export default function HopeSection() {
  // Heading blur reveal — plays once, the first time it scrolls into view.
  const headingRef = useRef<HTMLDivElement | null>(null);
  const [headingVisible, setHeadingVisible] = useState(false);

  useEffect(() => {
    const node = headingRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setHeadingVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="relative w-full overflow-x-hidden pt-10 pb-10 px-8 sm:px-12 md:px-16 lg:py-14 xl:py-30 lg:px-6 xl:px-6 2xl:px-40">
      <div className="flex flex-nowrap justify-center items-start gap-4 sm:gap-4 md:gap-4 lg:gap-8 xl:gap-16 max-w-full mb-16 sm:mb-18 md:mb-26 lg:mb-38">
        {images.map((img, i) => (
          <div
            key={i}
            className={`relative flex-1 min-w-0 lg:flex-none lg:shrink-0 ${img.top} animate-[float_2s_ease-in-out_infinite] sm:animate-[float-sm_2s_ease-in-out_infinite] md:animate-[float-md_2s_ease-in-out_infinite]`}
          >
            <div
              className={`w-full aspect-[3/4] lg:aspect-auto lg:w-[clamp(10rem,13vw,14rem)] lg:h-[clamp(13rem,16vw,17rem)] rounded-md sm:rounded-xl md:rounded-2xl overflow-hidden ${img.rotate}`}
            >
              <Image
                src={img.src}
                alt={`Family photo ${i + 1}`}
                width={200}
                height={260}
                className="w-full h-full object-cover"
                priority={i === 0}
              />
            </div>
          </div>
        ))}
      </div>

      <div ref={headingRef} className="text-center px-2">
        <Typography
          variant="heading-2"
          as="h2"
          className="text-[#382E07] font-tiempos-headline font-normal motion-reduce:!transition-none"
          style={{
            opacity: headingVisible ? 1 : 0,
            filter: headingVisible ? "blur(0px)" : "blur(14px)",
            transform: headingVisible
              ? "translate3d(0,0,0)"
              : "translate3d(0,32px,0)",
            transition:
              "opacity 700ms ease-out, filter 500ms ease-out, transform 1100ms cubic-bezier(0.22, 1, 0.36, 1)",
            willChange: "opacity, filter, transform",
          }}
        >
          Hope Begins With
        </Typography>

        <Typography
          variant="heading-2"
          as="p"
          className="mt-1 text-[#382E07] font-tiempos-headline font-normal motion-reduce:!transition-none"
          style={{
            opacity: headingVisible ? 1 : 0,
            filter: headingVisible ? "blur(0px)" : "blur(14px)",
            transform: headingVisible
              ? "translate3d(0,0,0)"
              : "translate3d(0,32px,0)",
            transition:
              "opacity 700ms ease-out, filter 500ms ease-out, transform 1100ms cubic-bezier(0.22, 1, 0.36, 1)",
            transitionDelay: "150ms",
            willChange: "opacity, filter, transform",
          }}
        >
          Your Kindness
        </Typography>
      </div>
    </section>
  );
}