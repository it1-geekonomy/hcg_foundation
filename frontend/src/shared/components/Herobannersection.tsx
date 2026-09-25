import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import Typography from "@/lib/Typography";

export interface BannerBreadcrumb {
  label: string;
  href?: string;
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
}

export interface BannerProps {
  bgImage: string;
  /** Optional image shown below the lg breakpoint (1024px). Falls back to bgImage if omitted. */
  bgImageMobile?: string;
  bgImageAlt?: string;
  breadcrumbs?: BannerBreadcrumb[];
  subtitle?: string;
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  className?: string;
}

export default function Banner({
  bgImage,
  bgImageMobile,
  bgImageAlt = "",
  breadcrumbs,
  title,
  className = "",
}: BannerProps) {
  return (
    <section className={`relative isolate grid w-full ${className}`}>
      {/* Below 1024px */}
      <Image
        src={bgImageMobile ?? bgImage}
        alt={bgImageAlt}
        width={1920}
        height={1080}
        priority
        sizes="100vw"
        className="col-start-1 row-start-1 block h-auto w-full object-contain lg:hidden"
      />
      {/* 1024px and up */}
      <Image
        src={bgImage}
        alt={bgImageAlt}
        width={1920}
        height={1080}
        priority
        sizes="100vw"
        className="col-start-1 row-start-1 hidden h-auto w-full object-contain lg:block"
      />

      <div className="relative col-start-1 row-start-1 z-10 flex items-end px-8 py-6 lg:items-center lg:px-6 lg:py-14 xl:px-6 xl:py-20 2xl:px-40">
        <div className="w-full lg:mt-8 xl:mt-10">
          {breadcrumbs && breadcrumbs.length > 0 && (
            <nav aria-label="Breadcrumb" className="mb-2 lg:mb-10 xl:mb-16">
              <ol className="flex flex-wrap items-center gap-2 text-white/90">
                <li aria-hidden className="h-2 w-2 shrink-0 rounded-full bg-[#FCCC2D]" />
                {breadcrumbs.map((crumb, index) => {
                  const isLast = index === breadcrumbs.length - 1;
                  const label = (
                    <>
                      <Typography variant="caption-2" as="span" className="block font-manrope font-light lg:hidden">
                        {crumb.label}
                      </Typography>
                      <Typography variant="text-1" as="span" className="hidden font-manrope font-light lg:inline">
                        {crumb.label}
                      </Typography>
                    </>
                  );
                  return (
                    <li key={`${crumb.label}-${index}`} className="flex items-center gap-2">
                      {crumb.href && !isLast ? (
                        <Link href={crumb.href} onClick={crumb.onClick} className="transition-colors hover:text-[#FCCC2D]">
                          {label}
                        </Link>
                      ) : (
                        <span className="text-white/90">{label}</span>
                      )}
                      {!isLast && (
                        <ChevronRight aria-hidden className="h-5 w-6 shrink-0 text-white/90" />
                      )}
                    </li>
                  );
                })}
              </ol>
            </nav>
          )}

          <Typography variant="heading-4" as="h1" className="block font-normal font-tiempos-headline text-white lg:hidden">
            {title}
          </Typography>
          <Typography variant="heading-2" as="h1" className="hidden font-normal font-tiempos-headline text-white lg:block">
            {title}
          </Typography>
        </div>
      </div>
    </section>
  );
}