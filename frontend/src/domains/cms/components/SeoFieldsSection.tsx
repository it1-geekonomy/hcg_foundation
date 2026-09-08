"use client";

import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";
import { CmsFormField } from "./CmsFormField";

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
    <section className="space-y-4 rounded-xl border border-[#FCCC2D]/40 bg-[#FFF8E8]/60 p-4">
      <h3 className="font-manrope text-sm font-bold tracking-wide text-[#C45A7A]">
        SEO Meta Tags:
      </h3>

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
        />
      </CmsFormField>
    </section>
  );
}
