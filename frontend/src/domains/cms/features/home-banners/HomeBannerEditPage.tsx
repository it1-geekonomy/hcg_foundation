"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { cmsApi } from "@/domains/cms/lib/api";
import { cmsToast } from "@/domains/cms/lib/toast";
import HomeBannerForm, {
  emptyHomeBannerForm,
  getHomeBannerPatch,
  homeBannerToFormValues,
  type HomeBannerFormValues,
} from "./HomeBannerForm";
import {
  CmsFormPageHeader,
  CmsViewLoading,
  cmsErrorMessage,
} from "@/domains/cms/ui/CmsViewChrome";

export default function HomeBannerEditPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [form, setForm] = useState<HomeBannerFormValues>(emptyHomeBannerForm);
  const [initial, setInitial] =
    useState<HomeBannerFormValues>(emptyHomeBannerForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    (async () => {
      setLoading(true);
      try {
        const res = await cmsApi.getHomeBanner(id);
        if (!cancelled) {
          const values = homeBannerToFormValues(res.data);
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

    const patch = getHomeBannerPatch(initial, form);
    if (!patch.hasChanges) {
      cmsToast.info("No changes found");
      return;
    }

    setSaving(true);
    try {
      const res = await cmsApi.updateHomeBanner(id, patch.fields, patch.files);
      cmsToast.success(res.message || "Home banner updated successfully");
      router.push(`/admin/home-banners/${id}`);
    } catch (err) {
      cmsToast.error(cmsErrorMessage(err, "Failed to update"));
      setSaving(false);
    }
  };

  if (loading) return <CmsViewLoading label="Loading editor…" />;

  return (
    <div className="space-y-6">
      <CmsFormPageHeader
        backHref={`/admin/home-banners/${id}`}
        backLabel="Back to view"
        title="Edit home banner"
        description="Save sends only what you changed."
      />

      <HomeBannerForm
        mode="edit"
        value={form}
        onChange={setForm}
        onSubmit={onSubmit}
        submitLabel="Save changes"
        saving={saving}
      />
    </div>
  );
}
