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
import { Button } from "@/shared/ui/button";
import { cmsApi } from "@/domains/cms/lib/api";
import { cmsConfirm } from "@/domains/cms/lib/confirm";
import { cmsToast } from "@/domains/cms/lib/toast";
import type { CmsEvent } from "@/domains/cms/lib/types";
import CmsHtmlContent from "./CmsHtmlContent";

function hasUrl(value?: string | null) {
  return Boolean(value && value.trim());
}

export default function EventViewPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [event, setEvent] = useState<CmsEvent | null>(null);
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
        const res = await cmsApi.getEvent(id);
        if (!cancelled) setEvent(res.data);
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
    if (!event) return;
    const ok = await cmsConfirm({
      title: "Move to Recently Deleted?",
      description: `“${event.title}” will be soft-deleted. You can restore it later from Recently Deleted.`,
      confirmLabel: "Move to deleted",
      tone: "danger",
    });
    if (!ok) return;
    setBusy(true);
    try {
      const res = await cmsApi.deleteEvent(event.id);
      cmsToast.success(res?.message || "Event deleted successfully");
      router.replace("/admin/events");
    } catch (err) {
      cmsToast.error(
        err instanceof Error ? err.message : "Failed to delete"
      );
      setBusy(false);
    }
  };

  const onRestore = async () => {
    if (!event) return;
    const ok = await cmsConfirm({
      title: "Restore event?",
      description: `“${event.title}” will be restored and show again in All events.`,
      confirmLabel: "Restore",
    });
    if (!ok) return;
    setBusy(true);
    try {
      const res = await cmsApi.restoreEvent(event.id);
      cmsToast.success(res.message || "Event restored successfully");
      setEvent(res.data);
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
      <div className="py-16 text-center font-manrope text-sm text-muted-foreground">
        Loading event…
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="space-y-4">
        <Link
          href="/admin/events"
          className="inline-flex items-center gap-1.5 font-manrope text-sm text-[#5C5C5C] hover:text-[#212121]"
        >
          <ArrowLeft className="size-3.5" />
          Back to list
        </Link>
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 font-manrope text-sm text-red-700">
          {error || "Event not found"}
        </div>
      </div>
    );
  }

  const isDeleted = Boolean(event.deletedAt);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link
            href="/admin/events"
            className="mb-3 inline-flex items-center gap-1.5 font-manrope text-sm text-[#5C5C5C] transition hover:text-[#212121]"
          >
            <ArrowLeft className="size-3.5" />
            Back to list
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="font-manrope text-xl font-semibold text-[#212121] sm:text-2xl">
              {event.title}
            </h2>
            <span className="rounded-full bg-[#FFF1C2] px-2.5 py-0.5 font-manrope text-xs font-medium text-[#7A5A00]">
              {event.status}
            </span>
            {isDeleted ? (
              <span className="rounded-full bg-red-50 px-2.5 py-0.5 font-manrope text-xs font-medium text-red-700">
                deleted
              </span>
            ) : null}
          </div>
          <p className="mt-1 font-manrope text-sm text-muted-foreground">
            /{event.slug}
          </p>
          <p className="mt-1 font-manrope text-sm text-[#5C5C5C]">
            {[
              event.eventDate,
              event.eventTime ? event.eventTime.slice(0, 5) : null,
              event.eventLocation,
            ]
              .filter(Boolean)
              .join(" · ") || "Date / location not set"}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {!isDeleted && event.status === "published" ? (
            <Link
              href={`/resources/events/${event.slug}`}
              target="_blank"
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-black/10 bg-white px-3 font-manrope text-sm text-[#212121] transition hover:bg-[#F7F7F5]"
            >
              <ExternalLink className="size-3.5" />
              Public page
            </Link>
          ) : null}
          {isDeleted ? (
            <Button
              type="button"
              variant="outline"
              className="h-9 gap-1.5 border-black/10 bg-white font-manrope text-[#212121] hover:bg-[#F0F0EC] hover:text-[#212121]"
              disabled={busy}
              onClick={() => void onRestore()}
            >
              <RotateCcw className="size-3.5" />
              {busy ? "Restoring…" : "Restore"}
            </Button>
          ) : (
            <>
              <Link
                href={`/admin/events/${event.id}/edit`}
                className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#FCCC2D] px-3 font-manrope text-sm font-semibold text-[#212121] transition hover:brightness-105"
              >
                <Pencil className="size-3.5" />
                Edit
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
        <div className="space-y-3 self-start">
          <div className="overflow-hidden rounded-xl bg-white shadow-[0_4px_14px_rgba(0,0,0,0.05)] ring-1 ring-black/[0.05]">
            <div className="relative h-44 bg-[#F0EEE9]">
              {hasUrl(event.eventBanner) ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={event.eventBanner!}
                  alt=""
                  className="absolute inset-0 h-full w-full object-contain p-2"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center font-manrope text-sm text-[#9A9A9A]">
                  No desktop banner
                </div>
              )}
            </div>
            <p className="border-t border-black/[0.04] px-3 py-2 font-manrope text-xs text-[#8A8A8A]">
              Desktop banner
            </p>
          </div>
          <div className="overflow-hidden rounded-xl bg-white shadow-[0_4px_14px_rgba(0,0,0,0.05)] ring-1 ring-black/[0.05]">
            <div className="relative h-36 bg-[#F0EEE9]">
              {hasUrl(event.eventMobileBanner) ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={event.eventMobileBanner!}
                  alt=""
                  className="absolute inset-0 h-full w-full object-contain p-2"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center font-manrope text-sm text-[#9A9A9A]">
                  No mobile banner
                </div>
              )}
            </div>
            <p className="border-t border-black/[0.04] px-3 py-2 font-manrope text-xs text-[#8A8A8A]">
              Mobile banner
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <section className="rounded-2xl bg-white p-5 ring-1 ring-black/5 sm:p-6">
            <h3 className="mb-3 font-manrope text-xs font-semibold tracking-[0.16em] text-[#9A9A9A] uppercase">
              Short description
            </h3>
            <p className="font-manrope text-sm leading-relaxed text-[#212121]">
              {event.shortDescription?.trim() || "—"}
            </p>
          </section>

          <section className="rounded-2xl bg-white p-5 ring-1 ring-black/5 sm:p-6">
            <h3 className="mb-3 font-manrope text-xs font-semibold tracking-[0.16em] text-[#9A9A9A] uppercase">
              Content
            </h3>
            {event.content ? (
              <CmsHtmlContent html={event.content} />
            ) : (
              <p className="font-manrope text-sm text-muted-foreground">
                No content yet.
              </p>
            )}
          </section>

          <section className="rounded-2xl bg-white p-5 ring-1 ring-black/5 sm:p-6">
            <h3 className="mb-3 font-manrope text-xs font-semibold tracking-[0.16em] text-[#9A9A9A] uppercase">
              SEO
            </h3>
            <dl className="grid gap-3 font-manrope text-sm sm:grid-cols-2">
              <div>
                <dt className="text-xs text-muted-foreground">Meta title</dt>
                <dd className="mt-0.5">{event.metaTitle || "—"}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">
                  Meta description
                </dt>
                <dd className="mt-0.5">{event.metaDescription || "—"}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-xs text-muted-foreground">Schema</dt>
                <dd className="mt-0.5 whitespace-pre-wrap break-all">
                  {event.schemaCode || "—"}
                </dd>
              </div>
            </dl>
          </section>
        </div>
      </div>
    </div>
  );
}
