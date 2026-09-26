"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ExternalLink } from "lucide-react";
import Typography from "@/lib/Typography";
import { cmsApi, publicAwardsApi } from "@/domains/cms/lib/api";
import { cmsConfirm } from "@/domains/cms/lib/confirm";
import { cmsToast } from "@/domains/cms/lib/toast";
import type { Award } from "@/domains/cms/lib/types";
import AwardsRecognition from "@/domains/about/components/awards";
import { mapCmsAwardToItem } from "@/domains/about/constants/awards";
import CmsWebsitePreview from "@/domains/cms/ui/CmsWebsitePreview";
import {
  CmsBadge,
  CmsDetailCard,
  CmsDetailField,
  CmsRecordActions,
  CmsViewError,
  CmsViewHeader,
  CmsViewLoading,
  cmsErrorMessage,
} from "@/domains/cms/ui/CmsViewChrome";

const LIST_HREF = "/admin/awards";

export default function AwardViewPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [award, setAward] = useState<Award | null>(null);
  const [published, setPublished] = useState<Award[]>([]);
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
          cmsApi.getAward(id),
          publicAwardsApi.listPublished({ limit: 50 }).catch(() => null),
        ]);
        if (cancelled) return;
        setAward(res.data);
        setPublished(publishedRes?.data ?? []);
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

  const previewItems = useMemo(() => {
    if (!award) return [];
    const others = published.filter((a) => a.id !== award.id);
    return [award, ...others].map(mapCmsAwardToItem);
  }, [award, published]);

  const onDelete = async () => {
    if (!award) return;
    const ok = await cmsConfirm({
      title: "Move to Recently Deleted?",
      description: `“${award.title}” will be soft-deleted. You can restore it later from Recently Deleted.`,
      confirmLabel: "Move to deleted",
      tone: "danger",
    });
    if (!ok) return;
    setBusy(true);
    try {
      const res = await cmsApi.deleteAward(award.id);
      cmsToast.success(res?.message || "Award deleted successfully");
      router.replace(LIST_HREF);
    } catch (err) {
      cmsToast.error(cmsErrorMessage(err, "Failed to delete"));
      setBusy(false);
    }
  };

  const onRestore = async () => {
    if (!award) return;
    const ok = await cmsConfirm({
      title: "Restore award?",
      description: `“${award.title}” will be restored and show again in All awards.`,
      confirmLabel: "Restore",
    });
    if (!ok) return;
    setBusy(true);
    try {
      const res = await cmsApi.restoreAward(award.id);
      cmsToast.success(res.message || "Award restored successfully");
      setAward(res.data);
    } catch (err) {
      cmsToast.error(cmsErrorMessage(err, "Failed to restore"));
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <CmsViewLoading label="Loading award…" />;
  if (error || !award) {
    return (
      <CmsViewError
        backHref={LIST_HREF}
        message={error || "Award not found"}
      />
    );
  }

  const isDeleted = Boolean(award.deletedAt);

  return (
    <div className="space-y-6">
      <CmsViewHeader
        backHref={LIST_HREF}
        title={award.title}
        badges={
          <>
            {award.year != null ? (
              <CmsBadge tone="info">{award.year}</CmsBadge>
            ) : null}
            <CmsBadge>{award.status}</CmsBadge>
            {isDeleted ? <CmsBadge tone="danger">deleted</CmsBadge> : null}
          </>
        }
        meta={
          <Typography
            variant="label-1"
            as="p"
            className="mt-1 text-muted-foreground"
          >
            Display order {award.displayOrder}
          </Typography>
        }
        actions={
          <CmsRecordActions
            isDeleted={isDeleted}
            busy={busy}
            editHref={`${LIST_HREF}/${award.id}/edit`}
            onDelete={onDelete}
            onRestore={onRestore}
            extra={
              award.awardImageUrl ? (
                <a
                  href={award.awardImageUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-black/10 bg-white px-3 text-[#212121] transition hover:bg-[#F7F7F5]"
                >
                  <ExternalLink className="size-3.5" />
                  <Typography variant="label-1" as="span">
                    Open image
                  </Typography>
                </a>
              ) : null
            }
          />
        }
      />

      <CmsWebsitePreview
        label="Website preview · About Us"
        className="bg-[#FFFCF2]"
      >
        <AwardsRecognition items={previewItems} />
      </CmsWebsitePreview>

      <CmsDetailCard title="Details">
        <dl className="grid gap-4 sm:grid-cols-2">
          <CmsDetailField label="Year" value={award.year} />
          <CmsDetailField label="Display order" value={award.displayOrder} />
          <CmsDetailField
            label="Description"
            value={award.description}
            empty="No description yet."
            className="sm:col-span-2"
          />
        </dl>
      </CmsDetailCard>
    </div>
  );
}
