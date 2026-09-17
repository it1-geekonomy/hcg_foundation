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
import type { Award } from "@/domains/cms/lib/types";

export default function AwardViewPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [award, setAward] = useState<Award | null>(null);
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
        const res = await cmsApi.getAward(id);
        if (!cancelled) setAward(res.data);
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
      router.replace("/admin/awards");
    } catch (err) {
      cmsToast.error(
        err instanceof Error ? err.message : "Failed to delete"
      );
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
        Loading award…
      </Typography>
    );
  }

  if (error || !award) {
    return (
      <div className="space-y-4">
        <Link
          href="/admin/awards"
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
          {error || "Award not found"}
        </Typography>
      </div>
    );
  }

  const isDeleted = Boolean(award.deletedAt);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link
            href="/admin/awards"
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
              {award.title}
            </Typography>
            {award.year != null ? (
              <Typography
                variant="caption-1"
                as="span"
                className="rounded-full bg-[#E8F0F6] px-2.5 py-0.5 font-medium text-[#1A4A6E]"
              >
                {award.year}
              </Typography>
            ) : null}
            <Typography
              variant="caption-1"
              as="span"
              className="rounded-full bg-[#FFF1C2] px-2.5 py-0.5 font-medium text-[#7A5A00]"
            >
              {award.status}
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
            Display order {award.displayOrder}
          </Typography>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {award.awardImageUrl ? (
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
                href={`/admin/awards/${award.id}/edit`}
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

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(180px,240px)_minmax(0,1fr)]">
        <div className="self-start overflow-hidden rounded-xl bg-white shadow-[0_4px_14px_rgba(0,0,0,0.05)] ring-1 ring-black/[0.05]">
          <div className="relative h-56 bg-[#F0EEE9]">
            {award.awardImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={award.awardImageUrl}
                alt={award.title}
                className="absolute inset-0 h-full w-full object-contain object-center p-3"
              />
            ) : (
              <Typography
                variant="label-1"
                as="div"
                className="absolute inset-0 flex items-center justify-center text-[#9A9A9A]"
              >
                No image
              </Typography>
            )}
          </div>
        </div>

        <section className="rounded-2xl bg-white p-5 ring-1 ring-black/5 sm:p-6">
          <Typography
            variant="caption-1"
            as="h3"
            className="mb-3 font-semibold tracking-[0.16em] text-[#9A9A9A] uppercase"
          >
            Description
          </Typography>
          {award.description?.trim() ? (
            <Typography
              variant="label-1"
              as="p"
              className="whitespace-pre-wrap leading-relaxed text-[#212121]"
            >
              {award.description}
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
