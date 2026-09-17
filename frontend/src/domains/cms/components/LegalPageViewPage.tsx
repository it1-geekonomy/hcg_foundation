"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, Pencil, RotateCcw, Trash2 } from "lucide-react";
import Typography from "@/lib/Typography";
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
        const res = await cmsApi.getLegalPage(section.apiPath, id);
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
      description: `“${page.title}” will be restored and show again in ${section.activeListLabel}.`,
      confirmLabel: "Restore",
    });
    if (!ok) return;
    setBusy(true);
    try {
      const res = await cmsApi.restoreLegalPage(section.apiPath, page.id);
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
      <Typography
        variant="label-1"
        as="div"
        className="py-16 text-center text-muted-foreground"
      >
        Loading…
      </Typography>
    );
  }

  if (error || !page) {
    return (
      <div className="space-y-4">
        <Link
          href={section.basePath}
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
          {error || "Not found"}
        </Typography>
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
              {page.title}
            </Typography>
            <Typography
              variant="caption-1"
              as="span"
              className="rounded-full bg-[#FFF1C2] px-2.5 py-0.5 font-medium text-[#7A5A00]"
            >
              {page.status}
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
        </div>

        <div className="flex flex-wrap items-center gap-2">
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
                href={`${section.basePath}/${page.id}/edit`}
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

      <section className="rounded-2xl bg-white p-5 ring-1 ring-black/5 sm:p-6">
        <Typography
          variant="caption-1"
          as="h3"
          className="mb-3 font-semibold tracking-[0.16em] text-[#9A9A9A] uppercase"
        >
          Content
        </Typography>
        {page.content ? (
          <CmsHtmlContent html={page.content} />
        ) : (
          <Typography
            variant="label-1"
            as="p"
            className="text-muted-foreground"
          >
            No content yet — add it in Edit.
          </Typography>
        )}
      </section>

      <section className="rounded-2xl bg-white p-5 ring-1 ring-black/5 sm:p-6">
        <Typography
          variant="caption-1"
          as="h3"
          className="mb-3 font-semibold tracking-[0.16em] text-[#9A9A9A] uppercase"
        >
          SEO
        </Typography>
        <dl className="grid gap-3 sm:grid-cols-2">
          <div>
            <Typography
              variant="caption-1"
              as="dt"
              className="text-muted-foreground"
            >
              Meta title
            </Typography>
            <Typography variant="label-1" as="dd" className="mt-0.5">
              {page.metaTitle || "—"}
            </Typography>
          </div>
          <div>
            <Typography
              variant="caption-1"
              as="dt"
              className="text-muted-foreground"
            >
              Meta description
            </Typography>
            <Typography variant="label-1" as="dd" className="mt-0.5">
              {page.metaDescription || "—"}
            </Typography>
          </div>
          <div className="sm:col-span-2">
            <Typography
              variant="caption-1"
              as="dt"
              className="text-muted-foreground"
            >
              Schema
            </Typography>
            <Typography
              variant="label-1"
              as="dd"
              className="mt-0.5 whitespace-pre-wrap break-all"
            >
              {page.schemaCode || "—"}
            </Typography>
          </div>
        </dl>
      </section>
    </div>
  );
}
