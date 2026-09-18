"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ExternalLink } from "lucide-react";
import Typography from "@/lib/Typography";
import { cmsApi } from "@/domains/cms/lib/api";
import { cmsConfirm } from "@/domains/cms/lib/confirm";
import { cmsToast } from "@/domains/cms/lib/toast";
import type { HomeBanner } from "@/domains/cms/lib/types";
import {
  CmsBadge,
  CmsDetailCard,
  CmsMediaTile,
  CmsRecordActions,
  CmsViewError,
  CmsViewHeader,
  CmsViewLoading,
  cmsErrorMessage,
} from "@/domains/cms/ui/CmsViewChrome";

const LIST_HREF = "/admin/home-banners";

export default function HomeBannerViewPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [banner, setBanner] = useState<HomeBanner | null>(null);
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
        const res = await cmsApi.getHomeBanner(id);
        if (!cancelled) setBanner(res.data);
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

  const onDelete = async () => {
    if (!banner) return;
    const ok = await cmsConfirm({
      title: "Move to Recently Deleted?",
      description: `“${banner.title}” will be soft-deleted. You can restore it later from Recently Deleted.`,
      confirmLabel: "Move to deleted",
      tone: "danger",
    });
    if (!ok) return;
    setBusy(true);
    try {
      const res = await cmsApi.deleteHomeBanner(banner.id);
      cmsToast.success(res?.message || "Home banner deleted successfully");
      router.replace(LIST_HREF);
    } catch (err) {
      cmsToast.error(cmsErrorMessage(err, "Failed to delete"));
      setBusy(false);
    }
  };

  const onRestore = async () => {
    if (!banner) return;
    const ok = await cmsConfirm({
      title: "Restore home banner?",
      description: `“${banner.title}” will be restored and show again in All banners.`,
      confirmLabel: "Restore",
    });
    if (!ok) return;
    setBusy(true);
    try {
      const res = await cmsApi.restoreHomeBanner(banner.id);
      cmsToast.success(res.message || "Home banner restored successfully");
      setBanner(res.data);
    } catch (err) {
      cmsToast.error(cmsErrorMessage(err, "Failed to restore"));
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <CmsViewLoading label="Loading banner…" />;
  if (error || !banner) {
    return (
      <CmsViewError
        backHref={LIST_HREF}
        message={error || "Home banner not found"}
      />
    );
  }

  const isDeleted = Boolean(banner.deletedAt);

  return (
    <div className="space-y-6">
      <CmsViewHeader
        backHref={LIST_HREF}
        title={banner.title}
        badges={
          <>
            <CmsBadge tone={banner.isActive ? "success" : "status"}>
              {banner.isActive ? "Active" : "Inactive"}
            </CmsBadge>
            {isDeleted ? <CmsBadge tone="danger">deleted</CmsBadge> : null}
          </>
        }
        meta={
          <Typography
            variant="label-1"
            as="p"
            className="mt-1 text-muted-foreground"
          >
            {banner.name}
            {banner.location ? ` · ${banner.location}` : ""} · order{" "}
            {banner.displayOrder}
          </Typography>
        }
        actions={
          <CmsRecordActions
            isDeleted={isDeleted}
            busy={busy}
            editHref={`${LIST_HREF}/${banner.id}/edit`}
            onDelete={onDelete}
            onRestore={onRestore}
            extra={
              banner.bannerImageUrl ? (
                <a
                  href={banner.bannerImageUrl}
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

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(220px,320px)_minmax(0,1fr)]">
        <div className="space-y-4">
          <CmsMediaTile
            src={banner.bannerImageUrl}
            alt={banner.title}
            empty="No banner image"
            className="h-56"
          />
          {banner.mobileBannerImageUrl || banner.profileImageUrl ? (
            <div className="grid grid-cols-2 gap-3">
              {banner.mobileBannerImageUrl ? (
                <CmsMediaTile
                  src={banner.mobileBannerImageUrl}
                  label="Mobile"
                  className="h-28"
                />
              ) : null}
              {banner.profileImageUrl ? (
                <CmsMediaTile
                  src={banner.profileImageUrl}
                  label="Profile"
                  className="h-28"
                />
              ) : null}
            </div>
          ) : null}
        </div>

        <CmsDetailCard title="Short description">
          {banner.shortDescription?.trim() ? (
            <Typography
              variant="label-1"
              as="p"
              className="whitespace-pre-wrap leading-relaxed text-[#212121]"
            >
              {banner.shortDescription}
            </Typography>
          ) : (
            <Typography
              variant="label-1"
              as="p"
              className="text-muted-foreground"
            >
              No description yet.
            </Typography>
          )}
        </CmsDetailCard>
      </div>
    </div>
  );
}
