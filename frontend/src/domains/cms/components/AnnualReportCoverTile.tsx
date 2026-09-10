"use client";

import Link from "next/link";
import { Eye, FileDown, Pencil, Trash2 } from "lucide-react";
import type { AnnualReport } from "@/domains/cms/lib/types";
import { cn } from "@/lib/utils";

type Props = {
  report: AnnualReport;
  onDelete?: (report: AnnualReport) => void;
};

/**
 * Compact cover card — full image visible (object-contain), not cropped giant posters.
 */
export default function AnnualReportCoverTile({ report, onDelete }: Props) {
  const hasPdf = Boolean(report.annualReportFile);
  const hasBanner = Boolean(report.annualReportBanner);
  const year = report.reportYear?.trim();

  return (
    <article className="group flex flex-col overflow-hidden rounded-xl bg-white shadow-[0_4px_14px_rgba(0,0,0,0.05)] ring-1 ring-black/[0.05] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(0,0,0,0.08)]">
      <div className="relative h-44 overflow-hidden bg-[#F0EEE9] sm:h-48">
        {hasBanner ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={report.annualReportBanner!}
            alt=""
            className="absolute inset-0 h-full w-full object-contain object-center p-1.5"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5 px-3 text-center">
            <span className="font-manrope text-[10px] font-semibold tracking-[0.16em] text-[#9A9A9A] uppercase">
              Annual report
            </span>
            <span className="font-manrope text-lg font-semibold text-[#212121]">
              {year || "—"}
            </span>
          </div>
        )}

        <span
          className={cn(
            "absolute top-2 right-2 z-20 rounded-full px-2 py-0.5 font-manrope text-[9px] font-semibold tracking-wide uppercase shadow-sm",
            report.status === "published"
              ? "bg-[#FCCC2D] text-[#212121]"
              : report.status === "archived"
                ? "bg-white/95 text-[#5C5C5C]"
                : "bg-white/95 text-[#9A7B00]"
          )}
        >
          {report.status}
        </span>

        <div className="pointer-events-none absolute inset-0 z-10 flex items-end justify-center bg-black/0 p-2 opacity-0 transition duration-200 group-hover:bg-black/30 group-hover:opacity-100 group-focus-within:bg-black/30 group-focus-within:opacity-100 max-sm:bg-black/20 max-sm:opacity-100">
          <div className="pointer-events-auto flex flex-wrap items-center justify-center gap-1.5">
            <Link
              href={`/admin/annual-reports/${report.id}`}
              className="inline-flex h-8 items-center gap-1 rounded-md bg-white px-2.5 font-manrope text-[11px] font-semibold text-[#212121] shadow-sm"
            >
              <Eye className="size-3" />
              View
            </Link>
            {hasPdf ? (
              <a
                href={report.annualReportFile!}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-8 items-center gap-1 rounded-md bg-[#C45A7A] px-2.5 font-manrope text-[11px] font-semibold text-white shadow-sm"
              >
                <FileDown className="size-3" />
                PDF
              </a>
            ) : null}
          </div>
        </div>

        <Link
          href={`/admin/annual-reports/${report.id}`}
          className="absolute inset-0 z-0"
          aria-label={`View ${report.title}`}
        />
      </div>

      <div className="relative z-10 flex items-start gap-1.5 border-t border-black/[0.04] bg-white px-3 py-2.5">
        <div className="min-w-0 flex-1">
          <Link
            href={`/admin/annual-reports/${report.id}`}
            className="line-clamp-2 block font-manrope text-sm font-semibold leading-snug text-[#212121] transition hover:text-[#9A7B00]"
          >
            {report.title}
          </Link>
          {year ? (
            <p className="mt-0.5 font-manrope text-[11px] text-[#8A8A8A]">
              {year}
            </p>
          ) : null}
        </div>

        <div className="flex shrink-0 items-center">
          <Link
            href={`/admin/annual-reports/${report.id}/edit`}
            className="inline-flex size-7 items-center justify-center rounded-md text-[#5C5C5C] transition hover:bg-[#F7F7F5] hover:text-[#212121]"
            aria-label={`Edit ${report.title}`}
            title="Edit"
          >
            <Pencil className="size-3.5" />
          </Link>
          {onDelete ? (
            <button
              type="button"
              onClick={() => onDelete(report)}
              className="inline-flex size-7 items-center justify-center rounded-md text-[#5C5C5C] transition hover:bg-red-50 hover:text-red-600"
              aria-label={`Delete ${report.title}`}
              title="Delete"
            >
              <Trash2 className="size-3.5" />
            </button>
          ) : null}
        </div>
      </div>
    </article>
  );
}
