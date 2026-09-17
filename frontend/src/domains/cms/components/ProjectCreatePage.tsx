"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import Typography from "@/lib/Typography";
import { cmsApi } from "@/domains/cms/lib/api";
import { cmsToast } from "@/domains/cms/lib/toast";
import ProjectForm, {
  emptyProjectForm,
  formValuesToFields,
  type ProjectFormValues,
} from "./ProjectForm";

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
          href="/admin/projects"
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
          Add project
        </Typography>
        <Typography
          variant="label-1"
          as="p"
          className="mt-1 text-muted-foreground"
        >
          Upload banner images (WebP/AVIF, max 5MB). Set status to{" "}
          <strong>published</strong> to show on the website.
        </Typography>
      </div>

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
