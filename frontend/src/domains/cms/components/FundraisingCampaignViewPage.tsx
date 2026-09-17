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
import type { FundraisingCampaign } from "@/domains/cms/lib/types";

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

function formatGoal(amount: string) {
  const n = Number(amount);
  if (Number.isNaN(n)) return amount;
  return `₹ ${n.toLocaleString("en-IN")}`;
}

export default function FundraisingCampaignViewPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [campaign, setCampaign] = useState<FundraisingCampaign | null>(null);
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
        const res = await cmsApi.getFundraisingCampaign(id);
        if (!cancelled) setCampaign(res.data);
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

  const isDeleted = Boolean(campaign?.deletedAt);

  const onDelete = async () => {
    if (!campaign) return;
    const ok = await cmsConfirm({
      title: "Move to Recently Deleted?",
      description: `“${campaign.fullName}” will be soft-deleted. You can restore it later from Recently Deleted.`,
      confirmLabel: "Move to deleted",
      tone: "danger",
    });
    if (!ok) return;
    setBusy(true);
    try {
      const res = await cmsApi.deleteFundraisingCampaign(campaign.id);
      cmsToast.success(res?.message || "Campaign deleted successfully");
      router.replace("/admin/campaigns");
    } catch (err) {
      cmsToast.error(
        err instanceof Error ? err.message : "Failed to delete"
      );
      setBusy(false);
    }
  };

  const onRestore = async () => {
    if (!campaign) return;
    const ok = await cmsConfirm({
      title: "Restore campaign?",
      description: `“${campaign.fullName}” will be restored and show again in All campaigns.`,
      confirmLabel: "Restore",
    });
    if (!ok) return;
    setBusy(true);
    try {
      const res = await cmsApi.restoreFundraisingCampaign(campaign.id);
      cmsToast.success(res.message || "Campaign restored successfully");
      setCampaign(res.data);
    } catch (err) {
      cmsToast.error(
        err instanceof Error ? err.message : "Failed to restore"
      );
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <Typography
        variant="label-1"
        as="div"
        className="py-16 text-center text-muted-foreground"
      >
        Loading campaign…
      </Typography>
    );
  }

  if (error || !campaign) {
    return (
      <div className="space-y-4">
        <Link
          href="/admin/campaigns"
          className="inline-flex items-center gap-1.5 text-[#5C5C5C] hover:text-[#212121]"
        >
          <ArrowLeft className="size-3.5" />
          <Typography variant="label-1" as="span">
            Back to list
          </Typography>
        </Link>
        <Typography
          variant="label-1"
          as="div"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700"
        >
          {error || "Campaign not found"}
        </Typography>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <Link
          href="/admin/campaigns"
          className="inline-flex items-center gap-1.5 text-[#9A7B00] hover:underline"
        >
          <ArrowLeft className="size-4" />
          <Typography variant="label-1" as="span">
            Back to campaigns
          </Typography>
        </Link>

        <div className="flex flex-wrap items-center gap-2">
          {isDeleted ? (
            <Button
              type="button"
              variant="outline"
              disabled={busy}
              className="h-9 gap-1.5 border-black/10 bg-white"
              onClick={() => void onRestore()}
            >
              <RotateCcw className="size-3.5" />
              <Typography variant="label-1" as="span">
                {busy ? "Restoring…" : "Restore"}
              </Typography>
            </Button>
          ) : (
            <>
              <Link
                href={`/admin/campaigns/${campaign.id}/edit`}
                className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-black/10 bg-white px-3 font-medium text-[#212121] transition hover:bg-[#F0F0EC]"
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
                className="h-9 gap-1.5 border-red-200 bg-white text-red-600 hover:bg-red-50 hover:text-red-700"
                onClick={() => void onDelete()}
              >
                <Trash2 className="size-3.5" />
                <Typography variant="label-1" as="span">
                  Delete
                </Typography>
              </Button>
            </>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{campaign.fullName}</CardTitle>
          <CardDescription className="capitalize">
            {isDeleted ? `Deleted · ${campaign.status}` : campaign.status}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Row label="Email" value={campaign.email} />
          <Row label="Phone" value={campaign.phoneNumber} />
          <Row label="City" value={campaign.city} />
          <Row
            label="Fundraising goal"
            value={formatGoal(campaign.fundraisingGoal)}
          />
          <Row label="Reason" value={campaign.fundraisingReason} />
          <Row label="Message" value={campaign.message} />
          <Row
            label="Terms accepted"
            value={campaign.termsAccepted ? "Yes" : "No"}
          />
          <Row label="Status" value={campaign.status} />
          <Row
            label="Submitted"
            value={new Date(campaign.createdAt).toLocaleString("en-IN")}
          />
          <Row
            label="Updated"
            value={new Date(campaign.updatedAt).toLocaleString("en-IN")}
          />
          {isDeleted ? (
            <Row
              label="Deleted at"
              value={
                campaign.deletedAt
                  ? new Date(campaign.deletedAt).toLocaleString("en-IN")
                  : null
              }
            />
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
