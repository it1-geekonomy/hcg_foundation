"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ExternalLink,
  Pencil,
  RotateCcw,
  Trash2,
} from "lucide-react";
import Typography from "@/lib/Typography";
import { Button } from "@/shared/ui/button";
import { cmsApi } from "@/domains/cms/lib/api";
import { cmsConfirm } from "@/domains/cms/lib/confirm";
import { cmsToast } from "@/domains/cms/lib/toast";
import type { HomeBanner } from "@/domains/cms/lib/types";

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
      router.replace("/admin/home-banners");
    } catch (err) {
      cmsToast.error(
        err instanceof Error ? err.message : "Failed to delete"
      );
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
        Loading banner…
      </Typography>
    );
  }

  if (error || !banner) {
    return (
      <div className="space-y-4">
        <Link
          href="/admin/home-banners"
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
          {error || "Home banner not found"}
        </Typography>
      </div>
    );
  }

  const isDeleted = Boolean(banner.deletedAt);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link
            href="/admin/home-banners"
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
              {banner.title}
            </Typography>
            <Typography
              variant="caption-1"
              as="span"
              className={`rounded-full px-2.5 py-0.5 font-medium ${
                banner.isActive
                  ? "bg-[#E8F6EC] text-[#1B6B3A]"
                  : "bg-[#FFF1C2] text-[#7A5A00]"
              }`}
            >
              {banner.isActive ? "Active" : "Inactive"}
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
            {banner.name}
            {banner.location ? ` · ${banner.location}` : ""} · order{" "}
            {banner.displayOrder}
          </Typography>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {banner.bannerImageUrl ? (
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
                href={`/admin/home-banners/${banner.id}/edit`}
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

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(220px,320px)_minmax(0,1fr)]">
        <div className="space-y-4">
          <div className="overflow-hidden rounded-xl bg-white shadow-[0_4px_14px_rgba(0,0,0,0.05)] ring-1 ring-black/[0.05]">
            <div className="relative h-56 bg-[#F0EEE9]">
              {banner.bannerImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={banner.bannerImageUrl}
                  alt={banner.title}
                  className="absolute inset-0 h-full w-full object-contain object-center p-3"
                />
              ) : (
                <Typography
                  variant="label-1"
                  as="div"
                  className="absolute inset-0 flex items-center justify-center text-[#9A9A9A]"
                >
                  No banner image
                </Typography>
              )}
            </div>
          </div>
          {banner.mobileBannerImageUrl || banner.profileImageUrl ? (
            <div className="grid grid-cols-2 gap-3">
              {banner.mobileBannerImageUrl ? (
                <div className="overflow-hidden rounded-xl bg-white ring-1 ring-black/[0.05]">
                  <Typography
                    variant="caption-1"
                    as="p"
                    className="px-2 pt-2 font-semibold tracking-wider text-[#9A9A9A] uppercase"
                  >
                    Mobile
                  </Typography>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={banner.mobileBannerImageUrl}
                    alt=""
                    className="h-28 w-full object-contain p-2"
                  />
                </div>
              ) : null}
              {banner.profileImageUrl ? (
                <div className="overflow-hidden rounded-xl bg-white ring-1 ring-black/[0.05]">
                  <Typography
                    variant="caption-1"
                    as="p"
                    className="px-2 pt-2 font-semibold tracking-wider text-[#9A9A9A] uppercase"
                  >
                    Profile
                  </Typography>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={banner.profileImageUrl}
                    alt=""
                    className="h-28 w-full object-contain p-2"
                  />
                </div>
              ) : null}
            </div>
          ) : null}
        </div>

        <section className="rounded-2xl bg-white p-5 ring-1 ring-black/5 sm:p-6">
          <Typography
            variant="caption-1"
            as="h3"
            className="mb-3 font-semibold tracking-[0.16em] text-[#9A9A9A] uppercase"
          >
            Short description
          </Typography>
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
        </section>
      </div>
    </div>
  );
}
