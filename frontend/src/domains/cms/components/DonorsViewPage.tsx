"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import { cmsApi } from "@/domains/cms/lib/api";
import type { Donor } from "@/domains/cms/lib/types";

function Row({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="grid gap-1 border-b border-border/60 py-3 sm:grid-cols-[160px_1fr]">
      <p className="font-manrope text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="font-manrope text-sm text-foreground">{value || "—"}</p>
    </div>
  );
}

export default function DonorsViewPage() {
  const params = useParams<{ id: string }>();
  const [donor, setDonor] = useState<Donor | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await cmsApi.getDonor(params.id);
        if (!cancelled) setDonor(res.data);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load donor");
        }
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [params.id]);

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 font-manrope text-sm text-red-700">
        {error}
      </div>
    );
  }

  if (!donor) {
    return <p className="font-manrope text-sm text-muted-foreground">Loading…</p>;
  }

  return (
    <div className="space-y-5">
      <Link
        href="/admin/donations"
        className="inline-flex items-center gap-1.5 font-manrope text-sm text-[#9A7B00] hover:underline"
      >
        <ArrowLeft className="size-4" />
        Back to donations
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>{donor.fullName}</CardTitle>
          <CardDescription className="capitalize">{donor.status}</CardDescription>
        </CardHeader>
        <CardContent>
          <Row label="Amount" value={`${donor.currency} ${donor.amount}`} />
          <Row label="Email" value={donor.email} />
          <Row label="Phone" value={donor.phone} />
          <Row label="City" value={donor.city} />
          <Row label="Country" value={donor.country || "India"} />
          <Row
            label="Donor type"
            value={donor.isInternational ? "International" : "India"}
          />
          <Row label="PAN / Aadhaar" value={donor.pan} />
          <Row label="Receipt" value={donor.receiptNumber} />
          <Row label="Razorpay order" value={donor.razorpayOrderId} />
          <Row label="Razorpay payment" value={donor.razorpayPaymentId} />
          <Row label="Message" value={donor.message} />
          <Row
            label="Created"
            value={new Date(donor.createdAt).toLocaleString("en-IN")}
          />
        </CardContent>
      </Card>
    </div>
  );
}
