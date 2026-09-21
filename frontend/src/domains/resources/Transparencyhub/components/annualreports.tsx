"use client";

import { useEffect, useState } from "react";
import Typography from "@/lib/Typography";
import { publicAnnualReportsApi } from "@/domains/cms/lib/api";
import {
  BREAKPOINTS,
  countPdfPages,
  formatPageCount,
  getBreakpoint,
  mapAnnualReportToCard,
  type Report,
} from "@/domains/resources/Transparencyhub/constants/annualreport";

export default function AnnualReportsSection({
  previewReports,
}: {
  previewReports?: Report[];
} = {}) {
  const [breakpoint, setBreakpoint] = useState(BREAKPOINTS[0]);
  const [page, setPage] = useState(0);
  const [reports, setReports] = useState<Report[]>(previewReports ?? []);
  const [loading, setLoading] = useState(!previewReports);

  useEffect(() => {
    function handleResize() {
      setBreakpoint(getBreakpoint(window.innerWidth));
      setPage(0); // reset to first page when layout density changes
    }
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    let cancelled = false;

    if (previewReports) {
      setReports(previewReports);
      setLoading(false);
      previewReports.forEach(async (rep) => {
        if (!rep.pdfUrl) return;
        const count = await countPdfPages(rep.pdfUrl);
        if (cancelled || !count) return;
        setReports((prev) =>
          prev.map((item) =>
            item.id === rep.id ? { ...item, pages: formatPageCount(count) } : item
          )
        );
      });
      return;
    }

    async function loadReports() {
      try {
        setLoading(true);
        const res = await publicAnnualReportsApi.listPublished({ limit: 100 });
        if (cancelled) return;

        const rawData = res.data ?? [];
        const mapped = rawData.map(mapAnnualReportToCard);
        setReports(mapped);

        // Asynchronously calculate PDF page counts without blocking initial display
        mapped.forEach(async (rep) => {
          if (!rep.pdfUrl) return;
          const count = await countPdfPages(rep.pdfUrl);
          if (cancelled || !count) return;
          setReports((prev) =>
            prev.map((item) =>
              item.id === rep.id ? { ...item, pages: formatPageCount(count) } : item
            )
          );
        });
      } catch {
        if (!cancelled) {
          setReports([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadReports();

    return () => {
      cancelled = true;
    };
  }, [previewReports]);

  const { perPage, cols } = breakpoint;
  const totalPages = Math.ceil(reports.length / perPage);
  const visibleReports = reports.slice(page * perPage, page * perPage + perPage);

  function handleOpen(pdfUrl?: string) {
    if (!pdfUrl) return;
    window.open(pdfUrl, "_blank", "noopener,noreferrer");
  }

  async function handleDownload(
    e: React.MouseEvent,
    pdfUrl?: string,
    title?: string
  ) {
    e.stopPropagation();
    if (!pdfUrl) return;

    const safeTitle =
      (title
        ? `${title.replace(/[^a-zA-Z0-9_\-\s]/g, "").trim().replace(/\s+/g, "_")}.pdf`
        : pdfUrl.split("/").pop()) || "annual-report.pdf";

    // Use our Next.js download proxy endpoint which sets Content-Disposition: attachment
    const downloadEndpoint = `/api/download?url=${encodeURIComponent(pdfUrl)}&filename=${encodeURIComponent(safeTitle)}`;

    const link = document.createElement("a");
    link.href = downloadEndpoint;
    link.download = safeTitle;
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

      {loading && reports.length === 0 ? (
        <div className={`mt-10 grid ${cols} gap-4 lg:gap-5`}>
          {Array.from({ length: perPage }).map((_, idx) => (
            <div
              key={idx}
              className="flex items-start gap-3 rounded-2xl bg-[#FFFCF3] p-4 shadow-sm animate-pulse"
            >
              <div className="h-24 w-12 sm:w-14 lg:w-16 shrink-0 rounded-lg bg-[#FFEBAF]/50" />
              <div className="min-w-0 flex-1 space-y-2 py-1">
                <div className="h-4 w-3/4 rounded bg-[#FFEBAF]/60" />
                <div className="h-3 w-full rounded bg-[#FFEBAF]/40" />
                <div className="h-3 w-2/3 rounded bg-[#FFEBAF]/40" />
              </div>
            </div>
          ))}
        </div>
      ) : reports.length === 0 ? (
        <div className="mt-10 text-center text-[#606060] font-manrope py-8">
          <Typography variant="body-3" as="p">
            No published annual reports available at the moment.
          </Typography>
        </div>
      ) : (
        <div className={`mt-10 grid ${cols} gap-4 lg:gap-5`}>
          {visibleReports.map((report, idx) => (
            <div
              key={report.id || `${page}-${idx}`}
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
                    onClick={(e) => handleDownload(e, report.pdfUrl, report.title)}
                    aria-label={`Download ${report.title}`}
                    className="shrink-0 rounded-full p-1 hover:bg-black/5"
                  >
                    <img src="/downloadbtn.png" alt="Download" className="h-6 w-6 sm:h-6 sm:w-6 lg:h-8 lg:w-8" />
                  </button>
                </div>

                {report.pages ? (
                  <Typography
                    variant="caption-1"
                    as="p"
                    className="mt-2 font-medium text-[#111111] font-manrope"
                  >
                    {report.pages}
                  </Typography>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}

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