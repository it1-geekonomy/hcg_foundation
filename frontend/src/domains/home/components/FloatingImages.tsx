"use client";

import Image from "next/image";
import Typography from "@/lib/Typography";
import { images } from "@/domains/home/constants/float";

export default function HopeSection() {
  return (
    <section className="relative w-full overflow-x-hidden py-10 md:py-10 px-8 sm:px-12 md:px-16 lg:py-14 xl:py-30 lg:px-6 xl:px-6 2xl:px-40">
      <div className="flex flex-nowrap justify-center items-start gap-4 sm:gap-4 md:gap-4 lg:gap-8 xl:gap-16 max-w-full mb-16 sm:mb-18 md:mb-26 lg:mb-38">
        {images.map((img, i) => (
          <div
            key={i}
            className={`relative flex-1 min-w-0 lg:flex-none lg:shrink-0 ${img.top} ${img.rotate} animate-float sm:animate-float-sm md:animate-float-md [animation-delay:${img.delay}] [animation-duration:${img.duration}]`}
          >
            <div className="w-full aspect-[3/4] lg:aspect-auto lg:w-[clamp(10rem,13vw,14rem)] lg:h-[clamp(13rem,16vw,17rem)] rounded-md sm:rounded-xl md:rounded-2xl overflow-hidden">
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

      <div className="text-center px-2">
        <Typography variant="heading-2"
          as="h2"
          className="text-[#382E07] font-tiempos-headline font-normal"
        >
          Hope Begins With
        </Typography>

        <Typography variant="heading-2"
          as="p"
          className="mt-1 text-[#382E07] font-tiempos-headline font-normal"
        >
          Your Kindness
        </Typography>
      </div>
    </section>
  );
}
