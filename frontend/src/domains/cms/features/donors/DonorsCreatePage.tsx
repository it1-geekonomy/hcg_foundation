"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Typography from "@/lib/Typography";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { DONATION_CATEGORIES } from "@/shared/lib/donors-api";
import { cmsApi } from "@/domains/cms/lib/api";
import type { CreateManualDonorPayload, DonationCategory } from "@/domains/cms/lib/types";
import { cmsToast } from "@/domains/cms/lib/toast";
import { CmsFormField } from "@/domains/cms/ui/CmsFormField";
import { CmsFormPageHeader, cmsErrorMessage } from "@/domains/cms/ui/CmsViewChrome";
import CmsSelect from "@/domains/cms/ui/CmsSelect";

const CURRENCY_OPTIONS = [
  { value: "INR", label: "INR" },
  { value: "USD", label: "USD" },
  { value: "EUR", label: "EUR" },
  { value: "GBP", label: "GBP" },
  { value: "AED", label: "AED" },
  { value: "SGD", label: "SGD" },
  { value: "AUD", label: "AUD" },
  { value: "CAD", label: "CAD" },
];

const CATEGORY_OPTIONS = DONATION_CATEGORIES.map((c) => ({
  value: c,
  label: c,
}));

type FormState = {
  fullName: string;
  email: string;
  phone: string;
  city: string;
  address: string;
  country: string;
  countryCode: string;
  isInternational: boolean;
  currency: string;
  pan: string;
  paymentReference: string;
  message: string;
  donationCategory: DonationCategory;
  amount: string;
  patientStoryId: string;
  sendReceiptEmail: boolean;
};

const emptyForm: FormState = {
  fullName: "",
  email: "",
  phone: "",
  city: "",
  address: "",
  country: "India",
  countryCode: "IN",
  isInternational: false,
  currency: "INR",
  pan: "",
  paymentReference: "",
  message: "",
  donationCategory: "General Funds",
  amount: "",
  patientStoryId: "",
  sendReceiptEmail: true,
};

