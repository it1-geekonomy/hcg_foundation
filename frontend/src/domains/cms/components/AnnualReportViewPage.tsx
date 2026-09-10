"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ExternalLink,
  FileDown,
  Pencil,
  Trash2,
} from "lucide-react";
import { Button } from "@/shared/ui/button";
import { cmsApi } from "@/domains/cms/lib/api";
import type { AnnualReport } from "@/domains/cms/lib/types";

export default function AnnualReportViewPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [report, setReport] = useState<AnnualReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await cmsApi.getAnnualReport(id);
        if (!cancelled) setReport(res.data);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id]);

  const onDelete = async () => {
    if (
      !report ||
      !window.confirm(
        `Delete “${report.title}”? This also removes files from R2.`
      )
    )
      return;
    setDeleting(true);
    try {
      await cmsApi.deleteAnnualReport(report.id);
      router.replace("/admin/annual-reports");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete");
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-16 text-center font-manrope text-sm text-muted-foreground">
        Loading report…
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="space-y-4">
        <Link
          href="/admin/annual-reports"
          className="inline-flex items-center gap-1.5 font-manrope text-sm text-[#5C5C5C] hover:text-[#212121]"
        >
          <ArrowLeft className="size-3.5" />
          Back to list
        </Link>
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 font-manrope text-sm text-red-700">
          {error || "Report not found"}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link
            href="/admin/annual-reports"
            className="mb-3 inline-flex items-center gap-1.5 font-manrope text-sm text-[#5C5C5C] transition hover:text-[#212121]"
          >
            <ArrowLeft className="size-3.5" />
            Back to list
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="font-manrope text-xl font-semibold text-[#212121] sm:text-2xl">
              {report.title}
            </h2>
            {report.reportYear ? (
              <span className="rounded-full bg-[#E8F0F6] px-2.5 py-0.5 font-manrope text-xs font-medium text-[#1A4A6E]">
                {report.reportYear}
              </span>
            ) : null}
            <span className="rounded-full bg-[#FFF1C2] px-2.5 py-0.5 font-manrope text-xs font-medium text-[#7A5A00]">
              {report.status}
            </span>
          </div>
          <p className="mt-1 font-manrope text-sm text-muted-foreground">
            /{report.slug}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {report.annualReportFile ? (
            <a
              href={report.annualReportFile}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#C45A7A] px-3 font-manrope text-sm font-semibold text-white transition hover:bg-[#b04e6c]"
            >
              <FileDown className="size-3.5" />
              Open PDF
            </a>
          ) : null}
          <Link
            href={`/admin/annual-reports/${report.id}/edit`}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#FCCC2D] px-3 font-manrope text-sm font-semibold text-[#212121] transition hover:brightness-105"
          >
            <Pencil className="size-3.5" />
            Edit
          </Link>
          <Button
            type="button"
            variant="outline"
            className="h-9 text-destructive"
            disabled={deleting}
            onClick={() => void onDelete()}
          >
            <Trash2 className="size-3.5" />
            {deleting ? "Deleting…" : "Delete"}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(180px,220px)_minmax(0,1fr)]">
        <div className="overflow-hidden rounded-xl bg-white shadow-[0_4px_14px_rgba(0,0,0,0.05)] ring-1 ring-black/[0.05]">
          <div className="relative h-56 bg-[#F0EEE9]">
            {report.annualReportBanner ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={report.annualReportBanner}
                alt={`${report.title} cover`}
                className="absolute inset-0 h-full w-full object-contain object-center p-2"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center font-manrope text-sm text-[#9A9A9A]">
                No cover image
              </div>
            )}
          </div>
          <div className="border-t border-black/[0.04] px-3 py-2.5 text-center">
            <p className="font-manrope text-sm font-semibold text-[#212121]">
              {report.title}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <section className="rounded-2xl bg-white p-5 ring-1 ring-black/5 sm:p-6">
            <h3 className="mb-3 font-manrope text-xs font-semibold tracking-[0.16em] text-[#9A9A9A] uppercase">
              Files (R2)
            </h3>
            <ul className="space-y-3 font-manrope text-sm">
              <li className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-[#5C5C5C]">Cover / banner</span>
                {report.annualReportBanner ? (
                  <a
                    href={report.annualReportBanner}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 font-medium text-[#9A7B00] underline-offset-2 hover:underline"
                  >
                    Open URL <ExternalLink className="size-3.5" />
                  </a>
                ) : (
                  <span className="text-muted-foreground">Not uploaded</span>
                )}
              </li>
              <li className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-[#5C5C5C]">Report PDF</span>
                {report.annualReportFile ? (
                  <a
                    href={report.annualReportFile}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 font-medium text-[#9A7B00] underline-offset-2 hover:underline"
                  >
                    Open PDF <ExternalLink className="size-3.5" />
                  </a>
                ) : (
                  <span className="text-muted-foreground">Not uploaded</span>
                )}
              </li>
            </ul>
          </section>

          <section className="rounded-2xl bg-white p-5 ring-1 ring-black/5 sm:p-6">
            <h3 className="mb-3 font-manrope text-xs font-semibold tracking-[0.16em] text-[#9A9A9A] uppercase">
              SEO
            </h3>
            <dl className="grid gap-3 font-manrope text-sm sm:grid-cols-2">
              <div>
                <dt className="text-xs text-muted-foreground">Meta title</dt>
                <dd className="mt-0.5">{report.metaTitle || "—"}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">
                  Meta description
                </dt>
                <dd className="mt-0.5">{report.metaDescription || "—"}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-xs text-muted-foreground">Schema</dt>
                <dd className="mt-0.5 whitespace-pre-wrap break-all">
                  {report.schemaCode || "—"}
                </dd>
              </div>
            </dl>
          </section>
        </div>
      </div>
    </div>
  );
}
