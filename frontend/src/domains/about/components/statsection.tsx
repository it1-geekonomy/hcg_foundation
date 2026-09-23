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
      className={`w-full overflow-x-hidden bg-[#FFF8E2] pb-8 pt-0 lg:pt-0 lg:pb-14 xl:pb-20 px-8 sm:px-12 md:px-16 lg:px-6 xl:px-6 2xl:pl-40 2xl:pr-40 min-[1536px]:max-[1800px]:!pr-16 ${className}`}
    >
      <div className="grid grid-cols-2 sm:grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <div
            key={index}
            className={`relative min-w-0 text-center lg:text-left lg:pl-10 lg:pr-10 xl:pl-12 xl:pr-12 2xl:pl-14 2xl:pr-14 lg:first:pl-0 lg:last:pr-0 ${
              index === 2 ? "min-[1536px]:max-[1800px]:!pr-4" : ""
            }`}
          >
            {/* Divider (fades top/bottom), hidden before the first item and below lg */}
            {index !== 0 && (
              <span
                aria-hidden
                className="absolute left-0 top-0 hidden h-full w-px lg:block bg-[linear-gradient(180deg,rgba(51,51,51,0)_0%,rgba(26,26,26,0.15)_50%,rgba(0,0,0,0.08)_100%)]"
              />
            )}

            {/* Value: default variant everywhere except lg, where it's hidden */}
            <Typography
              variant="display-2"
              as="p"
              className="lg:hidden xl:block font-manrope font-medium bg-[linear-gradient(90deg,#F8AC02_0%,#CD9E01_100%)] bg-clip-text text-transparent"
            >
              {stat.value}
            </Typography>
            {/* Value: heading-1 variant, shown only at lg */}
            <Typography
              variant="heading-3"
              as="p"
              className="hidden lg:block xl:hidden font-manrope font-medium bg-[linear-gradient(90deg,#F8AC02_0%,#CD9E01_100%)] bg-clip-text text-transparent"
            >
              {stat.value}
            </Typography>

            {/* Description: default variant everywhere except lg, where it's hidden */}
            <Typography
              variant="body-2"
              as="p"
              className="lg:hidden xl:block mt-2 font-normal font-argestadisplay text-[#8F8F8F]"
            >
              {stat.label}
            </Typography>
            {/* Description: body-7 variant, shown only at lg */}
            <Typography
              variant="body-6"
              as="p"
              className="hidden lg:block xl:hidden mt-2 font-normal font-argestadisplay text-[#8F8F8F]"
            >
              {stat.label}
            </Typography>
          </div>
        ))}
      </div>
    </section>
  );
}