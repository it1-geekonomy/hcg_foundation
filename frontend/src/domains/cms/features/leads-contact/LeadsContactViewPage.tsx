"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { cmsApi } from "@/domains/cms/lib/api";
import { cmsConfirm } from "@/domains/cms/lib/confirm";
import { cmsToast } from "@/domains/cms/lib/toast";
import type { LeadsContact } from "@/domains/cms/lib/types";
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

export default function LeadsContactViewPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [row, setRow] = useState<LeadsContact | null>(null);
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
        const res = await cmsApi.getLeadsContact(id);
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
      const res = await cmsApi.deleteLeadsContact(row.id);
      cmsToast.success(res?.message || "Lead deleted successfully");
      router.replace("/admin/leads-contact");
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
      const res = await cmsApi.restoreLeadsContact(row.id);
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
        backHref="/admin/leads-contact"
        message={error || "Not found"}
      />
    );
  }

  return (
    <div className="space-y-6">
      <CmsViewHeader
        backHref="/admin/leads-contact"
        title={row.fullName}
        badges={isDeleted ? <CmsBadge tone="danger">deleted</CmsBadge> : null}
        meta={`Contact lead · received ${formatCmsDateTime(row.createdAt)}`}
        actions={
          <CmsRecordActions
            isDeleted={isDeleted}
            busy={busy}
            editHref={`/admin/leads-contact/${row.id}/edit`}
            onDelete={() => void onDelete()}
            onRestore={() => void onRestore()}
          />
        }
      />

      <CmsDetailCard title="Details">
        <dl>
          <CmsDetailRow label="Email" value={row.email} />
          <CmsDetailRow label="Phone" value={row.phone} />
          <CmsDetailRow label="Message" value={row.message} />
          <CmsDetailRow label="Submitted" value={formatCmsDateTime(row.createdAt)} />
        </dl>
      </CmsDetailCard>
    </div>
  );
}
