"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Users } from "lucide-react";
import Typography from "@/lib/Typography";
import { cmsApi } from "@/domains/cms/lib/api";
import { cmsConfirm } from "@/domains/cms/lib/confirm";
import { cmsToast } from "@/domains/cms/lib/toast";
import type { PatientStory } from "@/domains/cms/lib/types";
import {
  CmsBadge,
  CmsRecordActions,
  CmsSeoCard,
  CmsViewError,
  CmsViewHeader,
  CmsViewLoading,
  cmsErrorMessage,
} from "@/domains/cms/ui/CmsViewChrome";
import CmsWebsitePreview from "@/domains/cms/ui/CmsWebsitePreview";
import { PatientStoryDetailPreview } from "@/domains/journey-of-hope/components/PatientStoryDetailPreview";

const LIST_HREF = "/admin/patients";

export default function PatientStoryViewPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [story, setStory] = useState<PatientStory | null>(null);
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
        const res = await cmsApi.getPatientStory(id);
        if (cancelled) return;
        setStory(res.data);
      } catch (err) {
        if (cancelled) return;
        const message = cmsErrorMessage(err, "Failed to load patient story");
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
    if (!story) return;
    const ok = await cmsConfirm({
      title: "Move to Recently Deleted?",
      description: `“${story.title}” will be soft-deleted. You can restore it later from Recently Deleted.`,
      confirmLabel: "Move to deleted",
      tone: "danger",
    });
    if (!ok) return;
    setBusy(true);
    try {
      const res = await cmsApi.deletePatientStory(story.id);
      cmsToast.success(res?.message || "Patient story deleted successfully");
      router.replace(LIST_HREF);
    } catch (err) {
      cmsToast.error(cmsErrorMessage(err, "Failed to delete"));
      setBusy(false);
    }
  };

  const onRestore = async () => {
    if (!story) return;
    const ok = await cmsConfirm({
      title: "Restore patient story?",
      description: `“${story.title}” will be restored and show again in All patient stories.`,
      confirmLabel: "Restore",
    });
    if (!ok) return;
    setBusy(true);
    try {
      const res = await cmsApi.restorePatientStory(story.id);
      cmsToast.success(res.message || "Patient story restored successfully");
      setStory(res.data);
    } catch (err) {
      cmsToast.error(cmsErrorMessage(err, "Failed to restore"));
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <CmsViewLoading label="Loading patient story…" />;
  if (error || !story) {
    return (
      <CmsViewError
        backHref={LIST_HREF}
        message={error || "Patient story not found"}
      />
    );
  }

  const isDeleted = Boolean(story.deletedAt);

  const previewStory = story
    ? {
        id: story.id,
        slug: story.slug,
        patientName: story.title,
        date: story.storyDate ? String(story.storyDate).slice(0, 10) : "",
        conditionTag: story.donationState || "Patient Journey",
        excerpt: story.shortDescription || "",
        fullStory: story.content || "",
        imageUrl:
          story.patientImage ||
          "https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?q=80&w=800&auto=format&fit=crop",
        heroImageUrl:
          story.patientImage ||
          "https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?q=80&w=1600&auto=format&fit=crop",
      }
    : null;

  return (
    <div className="space-y-6">
      <CmsViewHeader
        backHref={LIST_HREF}
        title={story.title}
        badges={
          <>
            <CmsBadge
              tone={
                story.status === "published"
                  ? "success"
                  : story.status === "archived"
                  ? "danger"
                  : undefined
              }
            >
              {story.status}
            </CmsBadge>
            {isDeleted ? <CmsBadge tone="danger">deleted</CmsBadge> : null}
          </>
        }
        meta={
          <>
            <Typography
              variant="label-1"
              as="p"
              className="mt-1 font-mono text-muted-foreground"
            >
              /{story.slug}
            </Typography>
            <Typography
              variant="label-1"
              as="p"
              className="mt-1 text-[#5C5C5C]"
            >
              {[
                story.storyDate ? `Date: ${String(story.storyDate).slice(0, 10)}` : null,
                story.donationState ? `Location: ${story.donationState}` : null,
              ]
                .filter(Boolean)
                .join(" · ") || "No date or location set"}
            </Typography>
          </>
        }
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <CmsRecordActions
              isDeleted={isDeleted}
              busy={busy}
              editHref={`${LIST_HREF}/${story.id}/edit`}
              onDelete={onDelete}
              onRestore={onRestore}
            />
          </div>
        }
      />

      <CmsWebsitePreview
        label="Website preview · Patient Story Detail"
        className="bg-[#FFFBEA]"
      >
        <div className="max-w-[90rem] 2xl:max-w-[97.5rem] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
          {previewStory ? <PatientStoryDetailPreview story={previewStory} /> : null}
        </div>
      </CmsWebsitePreview>

      <CmsSeoCard
        metaTitle={story.metaTitle}
        metaDescription={story.metaDescription}
        schemaCode={story.schemaCode}
      />
    </div>
  );
}
