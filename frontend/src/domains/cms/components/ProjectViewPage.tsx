"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Pencil, RotateCcw, Trash2 } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { cmsApi, publicProjectsApi } from "@/domains/cms/lib/api";
import { cmsConfirm } from "@/domains/cms/lib/confirm";
import { cmsToast } from "@/domains/cms/lib/toast";
import type { CmsProject } from "@/domains/cms/lib/types";
import { mapProjectToCard } from "@/domains/home/constants/project";
import ProjectsSection from "@/domains/home/components/ProjectsSection";
import CmsHtmlContent from "./CmsHtmlContent";
import CmsWebsitePreview from "./CmsWebsitePreview";

export default function ProjectViewPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [project, setProject] = useState<CmsProject | null>(null);
  const [published, setPublished] = useState<CmsProject[]>([]);
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
          cmsApi.getProject(id),
          publicProjectsApi.listPublished({ limit: 12 }).catch(() => null),
        ]);
        if (!cancelled) {
          setProject(res.data);
          setPublished(publishedRes?.data ?? []);
        }
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

  const { previewCards, activeIndex } = useMemo(() => {
    if (!project) return { previewCards: [], activeIndex: 0 };

    const list = [...published];
    const existingIdx = list.findIndex((p) => p.id === project.id);
    if (existingIdx === -1) {
      list.unshift(project);
    } else {
      list[existingIdx] = project;
    }

    const cards = list
      .slice(0, 12)
      .map((item, index) => mapProjectToCard(item, index));
    const idx = Math.max(
      0,
      cards.findIndex((c) => c.id === project.id)
    );

    return { previewCards: cards, activeIndex: idx };
  }, [project, published]);

  const onDelete = async () => {
    if (!project) return;
    const ok = await cmsConfirm({
      title: "Move to Recently Deleted?",
      description: `“${project.title}” will be soft-deleted. You can restore it later from Recently Deleted.`,
      confirmLabel: "Move to deleted",
      tone: "danger",
    });
    if (!ok) return;
    setBusy(true);
    try {
      const res = await cmsApi.deleteProject(project.id);
      cmsToast.success(res?.message || "Project deleted successfully");
      router.replace("/admin/projects");
    } catch (err) {
      cmsToast.error(
        err instanceof Error ? err.message : "Failed to delete"
      );
      setBusy(false);
    }
  };

  const onRestore = async () => {
    if (!project) return;
    const ok = await cmsConfirm({
      title: "Restore project?",
      description: `“${project.title}” will be restored and show again in All projects.`,
      confirmLabel: "Restore",
    });
    if (!ok) return;
    setBusy(true);
    try {
      const res = await cmsApi.restoreProject(project.id);
      cmsToast.success(res.message || "Project restored successfully");
      setProject(res.data);
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
        Loading project…
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="space-y-4">
        <Link
          href="/admin/projects"
          className="inline-flex items-center gap-1.5 font-manrope text-sm text-[#5C5C5C] hover:text-[#212121]"
        >
          <ArrowLeft className="size-3.5" />
          Back to list
        </Link>
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 font-manrope text-sm text-red-700">
          {error || "Project not found"}
        </div>
      </div>
    );
  }

  const isDeleted = Boolean(project.deletedAt);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link
            href="/admin/projects"
            className="mb-3 inline-flex items-center gap-1.5 font-manrope text-sm text-[#5C5C5C] transition hover:text-[#212121]"
          >
            <ArrowLeft className="size-3.5" />
            Back to list
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="font-manrope text-xl font-semibold text-[#212121] sm:text-2xl">
              {project.title}
            </h2>
            <span className="rounded-full bg-[#FFF1C2] px-2.5 py-0.5 font-manrope text-xs font-medium text-[#7A5A00]">
              {project.status}
            </span>
            {isDeleted ? (
              <span className="rounded-full bg-red-50 px-2.5 py-0.5 font-manrope text-xs font-medium text-red-700">
                deleted
              </span>
            ) : null}
          </div>
          <p className="mt-1 font-manrope text-sm text-muted-foreground">
            /{project.slug}
          </p>
          <p className="mt-1 font-manrope text-sm text-[#5C5C5C]">
            {[
              project.projectDate || null,
              project.displayOrder != null
                ? `Order ${project.displayOrder}`
                : null,
            ]
              .filter(Boolean)
              .join(" · ") || "No date set"}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
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
                href={`/admin/projects/${project.id}/edit`}
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

      <section className="overflow-hidden rounded-2xl ring-1 ring-black/5">
        <div className="border-b border-black/5 bg-white px-4 py-3 sm:px-5">
          <h3 className="font-manrope text-xs font-semibold tracking-[0.16em] text-[#9A9A9A] uppercase">
            Website preview
          </h3>
        </div>
        <CmsWebsitePreview className="bg-[#FFF6D8]">
          <ProjectsSection
            cards={previewCards}
            defaultActiveIndex={activeIndex}
            previewMode
          />
        </CmsWebsitePreview>
      </section>

      <div className="space-y-4">
        <section className="rounded-2xl bg-white p-5 ring-1 ring-black/5 sm:p-6">
          <h3 className="mb-3 font-manrope text-xs font-semibold tracking-[0.16em] text-[#9A9A9A] uppercase">
            Content
          </h3>
          {project.content ? (
            <CmsHtmlContent html={project.content} />
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
              <dd className="mt-0.5">{project.metaTitle || "—"}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">
                Meta description
              </dt>
              <dd className="mt-0.5">{project.metaDescription || "—"}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-xs text-muted-foreground">Schema</dt>
              <dd className="mt-0.5 break-all whitespace-pre-wrap">
                {project.schemaCode || "—"}
              </dd>
            </div>
          </dl>
        </section>
      </div>
    </div>
  );
}
