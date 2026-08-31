import Image from "next/image";
import Typography from "@/lib/Typography";
import {
  sustainableGoals,
  sustainableGoalsTheme,
} from "@/domains/home/constants/sustainableGoals";

export default function SustainableGoalsSection() {
  return (
    <section className="w-full bg-[#FFF6D8] py-10 md:py-10 px-4 md:px-4 lg:py-14 xl:py-30 lg:px-6 xl:px-6 2xl:px-40">
      {/* Below lg: heading sits outside the gray box, on the section's own
          bg-[#FFF6D8] background — so it switches to a dark color here.
          Hidden at lg+, where the box-version below takes over instead. */}
      <div className="mb-6 lg:hidden">
        <Typography
          variant="heading-2"
          as="h2"
          className="max-w-full font-tiempos-headline font-light text-[#090909]"
        >
          Sustainable Development Goals
        </Typography>
      </div>

      <div
        className="flex w-full flex-col overflow-hidden rounded-sm lg:flex-row lg:items-center"
        style={{ backgroundColor: sustainableGoalsTheme.panelBg }}
      >
        {/* Box heading: only rendered from lg up, back on the colored panel */}
        <div className="hidden flex-1 items-center px-6 py-16 lg:flex lg:px-6 xl:px-14 xl:py-16 2xl:px-20">
          <Typography
            variant="heading-2"
            as="h2"
            className="max-w-full font-tiempos-headline font-light text-white"
          >
            Sustainable Development Goals
          </Typography>
        </div>

        {/* Below md (cols-1 / cols-2): boxes get a fixed clamp() size instead
            of stretching to fill the column — that's what was making them
            oversized — and justify-items-center keeps them centered in each
            cell (this matters most at cols-1, where a lone box would
            otherwise sit flush left). At md (cols-4) and lg, sizing goes
            back to filling the column / the original fixed widths. */}
        <div className="grid grid-cols-2 justify-items-center gap-2 p-3 sm:grid-cols-3 sm:gap-2 md:grid-cols-4 md:gap-1.5 md:justify-items-stretch md:p-4 lg:flex lg:shrink-0 lg:items-center lg:gap-0 lg:p-4">
          {sustainableGoals.map((goal) => (
            <div
              key={goal.number}
              className="relative flex aspect-square w-[clamp(140px,38vw,180px)] flex-col p-2 sm:w-[clamp(140px,30vw,180px)] sm:p-4 md:w-full lg:w-36 xl:w-44 2xl:w-48"
              style={{ backgroundColor: goal.bg }}
            >
              <Typography
                variant="display-2"
                as="span"
                className="block shrink-0 font-bold text-left leading-none text-white/30"
              >
                {goal.number}
              </Typography>

              {/* This flex-1 spacer always gets the exact same leftover
                  height on every card, because the number row and the label
                  box below are both fixed heights now (not just min-heights),
                  so all four icons land on the same row. */}
              <div className="flex flex-1 items-center justify-center mt-6">
                <Image
                  src={goal.icon}
                  alt={goal.title}
                  width={80}
                  height={80}
                  className="h-[clamp(3rem,6vw,5rem)] w-[clamp(3rem,6vw,5rem)] object-contain"
                />
              </div>

              {/* Fixed height (not min-h) + line-clamp-2 = identical box on
                  every card whether the label is 1 line or 2. */}
              <div className="w-full flex h-8 shrink-0 items-center justify-center sm:h-9 lg:mt-3 lg:h-10 xl:h-11">
                <Typography
                  variant="caption-1"
                  as="span"
                  className="line-clamp-4 text-center font-semibold uppercase leading-tight tracking-wide text-white"
                >
                  {goal.title}
                </Typography>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}