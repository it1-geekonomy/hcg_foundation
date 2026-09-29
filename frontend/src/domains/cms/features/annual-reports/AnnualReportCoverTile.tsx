"use client";

import Link from "next/link";
import { Eye, FileDown, Pencil, Trash2 } from "lucide-react";
import Typography from "@/lib/Typography";
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
  const hasPdf = Boolean(
    report.annualReportFile && report.annualReportFile.trim()
  );
  const hasBanner = Boolean(
    report.annualReportBanner && report.annualReportBanner.trim()
  );
  const year = report.reportYear?.trim();

  return (
    <article className="group flex flex-col overflow-hidden rounded-xl bg-white shadow-[0_4px_14px_rgba(0,0,0,0.05)] ring-1 ring-cms-border transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(0,0,0,0.08)]">
      <div className="relative h-44 overflow-hidden bg-cms-subtle sm:h-48">
        {hasBanner ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={report.annualReportBanner!}
            alt=""
            className="absolute inset-0 h-full w-full object-cover object-center"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5 px-3 text-center">
            <Typography
              variant="caption-1"
              as="span"
              className="font-semibold tracking-[0.16em] text-cms-faint uppercase"
            >
              Annual report
            </Typography>
            <Typography
              variant="body-9"
              as="span"
              className="font-semibold text-cms-ink"
            >
              {year || "—"}
            </Typography>
          </div>
        )}

        <Typography
          variant="caption-1"
          as="span"
          className={cn(
            "absolute top-2 right-2 z-20 rounded-md px-2 py-0.5 font-semibold tracking-wide uppercase shadow-sm",
            report.status === "published"
              ? "bg-cms-accent text-cms-ink"
              : report.status === "archived"
                ? "bg-white/95 text-cms-muted"
                : "bg-white/95 text-cms-primary"
          )}
        >
          {report.status}
        </Typography>

        <div className="pointer-events-none absolute inset-0 z-10 flex items-end justify-center bg-black/0 p-2 opacity-0 transition duration-200 group-hover:bg-black/30 group-hover:opacity-100 group-focus-within:bg-black/30 group-focus-within:opacity-100 max-sm:bg-black/20 max-sm:opacity-100">
          <div className="pointer-events-auto flex flex-wrap items-center justify-center gap-1.5">
            <Link
              href={`/admin/annual-reports/${report.id}`}
              className="inline-flex h-8 items-center gap-1 rounded-md bg-white px-2.5 text-cms-ink shadow-sm"
            >
              <Eye className="size-3" />
              <Typography variant="button-2" as="span" className="font-semibold">
                View
              </Typography>
            </Link>
            {hasPdf ? (
              <a
                href={report.annualReportFile!}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-8 items-center gap-1 rounded-md bg-cms-primary px-2.5 text-white shadow-sm"
              >
                <FileDown className="size-3" />
                <Typography variant="button-2" as="span" className="font-semibold text-white">
                  PDF
                </Typography>
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

      <div className="relative z-10 flex items-start gap-1.5 border-t border-cms-border bg-white px-3 py-2.5">
        <div className="min-w-0 flex-1">
          <Link
            href={`/admin/annual-reports/${report.id}`}
            className="line-clamp-2 block font-semibold leading-snug text-cms-ink transition hover:text-cms-primary"
          >
            <Typography variant="label-1" as="span">
              {report.title}
            </Typography>
          </Link>
          {year ? (
            <Typography
              variant="caption-1"
              as="p"
              className="mt-0.5 text-cms-faint"
            >
              {year}
            </Typography>
          ) : null}
        </div>

        <div className="flex shrink-0 items-center">
          <Link
            href={`/admin/annual-reports/${report.id}/edit`}
            className="inline-flex size-7 items-center justify-center rounded-md text-cms-muted transition hover:bg-cms-subtle hover:text-cms-ink"
            aria-label={`Edit ${report.title}`}
            title="Edit"
          >
            <Pencil className="size-3.5" />
          </Link>
          {onDelete ? (
            <button
              type="button"
              onClick={() => onDelete(report)}
              className="inline-flex size-7 items-center justify-center rounded-md text-cms-muted transition hover:bg-red-50 hover:text-red-600"
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
