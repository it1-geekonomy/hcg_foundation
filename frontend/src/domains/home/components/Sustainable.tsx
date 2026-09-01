import Image from "next/image";
import Typography from "@/lib/Typography";
import {
  sustainableGoals,
  sustainableGoalsTheme,
} from "@/domains/home/constants/sustainableGoals";

export default function SustainableGoalsSection() {
  return (
    <section className="w-full bg-[#FFF6D8] px-4 md:px-4 lg:py-14 xl:py-30 lg:px-6 xl:px-6 2xl:px-40">

      <div
        className="flex w-full flex-col overflow-hidden rounded-sm lg:flex-row lg:items-center"
        style={{ backgroundColor: sustainableGoalsTheme.panelBg }}
      >
        {/* Box heading: rendered below lg (centered) and at lg+ (left-aligned) */}
        <div className="flex-1 items-center justify-center px-6 py-8 lg:justify-start lg:px-6 lg:py-16 xl:px-14 xl:py-16 2xl:px-20">
          <Typography
            variant="heading-3"
            as="h2"
            className="max-w-full font-tiempos-headline font-light text-white text-center lg:!text-left lg:heading-4"
          >
            Sustainable Development Goals
          </Typography>
        </div>

        {/* Below md (768px): grid-cols-2, full width, px-6, order box1,box2,box4,box3.
            md+: unchanged (cols-4 grid, then lg: flex row) */}
        <div className="grid w-full grid-cols-2 justify-items-center gap-4 px-6 py-6 md:w-auto md:grid-cols-4 md:gap-1.5 md:justify-items-stretch md:p-4 lg:flex lg:shrink-0 lg:items-center lg:gap-0 lg:p-4">
          {sustainableGoals.map((goal, idx) => {
            // Below 768px order: box1, box2, box4, box3
            const orderClass =
              idx === 0
                ? "order-1"
                : idx === 1
                  ? "order-2"
                  : idx === 2
                    ? "order-4" // box3 → last
                    : "order-3"; // box4 → third

            return (
              <div
                key={goal.number}
                className={`relative flex aspect-square w-full flex-col px-1 md:order-none lg:w-36 xl:w-44 2xl:w-48 ${orderClass}`}
                style={{ backgroundColor: goal.bg }}
              >
                <Typography
                  variant="heading-3"
                  as="span"
                  className="block shrink-0 font-bold font-manrope !text-left leading-none text-white/30"
                >
                  {goal.number}
                </Typography>

                <div className="flex flex-1 items-center justify-center">
                  <Image
                    src={goal.icon}
                    alt={goal.title}
                    width={80}
                    height={80}
                    className="h-[clamp(5rem,12vw,5rem)] w-[clamp(5rem,12vw,5rem)] object-contain sm:h-[clamp(6rem,14vw,7rem)] sm:w-[clamp(6rem,14vw,7rem)] md:h-[clamp(3rem,6vw,5rem)] md:w-[clamp(3rem,6vw,5rem)]"
                  />
                </div>

                <div className="w-full flex h-8 shrink-0 items-center justify-center pb-3 sm:h-9 md:pb-0 lg:mt-3 lg:h-10 xl:h-11">
                  <Typography
                    variant="caption-1"
                    as="span"
                    className="line-clamp-4 text-center font-manrope font-light uppercase leading-tight tracking-wide text-white"
                  >
                    {goal.title}
                  </Typography>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}