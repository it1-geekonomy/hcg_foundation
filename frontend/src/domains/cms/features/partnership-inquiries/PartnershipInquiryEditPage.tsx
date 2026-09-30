"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { cmsApi } from "@/domains/cms/lib/api";
import { cmsToast } from "@/domains/cms/lib/toast";
import PartnershipInquiryForm, {
  emptyPartnershipInquiryForm,
  formValuesToPayload,
  inquiryToFormValues,
  type PartnershipInquiryFormValues,
} from "./PartnershipInquiryForm";
import {
  CmsFormPageHeader,
  CmsViewLoading,
  cmsErrorMessage,
} from "@/domains/cms/ui/CmsViewChrome";

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
          const message = cmsErrorMessage(err, "Failed to load");
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
      const message = cmsErrorMessage(err, "Failed to update");
      setError(message);
      cmsToast.error(message);
      setSaving(false);
    }
  };

  if (loading) return <CmsViewLoading label="Loading editor…" />;

  return (
    <div className="space-y-6">
      <CmsFormPageHeader
        backHref={`/admin/partnership-inquiries/${id}`}
        backLabel="Back to view"
        title="Edit partnership inquiry"
      />
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
