"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { cmsApi } from "@/domains/cms/lib/api";
import { cmsToast } from "@/domains/cms/lib/toast";
import EventForm, {
  emptyEventForm,
  formValuesToFields,
  type EventFormValues,
} from "./EventForm";

export default function EventCreatePage() {
  const router = useRouter();
  const [form, setForm] = useState<EventFormValues>(emptyEventForm);
  const [slugLocked, setSlugLocked] = useState(false);
  const [saving, setSaving] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;
    if (!form.title.trim() || !form.slug.trim()) {
      cmsToast.error("Title and slug are required");
      return;
    }
    setSaving(true);
    try {
      const res = await cmsApi.createEvent(formValuesToFields(form), {
        eventBanner: form.eventBannerFile,
        eventMobileBanner: form.eventMobileBannerFile,
      });
      cmsToast.success(res.message || "Event created successfully");
      router.push(`/admin/events/${res.data.id}`);
    } catch (err) {
      cmsToast.error(
        err instanceof Error ? err.message : "Failed to create"
      );
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/events"
          className="mb-3 inline-flex items-center gap-1.5 font-manrope text-sm text-[#5C5C5C] transition hover:text-[#212121]"
        >
          <ArrowLeft className="size-3.5" />
          Back to list
        </Link>
        <h1 className="font-manrope text-2xl font-semibold text-[#212121]">
          Add event
        </h1>
        <p className="mt-1 font-manrope text-sm text-muted-foreground">
          Optional banners (WebP/AVIF). Set status to{" "}
          <strong>published</strong> to show on the website.
        </p>
      </div>

      <EventForm
        value={form}
        onChange={setForm}
        onSubmit={onSubmit}
        submitLabel="Create event"
        saving={saving}
        slugLocked={slugLocked}
        onSlugManualEdit={() => setSlugLocked(true)}
      />
    </div>
  );
}
