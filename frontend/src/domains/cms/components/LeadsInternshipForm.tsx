"use client";

import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";
import type {
  LeadsInternship,
  UpdateLeadsInternshipPayload,
} from "@/domains/cms/lib/types";
import { CmsFormField } from "./CmsFormField";

export type LeadsInternshipFormValues = {
  fullName: string;
  phone: string;
  email: string;
  gender: string;
  dob: string;
  currentCourse: string;
  address: string;
  languages: string;
  computerSkills: string;
  message: string;
  termsAccepted: boolean;
};

export const emptyLeadsInternshipForm: LeadsInternshipFormValues = {
  fullName: "",
  phone: "",
  email: "",
  gender: "",
  dob: "",
  currentCourse: "",
  address: "",
  languages: "",
  computerSkills: "",
  message: "",
  termsAccepted: false,
};

export function internshipToFormValues(
  row: LeadsInternship
): LeadsInternshipFormValues {
  return {
    fullName: row.fullName ?? "",
    phone: row.phone ?? "",
    email: row.email ?? "",
    gender: row.gender ?? "",
    dob: row.dob ?? "",
    currentCourse: row.currentCourse ?? "",
    address: row.address ?? "",
    languages: row.languages ?? "",
    computerSkills: row.computerSkills ?? "",
    message: row.message ?? "",
    termsAccepted: Boolean(row.termsAccepted),
  };
}

export function formValuesToPayload(
  form: LeadsInternshipFormValues
): UpdateLeadsInternshipPayload {
  return {
    fullName: form.fullName.trim(),
    phone: form.phone.trim(),
    email: form.email.trim(),
    gender: form.gender.trim(),
    dob: form.dob.trim(),
    currentCourse: form.currentCourse.trim(),
    address: form.address.trim(),
    languages: form.languages.trim(),
    computerSkills: form.computerSkills.trim(),
    message: form.message.trim(),
    termsAccepted: form.termsAccepted,
  };
}

type Props = {
  value: LeadsInternshipFormValues;
  onChange: (next: LeadsInternshipFormValues) => void;
  onSubmit: (e: React.FormEvent) => void;
  submitLabel: string;
  saving?: boolean;
  error?: string | null;
};

export default function LeadsInternshipForm({
  value,
  onChange,
  onSubmit,
  submitLabel,
  saving,
  error,
}: Props) {
  const set =
    <K extends keyof LeadsInternshipFormValues>(key: K) =>
    (next: LeadsInternshipFormValues[K]) =>
      onChange({ ...value, [key]: next });

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 font-manrope text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <CmsFormField label="Full name" htmlFor="int-fullName">
          <Input
            id="int-fullName"
            value={value.fullName}
            onChange={(e) => set("fullName")(e.target.value)}
            required
          />
        </CmsFormField>
        <CmsFormField label="Email" htmlFor="int-email">
          <Input
            id="int-email"
            type="email"
            value={value.email}
            onChange={(e) => set("email")(e.target.value)}
          />
        </CmsFormField>
        <CmsFormField label="Phone" htmlFor="int-phone">
          <Input
            id="int-phone"
            value={value.phone}
            onChange={(e) => set("phone")(e.target.value)}
          />
        </CmsFormField>
        <CmsFormField label="Gender" htmlFor="int-gender">
          <Input
            id="int-gender"
            value={value.gender}
            onChange={(e) => set("gender")(e.target.value)}
          />
        </CmsFormField>
        <CmsFormField label="Date of birth" htmlFor="int-dob">
          <Input
            id="int-dob"
            type="date"
            value={value.dob}
            onChange={(e) => set("dob")(e.target.value)}
          />
        </CmsFormField>
        <CmsFormField label="Current course" htmlFor="int-course">
          <Input
            id="int-course"
            value={value.currentCourse}
            onChange={(e) => set("currentCourse")(e.target.value)}
          />
        </CmsFormField>
      </div>

      <CmsFormField label="Address" htmlFor="int-address">
        <Textarea
          id="int-address"
          rows={2}
          value={value.address}
          onChange={(e) => set("address")(e.target.value)}
        />
      </CmsFormField>
      <CmsFormField label="Languages" htmlFor="int-languages">
        <Input
          id="int-languages"
          value={value.languages}
          onChange={(e) => set("languages")(e.target.value)}
        />
      </CmsFormField>
      <CmsFormField label="Computer skills" htmlFor="int-skills">
        <Input
          id="int-skills"
          value={value.computerSkills}
          onChange={(e) => set("computerSkills")(e.target.value)}
        />
      </CmsFormField>
      <CmsFormField label="Message" htmlFor="int-message">
        <Textarea
          id="int-message"
          rows={3}
          value={value.message}
          onChange={(e) => set("message")(e.target.value)}
        />
      </CmsFormField>

      <label className="flex items-center gap-2 font-manrope text-sm">
        <input
          type="checkbox"
          checked={value.termsAccepted}
          onChange={(e) => set("termsAccepted")(e.target.checked)}
          className="size-4 rounded border-black/20"
        />
        Terms accepted
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
