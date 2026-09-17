"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import Typography from "@/lib/Typography";
import { cmsApi } from "@/domains/cms/lib/api";
import { cmsToast } from "@/domains/cms/lib/toast";
import HomeBannerForm, {
  emptyHomeBannerForm,
  formValuesToFields,
  type HomeBannerFormValues,
} from "./HomeBannerForm";

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
          href="/admin/home-banners"
          className="mb-3 inline-flex items-center gap-1.5 text-[#5C5C5C] transition hover:text-[#212121]"
        >
          <ArrowLeft className="size-3.5" />
          <Typography variant="label-1" as="span">
            Back to list
          </Typography>
        </Link>
        <Typography
          variant="heading-8"
          as="h1"
          className="font-semibold text-[#212121]"
        >
          Add home banner
        </Typography>
        <Typography
          variant="label-1"
          as="p"
          className="mt-1 text-muted-foreground"
        >
          Upload banner images and set visibility to <strong>Active</strong> to
          show on the website.
        </Typography>
      </div>

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
