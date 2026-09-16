"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Plus, RotateCcw } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { cmsApi } from "@/domains/cms/lib/api";
import type { AnnualReport, ContentStatus } from "@/domains/cms/lib/types";
import { cmsToast } from "@/domains/cms/lib/toast";
import { cmsConfirm } from "@/domains/cms/lib/confirm";
import AnnualReportCoverTile from "./AnnualReportCoverTile";
import { CmsPagination, type PaginationMeta } from "./CmsPagination";
import CmsSelect, { CONTENT_STATUS_FILTER_OPTIONS } from "./CmsSelect";

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

export default function AnnualReportsListPage() {
  const [tab, setTab] = useState<ListTab>("active");
  const [reports, setReports] = useState<AnnualReport[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>(emptyMeta);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ContentStatus | "">("");
  const [loading, setLoading] = useState(true);
  const [restoringId, setRestoringId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res =
        tab === "deleted"
          ? await cmsApi.listDeletedAnnualReports({
              page,
              limit: PAGE_SIZE,
              search: search || undefined,
            })
          : await cmsApi.listAnnualReports({
              page,
              limit: PAGE_SIZE,
              search: search || undefined,
              status: statusFilter || undefined,
            });
      setReports(res.data ?? []);
      setMeta(res.meta ?? emptyMeta);
    } catch (err) {
      cmsToast.error(
        err instanceof Error ? err.message : "Failed to load annual reports"
      );
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

  const onDelete = async (report: AnnualReport) => {
    const ok = await cmsConfirm({
      title: "Move to Recently Deleted?",
      description: `“${report.title}” will be soft-deleted. You can restore it later from Recently Deleted.`,
      confirmLabel: "Move to deleted",
      tone: "danger",
    });
    if (!ok) return;
    try {
      const res = await cmsApi.deleteAnnualReport(report.id);
      cmsToast.success(res?.message || "Annual report deleted successfully");
      await load();
    } catch (err) {
      cmsToast.error(
        err instanceof Error ? err.message : "Failed to delete"
      );
    }
  };

  const onRestore = async (report: AnnualReport) => {
    const ok = await cmsConfirm({
      title: "Restore annual report?",
      description: `“${report.title}” will be restored and show again in All reports.`,
      confirmLabel: "Restore",
    });
    if (!ok) return;
    setRestoringId(report.id);
    try {
      const res = await cmsApi.restoreAnnualReport(report.id);
      cmsToast.success(res.message || "Annual report restored successfully");
      await load();
    } catch (err) {
      cmsToast.error(
        err instanceof Error ? err.message : "Failed to restore"
      );
    } finally {
      setRestoringId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <p className="max-w-xl font-manrope text-sm text-[#5C5C5C]">
          Soft-deleted reports stay in Recently Deleted until you restore them.
        </p>
        <Link
          href="/admin/annual-reports/new"
          className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-[#C45A7A] px-4 font-manrope text-sm font-semibold text-white transition hover:bg-[#b04e6c]"
        >
          <Plus className="size-4" />
          Add report
        </Link>
      </div>

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
          All reports
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
        {tab === "active" ? (
          <CmsSelect
            size="sm"
            className="h-10 sm:w-44"
            value={statusFilter}
            options={CONTENT_STATUS_FILTER_OPTIONS}
            onChange={(next) => {
              setPage(1);
              setStatusFilter(next as ContentStatus | "");
            }}
          />
        ) : null}
        <p className="font-manrope text-xs text-muted-foreground sm:ml-auto">
          {loading
            ? "Loading…"
            : `${meta.total} ${tab === "deleted" ? "deleted" : "reports"} · page ${meta.page} of ${meta.totalPages}`}
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
            {tab === "deleted" ? (
              "No deleted reports."
            ) : (
              <>
                No annual reports yet.{" "}
                <Link
                  href="/admin/annual-reports/new"
                  className="font-medium text-[#9A7B00] underline-offset-2 hover:underline"
                >
                  Create one
                </Link>
              </>
            )}
          </p>
        </div>
      ) : tab === "deleted" ? (
        <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-black/[0.04]">
          <div className="divide-y divide-black/[0.04]">
            {reports.map((report) => (
              <div
                key={report.id}
                className="flex flex-wrap items-center gap-3 px-4 py-3 sm:px-5"
              >
                <div className="size-12 shrink-0 overflow-hidden rounded-lg bg-[#F0EEE9] ring-1 ring-black/5">
                  {report.annualReportBanner ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={report.annualReportBanner}
                      alt=""
                      className="h-full w-full object-contain p-1"
                    />
                  ) : null}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-manrope text-sm font-semibold text-[#212121]">
                    {report.title}
                  </p>
                  <p className="font-manrope text-xs text-[#8A8A8A]">
                    Deleted {formatDeletedAt(report.deletedAt)}
                    {report.reportYear ? ` · ${report.reportYear}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/admin/annual-reports/${report.id}`}
                    className="inline-flex h-8 items-center rounded-md border border-black/10 px-2.5 font-manrope text-xs font-medium text-[#212121] transition hover:bg-[#F7F7F5]"
                  >
                    View
                  </Link>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-8 gap-1.5 border-black/10 bg-white px-2.5 font-manrope text-xs font-medium text-[#212121] hover:bg-[#F0F0EC] hover:text-[#212121]"
                    disabled={restoringId === report.id}
                    aria-label={`Restore ${report.title}`}
                    onClick={() => void onRestore(report)}
                  >
                    <RotateCcw className="size-3.5" />
                    {restoringId === report.id ? "Restoring…" : "Restore"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
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
