"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import Typography from "@/lib/Typography";
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
      <Typography
        variant="label-1"
        as="div"
        className="py-16 text-center text-muted-foreground"
      >
        Loading editor…
      </Typography>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          href={`/admin/partnership-inquiries/${id}`}
          className="mb-3 inline-flex items-center gap-1.5 text-[#5C5C5C]"
        >
          <ArrowLeft className="size-3.5" />
          <Typography variant="label-1" as="span">
            Back to view
          </Typography>
        </Link>
        <Typography
          variant="heading-8"
          as="h2"
          className="font-semibold text-[#212121]"
        >
          Edit partnership inquiry
        </Typography>
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
