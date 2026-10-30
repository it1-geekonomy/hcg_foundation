"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Ban, Pause, Play, RefreshCw } from "lucide-react";
import { Button } from "@/shared/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";
import { cmsApi } from "@/domains/cms/lib/api";
import { cmsConfirm } from "@/domains/cms/lib/confirm";
import { cmsToast } from "@/domains/cms/lib/toast";
import type { DonationSubscriptionDetail } from "@/domains/cms/lib/types";
import {
  CmsBadge,
  CmsDetailCard,
  CmsDetailRow,
  CmsViewError,
  CmsViewHeader,
  CmsViewLoading,
  cmsErrorMessage,
  formatCmsDateTime,
} from "@/domains/cms/ui/CmsViewChrome";
import ReceiptEmailStatus from "../donors/ReceiptEmailStatus";
import {
  FREQUENCY_LABELS,
  STATUS_HELP,
  STATUS_LABELS,
  formatInr,
  isSubscriptionEnded,
  subscriptionTone,
} from "./subscription-labels";

type Action = "cancel" | "pause" | "resume" | "sync";

const ACTION_DONE: Record<Action, string> = {
  cancel: "Recurring donation cancelled",
  pause: "Recurring donation paused",
  resume: "Recurring donation resumed",
  sync: "Status refreshed from Razorpay",
};

export default function SubscriptionViewPage() {
  const params = useParams<{ id: string }>();
  const [sub, setSub] = useState<DonationSubscriptionDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<Action | null>(null);

  const load = useCallback(async () => {
    const res = await cmsApi.getDonationSubscription(params.id);
    setSub(res.data);
  }, [params.id]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    load()
      .catch((err) => {
        if (!cancelled) setError(cmsErrorMessage(err, "Failed to load recurring donation"));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [load]);

  async function run(action: Action) {
    if (!sub) return;
    if (action === "cancel") {
      const ok = await cmsConfirm({
        title: "Cancel this recurring donation?",
        description: `${sub.fullName} will not be charged ${formatInr(sub.amount)} again. This cannot be undone — the donor would have to sign up again.`,
        confirmLabel: "Cancel donation",
        cancelLabel: "Keep it",
        tone: "danger",
      });
      if (!ok) return;
    }
    if (action === "pause") {
      const ok = await cmsConfirm({
        title: "Pause this recurring donation?",
        description: "No charges will be taken until you resume it.",
        confirmLabel: "Pause",
      });
      if (!ok) return;
    }

    setBusy(action);
    try {
      await cmsApi.updateDonationSubscription(sub.id, action);
      await load();
      cmsToast.success(ACTION_DONE[action]);
    } catch (err) {
      cmsToast.error(cmsErrorMessage(err, "Razorpay did not accept the change"));
    } finally {
      setBusy(null);
    }
  }

  if (loading) return <CmsViewLoading label="Loading…" />;
  if (error || !sub) {
    return (
      <CmsViewError
        backHref="/admin/recurring-donations"
        message={error || "Recurring donation not found"}
      />
    );
  }

  const ended = isSubscriptionEnded(sub.status);
  const help = STATUS_HELP[sub.status];

  return (
    <div className="space-y-6">
      <CmsViewHeader
        backHref="/admin/recurring-donations"
        title={sub.fullName}
        badges={
          <CmsBadge tone={subscriptionTone(sub.status)}>
            {STATUS_LABELS[sub.status] ?? sub.status}
          </CmsBadge>
        }
        meta={`${formatInr(sub.amount)} ${FREQUENCY_LABELS[sub.frequency].toLowerCase()} · since ${formatCmsDateTime(sub.createdAt)}`}
        actions={
          <>
            <Button
              type="button"
              variant="outline"
              disabled={busy !== null}
              onClick={() => void run("sync")}
            >
              <RefreshCw className={`size-4 ${busy === "sync" ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            {!ended && sub.status === "paused" ? (
              <Button
                type="button"
                variant="outline"
                disabled={busy !== null}
                onClick={() => void run("resume")}
              >
                <Play className="size-4" />
                {busy === "resume" ? "Resuming…" : "Resume"}
              </Button>
            ) : null}
            {sub.status === "active" ? (
              <Button
                type="button"
                variant="outline"
                disabled={busy !== null}
                onClick={() => void run("pause")}
              >
                <Pause className="size-4" />
                {busy === "pause" ? "Pausing…" : "Pause"}
              </Button>
            ) : null}
            {!ended ? (
              <Button
                type="button"
                variant="destructive"
                disabled={busy !== null}
                onClick={() => void run("cancel")}
              >
                <Ban className="size-4" />
                {busy === "cancel" ? "Cancelling…" : "Cancel donation"}
              </Button>
            ) : null}
          </>
        }
      />

      {help ? (
        <p className="rounded-lg border border-cms-border bg-cms-surface px-4 py-3 text-sm text-cms-muted">
          {help}
        </p>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <CmsDetailCard title="Donor">
          <dl>
            <CmsDetailRow label="Email" value={sub.email} />
            <CmsDetailRow label="Phone" value={sub.phone} />
            <CmsDetailRow label="City" value={sub.city} />
            <CmsDetailRow label="PAN / Aadhaar" value={sub.pan} />
            <CmsDetailRow label="Category" value={sub.donationCategory || "General Funds"} />
            <CmsDetailRow
              label="Message"
              value={sub.message?.trim() || null}
            />
          </dl>
        </CmsDetailCard>

        <CmsDetailCard title="Schedule">
          <dl>
            <CmsDetailRow label="Amount" value={`${formatInr(sub.amount)} per charge`} />
            <CmsDetailRow label="Frequency" value={FREQUENCY_LABELS[sub.frequency]} />
            <CmsDetailRow
              label="Charges"
              value={`${sub.paidCount} paid of ${sub.totalCount} maximum`}
            />
            <CmsDetailRow
              label="Next charge"
              value={sub.nextChargeAt ? formatCmsDateTime(sub.nextChargeAt) : null}
            />
            {sub.endedAt ? (
              <CmsDetailRow label="Ended" value={formatCmsDateTime(sub.endedAt)} />
            ) : null}
            <CmsDetailRow
              label="Razorpay subscription"
              value={
                <span className="font-mono text-[13px]">{sub.razorpaySubscriptionId}</span>
              }
            />
            <CmsDetailRow
              label="Razorpay plan"
              value={<span className="font-mono text-[13px]">{sub.razorpayPlanId}</span>}
            />
          </dl>
        </CmsDetailCard>
      </div>

      <CmsDetailCard title={`Charges (${sub.charges.length})`}>
        {sub.charges.length === 0 ? (
          <p className="text-sm text-cms-muted">No charges recorded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Receipt</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Email</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sub.charges.map((charge) => (
                  <TableRow key={charge.id}>
                    <TableCell className="whitespace-nowrap">
                      <Link
                        href={`/admin/donations/${charge.id}`}
                        className="text-cms-primary underline-offset-2 hover:underline"
                      >
                        {formatCmsDateTime(charge.createdAt)}
                      </Link>
                    </TableCell>
                    <TableCell>{formatInr(charge.amount)}</TableCell>
                    <TableCell className="font-mono text-[13px]">
                      {charge.receiptNumber ?? "—"}
                    </TableCell>
                    <TableCell>
                      <CmsBadge tone={charge.status === "paid" ? "success" : "info"}>
                        {charge.status}
                      </CmsBadge>
                    </TableCell>
                    <TableCell>
                      <ReceiptEmailStatus {...charge} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CmsDetailCard>
    </div>
  );
}
