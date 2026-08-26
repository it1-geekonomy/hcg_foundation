"use client";

import Image from "next/image";
import Typography from "@/lib/Typography";

const images = [
  { src: "/Kindness/kindness.png", rotate: "-rotate-6", delay: "0s", duration: "4s", top: "top-2 md:top-4" },
  { src: "/Kindness/kindness2.png", rotate: "rotate-3", delay: "0.7s", duration: "4.5s", top: "top-6 md:top-16" },
  { src: "/Kindness/kindness3.png", rotate: "-rotate-2", delay: "1.3s", duration: "5s", top: "top-0" },
  { src: "/Kindness/kindness4.png", rotate: "rotate-6", delay: "0.4s", duration: "4.2s", top: "top-4 md:top-10" },
  { src: "/Kindness/kindness5.png", rotate: "-rotate-3", delay: "1s", duration: "4.8s", top: "top-2 md:top-6" },
];

export default function HopeSection() {
  return (
    <section className="relative w-full bg-gradient-to-b from-[#FFF6D8] to-white overflow-x-hidden py-14 sm:py-10 md:py-20 px-4 lg:px-6">
      {/* Floating Images Row */}
      <div className="flex flex-nowrap justify-center items-start gap-4 sm:gap-4 md:gap-4 lg:gap-8 xl:gap-10 max-w-6xl mx-auto mb-10 sm:mb-16 md:mb-20">
        {images.map((img, i) => (
          <div
            key={i}
            className={`relative flex-1 min-w-0 md:flex-none md:shrink-0 ${img.top} ${img.rotate} animate-float sm:animate-float-sm md:animate-float-md [animation-delay:${img.delay}] [animation-duration:${img.duration}]`}
          >
            <div className="w-full aspect-[3/4] md:w-32 md:h-40 lg:w-36 lg:h-48 xl:w-40 xl:h-52 md:aspect-auto rounded-md sm:rounded-xl md:rounded-2xl overflow-hidden">
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

      {/* Heading Text */}
      <div className="text-center px-2">
        <Typography
          variant="editorial-lg"
          as="h2"
          className="font-tiempos-headline font-normal text-[#382E07]"
        >
          Hope Begins With
        </Typography>

        <Typography
          variant="editorial-lg"
          as="p"
          className="font-tiempos-headline font-normal italic text-[#382E07] mt-1"
        >
          Your Kindness
        </Typography>
      </div>
    </section>
  );
}