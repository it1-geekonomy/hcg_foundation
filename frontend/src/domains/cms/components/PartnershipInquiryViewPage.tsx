"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, Pencil, RotateCcw, Trash2 } from "lucide-react";
import { Button } from "@/shared/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import { cmsApi } from "@/domains/cms/lib/api";
import { cmsConfirm } from "@/domains/cms/lib/confirm";
import { cmsToast } from "@/domains/cms/lib/toast";
import type { PartnershipInquiry } from "@/domains/cms/lib/types";

function Row({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="grid gap-1 border-b border-border/60 py-3 sm:grid-cols-[180px_1fr]">
      <p className="font-manrope text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="whitespace-pre-wrap font-manrope text-sm text-foreground">
        {value || "—"}
      </p>
    </div>
  );
}

export default function PartnershipInquiryViewPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [row, setRow] = useState<PartnershipInquiry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await cmsApi.getPartnershipInquiry(id);
        if (!cancelled) setRow(res.data);
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

  const isDeleted = Boolean(row?.deletedAt);

  const onDelete = async () => {
    if (!row) return;
    const ok = await cmsConfirm({
      title: "Move to Recently Deleted?",
      description: `“${row.fullName}” will be soft-deleted.`,
      confirmLabel: "Move to deleted",
      tone: "danger",
    });
    if (!ok) return;
    setBusy(true);
    try {
      const res = await cmsApi.deletePartnershipInquiry(row.id);
      cmsToast.success(res?.message || "Inquiry deleted successfully");
      router.replace("/admin/partnership-inquiries");
    } catch (err) {
      cmsToast.error(err instanceof Error ? err.message : "Failed to delete");
      setBusy(false);
    }
  };

  const onRestore = async () => {
    if (!row) return;
    const ok = await cmsConfirm({
      title: "Restore inquiry?",
      description: `“${row.fullName}” will be restored.`,
      confirmLabel: "Restore",
    });
    if (!ok) return;
    setBusy(true);
    try {
      const res = await cmsApi.restorePartnershipInquiry(row.id);
      cmsToast.success(res.message || "Inquiry restored successfully");
      setRow(res.data);
    } catch (err) {
      cmsToast.error(err instanceof Error ? err.message : "Failed to restore");
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="py-16 text-center font-manrope text-sm text-muted-foreground">
        Loading inquiry…
      </div>
    );
  }

  if (error || !row) {
    return (
      <div className="space-y-4">
        <Link
          href="/admin/partnership-inquiries"
          className="inline-flex items-center gap-1.5 font-manrope text-sm text-[#5C5C5C]"
        >
          <ArrowLeft className="size-3.5" /> Back to list
        </Link>
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 font-manrope text-sm text-red-700">
          {error || "Not found"}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <Link
          href="/admin/partnership-inquiries"
          className="inline-flex items-center gap-1.5 font-manrope text-sm text-[#9A7B00] hover:underline"
        >
          <ArrowLeft className="size-4" /> Back to inquiries
        </Link>
        <div className="flex flex-wrap gap-2">
          {isDeleted ? (
            <Button
              type="button"
              variant="outline"
              disabled={busy}
              className="h-9 gap-1.5"
              onClick={() => void onRestore()}
            >
              <RotateCcw className="size-3.5" />
              {busy ? "Restoring…" : "Restore"}
            </Button>
          ) : (
            <>
              <Link
                href={`/admin/partnership-inquiries/${row.id}/edit`}
                className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-black/10 bg-white px-3 font-manrope text-sm"
              >
                <Pencil className="size-3.5" /> Edit
              </Link>
              <Button
                type="button"
                variant="outline"
                disabled={busy}
                className="h-9 gap-1.5 border-red-200 text-red-600 hover:bg-red-50"
                onClick={() => void onDelete()}
              >
                <Trash2 className="size-3.5" /> Delete
              </Button>
            </>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{row.fullName}</CardTitle>
          <CardDescription className="capitalize">
            {isDeleted
              ? `Deleted · ${row.status.replace("_", " ")}`
              : row.status.replace("_", " ")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Row label="Email" value={row.email} />
          <Row label="Phone" value={row.phoneNumber} />
          <Row label="Organization" value={row.organizationName} />
          <Row label="Message" value={row.message} />
          <Row label="Terms accepted" value={row.termsAccepted ? "Yes" : "No"} />
          <Row label="Status" value={row.status.replace("_", " ")} />
          <Row
            label="Submitted"
            value={new Date(row.createdAt).toLocaleString("en-IN")}
          />
          <Row
            label="Updated"
            value={new Date(row.updatedAt).toLocaleString("en-IN")}
          />
        </CardContent>
      </Card>
    </div>
  );
}
