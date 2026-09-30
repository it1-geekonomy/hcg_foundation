"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { cmsApi } from "@/domains/cms/lib/api";
import { cmsConfirm } from "@/domains/cms/lib/confirm";
import type { LegalSectionConfig } from "@/domains/cms/lib/legal-sections";
import { cmsToast } from "@/domains/cms/lib/toast";
import type { LegalPage } from "@/domains/cms/lib/types";
import {
  CmsBadge,
  CmsHtmlContentCard,
  CmsRecordActions,
  CmsSeoCard,
  CmsViewError,
  CmsViewHeader,
  CmsViewLoading,
  cmsErrorMessage,
} from "@/domains/cms/ui/CmsViewChrome";

export default function LegalPageViewPage({
  section,
}: {
  section: LegalSectionConfig;
}) {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [page, setPage] = useState<LegalPage | null>(null);
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
        const res = await cmsApi.getLegalPage(section.apiPath, id);
        if (!cancelled) setPage(res.data);
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
  }, [id, section.apiPath]);

  const onDelete = async () => {
    if (!page) return;
    const ok = await cmsConfirm({
      title: "Move to Recently Deleted?",
      description: `“${page.title}” will be soft-deleted. You can restore it later from Recently Deleted.`,
      confirmLabel: "Move to deleted",
      tone: "danger",
    });
    if (!ok) return;
    setBusy(true);
    try {
      const res = await cmsApi.deleteLegalPage(section.apiPath, page.id);
      cmsToast.success(
        res?.message || `${section.label} deleted successfully`,
      );
      router.replace(section.basePath);
    } catch (err) {
      cmsToast.error(cmsErrorMessage(err, "Failed to delete"));
      setBusy(false);
    }
  };

  const onRestore = async () => {
    if (!page) return;
    const ok = await cmsConfirm({
      title: `Restore ${section.singular}?`,
      description: `“${page.title}” will be restored and show again in ${section.activeListLabel}.`,
      confirmLabel: "Restore",
    });
    if (!ok) return;
    setBusy(true);
    try {
      const res = await cmsApi.restoreLegalPage(section.apiPath, page.id);
      cmsToast.success(
        res.message || `${section.label} restored successfully`,
      );
      setPage(res.data);
    } catch (err) {
      cmsToast.error(cmsErrorMessage(err, "Failed to restore"));
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <CmsViewLoading label="Loading…" />;
  if (error || !page) {
    return (
      <CmsViewError
        backHref={section.basePath}
        message={error || "Not found"}
      />
    );
  }

  const isDeleted = Boolean(page.deletedAt);

  return (
    <div className="space-y-6">
      <CmsViewHeader
        backHref={section.basePath}
        title={page.title}
        badges={
          <>
            <CmsBadge>{page.status}</CmsBadge>
            {isDeleted ? <CmsBadge tone="danger">deleted</CmsBadge> : null}
          </>
        }
        actions={
          <CmsRecordActions
            isDeleted={isDeleted}
            busy={busy}
            editHref={`${section.basePath}/${page.id}/edit`}
            onDelete={onDelete}
            onRestore={onRestore}
          />
        }
      />

      <CmsHtmlContentCard
        html={page.content}
        empty="No content yet — add it in Edit."
      />
      <CmsSeoCard
        metaTitle={page.metaTitle}
        metaDescription={page.metaDescription}
        schemaCode={page.schemaCode}
      />
    </div>
  );
}
