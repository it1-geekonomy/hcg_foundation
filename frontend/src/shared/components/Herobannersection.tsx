import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import Typography from "@/lib/Typography";
export interface BannerBreadcrumb {
  label: string;
  href?: string;
}
export interface BannerProps {
  bgImage: string;
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
  bgImageAlt = "",
  breadcrumbs,
  title,
  className = "",
}: BannerProps) {
  return (
    <section
      className={`relative isolate min-h-[420px] w-full overflow-hidden sm:min-h-[500px] lg:min-h-[740px] ${className}`}
    >
      <Image
        src={bgImage}
        alt={bgImageAlt}
        fill
        priority
        sizes="100vw"
        className="object-cover object-center"
      />
    <div className="absolute inset-0 z-10 flex items-center px-6 sm:px-10 xl:px-40 mt-30 sm:mt-32 lg:mt-40">
        <div className="w-full">
          {breadcrumbs && breadcrumbs.length > 0 && (
            <nav aria-label="Breadcrumb" className="mb-6 sm:mb-16">
              <ol className="flex flex-wrap items-center gap-2 text-white/90">
                <li aria-hidden className="h-2 w-2 shrink-0 rounded-full bg-[#FCCC2D]" />
                {breadcrumbs.map((crumb, index) => {
                  const isLast = index === breadcrumbs.length - 1;
                  return (
                    <li key={`${crumb.label}-${index}`} className="flex items-center gap-2">
                      {crumb.href && !isLast ? (
                        <Link
                          href={crumb.href}
                          className="transition-colors hover:text-[#FCCC2D]"
                        >
                          <Typography variant="text-1" as="span" className="font-light font-manrope">
                            {crumb.label}
                          </Typography>
                        </Link>
                      ) : (
                        <Typography
                          variant="text-1"
                          as="span"
                          className="font-light font-manrope text-white/90"
                        >
                          {crumb.label}
                        </Typography>
                      )}
                      {!isLast && (
                        <ChevronRight
                          aria-hidden
                          className="h-5 w-6 shrink-0 text-white/90"
                        />
                      )}
                    </li>
                  );
                })}
              </ol>
            </nav>
          )}
          <Typography
            variant="heading-2"
            as="h1"
            className="font-tiempos-headline text-white font-normal"
          >
            {title}
          </Typography>
        </div>
      </div>
    </section>
  );
}