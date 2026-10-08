"use client";

import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";
import Typography from "@/lib/Typography";
import type { UpdateVolunteerPayload, Volunteer } from "@/domains/cms/lib/types";
import { CmsFormField } from "@/domains/cms/ui/CmsFormField";

export type VolunteerFormValues = {
  fullName: string;
  phone: string;
  email: string;
  cityLocation: string;
  educationalQualification: string;
  areasOfInterest: string;
  reason: string;
  termsAccepted: boolean;
};

export const emptyVolunteerForm: VolunteerFormValues = {
  fullName: "",
  phone: "",
  email: "",
  cityLocation: "",
  educationalQualification: "",
  areasOfInterest: "",
  reason: "",
  termsAccepted: false,
};

export function volunteerToFormValues(row: Volunteer): VolunteerFormValues {
  return {
    fullName: row.fullName ?? "",
    phone: row.phone ?? "",
    email: row.email ?? "",
    cityLocation: row.cityLocation ?? "",
    educationalQualification: row.educationalQualification ?? "",
    areasOfInterest: row.areasOfInterest ?? "",
    reason: row.reason ?? "",
    termsAccepted: Boolean(row.termsAccepted),
  };
}

export function formValuesToPayload(form: VolunteerFormValues): UpdateVolunteerPayload {
  return {
    fullName: form.fullName.trim(),
    phone: form.phone.trim(),
    email: form.email.trim(),
    cityLocation: form.cityLocation.trim(),
    educationalQualification: form.educationalQualification.trim(),
    areasOfInterest: form.areasOfInterest.trim(),
    reason: form.reason.trim(),
    termsAccepted: form.termsAccepted,
  };
}

type Props = {
  value: VolunteerFormValues;
  onChange: (next: VolunteerFormValues) => void;
  onSubmit: (e: React.FormEvent) => void;
  submitLabel: string;
  saving?: boolean;
  error?: string | null;
};

export default function VolunteerForm({
  value,
  onChange,
  onSubmit,
  submitLabel,
  saving,
  error,
}: Props) {
  const set =
    <K extends keyof VolunteerFormValues>(key: K) =>
    (next: VolunteerFormValues[K]) =>
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
        <CmsFormField label="Full name" htmlFor="vol-fullName">
          <Input
            id="vol-fullName"
            value={value.fullName}
            onChange={(e) => set("fullName")(e.target.value)}
            maxLength={255}
            required
          />
        </CmsFormField>
        <CmsFormField label="Email" htmlFor="vol-email">
          <Input
            id="vol-email"
            type="email"
            value={value.email}
            onChange={(e) => set("email")(e.target.value)}
            maxLength={255}
            required
          />
        </CmsFormField>
        <CmsFormField label="Phone" htmlFor="vol-phone">
          <Input
            id="vol-phone"
            value={value.phone}
            onChange={(e) => set("phone")(e.target.value)}
            maxLength={20}
            required
          />
        </CmsFormField>
        <CmsFormField label="City / location" htmlFor="vol-cityLocation">
          <Input
            id="vol-cityLocation"
            value={value.cityLocation}
            onChange={(e) => set("cityLocation")(e.target.value)}
            maxLength={255}
            required
          />
        </CmsFormField>
        <CmsFormField label="Educational qualification" htmlFor="vol-education">
          <Input
            id="vol-education"
            value={value.educationalQualification}
            onChange={(e) => set("educationalQualification")(e.target.value)}
            maxLength={255}
            required
          />
        </CmsFormField>
        <CmsFormField label="Areas of interest" htmlFor="vol-interest">
          <Input
            id="vol-interest"
            value={value.areasOfInterest}
            onChange={(e) => set("areasOfInterest")(e.target.value)}
            maxLength={255}
            required
          />
        </CmsFormField>
      </div>

      <CmsFormField label="Why they want to volunteer" htmlFor="vol-reason">
        <Textarea
          id="vol-reason"
          rows={4}
          value={value.reason}
          onChange={(e) => set("reason")(e.target.value)}
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
        className="bg-cms-primary hover:bg-cms-primary-hover"
      >
        {saving ? "Saving…" : submitLabel}
      </Button>
    </form>
  );
}
