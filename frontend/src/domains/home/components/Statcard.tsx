"use client";

import type { Stat } from "@/domains/home/constants/stat";
import Typography from "@/lib/Typography";
import Ribbon from "./Ribbon";
import { useCountUp } from "@/domains/home/constants/Usecountup";

/* =========================================================
   STAT CARD
========================================================= */

export default function StatCard({ stat, active, id }: { stat: Stat; active: boolean; id: string }) {
  const count = useCountUp(stat.value, active);

  return (
    <div
      className="flex flex-col items-center transition-all duration-700"
      style={{
        opacity: active ? 1 : 0,
        transform: active ? "translateY(0)" : "translateY(24px)",
        transitionDelay: `${stat.delay}s`,
      }}
    >
      <div className="relative">
        <Ribbon id={id} delay={stat.delay} active={active} />

        <Typography
          variant="hero"
          as="span"
          className="pointer-events-none absolute left-1/3 top-[30%] -translate-x-1/5 -translate-y-1/2 whitespace-nowrap px-1 font-bold font-manrope tracking-tight text-stone-900 drop-shadow-sm"
        >
          {count.toLocaleString()}
          {stat.suffix}
        </Typography>
      </div>

      <Typography
        variant="body-lg"
        as="p"
        className="mt-2 whitespace-pre-line text-center font-tiempos-headline font-normal text-[#000000]"
      >
        {stat.label}
      </Typography>
    </div>
  );
}