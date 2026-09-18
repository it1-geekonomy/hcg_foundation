import Typography from "@/lib/Typography";
import { stats } from "@/domains/about/constants/stats";

export interface StatsHighlightProps {
  /** Override the section background color/class if needed */
  className?: string;
}

/**
 * Stats strip (About Us impact numbers).
 * Values/labels are sourced from `@/data/stats` rather than props.
 */
export default function StatsHighlight({ className = "" }: StatsHighlightProps) {
  return (
    <section
      className={`w-full overflow-x-hidden bg-[#FFF8E2] pt-6 pb-6 px-8 sm:px-12 md:px-16 lg:py-10 xl:py-20 lg:px-6 xl:px-6 2xl:px-40 ${className}`}
    >
      <div className="grid grid-cols-2 sm:grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-4 sm:gap-x-0">
        {stats.map((stat, index) => (
          <div key={index} className="relative min-w-0 text-center lg:text-left sm:px-8 first:sm:pl-0 last:sm:pr-0">
            {/* Divider (fades top/bottom), hidden before the first item and below lg */}
            {index !== 0 && (
              <span
                aria-hidden
                className="absolute left-0 top-0 hidden h-full w-px lg:block bg-[linear-gradient(180deg,rgba(51,51,51,0)_0%,rgba(26,26,26,0.6)_50%,rgba(0,0,0,0.2)_100%)]"
              />
            )}

            <Typography
              variant="display-2"
              as="p"
              className="font-manrope font-medium bg-[linear-gradient(90deg,#F8AC02_0%,#CD9E01_100%)] bg-clip-text text-transparent"
            >
              {stat.value}
            </Typography>

            <Typography
              variant="body-2"
              as="p"
              className="mt-2 font-normal font-argestadisplay text-[#8F8F8F]"
            >
              {stat.label}
            </Typography>
          </div>
        ))}
      </div>
    </section>
  );
}