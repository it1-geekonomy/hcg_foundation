"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { cmsApi } from "@/domains/cms/lib/api";
import type { LegalSectionConfig } from "@/domains/cms/lib/legal-sections";
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
    emptyLegalPageForm({
      title: section.defaultTitle,
      slug: section.defaultSlug,
    })
  );
  const [slugLocked, setSlugLocked] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await cmsApi.createLegalPage(
        formValuesToPayload(form, section.pageType)
      );
      router.push(`${section.basePath}/${res.data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create");
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <Link
          href={section.basePath}
          className="mb-3 inline-flex items-center gap-1.5 font-manrope text-sm text-[#5C5C5C] transition hover:text-[#212121]"
        >
          <ArrowLeft className="size-3.5" />
          Back to list
        </Link>
        <h1 className="font-manrope text-2xl font-semibold text-[#212121]">
          Add {section.singular}
        </h1>
        <p className="mt-1 font-manrope text-sm text-muted-foreground">
          Set status to <strong>published</strong> to show on{" "}
          {section.publicPath}.
        </p>
      </div>

      <LegalPageForm
        value={form}
        onChange={setForm}
        onSubmit={onSubmit}
        submitLabel={`Create ${section.singular}`}
        saving={saving}
        error={error}
        slugLocked={slugLocked}
        onSlugManualEdit={() => setSlugLocked(true)}
      />
    </div>
  );
}
