"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ExternalLink, Users } from "lucide-react";
import Typography from "@/lib/Typography";
import { cmsApi } from "@/domains/cms/lib/api";
import { cmsConfirm } from "@/domains/cms/lib/confirm";
import { cmsToast } from "@/domains/cms/lib/toast";
import type { PatientStory } from "@/domains/cms/lib/types";
import {
  CmsBadge,
  CmsDetailCard,
  CmsDetailField,
  CmsHtmlContentCard,
  CmsRecordActions,
  CmsSeoCard,
  CmsViewError,
  CmsViewHeader,
  CmsViewLoading,
  cmsErrorMessage,
  formatCmsDateTime,
} from "@/domains/cms/ui/CmsViewChrome";

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
            {!isDeleted && story.status === "published" ? (
              <Link
                href={`/journey-of-hope/patient-stories/${story.slug}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-input bg-background px-3 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
              >
                <ExternalLink className="size-4" />
                View on website
              </Link>
            ) : null}
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

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left Column: Photo & Core Details */}
        <div className="space-y-6 lg:col-span-4">
          <CmsDetailCard title="Patient Photo">
            {story.patientImage ? (
              <div className="relative aspect-[339/368] w-full overflow-hidden rounded-xl border border-black/10 bg-[#f4ebd0]/30 shadow-xs">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={story.patientImage}
                  alt={story.title}
                  className="h-full w-full object-cover"
                />
              </div>
            ) : (
              <div className="flex aspect-[339/368] w-full flex-col items-center justify-center rounded-xl border border-dashed border-black/15 bg-black/[0.02] text-muted-foreground">
                <Users className="size-10 mb-2 stroke-1" />
                <Typography variant="label-1" as="span">
                  No image uploaded
                </Typography>
              </div>
            )}
          </CmsDetailCard>

          <CmsDetailCard title="Metadata">
            <dl className="space-y-3">
              <CmsDetailField
                label="Story Date"
                value={
                  story.storyDate
                    ? String(story.storyDate).slice(0, 10)
                    : undefined
                }
              />

              <CmsDetailField
                label="State / Location"
                value={story.donationState}
              />

              <CmsDetailField
                label="Status"
                value={story.status}
              />

              <CmsDetailField
                label="Created at"
                value={formatCmsDateTime(story.createdAt)}
              />

              <CmsDetailField
                label="Updated at"
                value={formatCmsDateTime(story.updatedAt)}
              />

              {isDeleted ? (
                <CmsDetailField
                  label="Deleted at"
                  value={formatCmsDateTime(story.deletedAt)}
                />
              ) : null}
            </dl>
          </CmsDetailCard>
        </div>

        {/* Right Column: Narrative & SEO */}
        <div className="space-y-6 lg:col-span-8">
          {story.shortDescription ? (
            <CmsDetailCard title="Short Description">
              <Typography variant="body-6" as="p" className="text-[#343E43] leading-relaxed">
                {story.shortDescription}
              </Typography>
            </CmsDetailCard>
          ) : null}

          <CmsHtmlContentCard
            title="Full Story Narrative"
            html={story.content}
          />

          <CmsSeoCard
            metaTitle={story.metaTitle}
            metaDescription={story.metaDescription}
            schemaCode={story.schemaCode}
          />
        </div>
      </div>
    </div>
  );
}
