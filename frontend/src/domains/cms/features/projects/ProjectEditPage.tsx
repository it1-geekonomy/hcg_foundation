"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { cmsApi } from "@/domains/cms/lib/api";
import { cmsToast } from "@/domains/cms/lib/toast";
import ProjectForm, {
  emptyProjectForm,
  getProjectPatch,
  projectToFormValues,
  type ProjectFormValues,
} from "./ProjectForm";
import {
  CmsFormPageHeader,
  CmsViewLoading,
  cmsErrorMessage,
} from "@/domains/cms/ui/CmsViewChrome";

export default function ProjectEditPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [form, setForm] = useState<ProjectFormValues>(emptyProjectForm);
  const [initial, setInitial] = useState<ProjectFormValues>(emptyProjectForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    (async () => {
      setLoading(true);
      try {
        const res = await cmsApi.getProject(id);
        if (!cancelled) {
          const values = projectToFormValues(res.data);
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

    const patch = getProjectPatch(initial, form);
    if (!patch.hasChanges) {
      cmsToast.info("No changes found");
      return;
    }

    setSaving(true);
    try {
      const res = await cmsApi.updateProject(id, patch.fields, patch.files);
      cmsToast.success(res.message || "Project updated successfully");
      router.push(`/admin/projects/${id}`);
    } catch (err) {
      cmsToast.error(cmsErrorMessage(err, "Failed to update"));
      setSaving(false);
    }
  };

  if (loading) return <CmsViewLoading label="Loading editor…" />;

  return (
    <div className="space-y-6">
      <CmsFormPageHeader
        backHref={`/admin/projects/${id}`}
        backLabel="Back to view"
        title="Edit project"
        description="Save sends only what you changed."
      />

      <ProjectForm
        value={form}
        onChange={setForm}
        onSubmit={onSubmit}
        submitLabel="Save changes"
        saving={saving}
        slugLocked
      />
    </div>
  );
}
