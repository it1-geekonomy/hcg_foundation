"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ExternalLink,
  FileDown,
  Pencil,
  RotateCcw,
  Trash2,
} from "lucide-react";
import Typography from "@/lib/Typography";
import { Button } from "@/shared/ui/button";
import { cmsApi } from "@/domains/cms/lib/api";
import { cmsToast } from "@/domains/cms/lib/toast";
import { cmsConfirm } from "@/domains/cms/lib/confirm";
import type { AnnualReport } from "@/domains/cms/lib/types";

function hasUrl(value?: string | null) {
  return Boolean(value && value.trim());
}

export default function AnnualReportViewPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [report, setReport] = useState<AnnualReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

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
          const message =
            err instanceof Error ? err.message : "Failed to load";
          setError(message);
          cmsToast.error(message);
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
    if (!report) return;
    const ok = await cmsConfirm({
      title: "Move to Recently Deleted?",
      description: `“${report.title}” will be soft-deleted. You can restore it later from Recently Deleted.`,
      confirmLabel: "Move to deleted",
      tone: "danger",
    });
    if (!ok) return;
    setBusy(true);
    try {
      const res = await cmsApi.deleteAnnualReport(report.id);
      cmsToast.success(res?.message || "Annual report deleted successfully");
      router.replace("/admin/annual-reports");
    } catch (err) {
      cmsToast.error(
        err instanceof Error ? err.message : "Failed to delete"
      );
      setBusy(false);
    }
  };

  const onRestore = async () => {
    if (!report) return;
    const ok = await cmsConfirm({
      title: "Restore annual report?",
      description: `“${report.title}” will be restored and show again in All reports.`,
      confirmLabel: "Restore",
    });
    if (!ok) return;
    setBusy(true);
    try {
      const res = await cmsApi.restoreAnnualReport(report.id);
      cmsToast.success(res.message || "Annual report restored successfully");
      setReport(res.data);
    } catch (err) {
      cmsToast.error(
        err instanceof Error ? err.message : "Failed to restore"
      );
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <Typography
        variant="label-1"
        as="div"
        className="py-16 text-center text-muted-foreground"
      >
        Loading report…
      </Typography>
    );
  }

  if (error || !report) {
    return (
      <div className="space-y-4">
        <Link
          href="/admin/annual-reports"
          className="inline-flex items-center gap-1.5 text-[#5C5C5C] hover:text-[#212121]"
        >
          <ArrowLeft className="size-3.5" />
          <Typography variant="label-1" as="span">
            Back to list
          </Typography>
        </Link>
        <Typography
          variant="label-1"
          as="div"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700"
        >
          {error || "Report not found"}
        </Typography>
      </div>
    );
  }

  const isDeleted = Boolean(report.deletedAt);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link
            href="/admin/annual-reports"
            className="mb-3 inline-flex items-center gap-1.5 text-[#5C5C5C] transition hover:text-[#212121]"
          >
            <ArrowLeft className="size-3.5" />
            <Typography variant="label-1" as="span">
              Back to list
            </Typography>
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <Typography
              variant="heading-8"
              as="h2"
              className="font-semibold text-[#212121]"
            >
              {report.title}
            </Typography>
            {report.reportYear ? (
              <Typography
                variant="caption-1"
                as="span"
                className="rounded-full bg-[#E8F0F6] px-2.5 py-0.5 font-medium text-[#1A4A6E]"
              >
                {report.reportYear}
              </Typography>
            ) : null}
            <Typography
              variant="caption-1"
              as="span"
              className="rounded-full bg-[#FFF1C2] px-2.5 py-0.5 font-medium text-[#7A5A00]"
            >
              {report.status}
            </Typography>
            {isDeleted ? (
              <Typography
                variant="caption-1"
                as="span"
                className="rounded-full bg-red-50 px-2.5 py-0.5 font-medium text-red-700"
              >
                deleted
              </Typography>
            ) : null}
          </div>
          <Typography
            variant="label-1"
            as="p"
            className="mt-1 text-muted-foreground"
          >
            /{report.slug}
          </Typography>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {hasUrl(report.annualReportFile) ? (
            <a
              href={report.annualReportFile!}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#C45A7A] px-3 text-white transition hover:bg-[#b04e6c]"
            >
              <FileDown className="size-3.5" />
              <Typography variant="button-3" as="span">
                Open file
              </Typography>
            </a>
          ) : null}
          {isDeleted ? (
            <Button
              type="button"
              variant="outline"
              className="h-9 gap-1.5 border-black/10 bg-white text-[#212121] hover:bg-[#F0F0EC] hover:text-[#212121]"
              disabled={busy}
              onClick={() => void onRestore()}
            >
              <RotateCcw className="size-3.5" />
              {busy ? "Restoring…" : "Restore"}
            </Button>
          ) : (
            <>
              <Link
                href={`/admin/annual-reports/${report.id}/edit`}
                className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#FCCC2D] px-3 text-[#212121] transition hover:brightness-105"
              >
                <Pencil className="size-3.5" />
                <Typography variant="button-3" as="span">
                  Edit
                </Typography>
              </Link>
              <Button
                type="button"
                variant="outline"
                className="h-9 text-destructive"
                disabled={busy}
                onClick={() => void onDelete()}
              >
                <Trash2 className="size-3.5" />
                {busy ? "Deleting…" : "Delete"}
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(180px,220px)_minmax(0,1fr)]">
        <div className="self-start overflow-hidden rounded-xl bg-white shadow-[0_4px_14px_rgba(0,0,0,0.05)] ring-1 ring-black/[0.05]">
          <div className="relative h-56 bg-[#F0EEE9]">
            {hasUrl(report.annualReportBanner) ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={report.annualReportBanner!}
                alt={`${report.title} cover`}
                className="absolute inset-0 h-full w-full object-contain object-center p-2"
              />
            ) : (
              <Typography
                variant="label-1"
                as="div"
                className="absolute inset-0 flex items-center justify-center text-[#9A9A9A]"
              >
                No cover image
              </Typography>
            )}
          </div>
          <div className="border-t border-black/[0.04] px-3 py-2.5 text-center">
            <Typography
              variant="label-1"
              as="p"
              className="font-semibold text-[#212121]"
            >
              {report.title}
            </Typography>
          </div>
        </div>

        <div className="space-y-4">
          <section className="rounded-2xl bg-white p-5 ring-1 ring-black/5 sm:p-6">
            <Typography
              variant="caption-1"
              as="h3"
              className="mb-3 font-semibold tracking-[0.16em] text-[#9A9A9A] uppercase"
            >
              Files (R2)
            </Typography>
            <ul className="space-y-3">
              <li className="flex flex-wrap items-center justify-between gap-2">
                <Typography variant="label-1" as="span" className="text-[#5C5C5C]">
                  Desktop / web banner
                </Typography>
                {hasUrl(report.annualReportBanner) ? (
                  <a
                    href={report.annualReportBanner!}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 font-medium text-[#9A7B00] underline-offset-2 hover:underline"
                  >
                    <Typography variant="label-1" as="span">
                      Open URL
                    </Typography>{" "}
                    <ExternalLink className="size-3.5" />
                  </a>
                ) : (
                  <Typography
                    variant="label-1"
                    as="span"
                    className="text-muted-foreground"
                  >
                    Not uploaded
                  </Typography>
                )}
              </li>
              <li className="flex flex-wrap items-center justify-between gap-2">
                <Typography variant="label-1" as="span" className="text-[#5C5C5C]">
                  Mobile banner
                </Typography>
                {hasUrl(report.annualReportMobileBanner) ? (
                  <a
                    href={report.annualReportMobileBanner!}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 font-medium text-[#9A7B00] underline-offset-2 hover:underline"
                  >
                    <Typography variant="label-1" as="span">
                      Open URL
                    </Typography>{" "}
                    <ExternalLink className="size-3.5" />
                  </a>
                ) : (
                  <Typography
                    variant="label-1"
                    as="span"
                    className="text-muted-foreground"
                  >
                    Not uploaded
                  </Typography>
                )}
              </li>
              <li className="flex flex-wrap items-center justify-between gap-2">
                <Typography variant="label-1" as="span" className="text-[#5C5C5C]">
                  Report file
                </Typography>
                {hasUrl(report.annualReportFile) ? (
                  <a
                    href={report.annualReportFile!}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 font-medium text-[#9A7B00] underline-offset-2 hover:underline"
                  >
                    <Typography variant="label-1" as="span">
                      Open file
                    </Typography>{" "}
                    <ExternalLink className="size-3.5" />
                  </a>
                ) : (
                  <Typography
                    variant="label-1"
                    as="span"
                    className="text-muted-foreground"
                  >
                    Not uploaded
                  </Typography>
                )}
              </li>
            </ul>
          </section>

          <section className="rounded-2xl bg-white p-5 ring-1 ring-black/5 sm:p-6">
            <Typography
              variant="caption-1"
              as="h3"
              className="mb-3 font-semibold tracking-[0.16em] text-[#9A9A9A] uppercase"
            >
              SEO
            </Typography>
            <dl className="grid gap-3 sm:grid-cols-2">
              <div>
                <Typography
                  variant="caption-1"
                  as="dt"
                  className="text-muted-foreground"
                >
                  Meta title
                </Typography>
                <Typography variant="label-1" as="dd" className="mt-0.5">
                  {report.metaTitle || "—"}
                </Typography>
              </div>
              <div>
                <Typography
                  variant="caption-1"
                  as="dt"
                  className="text-muted-foreground"
                >
                  Meta description
                </Typography>
                <Typography variant="label-1" as="dd" className="mt-0.5">
                  {report.metaDescription || "—"}
                </Typography>
              </div>
              <div className="sm:col-span-2">
                <Typography
                  variant="caption-1"
                  as="dt"
                  className="text-muted-foreground"
                >
                  Schema
                </Typography>
                <Typography
                  variant="label-1"
                  as="dd"
                  className="mt-0.5 whitespace-pre-wrap break-all"
                >
                  {report.schemaCode || "—"}
                </Typography>
              </div>
            </dl>
          </section>
        </div>
      </div>
    </div>
  );
}
