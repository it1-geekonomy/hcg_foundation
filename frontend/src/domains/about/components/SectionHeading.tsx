import type { ReactNode } from "react";

export function SectionHeading({ children }: { children: ReactNode }) {
  return (
    <div className="mb-10 flex items-center justify-center gap-4 sm:mb-12 sm:gap-6">
      <span className="h-px w-10 bg-[#C4B48A] sm:w-16" aria-hidden />
      <div className="relative">
        <h2 className="font-argestadisplay text-3xl tracking-wide text-[#2B2410] sm:text-4xl md:text-[2.75rem]">
          {children}
        </h2>
        <span
          aria-hidden
          className="absolute -bottom-1 left-1/2 h-[3px] w-[72%] -translate-x-1/2 rounded-full bg-[#C45A7A]"
        />
      </div>
      <span className="h-px w-10 bg-[#C4B48A] sm:w-16" aria-hidden />
    </div>
  );
}
