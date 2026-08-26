"use client";

import Image from "next/image";
import Typography from "@/lib/Typography";
import { images } from "@/domains/home/constants/float";

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
            <div className="w-full aspect-[3/4] md:aspect-auto md:w-[clamp(8rem,10vw,10rem)] md:h-[clamp(10rem,13vw,13rem)] rounded-md sm:rounded-xl md:rounded-2xl overflow-hidden">
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