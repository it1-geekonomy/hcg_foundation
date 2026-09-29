"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
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
import {
  DownloadProgress,
  PdfTile,
  ReportCardShell,
} from "./annualReportAnimation";

const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

/* ---------- Page-count cache (localStorage) ---------- */
// Counts are keyed by PDF URL, so repeat visits show the number instantly.
const COUNT_CACHE_KEY = "ar-page-counts-v1";

function readCountCache(): Record<string, string> {
  try {
    return JSON.parse(localStorage.getItem(COUNT_CACHE_KEY) ?? "{}");
  } catch {
    return {};
  }
}

function writeCountCache(url: string, label: string) {
  try {
    const cache = readCountCache();
    cache[url] = label;
    localStorage.setItem(COUNT_CACHE_KEY, JSON.stringify(cache));
  } catch {
    // storage unavailable (private mode / quota) - ignore
  }
}

export default function AnnualReportsSection({
  previewReports,
}: {
  previewReports?: Report[];
} = {}) {
  const [breakpoint, setBreakpoint] = useState(BREAKPOINTS[0]);
  const [page, setPage] = useState(0);
  const [reports, setReports] = useState<Report[]>(previewReports ?? []);
  const [loading, setLoading] = useState(!previewReports);
  // Page counts live outside `reports` so a count arriving never re-creates the list
  const [pageCounts, setPageCounts] = useState<Record<string, string>>({});
  // Download progress per report id (0-100). Missing key = not downloading.
  const [downloads, setDownloads] = useState<Record<string, number>>({});
  const requestedCounts = useRef<Set<string>>(new Set());
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  // Apply the right breakpoint before the first paint, so the grid doesn't jump on refresh
  useIsoLayoutEffect(() => {
    function handleResize() {
      const next = getBreakpoint(window.innerWidth);
      setBreakpoint((prev) =>
        prev.perPage === next.perPage && prev.cols === next.cols ? prev : next
      );
    }
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Go back to the first page only when the layout density actually changes
  useEffect(() => {
    setPage(0);
  }, [breakpoint.perPage]);

  useEffect(() => {
    let cancelled = false;

    if (previewReports) {
      setReports(previewReports);
      setLoading(false);
      return;
    }

    async function loadReports() {
      try {
        setLoading(true);
        const res = await publicAnnualReportsApi.listPublished({ limit: 100 });
        if (cancelled) return;

        const rawData = res.data ?? [];
        setReports(rawData.map(mapAnnualReportToCard));
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

  // Page counts: as soon as the reports load, show cached counts immediately,
  // count the visible cards first (all in parallel), then count the rest in the
  // background so other pages are already filled in when the user switches.
  useEffect(() => {
    if (reports.length === 0) return;

    const cache = readCountCache();
    const cached: Record<string, string> = {};
    const pending: Report[] = [];

    for (const r of reports) {
      if (!r.pdfUrl || r.pages) continue;
      if (cache[r.pdfUrl]) cached[r.id] = cache[r.pdfUrl];
      else if (!requestedCounts.current.has(r.id)) pending.push(r);
    }

    // Cached counts show right away, in the same render as the title
    if (Object.keys(cached).length) {
      setPageCounts((prev) => ({ ...cached, ...prev }));
    }

    async function run(rep: Report) {
      if (requestedCounts.current.has(rep.id)) return;
      requestedCounts.current.add(rep.id);
      const count = await countPdfPages(rep.pdfUrl!);
      if (!mounted.current || !count) return;
      const label = formatPageCount(count);
      writeCountCache(rep.pdfUrl!, label);
      setPageCounts((prev) => ({ ...prev, [rep.id]: label }));
    }

    // Visible cards first, all in parallel
    const visibleIds = new Set(
      reports
        .slice(page * perPage, page * perPage + perPage)
        .map((r) => r.id)
    );
    const first = pending.filter((r) => visibleIds.has(r.id));
    const rest = pending.filter((r) => !visibleIds.has(r.id));
    first.forEach((r) => void run(r));

    // Everything else in the background, 3 at a time
    (async () => {
      const queue = [...rest];
      const worker = async () => {
        while (queue.length && mounted.current) await run(queue.shift()!);
      };
      await Promise.all([worker(), worker(), worker()]);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reports]);

  function handleOpen(pdfUrl?: string) {
    if (!pdfUrl) return;
    window.open(pdfUrl, "_blank", "noopener,noreferrer");
  }

  function setProgress(id: string, value: number) {
    if (!mounted.current) return;
    setDownloads((prev) => ({ ...prev, [id]: value }));
  }

  function clearProgress(id: string) {
    if (!mounted.current) return;
    setDownloads((prev) => {
      const { [id]: _removed, ...rest } = prev;
      return rest;
    });
  }

  function triggerSave(href: string, filename: string) {
    const link = document.createElement("a");
    link.href = href;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  async function handleDownload(e: React.MouseEvent, report: Report) {
    e.stopPropagation();
    const { id, pdfUrl, title } = report;
    if (!pdfUrl || downloads[id] !== undefined) return;

    const safeTitle =
      (title
        ? `${title.replace(/[^a-zA-Z0-9_\-\s]/g, "").trim().replace(/\s+/g, "_")}.pdf`
        : pdfUrl.split("/").pop()) || "annual-report.pdf";

    // Next.js download proxy endpoint (sets Content-Disposition: attachment)
    const endpoint = `/api/download?url=${encodeURIComponent(pdfUrl)}&filename=${encodeURIComponent(safeTitle)}`;

    setProgress(id, 3);

    // If the server doesn't send a size, ease toward 90% so the line still moves
    let knownTotal = false;
    let current = 3;
    const ticker = window.setInterval(() => {
      if (knownTotal) return;
      current += (90 - current) * 0.06;
      setProgress(id, current);
    }, 150);

    try {
      const res = await fetch(endpoint);
      if (!res.ok || !res.body) throw new Error("Download failed");

      const total = Number(res.headers.get("Content-Length")) || 0;
      knownTotal = total > 0;

      const reader = res.body.getReader();
      const chunks: Uint8Array[] = [];
      let received = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value) {
          chunks.push(value);
          received += value.length;
          if (knownTotal) {
            current = Math.max(current, Math.min(97, (received / total) * 100));
            setProgress(id, current);
          }
        }
      }

      const blob = new Blob(chunks as BlobPart[], { type: "application/pdf" });
      const blobUrl = URL.createObjectURL(blob);
      triggerSave(blobUrl, safeTitle);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 10_000);

      setProgress(id, 100); // line fills the whole bottom edge
    } catch {
      // Fall back to a plain browser download if streaming fails
      triggerSave(endpoint, safeTitle);
      setProgress(id, 100);
    } finally {
      window.clearInterval(ticker);
      // Let the full line show briefly, then fade it out
      setTimeout(() => clearProgress(id), 900);
    }
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
          {visibleReports.map((report, idx) => {
            const pagesLabel = report.pages || pageCounts[report.id] || "";
            const dlProgress = downloads[report.id];
            const isDownloading = dlProgress !== undefined;
            return (
              <ReportCardShell
                key={report.id || `${page}-${idx}`}
                onOpen={() => handleOpen(report.pdfUrl)}
              >
                {/* Download progress: yellow line fills the bottom edge of the card */}
                {isDownloading && <DownloadProgress progress={dlProgress} />}

                {/* PDF icon: two sheets slide out behind it on hover */}
                <PdfTile />

                <div className="min-w-0 flex-1">
                  <Typography
                    variant="body-5"
                    as="h3"
                    className="line-clamp-2 text-[#0D2838] mb-2 font-manrope font-bold leading-snug"
                  >
                    {report.title}
                  </Typography>

                  {/* Description row - download icon lives at the end of this row */}
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
                      onClick={(e) => handleDownload(e, report)}
                      disabled={isDownloading}
                      aria-busy={isDownloading}
                      aria-label={`Download ${report.title}`}
                      className="shrink-0 rounded-full p-1 cursor-pointer disabled:cursor-progress disabled:opacity-60"
                    >
                      <img src="/downloadbtn.png" alt="Download" className="h-6 w-6 sm:h-6 sm:w-6 lg:h-8 lg:w-8" />
                    </button>
                  </div>

                  {/* Space for the page count is always reserved, so nothing shifts when it arrives */}
                  {report.pdfUrl ? (
                    <div className="relative mt-2">
                      <Typography
                        variant="caption-1"
                        as="p"
                        className={`font-medium text-[#111111] font-manrope ${
                          pagesLabel ? "opacity-100" : "opacity-0"
                        }`}
                      >
                        {pagesLabel || "00 pages"}
                      </Typography>
                      {!pagesLabel && (
                        <span className="absolute left-0 top-1/2 h-3 w-16 -translate-y-1/2 animate-pulse rounded bg-[#FFEBAF]/70" />
                      )}
                    </div>
                  ) : null}
                </div>
              </ReportCardShell>
            );
          })}
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