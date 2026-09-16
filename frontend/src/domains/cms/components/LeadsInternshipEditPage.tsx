"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { cmsApi } from "@/domains/cms/lib/api";
import { cmsToast } from "@/domains/cms/lib/toast";
import LeadsInternshipForm, {
  emptyLeadsInternshipForm,
  formValuesToPayload,
  internshipToFormValues,
  type LeadsInternshipFormValues,
} from "./LeadsInternshipForm";

export default function LeadsInternshipEditPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [form, setForm] = useState<LeadsInternshipFormValues>(
    emptyLeadsInternshipForm
  );
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
        const res = await cmsApi.getLeadsInternship(id);
        if (!cancelled) setForm(internshipToFormValues(res.data));
      } catch (err) {
        if (!cancelled) {
          const message =
            err instanceof Error ? err.message : "Failed to load";
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
      const res = await cmsApi.updateLeadsInternship(
        id,
        formValuesToPayload(form)
      );
      cmsToast.success(res.message || "Lead updated successfully");
      router.push(`/admin/leads-internship/${id}`);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to update";
      setError(message);
      cmsToast.error(message);
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-16 text-center font-manrope text-sm text-muted-foreground">
        Loading editor…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          href={`/admin/leads-internship/${id}`}
          className="mb-3 inline-flex items-center gap-1.5 font-manrope text-sm text-[#5C5C5C]"
        >
          <ArrowLeft className="size-3.5" /> Back to view
        </Link>
        <h1 className="font-manrope text-2xl font-semibold text-[#212121]">
          Edit internship lead
        </h1>
      </div>
      <LeadsInternshipForm
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
