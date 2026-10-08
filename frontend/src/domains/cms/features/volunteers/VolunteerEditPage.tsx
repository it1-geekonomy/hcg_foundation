"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { cmsApi } from "@/domains/cms/lib/api";
import { cmsToast } from "@/domains/cms/lib/toast";
import VolunteerForm, {
  emptyVolunteerForm,
  formValuesToPayload,
  volunteerToFormValues,
  type VolunteerFormValues,
} from "./VolunteerForm";
import {
  CmsFormPageHeader,
  CmsViewLoading,
  cmsErrorMessage,
} from "@/domains/cms/ui/CmsViewChrome";

export default function VolunteerEditPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [form, setForm] = useState<VolunteerFormValues>(emptyVolunteerForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await cmsApi.getVolunteer(id);
        if (!cancelled) setForm(volunteerToFormValues(res.data));
      } catch (err) {
        if (!cancelled) {
          const message = cmsErrorMessage(err, "Failed to load");
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

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setSaving(true);
    setError(null);
    try {
      const res = await cmsApi.updateVolunteer(id, formValuesToPayload(form));
      cmsToast.success(res.message || "Volunteer updated successfully");
      router.push(`/admin/volunteers/${id}`);
    } catch (err) {
      const message = cmsErrorMessage(err, "Failed to update");
      setError(message);
      cmsToast.error(message);
      setSaving(false);
    }
  };

  if (loading) return <CmsViewLoading label="Loading editor…" />;

  return (
    <div className="space-y-6">
      <CmsFormPageHeader
        backHref={`/admin/volunteers/${id}`}
        backLabel="Back to view"
        title="Edit volunteer"
      />
      <VolunteerForm
        value={form}
        onChange={setForm}
        onSubmit={onSubmit}
        submitLabel="Save changes"
        saving={saving}
        error={error}
      />
    </div>
  );
}
