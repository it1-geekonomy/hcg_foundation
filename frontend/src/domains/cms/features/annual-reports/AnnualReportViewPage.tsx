"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ExternalLink } from "lucide-react";
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
  CmsDetailField,
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
  subLabel,
  url,
  openLabel = "Open URL",
}: {
  label: string;
  subLabel?: string;
  url?: string | null;
  openLabel?: string;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div>
        <Typography variant="body-9" as="p" className="font-medium text-cms-ink">
          {label}
        </Typography>
        {subLabel && (
          <Typography variant="label-1" as="p" className="text-cms-muted">
            {subLabel}
          </Typography>
        )}
      </div>
      {hasUrl(url) ? (
        <a
          href={url!}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 font-medium text-cms-primary hover:text-cms-primary-hover hover:underline"
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
          className="text-cms-faint"
        >
          Not uploaded
        </Typography>
      )}
    </div>
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
        actions={
          <CmsRecordActions
            isDeleted={isDeleted}
            busy={busy}
            editHref={`${LIST_HREF}/${report.id}/edit`}
            onDelete={onDelete}
            onRestore={onRestore}
          />
        }
      />

      <div className="flex flex-col gap-10">
        <CmsDetailCard title="Report Information">
          <dl className="grid gap-4 sm:grid-cols-2">
            <CmsDetailField label="Slug" value={`/${report.slug}`} />
            <CmsDetailField label="Status" value={report.status} />
          </dl>
        </CmsDetailCard>

        <CmsDetailCard title={`Files (3)`}>
          <ul className="divide-y divide-cms-border -my-5">
            <li className="py-4">
              <FileRow
                label="Desktop / Web Banner"
                subLabel="Image file"
                url={report.annualReportBanner}
                openLabel="Open"
              />
            </li>
            <li className="py-4">
              <FileRow
                label="Mobile Banner"
                subLabel="Image file"
                url={report.annualReportMobileBanner}
                openLabel="Open"
              />
            </li>
            <li className="py-4">
              <FileRow
                label="Report File"
                subLabel="PDF document"
                url={report.annualReportFile}
                openLabel="Download"
              />
            </li>
          </ul>
        </CmsDetailCard>

        <CmsSeoCard
          metaTitle={report.metaTitle}
          metaDescription={report.metaDescription}
          schemaCode={report.schemaCode}
        />
      </div>

      <CmsWebsitePreview
        label="Website preview · Transparency & Knowledge Hub"
        className="bg-[#FFF8E2]"
      >
        <AnnualReportsSection previewReports={previewReports} />
      </CmsWebsitePreview>
    </div>
  );
}
