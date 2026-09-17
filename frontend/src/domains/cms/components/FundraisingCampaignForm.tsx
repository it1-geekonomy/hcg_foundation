"use client";

import Typography from "@/lib/Typography";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";
import type {
  CampaignStatus,
  FundraisingCampaign,
  UpdateFundraisingCampaignPayload,
} from "@/domains/cms/lib/types";
import { CmsFormField } from "./CmsFormField";
import CmsSelect, { CAMPAIGN_STATUS_OPTIONS } from "./CmsSelect";

export type FundraisingCampaignFormValues = {
  fullName: string;
  phoneNumber: string;
  email: string;
  city: string;
  fundraisingGoal: string;
  fundraisingReason: string;
  message: string;
  termsAccepted: boolean;
  status: CampaignStatus;
};

export const emptyFundraisingCampaignForm: FundraisingCampaignFormValues = {
  fullName: "",
  phoneNumber: "",
  email: "",
  city: "",
  fundraisingGoal: "",
  fundraisingReason: "",
  message: "",
  termsAccepted: false,
  status: "pending",
};

export function campaignToFormValues(
  campaign: FundraisingCampaign
): FundraisingCampaignFormValues {
  return {
    fullName: campaign.fullName ?? "",
    phoneNumber: campaign.phoneNumber ?? "",
    email: campaign.email ?? "",
    city: campaign.city ?? "",
    fundraisingGoal: campaign.fundraisingGoal ?? "",
    fundraisingReason: campaign.fundraisingReason ?? "",
    message: campaign.message ?? "",
    termsAccepted: Boolean(campaign.termsAccepted),
    status: campaign.status,
  };
}

export function formValuesToPayload(
  form: FundraisingCampaignFormValues
): UpdateFundraisingCampaignPayload {
  return {
    fullName: form.fullName.trim(),
    phoneNumber: form.phoneNumber.trim(),
    email: form.email.trim(),
    city: form.city.trim(),
    fundraisingGoal: form.fundraisingGoal.trim(),
    fundraisingReason: form.fundraisingReason.trim(),
    message: form.message.trim(),
    termsAccepted: form.termsAccepted,
    status: form.status,
  };
}

type Props = {
  value: FundraisingCampaignFormValues;
  onChange: (next: FundraisingCampaignFormValues) => void;
  onSubmit: (e: React.FormEvent) => void;
  submitLabel: string;
  saving?: boolean;
  error?: string | null;
};

export default function FundraisingCampaignForm({
  value,
  onChange,
  onSubmit,
  submitLabel,
  saving,
  error,
}: Props) {
  const set =
    <K extends keyof FundraisingCampaignFormValues>(key: K) =>
    (next: FundraisingCampaignFormValues[K]) =>
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
        <CmsFormField label="Full name" htmlFor="campaign-fullName">
          <Input
            id="campaign-fullName"
            value={value.fullName}
            onChange={(e) => set("fullName")(e.target.value)}
            required
          />
        </CmsFormField>

        <CmsFormField label="Status" htmlFor="campaign-status">
          <CmsSelect
            value={value.status}
            options={CAMPAIGN_STATUS_OPTIONS}
            onChange={(next) => set("status")(next as CampaignStatus)}
          />
        </CmsFormField>

        <CmsFormField label="Email" htmlFor="campaign-email">
          <Input
            id="campaign-email"
            type="email"
            value={value.email}
            onChange={(e) => set("email")(e.target.value)}
            required
          />
        </CmsFormField>

        <CmsFormField label="Phone" htmlFor="campaign-phone">
          <Input
            id="campaign-phone"
            value={value.phoneNumber}
            onChange={(e) => set("phoneNumber")(e.target.value)}
            required
          />
        </CmsFormField>

        <CmsFormField label="City" htmlFor="campaign-city">
          <Input
            id="campaign-city"
            value={value.city}
            onChange={(e) => set("city")(e.target.value)}
            required
          />
        </CmsFormField>

        <CmsFormField label="Fundraising goal" htmlFor="campaign-goal">
          <Input
            id="campaign-goal"
            value={value.fundraisingGoal}
            onChange={(e) => set("fundraisingGoal")(e.target.value)}
            required
          />
        </CmsFormField>
      </div>

      <CmsFormField label="Fundraising reason" htmlFor="campaign-reason">
        <Textarea
          id="campaign-reason"
          rows={4}
          value={value.fundraisingReason}
          onChange={(e) => set("fundraisingReason")(e.target.value)}
          required
        />
      </CmsFormField>

      <CmsFormField label="Message" htmlFor="campaign-message">
        <Textarea
          id="campaign-message"
          rows={3}
          value={value.message}
          onChange={(e) => set("message")(e.target.value)}
        />
      </CmsFormField>

      <Typography
        variant="label-1"
        as="label"
        className="flex items-center gap-2 text-[#212121]"
      >
        <input
          type="checkbox"
          checked={value.termsAccepted}
          onChange={(e) => set("termsAccepted")(e.target.checked)}
          className="size-4 rounded border-black/20"
        />
        Terms accepted
      </Typography>

      <Button
        type="submit"
        disabled={saving}
        className="bg-[#C45A7A] hover:bg-[#b04e6c]"
      >
        {saving ? "Saving…" : submitLabel}
      </Button>
    </form>
  );
}
