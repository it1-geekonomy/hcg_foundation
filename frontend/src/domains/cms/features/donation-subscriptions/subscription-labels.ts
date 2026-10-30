import type {
  DonationFrequency,
  SubscriptionStatus,
} from "@/domains/cms/lib/types";
import type { CmsSelectOption } from "@/domains/cms/ui/CmsSelect";

export const FREQUENCY_LABELS: Record<DonationFrequency, string> = {
  monthly: "Monthly",
  quarterly: "Quarterly",
  yearly: "Yearly",
};

export const STATUS_LABELS: Record<SubscriptionStatus, string> = {
  created: "Awaiting approval",
  authenticated: "Approved",
  active: "Active",
  pending: "Payment retrying",
  halted: "Halted",
  paused: "Paused",
  cancelled: "Cancelled",
  completed: "Completed",
  expired: "Expired",
};

export const STATUS_HELP: Partial<Record<SubscriptionStatus, string>> = {
  created: "The donor opened checkout but has not approved the mandate yet.",
  authenticated: "Mandate approved; the first charge has not happened yet.",
  pending: "The last charge failed. Razorpay is retrying automatically.",
  halted: "All retries failed. No more charges until the donor updates their payment method.",
  paused: "No charges until it is resumed.",
};

export function subscriptionTone(status: SubscriptionStatus) {
  if (status === "active" || status === "authenticated") return "success" as const;
  if (status === "pending" || status === "halted") return "danger" as const;
  if (status === "paused" || status === "created") return "status" as const;
  return "info" as const;
}

export function isSubscriptionEnded(status: SubscriptionStatus) {
  return status === "cancelled" || status === "completed" || status === "expired";
}

export function formatInr(amount: string) {
  const n = Number(amount);
  return Number.isNaN(n) ? `₹${amount}` : `₹${n.toLocaleString("en-IN")}`;
}

export const SUBSCRIPTION_STATUS_FILTER_OPTIONS: CmsSelectOption[] = [
  { value: "", label: "All statuses" },
  ...(Object.keys(STATUS_LABELS) as SubscriptionStatus[]).map((value) => ({
    value,
    label: STATUS_LABELS[value],
  })),
];

export const FREQUENCY_FILTER_OPTIONS: CmsSelectOption[] = [
  { value: "", label: "All frequencies" },
  ...(Object.keys(FREQUENCY_LABELS) as DonationFrequency[]).map((value) => ({
    value,
    label: FREQUENCY_LABELS[value],
  })),
];
