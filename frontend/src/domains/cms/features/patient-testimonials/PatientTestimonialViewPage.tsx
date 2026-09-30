"use client";

import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import Typography from "@/lib/Typography";
import { cmsApi } from "@/domains/cms/lib/api";
import { cmsConfirm } from "@/domains/cms/lib/confirm";
import { cmsToast } from "@/domains/cms/lib/toast";
import type { PatientTestimonial } from "@/domains/cms/lib/types";
import {
  CmsBadge,
  CmsRecordActions,
  CmsSeoCard,
  CmsViewError,
  CmsViewHeader,
  CmsViewLoading,
  cmsErrorMessage,
  formatCmsDateTime,
} from "@/domains/cms/ui/CmsViewChrome";

import TestimonialCard from "@/domains/journey-of-hope/components/TestimonialCard";
import TestimonialVideoModal from "@/domains/journey-of-hope/components/TestimonialVideoModal";

const LIST_HREF = "/admin/patient-testimonials";

export default function PatientTestimonialViewPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [testimonial, setTestimonial] = useState<PatientTestimonial | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [activeVideoUrl, setActiveVideoUrl] = useState<string | null>(null);
  const [windowWidth, setWindowWidth] = useState<number>(1200);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await cmsApi.getPatientTestimonial(id);
        if (cancelled) return;
        setTestimonial(res.data);
      } catch (err) {
        if (cancelled) return;
        const message = cmsErrorMessage(err, "Failed to load patient testimonial");
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
    if (!testimonial) return;
    const ok = await cmsConfirm({
      title: "Move to Recently Deleted?",
      description: `“${testimonial.title}” will be soft-deleted. You can restore it later.`,
      confirmLabel: "Move to deleted",
      tone: "danger",
    });
    if (!ok) return;
    setBusy(true);
    try {
      const res = await cmsApi.deletePatientTestimonial(testimonial.id);
      cmsToast.success(res?.message || "Patient testimonial deleted successfully");
      router.replace(LIST_HREF);
    } catch (err) {
      cmsToast.error(cmsErrorMessage(err, "Failed to delete"));
      setBusy(false);
    }
  };

  const onRestore = async () => {
    if (!testimonial) return;
    const ok = await cmsConfirm({
      title: "Restore Patient Testimonial?",
      description: `“${testimonial.title}” will be restored to active status.`,
      confirmLabel: "Restore",
    });
    if (!ok) return;
    setBusy(true);
    try {
      const res = await cmsApi.restorePatientTestimonial(testimonial.id);
      cmsToast.success(res.message || "Testimonial restored successfully");
      setTestimonial(res.data);
    } catch (err) {
      cmsToast.error(cmsErrorMessage(err, "Failed to restore"));
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <CmsViewLoading label="Loading patient testimonial…" />;
  if (error || !testimonial) {
    return (
      <CmsViewError
        backHref={LIST_HREF}
        message={error || "Patient testimonial not found"}
      />
    );
  }

  const isDeleted = Boolean(testimonial.deletedAt);

  // Map CMS backend data to frontend card requirements
  const mappedCardItem = {
    id: testimonial.id,
    patientName: testimonial.title,
    role: testimonial.shortDescription || "Patient",
    thumbnailUrl: testimonial.patientTestimonialBanner || "",
    videoUrl: testimonial.patientTestimonialFile || "",
  };

  return (
    <div className="space-y-6 pb-20">
      <CmsViewHeader
        backHref={LIST_HREF}
        title={testimonial.title}
        badges={
          <>
            <CmsBadge
              tone={
                testimonial.status === "published"
                  ? "success"
                  : testimonial.status === "archived"
                  ? "danger"
                  : undefined
              }
            >
              {testimonial.status}
            </CmsBadge>
            {isDeleted ? <CmsBadge tone="danger">deleted</CmsBadge> : null}
          </>
        }
        meta={
          <Typography
            variant="label-1"
            as="p"
            className="mt-1 text-cms-muted"
          >
            {testimonial.shortDescription || "No short description"}
          </Typography>
        }
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <CmsRecordActions
              isDeleted={isDeleted}
              busy={busy}
              editHref={`${LIST_HREF}/${testimonial.id}/edit`}
              onDelete={onDelete}
              onRestore={onRestore}
            />
          </div>
        }
      />

      <div className="mx-auto max-w-4xl pt-6">
        {isDeleted && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            This testimonial was deleted on{" "}
            <span className="font-medium">
              {formatCmsDateTime(testimonial.deletedAt)}
            </span>
            . It is hidden from the website.
          </div>
        )}

        <div className="flex flex-col gap-8">
          {/* Preview Section */}
          <section className="overflow-hidden rounded-xl border border-cms-border bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
            <div className="border-b border-cms-border px-5 py-3.5">
              <Typography variant="heading-7" as="h3" className="text-cms-ink">
                Website preview
              </Typography>
              {testimonial.patientTestimonialFile ? (
                <Typography variant="caption-1" as="p" className="mt-0.5 text-cms-muted">
                  Use the play button on the card to preview the video testimonial.
                </Typography>
              ) : null}
            </div>

            <div
              data-site-preview
              className="relative flex h-[16rem] w-full items-center justify-center overflow-visible bg-cms-subtle sm:h-[18.5rem] lg:h-[16.5rem] xl:h-[19.5rem] 2xl:h-[22.5rem]"
            >
              <TestimonialCard
                item={mappedCardItem}
                diff={0}
                windowWidth={windowWidth > 1200 ? 1200 : windowWidth}
                onDragEnd={() => {}}
                onNext={() => {}}
                onPrev={() => {}}
                onPlayVideo={(url) => setActiveVideoUrl(url)}
              />
            </div>
          </section>


          <CmsSeoCard
            metaTitle={testimonial.metaTitle}
            metaDescription={testimonial.metaDescription}
            schemaCode={testimonial.schemaCode}
          />

        </div>
      </div>

      <div data-site-preview>
        <TestimonialVideoModal
          videoUrl={activeVideoUrl}
          onClose={() => setActiveVideoUrl(null)}
        />
      </div>
    </div>
  );
}
