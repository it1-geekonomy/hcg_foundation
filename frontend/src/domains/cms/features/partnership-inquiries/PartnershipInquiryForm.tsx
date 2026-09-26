"use client";

import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";
import Typography from "@/lib/Typography";
import type {
  InquiryStatus,
  PartnershipInquiry,
  UpdatePartnershipInquiryPayload,
} from "@/domains/cms/lib/types";
import { CmsFormField } from "@/domains/cms/ui/CmsFormField";
import CmsSelect, { INQUIRY_STATUS_OPTIONS } from "@/domains/cms/ui/CmsSelect";

export type PartnershipInquiryFormValues = {
  fullName: string;
  email: string;
  phoneNumber: string;
  organizationName: string;
  message: string;
  termsAccepted: boolean;
  status: InquiryStatus;
};

export const emptyPartnershipInquiryForm: PartnershipInquiryFormValues = {
  fullName: "",
  email: "",
  phoneNumber: "",
  organizationName: "",
  message: "",
  termsAccepted: false,
  status: "pending",
};

export function inquiryToFormValues(
  row: PartnershipInquiry
): PartnershipInquiryFormValues {
  return {
    fullName: row.fullName ?? "",
    email: row.email ?? "",
    phoneNumber: row.phoneNumber ?? "",
    organizationName: row.organizationName ?? "",
    message: row.message ?? "",
    termsAccepted: Boolean(row.termsAccepted),
    status: row.status,
  };
}

export function formValuesToPayload(
  form: PartnershipInquiryFormValues
): UpdatePartnershipInquiryPayload {
  return {
    fullName: form.fullName.trim(),
    email: form.email.trim(),
    phoneNumber: form.phoneNumber.trim(),
    organizationName: form.organizationName.trim(),
    message: form.message.trim(),
    termsAccepted: form.termsAccepted,
    status: form.status,
  };
}

type Props = {
  value: PartnershipInquiryFormValues;
  onChange: (next: PartnershipInquiryFormValues) => void;
  onSubmit: (e: React.FormEvent) => void;
  submitLabel: string;
  saving?: boolean;
  error?: string | null;
};

export default function PartnershipInquiryForm({
  value,
  onChange,
  onSubmit,
  submitLabel,
  saving,
  error,
}: Props) {
  const set =
    <K extends keyof PartnershipInquiryFormValues>(key: K) =>
    (next: PartnershipInquiryFormValues[K]) =>
      onChange({ ...value, [key]: next });

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {error ? (
        <Typography
          variant="label-1"
          as="div"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700"
        >
          {error}
        </Typography>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <CmsFormField label="Full name" htmlFor="inq-fullName">
          <Input
            id="inq-fullName"
            value={value.fullName}
            onChange={(e) => set("fullName")(e.target.value)}
            required
          />
        </CmsFormField>
        <CmsFormField label="Status" htmlFor="inq-status">
          <CmsSelect
            value={value.status}
            options={INQUIRY_STATUS_OPTIONS}
            onChange={(next) => set("status")(next as InquiryStatus)}
          />
        </CmsFormField>
        <CmsFormField label="Email" htmlFor="inq-email">
          <Input
            id="inq-email"
            type="email"
            value={value.email}
            onChange={(e) => set("email")(e.target.value)}
            required
          />
        </CmsFormField>
        <CmsFormField label="Phone" htmlFor="inq-phone">
          <Input
            id="inq-phone"
            value={value.phoneNumber}
            onChange={(e) => set("phoneNumber")(e.target.value)}
            required
          />
        </CmsFormField>
        <CmsFormField
          label="Organization"
          htmlFor="inq-org"
          className="sm:col-span-2"
        >
          <Input
            id="inq-org"
            value={value.organizationName}
            onChange={(e) => set("organizationName")(e.target.value)}
          />
        </CmsFormField>
      </div>

      <CmsFormField label="Message" htmlFor="inq-message">
        <Textarea
          id="inq-message"
          rows={4}
          value={value.message}
          onChange={(e) => set("message")(e.target.value)}
          required
        />
      </CmsFormField>

      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={value.termsAccepted}
          onChange={(e) => set("termsAccepted")(e.target.checked)}
          className="size-4 rounded border-black/20"
        />
        <Typography variant="label-1" as="span">
          Terms accepted
        </Typography>
      </label>

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
