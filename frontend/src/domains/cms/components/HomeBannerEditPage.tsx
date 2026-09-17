"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import Typography from "@/lib/Typography";
import { cmsApi } from "@/domains/cms/lib/api";
import { cmsToast } from "@/domains/cms/lib/toast";
import HomeBannerForm, {
  emptyHomeBannerForm,
  getHomeBannerPatch,
  homeBannerToFormValues,
  type HomeBannerFormValues,
} from "./HomeBannerForm";

export default function HomeBannerEditPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [form, setForm] = useState<HomeBannerFormValues>(emptyHomeBannerForm);
  const [initial, setInitial] =
    useState<HomeBannerFormValues>(emptyHomeBannerForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    (async () => {
      setLoading(true);
      try {
        const res = await cmsApi.getHomeBanner(id);
        if (!cancelled) {
          const values = homeBannerToFormValues(res.data);
          setForm(values);
          setInitial({ ...values });
        }
      } catch (err) {
        if (!cancelled) {
          cmsToast.error(
            err instanceof Error ? err.message : "Failed to load"
          );
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
    if (!id || saving) return;

    const patch = getHomeBannerPatch(initial, form);
    if (!patch.hasChanges) {
      cmsToast.info("No changes found");
      return;
    }

    setSaving(true);
    try {
      const res = await cmsApi.updateHomeBanner(id, patch.fields, patch.files);
      cmsToast.success(res.message || "Home banner updated successfully");
      router.push(`/admin/home-banners/${id}`);
    } catch (err) {
      cmsToast.error(
        err instanceof Error ? err.message : "Failed to update"
      );
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
          href={`/admin/home-banners/${id}`}
          className="mb-3 inline-flex items-center gap-1.5 text-[#5C5C5C] transition hover:text-[#212121]"
        >
          <ArrowLeft className="size-3.5" />
          <Typography variant="label-1" as="span">
            Back to view
          </Typography>
        </Link>
        <Typography
          variant="heading-8"
          as="h1"
          className="font-semibold text-[#212121]"
        >
          Edit home banner
        </Typography>
        <Typography
          variant="label-1"
          as="p"
          className="mt-1 text-muted-foreground"
        >
          Save sends only what you changed.
        </Typography>
      </div>

      <HomeBannerForm
        mode="edit"
        value={form}
        onChange={setForm}
        onSubmit={onSubmit}
        submitLabel="Save changes"
        saving={saving}
      />
    </div>
  );
}
