"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import Typography from "@/lib/Typography";
import { cmsApi } from "@/domains/cms/lib/api";
import type { LegalSectionConfig } from "@/domains/cms/lib/legal-sections";
import { cmsToast } from "@/domains/cms/lib/toast";
import LegalPageForm, {
  emptyLegalPageForm,
  formValuesToPayload,
  legalPageToFormValues,
  type LegalPageFormValues,
} from "./LegalPageForm";

export default function LegalPageEditPage({
  section,
}: {
  section: LegalSectionConfig;
}) {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [form, setForm] = useState<LegalPageFormValues>(emptyLegalPageForm);
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
        const res = await cmsApi.getLegalPage(section.apiPath, id);
        if (!cancelled) setForm(legalPageToFormValues(res.data));
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
  }, [id, section.apiPath]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setSaving(true);
    setError(null);
    try {
      const res = await cmsApi.updateLegalPage(
        section.apiPath,
        id,
        formValuesToPayload(form)
      );
      cmsToast.success(
        res.message || `${section.label} updated successfully`
      );
      router.push(`${section.basePath}/${id}`);
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
      <Typography
        variant="label-1"
        as="div"
        className="py-16 text-center text-muted-foreground"
      >
        Loading editor…
      </Typography>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          href={`${section.basePath}/${id}`}
          className="mb-3 inline-flex items-center gap-1.5 text-[#5C5C5C] transition hover:text-[#212121]"
        >
          <ArrowLeft className="size-3.5" />
          <Typography variant="label-1" as="span">
            Back to view
          </Typography>
        </Link>
        <Typography
          variant="heading-8"
          as="h1"
          className="font-semibold text-[#212121]"
        >
          Edit {section.singular}
        </Typography>
      </div>

      <LegalPageForm
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
