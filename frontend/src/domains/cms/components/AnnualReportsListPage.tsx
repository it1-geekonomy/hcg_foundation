"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { Input } from "@/shared/ui/input";
import { cmsApi } from "@/domains/cms/lib/api";
import type { AnnualReport, ContentStatus } from "@/domains/cms/lib/types";
import AnnualReportCoverTile from "./AnnualReportCoverTile";
import { CmsPagination, type PaginationMeta } from "./CmsPagination";

const PAGE_SIZE = 12;

const emptyMeta: PaginationMeta = {
  total: 0,
  page: 1,
  limit: PAGE_SIZE,
  totalPages: 1,
};

export default function AnnualReportsListPage() {
  const [reports, setReports] = useState<AnnualReport[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>(emptyMeta);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ContentStatus | "">("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await cmsApi.listAnnualReports({
        page,
        limit: PAGE_SIZE,
        search: search || undefined,
        status: statusFilter || undefined,
      });
      setReports(res.data ?? []);
      setMeta(res.meta ?? emptyMeta);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load annual reports"
      );
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => {
    void load();
  }, [load]);

  const onDelete = async (report: AnnualReport) => {
    if (
      !window.confirm(
        `Delete “${report.title}”? This also removes R2 files.`
      )
    )
      return;
    setError(null);
    try {
      await cmsApi.deleteAnnualReport(report.id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <p className="max-w-xl font-manrope text-sm text-[#5C5C5C]">
          Browse by cover — same layout idea as before, with PDF and edit on
          hover. Files are stored on R2.
        </p>
        <Link
          href="/admin/annual-reports/new"
          className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-[#C45A7A] px-4 font-manrope text-sm font-semibold text-white transition hover:bg-[#b04e6c]"
        >
          <Plus className="size-4" />
          Add report
        </Link>
      </div>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 font-manrope text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <Input
          placeholder="Search title / year…"
          value={search}
          onChange={(e) => {
            setPage(1);
            setSearch(e.target.value);
          }}
          className="h-10 bg-white sm:max-w-sm sm:flex-1"
        />
        <select
          className="h-10 rounded-lg border border-input bg-white px-2.5 text-sm outline-none"
          value={statusFilter}
          onChange={(e) => {
            setPage(1);
            setStatusFilter(e.target.value as ContentStatus | "");
          }}
        >
          <option value="">All statuses</option>
          <option value="draft">draft</option>
          <option value="published">published</option>
          <option value="archived">archived</option>
        </select>
        <p className="font-manrope text-xs text-muted-foreground sm:ml-auto">
          {loading
            ? "Loading…"
            : `${meta.total} reports · page ${meta.page} of ${meta.totalPages}`}
        </p>
      </div>

      {loading && reports.length === 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="h-56 animate-pulse rounded-xl bg-white/80 ring-1 ring-black/[0.04]"
            />
          ))}
        </div>
      ) : reports.length === 0 ? (
        <div className="rounded-2xl bg-white px-6 py-16 text-center ring-1 ring-black/[0.04]">
          <p className="font-manrope text-sm text-muted-foreground">
            No annual reports yet.{" "}
            <Link
              href="/admin/annual-reports/new"
              className="font-medium text-[#9A7B00] underline-offset-2 hover:underline"
            >
              Create one
            </Link>
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
          {reports.map((report) => (
            <AnnualReportCoverTile
              key={report.id}
              report={report}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}

      <CmsPagination meta={meta} onPageChange={setPage} />
    </div>
  );
}
