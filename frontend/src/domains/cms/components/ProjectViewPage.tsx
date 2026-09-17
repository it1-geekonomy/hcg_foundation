"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Pencil, RotateCcw, Trash2 } from "lucide-react";
import Typography from "@/lib/Typography";
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
      <Typography
        variant="label-1"
        as="div"
        className="py-16 text-center text-muted-foreground"
      >
        Loading project…
      </Typography>
    );
  }

  if (error || !project) {
    return (
      <div className="space-y-4">
        <Link
          href="/admin/projects"
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
          {error || "Project not found"}
        </Typography>
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
              {project.title}
            </Typography>
            <Typography
              variant="caption-1"
              as="span"
              className="rounded-full bg-[#FFF1C2] px-2.5 py-0.5 font-medium text-[#7A5A00]"
            >
              {project.status}
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
            /{project.slug}
          </Typography>
          <Typography variant="label-1" as="p" className="mt-1 text-[#5C5C5C]">
            {[
              project.projectDate || null,
              project.displayOrder != null
                ? `Order ${project.displayOrder}`
                : null,
            ]
              .filter(Boolean)
              .join(" · ") || "No date set"}
          </Typography>
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
                href={`/admin/projects/${project.id}/edit`}
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

      <section className="overflow-hidden rounded-2xl ring-1 ring-black/5">
        <div className="border-b border-black/5 bg-white px-4 py-3 sm:px-5">
          <Typography
            variant="caption-1"
            as="h3"
            className="font-semibold tracking-[0.16em] text-[#9A9A9A] uppercase"
          >
            Website preview
          </Typography>
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
          <Typography
            variant="caption-1"
            as="h3"
            className="mb-3 font-semibold tracking-[0.16em] text-[#9A9A9A] uppercase"
          >
            Content
          </Typography>
          {project.content ? (
            <CmsHtmlContent html={project.content} />
          ) : (
            <Typography
              variant="label-1"
              as="p"
              className="text-muted-foreground"
            >
              No content yet.
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
                {project.metaTitle || "—"}
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
                {project.metaDescription || "—"}
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
                className="mt-0.5 break-all whitespace-pre-wrap"
              >
                {project.schemaCode || "—"}
              </Typography>
            </div>
          </dl>
        </section>
      </div>
    </div>
  );
}
