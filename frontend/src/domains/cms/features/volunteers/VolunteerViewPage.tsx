"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { cmsApi } from "@/domains/cms/lib/api";
import { cmsConfirm } from "@/domains/cms/lib/confirm";
import { cmsToast } from "@/domains/cms/lib/toast";
import type { Volunteer } from "@/domains/cms/lib/types";
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

export default function VolunteerViewPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [row, setRow] = useState<Volunteer | null>(null);
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
        const res = await cmsApi.getVolunteer(id);
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
      const res = await cmsApi.deleteVolunteer(row.id);
      cmsToast.success(res?.message || "Volunteer deleted successfully");
      router.replace("/admin/volunteers");
    } catch (err) {
      cmsToast.error(cmsErrorMessage(err, "Failed to delete"));
      setBusy(false);
    }
  };

  const onRestore = async () => {
    if (!row) return;
    const ok = await cmsConfirm({
      title: "Restore volunteer?",
      description: `“${row.fullName}” will be restored.`,
      confirmLabel: "Restore",
    });
    if (!ok) return;
    setBusy(true);
    try {
      const res = await cmsApi.restoreVolunteer(row.id);
      cmsToast.success(res.message || "Volunteer restored successfully");
      setRow(res.data);
    } catch (err) {
      cmsToast.error(cmsErrorMessage(err, "Failed to restore"));
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <CmsViewLoading label="Loading volunteer…" />;
  if (error || !row) {
    return (
      <CmsViewError backHref="/admin/volunteers" message={error || "Not found"} />
    );
  }

  return (
    <div className="space-y-6">
      <CmsViewHeader
        backHref="/admin/volunteers"
        title={row.fullName}
        badges={isDeleted ? <CmsBadge tone="danger">deleted</CmsBadge> : null}
        meta={`Volunteer application · received ${formatCmsDateTime(row.createdAt)}`}
        actions={
          <CmsRecordActions
            isDeleted={isDeleted}
            busy={busy}
            editHref={`/admin/volunteers/${row.id}/edit`}
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
            <CmsDetailRow label="City / location" value={row.cityLocation} />
          </dl>
        </CmsDetailCard>

        <CmsDetailCard title="Background">
          <dl>
            <CmsDetailRow
              label="Educational qualification"
              value={row.educationalQualification}
            />
            <CmsDetailRow label="Areas of interest" value={row.areasOfInterest} />
            <CmsDetailRow
              label="Terms accepted"
              value={row.termsAccepted ? "Yes" : "No"}
            />
            <CmsDetailRow label="Submitted" value={formatCmsDateTime(row.createdAt)} />
          </dl>
        </CmsDetailCard>
      </div>

      <CmsDetailCard title="Why they want to volunteer">
        <p className="text-sm whitespace-pre-wrap text-cms-ink">
          {row.reason?.trim() || (
            <span className="text-cms-faint">No reason provided.</span>
          )}
        </p>
      </CmsDetailCard>
    </div>
  );
}
