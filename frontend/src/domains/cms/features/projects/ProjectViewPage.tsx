"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import Typography from "@/lib/Typography";
import { cmsApi, publicProjectsApi } from "@/domains/cms/lib/api";
import { cmsConfirm } from "@/domains/cms/lib/confirm";
import { cmsToast } from "@/domains/cms/lib/toast";
import type { CmsProject } from "@/domains/cms/lib/types";
import { mapProjectToCard } from "@/domains/home/constants/project";
import ProjectsSection from "@/domains/home/components/ProjectsSection";
import CmsWebsitePreview from "@/domains/cms/ui/CmsWebsitePreview";
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

const LIST_HREF = "/admin/projects";

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
        if (cancelled) return;
        setProject(res.data);
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

  const { previewCards, activeIndex } = useMemo(() => {
    if (!project) return { previewCards: [], activeIndex: 0 };

    const list = [...published];
    const existingIdx = list.findIndex((p) => p.id === project.id);
    if (existingIdx === -1) list.unshift(project);
    else list[existingIdx] = project;

    const cards = list
      .slice(0, 12)
      .map((item, index) => mapProjectToCard(item, index));
    const idx = Math.max(
      0,
      cards.findIndex((c) => c.id === project.id),
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
      router.replace(LIST_HREF);
    } catch (err) {
      cmsToast.error(cmsErrorMessage(err, "Failed to delete"));
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
      cmsToast.error(cmsErrorMessage(err, "Failed to restore"));
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <CmsViewLoading label="Loading project…" />;
  if (error || !project) {
    return (
      <CmsViewError
        backHref={LIST_HREF}
        message={error || "Project not found"}
      />
    );
  }

  const isDeleted = Boolean(project.deletedAt);

  return (
    <div className="space-y-6">
      <CmsViewHeader
        backHref={LIST_HREF}
        title={project.title}
        badges={
          <>
            <CmsBadge>{project.status}</CmsBadge>
            {isDeleted ? <CmsBadge tone="danger">deleted</CmsBadge> : null}
          </>
        }
        meta={
          <>
            <Typography
              variant="label-1"
              as="p"
              className="mt-1 text-muted-foreground"
            >
              /{project.slug}
            </Typography>
            <Typography
              variant="label-1"
              as="p"
              className="mt-1 text-[#5C5C5C]"
            >
              {[
                project.projectDate || null,
                project.displayOrder != null
                  ? `Order ${project.displayOrder}`
                  : null,
              ]
                .filter(Boolean)
                .join(" · ") || "No date set"}
            </Typography>
          </>
        }
        actions={
          <CmsRecordActions
            isDeleted={isDeleted}
            busy={busy}
            editHref={`${LIST_HREF}/${project.id}/edit`}
            onDelete={onDelete}
            onRestore={onRestore}
          />
        }
      />

      <CmsWebsitePreview label="Website preview" className="bg-[#FFF6D8]">
        <ProjectsSection
          cards={previewCards}
          defaultActiveIndex={activeIndex}
          previewMode
        />
      </CmsWebsitePreview>

      <div className="space-y-4">
        <CmsHtmlContentCard html={project.content} />
        <CmsSeoCard
          metaTitle={project.metaTitle}
          metaDescription={project.metaDescription}
          schemaCode={project.schemaCode}
        />
      </div>
    </div>
  );
}
