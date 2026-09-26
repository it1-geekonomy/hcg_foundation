"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { cmsApi } from "@/domains/cms/lib/api";
import { cmsToast } from "@/domains/cms/lib/toast";
import EventForm, {
  emptyEventForm,
  formValuesToFields,
  type EventFormValues,
} from "./EventForm";
import { CmsFormPageHeader, cmsErrorMessage } from "@/domains/cms/ui/CmsViewChrome";

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
      cmsToast.error(cmsErrorMessage(err, "Failed to create"));
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <CmsFormPageHeader
        backHref="/admin/events"
        title="Add event"
        description={
          <>
            Optional banners (WebP/AVIF). Set status to{" "}
            <strong>published</strong> to show on the website.
          </>
        }
      />

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
