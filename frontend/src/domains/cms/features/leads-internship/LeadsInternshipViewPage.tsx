"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Download, ExternalLink, FileText } from "lucide-react";
import { cmsApi } from "@/domains/cms/lib/api";
import { cmsConfirm } from "@/domains/cms/lib/confirm";
import { cmsToast } from "@/domains/cms/lib/toast";
import type { LeadsInternship } from "@/domains/cms/lib/types";
import {
  CmsBadge,
  CmsDetailCard,
  CmsDetailRow,
  CmsRecordActions,
  CmsViewError,
  CmsViewHeader,
  CmsViewLoading,
  cmsErrorMessage,
  formatCmsDateTime,
} from "@/domains/cms/ui/CmsViewChrome";

export default function LeadsInternshipViewPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [row, setRow] = useState<LeadsInternship | null>(null);
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
        const res = await cmsApi.getLeadsInternship(id);
        if (!cancelled) setRow(res.data);
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

  const isDeleted = Boolean(row?.deletedAt);

  const onDelete = async () => {
    if (!row) return;
    const ok = await cmsConfirm({
      title: "Move to Recently Deleted?",
      description: `“${row.fullName}” will be soft-deleted.`,
      confirmLabel: "Move to deleted",
      tone: "danger",
    });
    if (!ok) return;
    setBusy(true);
    try {
      const res = await cmsApi.deleteLeadsInternship(row.id);
      cmsToast.success(res?.message || "Lead deleted successfully");
      router.replace("/admin/leads-internship");
    } catch (err) {
      cmsToast.error(cmsErrorMessage(err, "Failed to delete"));
      setBusy(false);
    }
  };

  const onRestore = async () => {
    if (!row) return;
    const ok = await cmsConfirm({
      title: "Restore lead?",
      description: `“${row.fullName}” will be restored.`,
      confirmLabel: "Restore",
    });
    if (!ok) return;
    setBusy(true);
    try {
      const res = await cmsApi.restoreLeadsInternship(row.id);
      cmsToast.success(res.message || "Lead restored successfully");
      setRow(res.data);
    } catch (err) {
      cmsToast.error(cmsErrorMessage(err, "Failed to restore"));
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <CmsViewLoading label="Loading lead…" />;
  if (error || !row) {
    return (
      <CmsViewError
        backHref="/admin/leads-internship"
        message={error || "Not found"}
      />
    );
  }

  return (
    <div className="space-y-6">
      <CmsViewHeader
        backHref="/admin/leads-internship"
        title={row.fullName}
        badges={isDeleted ? <CmsBadge tone="danger">deleted</CmsBadge> : null}
        meta={`Internship lead · received ${formatCmsDateTime(row.createdAt)}`}
        actions={
          <CmsRecordActions
            isDeleted={isDeleted}
            busy={busy}
            editHref={`/admin/leads-internship/${row.id}/edit`}
            onDelete={() => void onDelete()}
            onRestore={() => void onRestore()}
          />
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <CmsDetailCard title="Applicant">
          <dl>
            <CmsDetailRow label="Email" value={row.email} />
            <CmsDetailRow label="Phone" value={row.phone} />
            <CmsDetailRow label="Gender" value={row.gender} />
            <CmsDetailRow label="Date of birth" value={row.dob} />
            <CmsDetailRow label="Address" value={row.address} />
            <CmsDetailRow
              label="CV / Resume"
              value={
                row.cv ? (
                  <a
                    href={row.cv}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 font-medium text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    <FileText className="size-4 shrink-0" />
                    <span>View CV / Resume</span>
                    <ExternalLink className="size-3.5 shrink-0" />
                  </a>
                ) : (
                  <span className="text-cms-faint">No CV attached</span>
                )
              }
            />
          </dl>
        </CmsDetailCard>

        <CmsDetailCard title="Background">
          <dl>
            <CmsDetailRow label="Current course" value={row.currentCourse} />
            <CmsDetailRow label="Languages" value={row.languages} />
            <CmsDetailRow label="Computer skills" value={row.computerSkills} />
            <CmsDetailRow
              label="Terms accepted"
              value={row.termsAccepted ? "Yes" : "No"}
            />
            <CmsDetailRow label="Submitted" value={formatCmsDateTime(row.createdAt)} />
          </dl>
        </CmsDetailCard>
      </div>

      <CmsDetailCard title="Curriculum Vitae (CV)">
        {row.cv ? (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-lg border border-cms-border bg-cms-subtle/50">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-cms-primary/10 text-cms-primary">
                <FileText className="size-5" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-cms-ink">Attached Resume / CV Document</p>
                <p className="text-xs text-cms-muted truncate max-w-sm sm:max-w-md lg:max-w-lg">
                  {row.cv}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <a
                href={row.cv}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md bg-cms-primary text-black hover:bg-cms-primary-hover transition-colors shadow-xs"
              >
                <span>View CV</span>
                <ExternalLink className="size-3.5" />
              </a>
              <a
                href={row.cv}
                download
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md border border-cms-border bg-white text-cms-ink hover:bg-cms-subtle transition-colors shadow-xs"
              >
                <Download className="size-3.5" />
                <span>Download</span>
              </a>
            </div>
          </div>
        ) : (
          <p className="text-sm text-cms-faint">No CV file was uploaded with this application.</p>
        )}
      </CmsDetailCard>

      <CmsDetailCard title="Message">
        <p className="text-sm whitespace-pre-wrap text-cms-ink">
          {row.message?.trim() || (
            <span className="text-cms-faint">No message provided.</span>
          )}
        </p>
      </CmsDetailCard>
    </div>
  );
}
