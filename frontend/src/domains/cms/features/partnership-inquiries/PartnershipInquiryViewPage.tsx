"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { cmsApi } from "@/domains/cms/lib/api";
import { cmsConfirm } from "@/domains/cms/lib/confirm";
import { cmsToast } from "@/domains/cms/lib/toast";
import type { PartnershipInquiry } from "@/domains/cms/lib/types";
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

export default function PartnershipInquiryViewPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [row, setRow] = useState<PartnershipInquiry | null>(null);
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
        const res = await cmsApi.getPartnershipInquiry(id);
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
      const res = await cmsApi.deletePartnershipInquiry(row.id);
      cmsToast.success(res?.message || "Inquiry deleted successfully");
      router.replace("/admin/partnership-inquiries");
    } catch (err) {
      cmsToast.error(cmsErrorMessage(err, "Failed to delete"));
      setBusy(false);
    }
  };

  const onRestore = async () => {
    if (!row) return;
    const ok = await cmsConfirm({
      title: "Restore inquiry?",
      description: `“${row.fullName}” will be restored.`,
      confirmLabel: "Restore",
    });
    if (!ok) return;
    setBusy(true);
    try {
      const res = await cmsApi.restorePartnershipInquiry(row.id);
      cmsToast.success(res.message || "Inquiry restored successfully");
      setRow(res.data);
    } catch (err) {
      cmsToast.error(cmsErrorMessage(err, "Failed to restore"));
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <CmsViewLoading label="Loading inquiry…" />;
  if (error || !row) {
    return (
      <CmsViewError
        backHref="/admin/partnership-inquiries"
        message={error || "Not found"}
      />
    );
  }

  const statusLabel = row.status.replace("_", " ");

  return (
    <div className="space-y-6">
      <CmsViewHeader
        backHref="/admin/partnership-inquiries"
        title={row.fullName}
        badges={
          <>
            <CmsBadge>{statusLabel}</CmsBadge>
            {isDeleted ? <CmsBadge tone="danger">deleted</CmsBadge> : null}
          </>
        }
        meta={row.organizationName || "Partnership inquiry"}
        actions={
          <CmsRecordActions
            isDeleted={isDeleted}
            busy={busy}
            editHref={`/admin/partnership-inquiries/${row.id}/edit`}
            onDelete={() => void onDelete()}
            onRestore={() => void onRestore()}
          />
        }
      />

      <CmsDetailCard title="Details">
        <dl>
          <CmsDetailRow label="Email" value={row.email} />
          <CmsDetailRow label="Phone" value={row.phoneNumber} />
          <CmsDetailRow label="Organization" value={row.organizationName} />
          <CmsDetailRow label="Message" value={row.message} />
          <CmsDetailRow
            label="Terms accepted"
            value={row.termsAccepted ? "Yes" : "No"}
          />
          <CmsDetailRow
            label="Status"
            value={<span className="capitalize">{statusLabel}</span>}
          />
          <CmsDetailRow label="Submitted" value={formatCmsDateTime(row.createdAt)} />
          <CmsDetailRow label="Updated" value={formatCmsDateTime(row.updatedAt)} />
        </dl>
      </CmsDetailCard>
    </div>
  );
}
