"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { cmsApi } from "@/domains/cms/lib/api";
import { cmsToast } from "@/domains/cms/lib/toast";
import HomeBannerForm, {
  emptyHomeBannerForm,
  formValuesToFields,
  type HomeBannerFormValues,
} from "./HomeBannerForm";
import { CmsFormPageHeader, cmsErrorMessage } from "@/domains/cms/ui/CmsViewChrome";

export default function HomeBannerCreatePage() {
  const router = useRouter();
  const [form, setForm] = useState<HomeBannerFormValues>(emptyHomeBannerForm);
  const [saving, setSaving] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;
    if (!form.name.trim()) {
      cmsToast.error("Name is required");
      return;
    }
    if (!form.title.trim()) {
      cmsToast.error("Title is required");
      return;
    }
    if (!form.bannerImageFile) {
      cmsToast.error("Banner image is required");
      return;
    }
    setSaving(true);
    try {
      const res = await cmsApi.createHomeBanner(formValuesToFields(form), {
        bannerImage: form.bannerImageFile,
        mobileBannerImage: form.mobileBannerImageFile,
        profileImage: form.profileImageFile,
      });
      cmsToast.success(res.message || "Home banner created successfully");
      router.push(`/admin/home-banners/${res.data.id}`);
    } catch (err) {
      cmsToast.error(cmsErrorMessage(err, "Failed to create"));
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <CmsFormPageHeader
        backHref="/admin/home-banners"
        title="Add home banner"
        description={
          <>
            Upload banner images and set visibility to <strong>Active</strong> to
            show on the website.
          </>
        }
      />

      <HomeBannerForm
        mode="create"
        value={form}
        onChange={setForm}
        onSubmit={onSubmit}
        submitLabel="Create banner"
        saving={saving}
      />
    </div>
  );
}
