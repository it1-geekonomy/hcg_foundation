"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import Typography from "@/lib/Typography";
import { cmsApi } from "@/domains/cms/lib/api";
import type { LegalSectionConfig } from "@/domains/cms/lib/legal-sections";
import { cmsToast } from "@/domains/cms/lib/toast";
import LegalPageForm, {
  emptyLegalPageForm,
  formValuesToPayload,
  type LegalPageFormValues,
} from "./LegalPageForm";

export default function LegalPageCreatePage({
  section,
}: {
  section: LegalSectionConfig;
}) {
  const router = useRouter();
  const [form, setForm] = useState<LegalPageFormValues>(() =>
    emptyLegalPageForm({ title: section.defaultTitle })
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await cmsApi.createLegalPage(
        section.apiPath,
        formValuesToPayload(form)
      );
      cmsToast.success(
        res.message || `${section.label} created successfully`
      );
      router.push(`${section.basePath}/${res.data.id}`);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to create";
      setError(message);
      cmsToast.error(message);
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <Link
          href={section.basePath}
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
          Add {section.singular}
        </Typography>
        <Typography
          variant="label-1"
          as="p"
          className="mt-1 text-muted-foreground"
        >
          Set status to <strong>published</strong> to show on{" "}
          {section.publicPath}.
        </Typography>
      </div>

      <LegalPageForm
        value={form}
        onChange={setForm}
        onSubmit={onSubmit}
        submitLabel={`Create ${section.singular}`}
        saving={saving}
        error={error}
      />
    </div>
  );
}
