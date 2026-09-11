"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { cmsApi } from "@/domains/cms/lib/api";
import { cmsToast } from "@/domains/cms/lib/toast";
import TeamForm, {
  emptyTeamForm,
  getTeamPatch,
  teamToFormValues,
  type TeamFormValues,
} from "./TeamForm";

export default function TeamEditPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [form, setForm] = useState<TeamFormValues>(emptyTeamForm);
  const [initial, setInitial] = useState<TeamFormValues>(emptyTeamForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    (async () => {
      setLoading(true);
      try {
        const res = await cmsApi.getTeam(id);
        if (!cancelled) {
          const values = teamToFormValues(res.data);
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

    const patch = getTeamPatch(initial, form);
    if (!patch.hasChanges) {
      cmsToast.info("No changes found");
      return;
    }

    setSaving(true);
    try {
      const res = await cmsApi.updateTeam(id, patch.fields, patch.file);
      cmsToast.success(
        res.message || "Team member updated successfully"
      );
      router.push(`/admin/team/${id}`);
    } catch (err) {
      cmsToast.error(
        err instanceof Error ? err.message : "Failed to update"
      );
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
          href={`/admin/team/${id}`}
          className="mb-3 inline-flex items-center gap-1.5 font-manrope text-sm text-[#5C5C5C] transition hover:text-[#212121]"
        >
          <ArrowLeft className="size-3.5" />
          Back to view
        </Link>
        <h1 className="font-manrope text-2xl font-semibold text-[#212121]">
          Edit team member
        </h1>
        <p className="mt-1 font-manrope text-sm text-muted-foreground">
          Save sends only what you changed.
        </p>
      </div>

      <TeamForm
        value={form}
        onChange={setForm}
        onSubmit={onSubmit}
        submitLabel="Save changes"
        saving={saving}
      />
    </div>
  );
}
