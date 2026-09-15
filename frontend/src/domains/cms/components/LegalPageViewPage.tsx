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
import type { LegalSectionConfig } from "@/domains/cms/lib/legal-sections";
import { cmsToast } from "@/domains/cms/lib/toast";
import type { LegalPage } from "@/domains/cms/lib/types";
import CmsHtmlContent from "./CmsHtmlContent";

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
        const res = await cmsApi.getLegalPage(section.pageType, id);
        if (!cancelled) setPage(res.data);
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
  }, [id, section.pageType]);

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
      const res = await cmsApi.deleteLegalPage(section.pageType, page.id);
      cmsToast.success(
        res?.message || `${section.label} deleted successfully`
      );
      router.replace(section.basePath);
    } catch (err) {
      cmsToast.error(
        err instanceof Error ? err.message : "Failed to delete"
      );
      setBusy(false);
    }
  };

  const onRestore = async () => {
    if (!page) return;
    const ok = await cmsConfirm({
      title: `Restore ${section.singular}?`,
      description: `“${page.title}” will be restored and show again in All entries.`,
      confirmLabel: "Restore",
    });
    if (!ok) return;
    setBusy(true);
    try {
      const res = await cmsApi.restoreLegalPage(section.pageType, page.id);
      cmsToast.success(
        res.message || `${section.label} restored successfully`
      );
      setPage(res.data);
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
        Loading…
      </div>
    );
  }

  if (error || !page) {
    return (
      <div className="space-y-4">
        <Link
          href={section.basePath}
          className="inline-flex items-center gap-1.5 font-manrope text-sm text-[#5C5C5C] hover:text-[#212121]"
        >
          <ArrowLeft className="size-3.5" />
          Back to list
        </Link>
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 font-manrope text-sm text-red-700">
          {error || "Not found"}
        </div>
      </div>
    );
  }

  const isDeleted = Boolean(page.deletedAt);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link
            href={section.basePath}
            className="mb-3 inline-flex items-center gap-1.5 font-manrope text-sm text-[#5C5C5C] transition hover:text-[#212121]"
          >
            <ArrowLeft className="size-3.5" />
            Back to list
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="font-manrope text-xl font-semibold text-[#212121] sm:text-2xl">
              {page.title}
            </h2>
            <span className="rounded-full bg-[#FFF1C2] px-2.5 py-0.5 font-manrope text-xs font-medium text-[#7A5A00]">
              {page.status}
            </span>
            {isDeleted ? (
              <span className="rounded-full bg-red-50 px-2.5 py-0.5 font-manrope text-xs font-medium text-red-700">
                deleted
              </span>
            ) : null}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {!isDeleted && page.status === "published" ? (
            <Link
              href={section.publicPath}
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
                href={`${section.basePath}/${page.id}/edit`}
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

      <section className="rounded-2xl bg-white p-5 ring-1 ring-black/5 sm:p-6">
        <h3 className="mb-3 font-manrope text-xs font-semibold tracking-[0.16em] text-[#9A9A9A] uppercase">
          Content
        </h3>
        {page.content ? (
          <CmsHtmlContent html={page.content} />
        ) : (
          <p className="font-manrope text-sm text-muted-foreground">
            No content yet — add it in Edit.
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
            <dd className="mt-0.5">{page.metaTitle || "—"}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Meta description</dt>
            <dd className="mt-0.5">{page.metaDescription || "—"}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-xs text-muted-foreground">Schema</dt>
            <dd className="mt-0.5 whitespace-pre-wrap break-all">
              {page.schemaCode || "—"}
            </dd>
          </div>
        </dl>
      </section>
    </div>
  );
}
