"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, Pencil, RotateCcw, Trash2 } from "lucide-react";
import Typography from "@/lib/Typography";
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
import {
  CmsBadge,
  CmsViewError,
  CmsViewLoading,
  cmsErrorMessage,
} from "@/domains/cms/ui/CmsViewChrome";

function Row({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="grid gap-1 border-b border-border/60 py-3 sm:grid-cols-[180px_1fr]">
      <Typography
        variant="caption-1"
        as="p"
        className="font-semibold uppercase tracking-wide text-muted-foreground"
      >
        {label}
      </Typography>
      <Typography
        variant="label-1"
        as="p"
        className="whitespace-pre-wrap text-foreground"
      >
        {value || "—"}
      </Typography>
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
        if (cancelled) return;
        const message = cmsErrorMessage(err, "Failed to load");
        setError(message);
        cmsToast.error(message);
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
      cmsToast.error(cmsErrorMessage(err, "Failed to delete"));
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
      cmsToast.error(cmsErrorMessage(err, "Failed to restore"));
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <CmsViewLoading label="Loading inquiry…" />;
  if (error || !row) {
    return (
      <CmsViewError
        backHref="/admin/partnership-inquiries"
        message={error || "Not found"}
      />
    );
  }

  const statusLabel = row.status.replace("_", " ");

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <Link
          href="/admin/partnership-inquiries"
          className="inline-flex items-center gap-1.5 text-[#9A7B00] hover:underline"
        >
          <ArrowLeft className="size-4" />
          <Typography variant="label-1" as="span">
            Back to inquiries
          </Typography>
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
                className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-black/10 bg-white px-3"
              >
                <Pencil className="size-3.5" />
                <Typography variant="label-1" as="span">
                  Edit
                </Typography>
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
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle>{row.fullName}</CardTitle>
            <CmsBadge>
              <span className="capitalize">{statusLabel}</span>
            </CmsBadge>
            {isDeleted ? <CmsBadge tone="danger">deleted</CmsBadge> : null}
          </div>
          <CardDescription className="capitalize">
            {isDeleted ? `Deleted · ${statusLabel}` : statusLabel}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Row label="Email" value={row.email} />
          <Row label="Phone" value={row.phoneNumber} />
          <Row label="Organization" value={row.organizationName} />
          <Row label="Message" value={row.message} />
          <Row label="Terms accepted" value={row.termsAccepted ? "Yes" : "No"} />
          <Row label="Status" value={statusLabel} />
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
