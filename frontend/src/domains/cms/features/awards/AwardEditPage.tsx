"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { cmsApi } from "@/domains/cms/lib/api";
import { cmsToast } from "@/domains/cms/lib/toast";
import AwardForm, {
  awardToFormValues,
  emptyAwardForm,
  getAwardPatch,
  type AwardFormValues,
} from "./AwardForm";
import {
  CmsFormPageHeader,
  CmsViewLoading,
  cmsErrorMessage,
} from "@/domains/cms/ui/CmsViewChrome";

export default function AwardEditPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [form, setForm] = useState<AwardFormValues>(emptyAwardForm);
  const [initial, setInitial] = useState<AwardFormValues>(emptyAwardForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    (async () => {
      setLoading(true);
      try {
        const res = await cmsApi.getAward(id);
        if (!cancelled) {
          const values = awardToFormValues(res.data);
          setForm(values);
          setInitial({ ...values });
        }
      } catch (err) {
        if (!cancelled) {
          cmsToast.error(cmsErrorMessage(err, "Failed to load"));
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
    if (!id || saving) return;

    const patch = getAwardPatch(initial, form);
    if (!patch.hasChanges) {
      cmsToast.info("No changes found");
      return;
    }

    setSaving(true);
    try {
      const res = await cmsApi.updateAward(id, patch.fields, patch.file);
      cmsToast.success(res.message || "Award updated successfully");
      router.push(`/admin/awards/${id}`);
    } catch (err) {
      cmsToast.error(cmsErrorMessage(err, "Failed to update"));
      setSaving(false);
    }
  };

  if (loading) return <CmsViewLoading label="Loading editor…" />;

  return (
    <div className="space-y-6">
      <CmsFormPageHeader
        backHref={`/admin/awards/${id}`}
        backLabel="Back to view"
        title="Edit award"
        description="Save sends only what you changed."
      />

      <AwardForm
        value={form}
        onChange={setForm}
        onSubmit={onSubmit}
        submitLabel="Save changes"
        saving={saving}
      />
    </div>
  );
}
