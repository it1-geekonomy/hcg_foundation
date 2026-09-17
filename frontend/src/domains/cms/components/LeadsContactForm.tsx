"use client";

import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";
import type {
  LeadsContact,
  UpdateLeadsContactPayload,
} from "@/domains/cms/lib/types";
import { CmsFormField } from "./CmsFormField";

export type LeadsContactFormValues = {
  fullName: string;
  phone: string;
  email: string;
  message: string;
};

export const emptyLeadsContactForm: LeadsContactFormValues = {
  fullName: "",
  phone: "",
  email: "",
  message: "",
};

export function contactToFormValues(row: LeadsContact): LeadsContactFormValues {
  return {
    fullName: row.fullName ?? "",
    phone: row.phone ?? "",
    email: row.email ?? "",
    message: row.message ?? "",
  };
}

export function formValuesToPayload(
  form: LeadsContactFormValues
): UpdateLeadsContactPayload {
  return {
    fullName: form.fullName.trim(),
    phone: form.phone.trim(),
    email: form.email.trim(),
    message: form.message.trim(),
  };
}

type Props = {
  value: LeadsContactFormValues;
  onChange: (next: LeadsContactFormValues) => void;
  onSubmit: (e: React.FormEvent) => void;
  submitLabel: string;
  saving?: boolean;
  error?: string | null;
};

export default function LeadsContactForm({
  value,
  onChange,
  onSubmit,
  submitLabel,
  saving,
  error,
}: Props) {
  const set =
    <K extends keyof LeadsContactFormValues>(key: K) =>
    (next: LeadsContactFormValues[K]) =>
      onChange({ ...value, [key]: next });

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 font-manrope text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <CmsFormField label="Full name" htmlFor="con-fullName">
          <Input
            id="con-fullName"
            value={value.fullName}
            onChange={(e) => set("fullName")(e.target.value)}
            required
          />
        </CmsFormField>
        <CmsFormField label="Email" htmlFor="con-email">
          <Input
            id="con-email"
            type="email"
            value={value.email}
            onChange={(e) => set("email")(e.target.value)}
          />
        </CmsFormField>
        <CmsFormField label="Phone" htmlFor="con-phone" className="sm:col-span-2">
          <Input
            id="con-phone"
            value={value.phone}
            onChange={(e) => set("phone")(e.target.value)}
          />
        </CmsFormField>
      </div>

      <CmsFormField label="Message" htmlFor="con-message">
        <Textarea
          id="con-message"
          rows={4}
          value={value.message}
          onChange={(e) => set("message")(e.target.value)}
        />
      </CmsFormField>

      <Button
        type="submit"
        disabled={saving}
        className="bg-[#C45A7A] font-manrope hover:bg-[#b04e6c]"
      >
        {saving ? "Saving…" : submitLabel}
      </Button>
    </form>
  );
}
