"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { cmsApi } from "@/domains/cms/lib/api";
import { cmsToast } from "@/domains/cms/lib/toast";
import ProjectForm, {
  emptyProjectForm,
  formValuesToFields,
  type ProjectFormValues,
} from "./ProjectForm";
import { CmsFormPageHeader, cmsErrorMessage } from "@/domains/cms/ui/CmsViewChrome";

export default function ProjectCreatePage() {
  const router = useRouter();
  const [form, setForm] = useState<ProjectFormValues>(emptyProjectForm);
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
      const res = await cmsApi.createProject(formValuesToFields(form), {
        projectBanner: form.projectBannerFile,
        projectMobileBanner: form.projectMobileBannerFile,
      });
      cmsToast.success(res.message || "Project created successfully");
      router.push(`/admin/projects/${res.data.id}`);
    } catch (err) {
      cmsToast.error(cmsErrorMessage(err, "Failed to create"));
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <CmsFormPageHeader
        backHref="/admin/projects"
        title="Add project"
        description={
          <>
            Desktop banner must be exactly{" "}
            <strong>1105 × 560px</strong> (~2:1). Mobile banner must be exactly{" "}
            <strong>780 × 960px</strong> (WebP/AVIF). Set status to{" "}
            <strong>published</strong> to show on the homepage.
          </>
        }
      />

      <ProjectForm
        value={form}
        onChange={setForm}
        onSubmit={onSubmit}
        submitLabel="Create project"
        saving={saving}
        slugLocked={slugLocked}
        onSlugManualEdit={() => setSlugLocked(true)}
      />
    </div>
  );
}
