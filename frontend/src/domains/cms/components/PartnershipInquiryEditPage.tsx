"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { cmsApi } from "@/domains/cms/lib/api";
import { cmsToast } from "@/domains/cms/lib/toast";
import PartnershipInquiryForm, {
  emptyPartnershipInquiryForm,
  formValuesToPayload,
  inquiryToFormValues,
  type PartnershipInquiryFormValues,
} from "./PartnershipInquiryForm";

export default function PartnershipInquiryEditPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [form, setForm] = useState<PartnershipInquiryFormValues>(
    emptyPartnershipInquiryForm
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await cmsApi.getPartnershipInquiry(id);
        if (!cancelled) setForm(inquiryToFormValues(res.data));
      } catch (err) {
        if (!cancelled) {
          const message =
            err instanceof Error ? err.message : "Failed to load";
          setError(message);
          cmsToast.error(message);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setSaving(true);
    setError(null);
    try {
      const res = await cmsApi.updatePartnershipInquiry(
        id,
        formValuesToPayload(form)
      );
      cmsToast.success(res.message || "Inquiry updated successfully");
      router.push(`/admin/partnership-inquiries/${id}`);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to update";
      setError(message);
      cmsToast.error(message);
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-16 text-center font-manrope text-sm text-muted-foreground">
        Loading editor…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          href={`/admin/partnership-inquiries/${id}`}
          className="mb-3 inline-flex items-center gap-1.5 font-manrope text-sm text-[#5C5C5C]"
        >
          <ArrowLeft className="size-3.5" /> Back to view
        </Link>
        <h1 className="font-manrope text-2xl font-semibold text-[#212121]">
          Edit partnership inquiry
        </h1>
      </div>
      <PartnershipInquiryForm
        value={form}
        onChange={setForm}
        onSubmit={onSubmit}
        submitLabel="Save changes"
        saving={saving}
        error={error}
      />
    </div>
  );
}
