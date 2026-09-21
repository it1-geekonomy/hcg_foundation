"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ExternalLink, FileDown } from "lucide-react";
import Typography from "@/lib/Typography";
import { cmsApi, publicAnnualReportsApi } from "@/domains/cms/lib/api";
import { cmsToast } from "@/domains/cms/lib/toast";
import { cmsConfirm } from "@/domains/cms/lib/confirm";
import type { AnnualReport } from "@/domains/cms/lib/types";
import AnnualReportsSection from "@/domains/resources/Transparencyhub/components/annualreports";
import { mapAnnualReportToCard } from "@/domains/resources/Transparencyhub/constants/annualreport";
import CmsWebsitePreview from "@/domains/cms/ui/CmsWebsitePreview";
import {
  CmsBadge,
  CmsDetailCard,
  CmsMediaTile,
  CmsRecordActions,
  CmsSeoCard,
  CmsViewError,
  CmsViewHeader,
  CmsViewLoading,
  cmsErrorMessage,
} from "@/domains/cms/ui/CmsViewChrome";

const LIST_HREF = "/admin/annual-reports";

function hasUrl(value?: string | null) {
  return Boolean(value && value.trim());
}

function FileRow({
  label,
  url,
  openLabel = "Open URL",
}: {
  label: string;
  url?: string | null;
  openLabel?: string;
}) {
  return (
    <li className="flex flex-wrap items-center justify-between gap-2">
      <Typography variant="label-1" as="span" className="text-[#5C5C5C]">
        {label}
      </Typography>
      {hasUrl(url) ? (
        <a
          href={url!}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 font-medium text-[#9A7B00] underline-offset-2 hover:underline"
        >
          <Typography variant="label-1" as="span">
            {openLabel}
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
  );
}

export default function AnnualReportViewPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [report, setReport] = useState<AnnualReport | null>(null);
  const [published, setPublished] = useState<AnnualReport[]>([]);
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
        const [res, publishedRes] = await Promise.all([
          cmsApi.getAnnualReport(id),
          publicAnnualReportsApi.listPublished({ limit: 50 }).catch(() => null),
        ]);
        if (!cancelled) {
          setReport(res.data);
          setPublished(publishedRes?.data ?? []);
        }
      } catch (err) {
        if (cancelled) return;
        const message = cmsErrorMessage(err, "Failed to load");
        setError(message);
        cmsToast.error(message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id]);

  const previewReports = useMemo(() => {
    if (!report) return [];
    const others = published.filter((r) => r.id !== report.id);
    return [report, ...others].map(mapAnnualReportToCard);
  }, [report, published]);

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
      router.replace(LIST_HREF);
    } catch (err) {
      cmsToast.error(cmsErrorMessage(err, "Failed to delete"));
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
      cmsToast.error(cmsErrorMessage(err, "Failed to restore"));
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <CmsViewLoading label="Loading report…" />;
  if (error || !report) {
    return (
      <CmsViewError
        backHref={LIST_HREF}
        message={error || "Report not found"}
      />
    );
  }

  const isDeleted = Boolean(report.deletedAt);

  return (
    <div className="space-y-6">
      <CmsViewHeader
        backHref={LIST_HREF}
        title={report.title}
        badges={
          <>
            {report.reportYear ? (
              <CmsBadge tone="info">{report.reportYear}</CmsBadge>
            ) : null}
            <CmsBadge>{report.status}</CmsBadge>
            {isDeleted ? <CmsBadge tone="danger">deleted</CmsBadge> : null}
          </>
        }
        meta={
          <Typography
            variant="label-1"
            as="p"
            className="mt-1 text-muted-foreground"
          >
            /{report.slug}
          </Typography>
        }
        actions={
          <CmsRecordActions
            isDeleted={isDeleted}
            busy={busy}
            editHref={`${LIST_HREF}/${report.id}/edit`}
            onDelete={onDelete}
            onRestore={onRestore}
            extra={
              hasUrl(report.annualReportFile) ? (
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
              ) : null
            }
          />
        }
      />

      <CmsWebsitePreview
        label="Website preview · Transparency & Knowledge Hub"
        className="bg-[#FFF8E2]"
      >
        <AnnualReportsSection previewReports={previewReports} />
      </CmsWebsitePreview>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(180px,220px)_minmax(0,1fr)]">
        <div className="self-start space-y-2">
          <CmsMediaTile
            src={report.annualReportBanner}
            alt={`${report.title} cover`}
            empty="No cover image"
            className="h-56"
          />
          <Typography
            variant="label-1"
            as="p"
            className="text-center font-semibold text-[#212121]"
          >
            {report.title}
          </Typography>
        </div>

        <div className="space-y-4">
          <CmsDetailCard title="Files (R2)">
            <ul className="space-y-3">
              <FileRow
                label="Desktop / web banner"
                url={report.annualReportBanner}
              />
              <FileRow
                label="Mobile banner"
                url={report.annualReportMobileBanner}
              />
              <FileRow
                label="Report file"
                url={report.annualReportFile}
                openLabel="Open file"
              />
            </ul>
          </CmsDetailCard>

          <CmsSeoCard
            metaTitle={report.metaTitle}
            metaDescription={report.metaDescription}
            schemaCode={report.schemaCode}
          />
        </div>
      </div>
    </div>
  );
}
