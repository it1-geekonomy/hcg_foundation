"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { cmsApi } from "@/domains/cms/lib/api";
import type { LegalSectionConfig } from "@/domains/cms/lib/legal-sections";
import { cmsToast } from "@/domains/cms/lib/toast";
import LegalPageForm, {
  emptyLegalPageForm,
  formValuesToPayload,
  type LegalPageFormValues,
} from "./LegalPageForm";
import { CmsFormPageHeader, cmsErrorMessage } from "@/domains/cms/ui/CmsViewChrome";

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
      const message = cmsErrorMessage(err, "Failed to create");
      setError(message);
      cmsToast.error(message);
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <CmsFormPageHeader
        backHref={section.basePath}
        title={`Add ${section.singular}`}
        description={
          <>
            Set status to <strong>published</strong> to show on{" "}
            {section.publicPath}.
          </>
        }
      />

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
