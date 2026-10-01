"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Typography from "@/lib/Typography";
import { cmsApi } from "@/domains/cms/lib/api";
import { cmsConfirm } from "@/domains/cms/lib/confirm";
import { cmsToast } from "@/domains/cms/lib/toast";
import type { CmsEvent } from "@/domains/cms/lib/types";
import EventCard from "@/domains/resources/components/EventCard";
import type { EventItem } from "@/domains/resources/constants/events";
import EventsListSection from "@/domains/resources/components/EventsListSection";
import CmsWebsitePreview from "@/domains/cms/ui/CmsWebsitePreview";
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
} from "@/domains/cms/ui/CmsViewChrome";

const LIST_HREF = "/admin/events";

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
        if (!cancelled) {
          setEvent(res.data);
        }
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
      router.replace(LIST_HREF);
    } catch (err) {
      cmsToast.error(cmsErrorMessage(err, "Failed to delete"));
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
      cmsToast.error(cmsErrorMessage(err, "Failed to restore"));
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <CmsViewLoading label="Loading event…" />;
  if (error || !event) {
    return (
      <CmsViewError
        backHref={LIST_HREF}
        message={error || "Event not found"}
      />
    );
  }

  const isDeleted = Boolean(event.deletedAt);

  const previewEvent: EventItem | null = event ? {
    id: event.id ?? "",
    slug: event.slug ?? "",
    title: event.title ?? "",
    date: event.eventDate ? new Date(event.eventDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "",
    category: "Community Event",
    summary: event.shortDescription ?? "",
    fullStory: event.content ?? "",
    imageUrl: event.eventBanner || event.eventMobileBanner || "",
    mobileImageUrl: event.eventMobileBanner || event.eventBanner || "",
    location: event.eventLocation ?? "",
  } : null;

  return (
    <div className="space-y-6">
      <CmsViewHeader
        backHref={LIST_HREF}
        title={event.title}
        badges={
          <>
            <CmsBadge>{event.status}</CmsBadge>
            {isDeleted ? <CmsBadge tone="danger">deleted</CmsBadge> : null}
          </>
        }
        actions={
          <CmsRecordActions
            isDeleted={isDeleted}
            busy={busy}
            editHref={`${LIST_HREF}/${event.id}/edit`}
            onDelete={onDelete}
            onRestore={onRestore}
          />
        }
      />

      <div className="flex flex-col gap-10">
        <CmsDetailCard title="Event Information">
          <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <CmsDetailField label="Slug" value={`/${event.slug}`} />
            <CmsDetailField label="Date" value={event.eventDate ? new Date(event.eventDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—"} />
            <CmsDetailField label="Time" value={event.eventTime ? event.eventTime.slice(0, 5) : "—"} />
            <CmsDetailField label="Location" value={event.eventLocation || "—"} />
          </dl>
        </CmsDetailCard>

        <CmsHtmlContentCard title="Content" html={event.content} />

        <CmsSeoCard
          metaTitle={event.metaTitle}
          metaDescription={event.metaDescription}
          schemaCode={event.schemaCode}
        />
      </div>

      <CmsWebsitePreview label="Website preview" className="bg-[#FFF6D8]">
        <EventsListSection previewEvent={previewEvent} />
      </CmsWebsitePreview>
    </div>
  );
}
