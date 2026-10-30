"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import Typography from "@/lib/Typography";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";
import { cmsApi } from "@/domains/cms/lib/api";
import type {
  DonationFrequency,
  DonationSubscription,
  SubscriptionStatus,
} from "@/domains/cms/lib/types";
import { CmsBadge, cmsErrorMessage } from "@/domains/cms/ui/CmsViewChrome";
import { CmsPagination, type PaginationMeta } from "@/domains/cms/ui/CmsPagination";
import CmsSearchInput from "@/domains/cms/ui/CmsSearchInput";
import CmsSelect from "@/domains/cms/ui/CmsSelect";
import {
  FREQUENCY_FILTER_OPTIONS,
  FREQUENCY_LABELS,
  STATUS_LABELS,
  SUBSCRIPTION_STATUS_FILTER_OPTIONS,
  formatInr,
  subscriptionTone,
} from "./subscription-labels";

const PAGE_SIZE = 10;

const emptyMeta: PaginationMeta = {
  total: 0,
  page: 1,
  limit: PAGE_SIZE,
  totalPages: 1,
};

export default function SubscriptionsListPage() {
  const [rows, setRows] = useState<DonationSubscription[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>(emptyMeta);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<SubscriptionStatus | "">("");
  const [frequency, setFrequency] = useState<DonationFrequency | "">("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await cmsApi.listDonationSubscriptions({
        page,
        limit: PAGE_SIZE,
        search: search || undefined,
        status: status || undefined,
        frequency: frequency || undefined,
      });
      setRows(res.data ?? []);
      setMeta(res.meta ?? emptyMeta);
    } catch (err) {
      setError(cmsErrorMessage(err, "Failed to load recurring donations"));
    } finally {
      setLoading(false);
    }
  }, [page, search, status, frequency]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="space-y-5">
      <Typography variant="label-1" as="p" className="max-w-xl text-cms-muted">
        Monthly, quarterly and yearly donations charged automatically by
        Razorpay. Each successful charge also appears under Donations.
      </Typography>

      {error ? (
        <Typography
          variant="label-1"
          as="div"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700"
        >
          {error}
        </Typography>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Recurring Donations</CardTitle>
          <CardDescription>
            {loading
              ? "Loading…"
              : `${meta.total} total · page ${meta.page} of ${meta.totalPages}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-col gap-3 sm:flex-row">
            <CmsSearchInput
              placeholder="Search name / email / phone…"
              value={search}
              onDebouncedChange={(next) => {
                setPage(1);
                setSearch(next);
              }}
            />
            <CmsSelect
              size="sm"
              className="sm:w-48"
              value={status}
              options={SUBSCRIPTION_STATUS_FILTER_OPTIONS}
              onChange={(next) => {
                setPage(1);
                setStatus(next as SubscriptionStatus | "");
              }}
            />
            <CmsSelect
              size="sm"
              className="sm:w-44"
              value={frequency}
              options={FREQUENCY_FILTER_OPTIONS}
              onChange={(next) => {
                setPage(1);
                setFrequency(next as DonationFrequency | "");
              }}
            />
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Frequency</TableHead>
                  <TableHead>Charges</TableHead>
                  <TableHead>Next charge</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Started</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-cms-muted">
                      {loading ? "Loading…" : "No recurring donations yet."}
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.map((sub) => (
                    <TableRow key={sub.id}>
                      <TableCell className="font-medium">
                        <Link
                          href={`/admin/recurring-donations/${sub.id}`}
                          className="text-cms-primary underline-offset-2 hover:underline"
                        >
                          {sub.fullName}
                        </Link>
                        {sub.email ? (
                          <span className="block text-xs font-normal text-cms-muted">
                            {sub.email}
                          </span>
                        ) : null}
                      </TableCell>
                      <TableCell>{formatInr(sub.amount)}</TableCell>
                      <TableCell>{FREQUENCY_LABELS[sub.frequency]}</TableCell>
                      <TableCell className="whitespace-nowrap">
                        {sub.paidCount} / {sub.totalCount}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-cms-muted">
                        {sub.nextChargeAt
                          ? new Date(sub.nextChargeAt).toLocaleDateString("en-IN")
                          : "—"}
                      </TableCell>
                      <TableCell>
                        <CmsBadge tone={subscriptionTone(sub.status)}>
                          {STATUS_LABELS[sub.status] ?? sub.status}
                        </CmsBadge>
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-cms-muted">
                        {new Date(sub.createdAt).toLocaleDateString("en-IN")}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <CmsPagination meta={meta} onPageChange={setPage} />
        </CardContent>
      </Card>
    </div>
  );
}
