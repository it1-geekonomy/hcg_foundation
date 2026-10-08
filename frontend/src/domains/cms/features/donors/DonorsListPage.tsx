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
  DonationCategory,
  DonationStatus,
  Donor,
  ReceiptEmailStatus as ReceiptEmailStatusValue,
} from "@/domains/cms/lib/types";
import ReceiptEmailStatus from "./ReceiptEmailStatus";
import { cmsErrorMessage } from "@/domains/cms/ui/CmsViewChrome";
import { CmsPagination, type PaginationMeta } from "@/domains/cms/ui/CmsPagination";
import CmsSearchInput from "@/domains/cms/ui/CmsSearchInput";
import CmsSelect, {
  DONATION_CATEGORY_FILTER_OPTIONS,
  DONATION_STATUS_OPTIONS,
  RECEIPT_EMAIL_STATUS_FILTER_OPTIONS,
} from "@/domains/cms/ui/CmsSelect";

const PAGE_SIZE = 10;

const emptyMeta: PaginationMeta = {
  total: 0,
  page: 1,
  limit: PAGE_SIZE,
  totalPages: 1,
};

function formatAmount(amount: string, currency: string) {
  const n = Number(amount);
  if (Number.isNaN(n)) return `${currency} ${amount}`;
  return `${currency} ${n.toLocaleString("en-IN")}`;
}

export default function DonorsListPage() {
  const [donors, setDonors] = useState<Donor[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>(emptyMeta);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<DonationStatus | "">("paid");
  const [category, setCategory] = useState<DonationCategory | "">("");
  const [emailStatus, setEmailStatus] = useState<ReceiptEmailStatusValue | "">("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await cmsApi.listDonors({
        page,
        limit: PAGE_SIZE,
        search: search || undefined,
        status: status || undefined,
        donationCategory: category || undefined,
        receiptEmailStatus: emailStatus || undefined,
      });
      setDonors(res.data ?? []);
      setMeta(res.meta ?? emptyMeta);
    } catch (err) {
      setError(cmsErrorMessage(err, "Failed to load donors"));
    } finally {
      setLoading(false);
    }
  }, [page, search, status, category, emailStatus]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="space-y-5">
      <Typography
        variant="label-1"
        as="p"
        className="max-w-xl text-cms-muted"
      >
        Website donations that completed payment.
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
          <CardTitle>Donations</CardTitle>
          <CardDescription>
            {loading
              ? "Loading…"
              : `${meta.total} total · page ${meta.page} of ${meta.totalPages}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-col gap-3 sm:flex-row">
            <CmsSearchInput
              placeholder="Search name / email / phone / country…"
              value={search}
              onDebouncedChange={(next) => {
                setPage(1);
                setSearch(next);
              }}
            />
            <CmsSelect
              size="sm"
              className="sm:w-40"
              value={status}
              options={DONATION_STATUS_OPTIONS}
              onChange={(next) => {
                setPage(1);
                setStatus(next as DonationStatus | "");
              }}
            />
            <CmsSelect
              size="sm"
              className="sm:w-56"
              value={category}
              options={DONATION_CATEGORY_FILTER_OPTIONS}
              onChange={(next) => {
                setPage(1);
                setCategory(next as DonationCategory | "");
              }}
            />
            <CmsSelect
              size="sm"
              className="sm:w-40"
              value={emailStatus}
              options={RECEIPT_EMAIL_STATUS_FILTER_OPTIONS}
              onChange={(next) => {
                setPage(1);
                setEmailStatus(next as ReceiptEmailStatusValue | "");
              }}
            />
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Country</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {donors.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-cms-muted">
                      No donations yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  donors.map((donor) => (
                    <TableRow key={donor.id}>
                      <TableCell className="font-medium">
                        <Link
                          href={`/admin/donations/${donor.id}`}
                          className="text-cms-primary underline-offset-2 hover:underline"
                        >
                          {donor.fullName}
                        </Link>
                      </TableCell>
                      <TableCell>
                        {formatAmount(donor.amount, donor.currency)}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {donor.donationCategory || "General Funds"}
                      </TableCell>
                      <TableCell>
                        <span className="block">
                          {donor.country?.trim() || "India"}
                        </span>
                        {donor.isInternational ? (
                          <Typography
                            variant="caption-1"
                            as="span"
                            className="text-cms-primary"
                          >
                            International
                          </Typography>
                        ) : null}
                      </TableCell>
                      <TableCell className="capitalize">{donor.status}</TableCell>
                      <TableCell>
                        <ReceiptEmailStatus {...donor} />
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-cms-muted">
                        {new Date(donor.createdAt).toLocaleDateString("en-IN")}
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
