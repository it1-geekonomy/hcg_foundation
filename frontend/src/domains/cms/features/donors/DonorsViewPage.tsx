"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { cmsApi } from "@/domains/cms/lib/api";
import type { Donor } from "@/domains/cms/lib/types";
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
import ReceiptEmailStatus from "./ReceiptEmailStatus";

function statusTone(status?: string) {
  if (status === "paid") return "success" as const;
  if (status === "failed") return "danger" as const;
  if (status === "refunded") return "info" as const;
  return "status" as const;
}

export default function DonorsViewPage() {
  const params = useParams<{ id: string }>();
  const [donor, setDonor] = useState<Donor | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await cmsApi.getDonor(params.id);
        if (!cancelled) setDonor(res.data);
      } catch (err) {
        if (!cancelled) {
          setError(cmsErrorMessage(err, "Failed to load donor"));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [params.id]);

  if (loading) return <CmsViewLoading label="Loading…" />;
  if (error || !donor) {
    return (
      <CmsViewError
        backHref="/admin/donations"
        message={error || "Donor not found"}
      />
    );
  }

  return (
    <div className="space-y-6">
      <CmsViewHeader
        backHref="/admin/donations"
        title={donor.fullName}
        badges={<CmsBadge tone={statusTone(donor.status)}>{donor.status}</CmsBadge>}
        meta={`${donor.currency} ${donor.amount} · ${formatCmsDateTime(donor.createdAt)}`}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <CmsDetailCard title="Donor">
          <dl>
            <CmsDetailRow label="Email" value={donor.email} />
            <CmsDetailRow label="Phone" value={donor.phone} />
            <CmsDetailRow label="City" value={donor.city} />
            <CmsDetailRow
              label="Country"
              value={
                donor.countryCode
                  ? `${donor.country || "—"} (${donor.countryCode})`
                  : donor.country || "India"
              }
            />
            <CmsDetailRow
              label="Donor type"
              value={donor.isInternational ? "International" : "India"}
            />
            <CmsDetailRow label="PAN / Aadhaar" value={donor.pan} />
          </dl>
        </CmsDetailCard>

        <CmsDetailCard title="Payment">
          <dl>
            <CmsDetailRow label="Amount" value={`${donor.currency} ${donor.amount}`} />
            <CmsDetailRow
              label="Category"
              value={donor.donationCategory || "General Funds"}
            />
            <CmsDetailRow
              label="Status"
              value={<span className="capitalize">{donor.status}</span>}
            />
            <CmsDetailRow label="Receipt" value={donor.receiptNumber} />
            <CmsDetailRow label="Receipt email" value={<ReceiptEmailStatus {...donor} />} />
            {donor.receiptEmailError && donor.receiptEmailStatus !== "sent" ? (
              <CmsDetailRow label="Email note" value={donor.receiptEmailError} />
            ) : null}
            <CmsDetailRow
              label="Razorpay order"
              value={
                donor.razorpayOrderId ? (
                  <span className="font-mono text-[13px]">{donor.razorpayOrderId}</span>
                ) : null
              }
            />
            <CmsDetailRow
              label="Razorpay payment"
              value={
                donor.razorpayPaymentId ? (
                  <span className="font-mono text-[13px]">{donor.razorpayPaymentId}</span>
                ) : null
              }
            />
            <CmsDetailRow label="Created" value={formatCmsDateTime(donor.createdAt)} />
          </dl>
        </CmsDetailCard>
      </div>

      <CmsDetailCard title="Message">
        <p className="text-sm whitespace-pre-wrap text-cms-ink">
          {donor.message?.trim() || (
            <span className="text-cms-faint">No message provided.</span>
          )}
        </p>
      </CmsDetailCard>
    </div>
  );
}
