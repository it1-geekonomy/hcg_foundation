"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Eye, Pencil, RotateCcw, Trash2 } from "lucide-react";
import { Button } from "@/shared/ui/button";
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
import { cmsConfirm } from "@/domains/cms/lib/confirm";
import { cmsToast } from "@/domains/cms/lib/toast";
import type {
  InquiryStatus,
  PartnershipInquiry,
} from "@/domains/cms/lib/types";
import { CmsPagination, type PaginationMeta } from "./CmsPagination";
import CmsSearchInput from "./CmsSearchInput";
import CmsSelect, { INQUIRY_STATUS_FILTER_OPTIONS } from "./CmsSelect";

const PAGE_SIZE = 20;
type ListTab = "active" | "deleted";

const emptyMeta: PaginationMeta = {
  total: 0,
  page: 1,
  limit: PAGE_SIZE,
  totalPages: 1,
};

function formatDeletedAt(value?: string | null) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function PartnershipInquiriesListPage() {
  const [tab, setTab] = useState<ListTab>("active");
  const [rows, setRows] = useState<PartnershipInquiry[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>(emptyMeta);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<InquiryStatus | "">("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [restoringId, setRestoringId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res =
        tab === "deleted"
          ? await cmsApi.listDeletedPartnershipInquiries({
              page,
              limit: PAGE_SIZE,
              search: search || undefined,
            })
          : await cmsApi.listPartnershipInquiries({
              page,
              limit: PAGE_SIZE,
              search: search || undefined,
              status: statusFilter || undefined,
            });
      setRows(res.data ?? []);
      setMeta(res.meta ?? emptyMeta);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load inquiries";
      setError(message);
      cmsToast.error(message);
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter, tab]);

  useEffect(() => {
    void load();
  }, [load]);

  const switchTab = (next: ListTab) => {
    if (next === tab) return;
    setTab(next);
    setPage(1);
    setSearch("");
    setStatusFilter("");
  };

  const onDelete = async (id: string, name: string) => {
    const ok = await cmsConfirm({
      title: "Move to Recently Deleted?",
      description: `“${name}” will be soft-deleted. You can restore it later.`,
      confirmLabel: "Move to deleted",
      tone: "danger",
    });
    if (!ok) return;
    try {
      const res = await cmsApi.deletePartnershipInquiry(id);
      cmsToast.success(res?.message || "Inquiry deleted successfully");
      await load();
    } catch (err) {
      cmsToast.error(err instanceof Error ? err.message : "Failed to delete");
    }
  };

  const onRestore = async (id: string, name: string) => {
    const ok = await cmsConfirm({
      title: "Restore inquiry?",
      description: `“${name}” will be restored to All inquiries.`,
      confirmLabel: "Restore",
    });
    if (!ok) return;
    setRestoringId(id);
    try {
      const res = await cmsApi.restorePartnershipInquiry(id);
      cmsToast.success(res.message || "Inquiry restored successfully");
      await load();
    } catch (err) {
      cmsToast.error(err instanceof Error ? err.message : "Failed to restore");
    } finally {
      setRestoringId(null);
    }
  };

  return (
    <div className="space-y-6">
      <p className="max-w-xl font-manrope text-sm text-muted-foreground">
        Partnership inquiry forms submitted from the website.
      </p>

      <div className="inline-flex rounded-xl bg-white p-1 ring-1 ring-black/5">
        <button
          type="button"
          onClick={() => switchTab("active")}
          className={`rounded-lg px-3.5 py-1.5 font-manrope text-sm font-medium transition ${
            tab === "active"
              ? "bg-[#C45A7A] text-white"
              : "text-[#5C5C5C] hover:text-[#212121]"
          }`}
        >
          All inquiries
        </button>
        <button
          type="button"
          onClick={() => switchTab("deleted")}
          className={`rounded-lg px-3.5 py-1.5 font-manrope text-sm font-medium transition ${
            tab === "deleted"
              ? "bg-[#C45A7A] text-white"
              : "text-[#5C5C5C] hover:text-[#212121]"
          }`}
        >
          Recently deleted
        </button>
      </div>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 font-manrope text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>
            {tab === "deleted" ? "Recently deleted" : "All inquiries"}
          </CardTitle>
          <CardDescription>
            {loading
              ? "Loading…"
              : `${meta.total} total · page ${meta.page} of ${meta.totalPages}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-col gap-2 sm:flex-row">
            <CmsSearchInput
              placeholder="Search name / email / phone / org…"
              value={search}
              onDebouncedChange={(next) => {
                setPage(1);
                setSearch(next);
              }}
              className="sm:flex-1"
            />
            {tab === "active" ? (
              <CmsSelect
                size="sm"
                className="sm:w-44"
                value={statusFilter}
                options={INQUIRY_STATUS_FILTER_OPTIONS}
                onChange={(next) => {
                  setPage(1);
                  setStatusFilter(next as InquiryStatus | "");
                }}
              />
            ) : null}
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Organization</TableHead>
                  <TableHead>Contact</TableHead>
                  {tab === "deleted" ? (
                    <TableHead>Deleted at</TableHead>
                  ) : (
                    <TableHead>Status</TableHead>
                  )}
                  <TableHead>Submitted</TableHead>
                  <TableHead className="w-40 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-muted-foreground">
                      {tab === "deleted"
                        ? "No deleted inquiries."
                        : "No partnership inquiries yet."}
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell>
                        <Link
                          href={`/admin/partnership-inquiries/${row.id}`}
                          className="font-medium text-[#9A7B00] underline-offset-2 hover:underline"
                        >
                          {row.fullName}
                        </Link>
                      </TableCell>
                      <TableCell>{row.organizationName || "—"}</TableCell>
                      <TableCell>
                        <p className="font-manrope text-sm">{row.email}</p>
                        <p className="font-manrope text-xs text-[#8A8A8A]">
                          {row.phoneNumber}
                        </p>
                      </TableCell>
                      <TableCell>
                        {tab === "deleted" ? (
                          <span className="font-manrope text-xs text-[#5C5C5C]">
                            {formatDeletedAt(row.deletedAt)}
                          </span>
                        ) : (
                          <span className="rounded-full bg-[#F4F4F4] px-2 py-0.5 text-xs capitalize text-[#5C5C5C]">
                            {row.status.replace("_", " ")}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-muted-foreground">
                        {new Date(row.createdAt).toLocaleDateString("en-IN")}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-0.5">
                          {tab === "deleted" ? (
                            <>
                              <Link
                                href={`/admin/partnership-inquiries/${row.id}`}
                                className="inline-flex size-7 items-center justify-center rounded-lg text-[#5C5C5C] transition hover:bg-muted hover:text-[#212121]"
                                aria-label={`View ${row.fullName}`}
                              >
                                <Eye className="size-4" />
                              </Link>
                              <Button
                                type="button"
                                variant="outline"
                                className="h-8 gap-1.5 border-black/10 bg-white px-2.5 font-manrope text-xs"
                                disabled={restoringId === row.id}
                                onClick={() =>
                                  void onRestore(row.id, row.fullName)
                                }
                              >
                                <RotateCcw className="size-3.5" />
                                {restoringId === row.id
                                  ? "Restoring…"
                                  : "Restore"}
                              </Button>
                            </>
                          ) : (
                            <>
                              <Link
                                href={`/admin/partnership-inquiries/${row.id}`}
                                className="inline-flex size-7 items-center justify-center rounded-lg text-[#5C5C5C] transition hover:bg-muted hover:text-[#212121]"
                                aria-label={`View ${row.fullName}`}
                              >
                                <Eye className="size-4" />
                              </Link>
                              <Link
                                href={`/admin/partnership-inquiries/${row.id}/edit`}
                                className="inline-flex size-7 items-center justify-center rounded-lg text-[#5C5C5C] transition hover:bg-muted hover:text-[#212121]"
                                aria-label={`Edit ${row.fullName}`}
                              >
                                <Pencil className="size-4" />
                              </Link>
                              <button
                                type="button"
                                className="inline-flex size-7 items-center justify-center rounded-lg text-[#5C5C5C] transition hover:bg-red-50 hover:text-red-600"
                                aria-label={`Delete ${row.fullName}`}
                                onClick={() =>
                                  void onDelete(row.id, row.fullName)
                                }
                              >
                                <Trash2 className="size-4" />
                              </button>
                            </>
                          )}
                        </div>
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
