"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { cmsApi } from "@/domains/cms/lib/api";
import { cmsToast } from "@/domains/cms/lib/toast";
import FundraisingCampaignForm, {
  campaignToFormValues,
  emptyFundraisingCampaignForm,
  formValuesToPayload,
  type FundraisingCampaignFormValues,
} from "./FundraisingCampaignForm";

export default function FundraisingCampaignEditPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [form, setForm] = useState<FundraisingCampaignFormValues>(
    emptyFundraisingCampaignForm
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
        const res = await cmsApi.getFundraisingCampaign(id);
        if (!cancelled) setForm(campaignToFormValues(res.data));
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
      const res = await cmsApi.updateFundraisingCampaign(
        id,
        formValuesToPayload(form)
      );
      cmsToast.success(res.message || "Campaign updated successfully");
      router.push(`/admin/campaigns/${id}`);
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
          href={`/admin/campaigns/${id}`}
          className="mb-3 inline-flex items-center gap-1.5 font-manrope text-sm text-[#5C5C5C] transition hover:text-[#212121]"
        >
          <ArrowLeft className="size-3.5" />
          Back to view
        </Link>
        <h1 className="font-manrope text-2xl font-semibold text-[#212121]">
          Edit campaign
        </h1>
        <p className="mt-1 font-manrope text-sm text-muted-foreground">
          Update application details or review status.
        </p>
      </div>

      <FundraisingCampaignForm
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