export default function DonorsCreatePage() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [patientOptions, setPatientOptions] = useState<
    Array<{ value: string; label: string }>
  >([{ value: "", label: "None" }]);

  useEffect(() => {
    let cancelled = false;
    async function loadPatients() {
      try {
        const res = await cmsApi.listPatientStories({
          page: 1,
          limit: 100,
          status: "published",
        });
        if (cancelled) return;
        setPatientOptions([
          { value: "", label: "None" },
          ...(res.data ?? []).map((p) => ({
            value: p.id,
            label: p.title,
          })),
        ]);
      } catch {
        // Patient dropdown is optional; keep "None".
      }
    }
    void loadPatients();
    return () => {
      cancelled = true;
    };
  }, []);

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const onOriginChange = (international: boolean) => {
    setForm((prev) => ({
      ...prev,
      isInternational: international,
      country: international ? prev.country === "India" ? "" : prev.country : "India",
      countryCode: international
        ? prev.countryCode === "IN"
          ? ""
          : prev.countryCode
        : "IN",
      currency: international
        ? prev.currency === "INR"
          ? "USD"
          : prev.currency
        : "INR",
      pan: international ? "" : prev.pan,
    }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;

    const amount = Number(form.amount);
    if (!form.fullName.trim() || !form.email.trim() || Number.isNaN(amount) || amount < 1) {
      setError("Full name, email, and a valid amount are required.");
      return;
    }

    if (!form.isInternational && !form.address.trim()) {
      setError("Address is required for Indian donations.");
      return;
    }

    if (!form.isInternational && amount >= 2000) {
      const pan = form.pan.replace(/\s/g, "").toUpperCase();
      if (!/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(pan)) {
        setError("A valid 10-character PAN is required for donations of ₹2,000 or more.");
        return;
      }
    }

    const payload: CreateManualDonorPayload = {
      fullName: form.fullName.trim(),
      email: form.email.trim(),
      amount,
      currency: form.currency,
      isInternational: form.isInternational,
      donationCategory: form.donationCategory,
      sendReceiptEmail: form.sendReceiptEmail,
    };

    if (form.phone.trim()) payload.phone = form.phone.trim();
    if (form.city.trim()) payload.city = form.city.trim();
    if (form.address.trim()) payload.address = form.address.trim();
    if (form.country.trim()) payload.country = form.country.trim();
    if (form.countryCode.trim()) payload.countryCode = form.countryCode.trim();
    if (!form.isInternational && form.pan.trim()) {
      payload.pan = form.pan.replace(/\s/g, "").toUpperCase();
    }
    if (form.paymentReference.trim()) {
      payload.paymentReference = form.paymentReference.trim();
    }
    if (form.message.trim()) payload.message = form.message.trim();
    if (form.patientStoryId) payload.patientStoryId = form.patientStoryId;

    setSaving(true);
    setError(null);
    try {
      const res = await cmsApi.createManualDonor(payload);
      cmsToast.success(res.message || "Donor created successfully");
      router.push(`/admin/donations/${res.data.id}`);
    } catch (err) {
      setError(cmsErrorMessage(err, "Failed to create donor"));
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <CmsFormPageHeader
        backHref="/admin/donations"
        backLabel="Back to donations"
        title="Add donor manually"
        description="Record an offline donation (bank transfer, FCRA remittance, cheque, or cash). Saved as paid — no Razorpay checkout."
      />

      <form
        onSubmit={onSubmit}
        className="mx-auto max-w-2xl space-y-4 rounded-xl border border-cms-border bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)] sm:p-6"
      >
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
          <CmsFormField label="Full name" htmlFor="fullName">
            <Input
              id="fullName"
              required
              value={form.fullName}
              onChange={(e) => setField("fullName", e.target.value)}
              placeholder="Anita Sharma"
            />
          </CmsFormField>

          <CmsFormField label="Email" htmlFor="email">
            <Input
              id="email"
              type="email"
              required
              value={form.email}
              onChange={(e) => setField("email", e.target.value)}
              placeholder="anita@example.com"
            />
          </CmsFormField>

          <CmsFormField label="Phone" htmlFor="phone" hint="Optional">
            <Input
              id="phone"
              value={form.phone}
              onChange={(e) => setField("phone", e.target.value)}
              placeholder="9876543210"
            />
          </CmsFormField>

          <CmsFormField label="Amount" htmlFor="amount">
            <Input
              id="amount"
              type="number"
              min="1"
              step="0.01"
              required
              value={form.amount}
              onChange={(e) => setField("amount", e.target.value)}
              placeholder="5000"
            />
          </CmsFormField>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <CmsFormField label="Donor origin" htmlFor="origin">
            <CmsSelect
              id="origin"
              value={form.isInternational ? "international" : "india"}
              options={[
                { value: "india", label: "India" },
                { value: "international", label: "Outside India" },
              ]}
              onChange={(next) => onOriginChange(next === "international")}
            />
          </CmsFormField>

          <CmsFormField label="Currency" htmlFor="currency">
            <CmsSelect
              id="currency"
              value={form.currency}
              options={CURRENCY_OPTIONS}
              onChange={(next) => setField("currency", next)}
            />
          </CmsFormField>
        </div>

        {form.isInternational ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <CmsFormField label="Country" htmlFor="country">
              <Input
                id="country"
                value={form.country}
                onChange={(e) => setField("country", e.target.value)}
                placeholder="United States"
              />
            </CmsFormField>
            <CmsFormField label="Country code" htmlFor="countryCode" hint="ISO alpha-2">
              <Input
                id="countryCode"
                value={form.countryCode}
                onChange={(e) => setField("countryCode", e.target.value.toUpperCase())}
                placeholder="US"
                maxLength={8}
              />
            </CmsFormField>
          </div>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2">
          <CmsFormField label="City" htmlFor="city" hint="Optional">
            <Input
              id="city"
              value={form.city}
              onChange={(e) => setField("city", e.target.value)}
              placeholder="Bengaluru"
            />
          </CmsFormField>

          {!form.isInternational ? (
            <CmsFormField label="PAN" htmlFor="pan" hint="Required for ₹2,000+">
              <Input
                id="pan"
                value={form.pan}
                onChange={(e) => setField("pan", e.target.value.toUpperCase())}
                placeholder="ABCDE1234F"
                maxLength={10}
              />
            </CmsFormField>
          ) : (
            <div />
          )}
        </div>

        <CmsFormField
          label="Address"
          htmlFor="address"
          hint={form.isInternational ? "Optional" : "Required for Indian donations"}
        >
          <Input
            id="address"
            value={form.address}
            onChange={(e) => setField("address", e.target.value)}
            placeholder="12 MG Road, Bengaluru, Karnataka 560001"
            required={!form.isInternational}
          />
        </CmsFormField>

        <div className="grid gap-4 sm:grid-cols-2">
          <CmsFormField label="Category" htmlFor="donationCategory">
            <CmsSelect
              id="donationCategory"
              value={form.donationCategory}
              options={CATEGORY_OPTIONS}
              onChange={(next) =>
                setField("donationCategory", next as DonationCategory)
              }
            />
          </CmsFormField>

          <CmsFormField label="Patient story" htmlFor="patientStoryId" hint="Optional">
            <CmsSelect
              id="patientStoryId"
              value={form.patientStoryId}
              options={patientOptions}
              onChange={(next) => {
                setField("patientStoryId", next);
                if (next && form.donationCategory === "General Funds") {
                  setField("donationCategory", "Patient Specific");
                }
              }}
            />
          </CmsFormField>
        </div>

        <CmsFormField
          label="Payment reference"
          htmlFor="paymentReference"
          hint="UTR / cheque number / bank ref (optional)"
        >
          <Input
            id="paymentReference"
            value={form.paymentReference}
            onChange={(e) => setField("paymentReference", e.target.value)}
            placeholder="NEFT UTR 123456789"
          />
        </CmsFormField>

        <CmsFormField label="Notes" htmlFor="message" hint="Optional">
          <textarea
            id="message"
            rows={3}
            value={form.message}
            onChange={(e) => setField("message", e.target.value)}
            placeholder="Cheque received at office / FCRA remittance…"
            className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
          />
        </CmsFormField>

        <label className="flex items-start gap-2.5 text-sm text-cms-ink">
          <input
            type="checkbox"
            className="mt-0.5 size-4 rounded border-cms-border"
            checked={form.sendReceiptEmail}
            onChange={(e) => setField("sendReceiptEmail", e.target.checked)}
          />
          <span>
            Send receipt / 80G email
            <span className="mt-0.5 block text-xs text-cms-muted">
              Queued through the same email system as online donations.
            </span>
          </span>
        </label>

        <div className="flex flex-wrap gap-3 pt-2">
          <Button
            type="submit"
            disabled={saving}
            className="bg-cms-primary text-white hover:bg-cms-primary/90 sm:min-w-36"
          >
            {saving ? "Creating…" : "Create donor"}
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={saving}
            onClick={() => router.push("/admin/donations")}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
