"use client";

import Typography from "@/lib/Typography";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";
import { CmsFormField } from "@/domains/cms/ui/CmsFormField";

type SeoValue = {
  metaTitle: string;
  metaDescription: string;
  schemaCode: string;
};

export function SeoFieldsSection({
  value,
  onChange,
}: {
  value: SeoValue;
  onChange: (next: SeoValue) => void;
}) {
  return (
    <section className="overflow-hidden rounded-xl border border-cms-border bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
      <div className="border-b border-cms-border px-6 py-4">
        <Typography variant="heading-7" as="h3" className="text-cms-ink">
          SEO
        </Typography>
        <Typography variant="caption-1" as="p" className="mt-0.5 text-cms-muted">
          Controls how this page appears in search results and link previews.
        </Typography>
      </div>

      <div className="space-y-5 p-6">
      <CmsFormField label="Meta Title" htmlFor="metaTitle">
        <Input
          id="metaTitle"
          placeholder="Meta Title"
          value={value.metaTitle}
          onChange={(e) => onChange({ ...value, metaTitle: e.target.value })}
        />
      </CmsFormField>

      <CmsFormField label="Meta Description" htmlFor="metaDescription">
        <Textarea
          id="metaDescription"
          placeholder="Meta Description"
          value={value.metaDescription}
          onChange={(e) =>
            onChange({ ...value, metaDescription: e.target.value })
          }
        />
      </CmsFormField>

      <CmsFormField label="Schema Code" htmlFor="schemaCode">
        <Textarea
          id="schemaCode"
          placeholder="Schema Code"
          value={value.schemaCode}
          onChange={(e) => onChange({ ...value, schemaCode: e.target.value })}
          className="font-mono text-xs"
        />
      </CmsFormField>
      </div>
    </section>
  );
}
