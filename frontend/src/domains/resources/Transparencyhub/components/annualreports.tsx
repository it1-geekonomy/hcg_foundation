"use client";

import { useEffect, useState } from "react";
import Typography from "@/lib/Typography";
import {
  BREAKPOINTS,
  getBreakpoint,
  REPORTS,
} from "@/domains/resources/Transparencyhub/constants/annualreport";

export default function AnnualReportsSection() {
  const [breakpoint, setBreakpoint] = useState(BREAKPOINTS[0]);
  const [page, setPage] = useState(0);

  useEffect(() => {
    function handleResize() {
      setBreakpoint(getBreakpoint(window.innerWidth));
      setPage(0); // reset to first page when layout density changes
    }
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const { perPage, cols } = breakpoint;
  const totalPages = Math.ceil(REPORTS.length / perPage);
  const visibleReports = REPORTS.slice(page * perPage, page * perPage + perPage);

  function handleOpen(pdfUrl: string) {
    window.open(pdfUrl, "_blank", "noopener,noreferrer");
  }

  function handleDownload(e: React.MouseEvent, pdfUrl: string) {
    e.stopPropagation();
    const link = document.createElement("a");
    link.href = pdfUrl;
    link.download = pdfUrl.split("/").pop() || "annual-report.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <section className="bg-[#FFF8E2] pt-6 pb-6 px-8 sm:px-12 md:px-16 lg:py-20 lg:px-6 xl:px-6 2xl:px-40">
      <div className="text-center">
        <div className="mb-4 flex items-center justify-center gap-2">
          <span className="h-2 w-2 rounded-full bg-[#FCCC2D]" />
          <Typography variant="body-7" as="span" className="text-[#6F5E09] font-manrope font-normal">
            transparency
          </Typography>
        </div>

        <Typography variant="heading-3" as="h2" className="font-tiempos-headline font-normal">
          Annual Reports & Impact
        </Typography>

        <Typography variant="body-2" as="p" className="mx-auto mt-4 max-w-2xl font-normal font-argestadisplay">
          Explore our annual reports to see the impact of cancer awareness,
          patient support, and community healthcare initiatives.
        </Typography>
      </div>

      <div className={`mt-10 grid ${cols} gap-4 lg:gap-5`}>
        {visibleReports.map((report, idx) => (
          <div
            key={`${page}-${idx}`}
            role="button"
            tabIndex={0}
            onClick={() => handleOpen(report.pdfUrl)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") handleOpen(report.pdfUrl);
            }}
            className="flex cursor-pointer items-start gap-3 rounded-2xl bg-[#FFFCF3] p-4 shadow-sm transition-shadow hover:shadow-md"
          >
            {/* PDF icon — background fills the full card height, icon scales up on larger screens */}
            <div className="flex h-full w-12 sm:w-14 lg:w-16 shrink-0 items-center justify-center rounded-lg bg-[#FFEBAF]">
              <img src="/pdficon.png" alt="PDF" className="h-10 w-10 sm:h-12 sm:w-12 lg:h-10 lg:w-10" />
            </div>

            <div className="min-w-0 flex-1">
              <Typography
                variant="body-5"
                as="h3"
                className="line-clamp-2 text-[#0D2838] mb-2 font-manrope font-bold leading-snug"
              >
                {report.title}
              </Typography>

              {/* Description row — download icon now lives at the end of this row */}
              <div className="flex items-start justify-between gap-2">
                <Typography
                  variant="caption-1"
                  as="p"
                  className="line-clamp-4 text-[#606060] font-manrope font-medium"
                >
                  {report.description}
                </Typography>

                <button
                  type="button"
                  onClick={(e) => handleDownload(e, report.pdfUrl)}
                  aria-label={`Download ${report.title}`}
                  className="shrink-0 rounded-full p-1 hover:bg-black/5"
                >
                  <img src="/downloadbtn.png" alt="Download" className="h-6 w-6 sm:h-6 sm:w-6 lg:h-8 lg:w-8" />
                </button>
              </div>

              <Typography
                variant="caption-1"
                as="p"
                className="mt-2 font-medium text-[#111111] font-manrope"
              >
                {report.pages}
              </Typography>
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setPage(i)}
              aria-label={`Go to page ${i + 1}`}
              className={`h-2 rounded-full transition-all ${
                i === page ? "w-6 bg-[#FCCC2D]" : "w-2 bg-[#FCCC2D]/30"
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}