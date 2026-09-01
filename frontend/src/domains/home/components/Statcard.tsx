"use client";

import type { Stat } from "@/domains/home/constants/stat";
import Typography from "@/lib/Typography";
import Ribbon from "./Ribbon";
import { useCountUp } from "@/domains/home/constants/Usecountup";

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
      <div className="relative h-72 w-[202px]">
        <Ribbon id={id} delay={stat.delay} active={active} />

        <Typography variant="display-2"
          as="span"
          className="pointer-events-none absolute top-[30%] whitespace-nowrap px-1 text-[#2E1C12] drop-shadow-sm font-bold lg:hidden"
          style={{ left: "47%", transform: "translateX(-50%) translateY(-50%)" }}
        >
          {count.toLocaleString()}
          {stat.suffix}
        </Typography>
        <Typography variant="heading-7"
          as="span"
          className="pointer-events-none absolute top-[30%] whitespace-nowrap px-1 text-[#2E1C12] drop-shadow-sm font-bold hidden lg:block"
          style={{ left: "47%", transform: "translateX(-50%) translateY(-50%)" }}
        >
          {count.toLocaleString()}
          {stat.suffix}
        </Typography>
      </div>

      <Typography variant="body-4"
        as="p"
        className="mt-2 whitespace-pre-line text-center text-black font-light"
      >
        {stat.label}
      </Typography>
    </div>
  );
}
