"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Eye, Pencil, Plus, RotateCcw, Trash2 } from "lucide-react";
import Typography from "@/lib/Typography";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
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
import type { HomeBanner } from "@/domains/cms/lib/types";
import { CmsPagination, type PaginationMeta } from "./CmsPagination";
import CmsSearchInput from "./CmsSearchInput";
import CmsSelect, { ACTIVE_STATUS_FILTER_OPTIONS } from "./CmsSelect";

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

export default function HomeBannersListPage() {
  const [tab, setTab] = useState<ListTab>("active");
  const [banners, setBanners] = useState<HomeBanner[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>(emptyMeta);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<"" | "true" | "false">("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [restoringId, setRestoringId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res =
        tab === "deleted"
          ? await cmsApi.listDeletedHomeBanners({
              page,
              limit: PAGE_SIZE,
              search: search || undefined,
            })
          : await cmsApi.listHomeBanners({
              page,
              limit: PAGE_SIZE,
              search: search || undefined,
            });
      setBanners(res.data ?? []);
      setMeta(res.meta ?? emptyMeta);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load home banners";
      setError(message);
      cmsToast.error(message);
    } finally {
      setLoading(false);
    }
  }, [page, search, tab]);

  useEffect(() => {
    void load();
  }, [load]);

  const visibleBanners = useMemo(() => {
    if (tab === "deleted" || !activeFilter) return banners;
    const wantActive = activeFilter === "true";
    return banners.filter((b) => b.isActive === wantActive);
  }, [activeFilter, banners, tab]);

  const switchTab = (next: ListTab) => {
    if (next === tab) return;
    setTab(next);
    setPage(1);
    setSearch("");
    setActiveFilter("");
  };

  const onDelete = async (id: string, title: string) => {
    const ok = await cmsConfirm({
      title: "Move to Recently Deleted?",
      description: `“${title}” will be soft-deleted. You can restore it later from Recently Deleted.`,
      confirmLabel: "Move to deleted",
      tone: "danger",
    });
    if (!ok) return;
    try {
      const res = await cmsApi.deleteHomeBanner(id);
      cmsToast.success(res?.message || "Home banner deleted successfully");
      await load();
    } catch (err) {
      cmsToast.error(
        err instanceof Error ? err.message : "Failed to delete"
      );
    }
  };

  const onRestore = async (id: string, title: string) => {
    const ok = await cmsConfirm({
      title: "Restore home banner?",
      description: `“${title}” will be restored and show again in All banners.`,
      confirmLabel: "Restore",
    });
    if (!ok) return;
    setRestoringId(id);
    try {
      const res = await cmsApi.restoreHomeBanner(id);
      cmsToast.success(res.message || "Home banner restored successfully");
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
        <Typography
          variant="label-1"
          as="p"
          className="max-w-xl text-muted-foreground"
        >
          Manage homepage banners. Soft-deleted items stay in Recently Deleted
          until you restore them.
        </Typography>

        <Link
          href="/admin/home-banners/new"
          className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-[#C45A7A] px-4 text-white transition hover:bg-[#b04e6c]"
        >
          <Plus className="size-4" />
          <Typography variant="button-3" as="span">
            Add banner
          </Typography>
        </Link>
      </div>

      <div className="inline-flex rounded-xl bg-white p-1 ring-1 ring-black/5">
        <button
          type="button"
          onClick={() => switchTab("active")}
          className={`rounded-lg px-3.5 py-1.5 font-medium transition ${
            tab === "active"
              ? "bg-[#C45A7A] text-white"
              : "text-[#5C5C5C] hover:text-[#212121]"
          }`}
        >
          <Typography variant="label-1" as="span">
            All banners
          </Typography>
        </button>
        <button
          type="button"
          onClick={() => switchTab("deleted")}
          className={`rounded-lg px-3.5 py-1.5 font-medium transition ${
            tab === "deleted"
              ? "bg-[#C45A7A] text-white"
              : "text-[#5C5C5C] hover:text-[#212121]"
          }`}
        >
          <Typography variant="label-1" as="span">
            Recently deleted
          </Typography>
        </button>
      </div>

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
          <CardTitle>
            {tab === "deleted" ? "Recently deleted" : "All banners"}
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
              placeholder="Search name / title…"
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
                value={activeFilter}
                options={ACTIVE_STATUS_FILTER_OPTIONS}
                onChange={(next) =>
                  setActiveFilter(next as "" | "true" | "false")
                }
              />
            ) : null}
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-14">Image</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Order</TableHead>
                {tab === "deleted" ? (
                  <TableHead>Deleted at</TableHead>
                ) : (
                  <TableHead>Visibility</TableHead>
                )}
                <TableHead className="w-40 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibleBanners.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-muted-foreground">
                    {tab === "deleted" ? (
                      "No deleted banners."
                    ) : (
                      <>
                        No banners yet.{" "}
                        <Link
                          href="/admin/home-banners/new"
                          className="font-medium text-[#9A7B00] underline-offset-2 hover:underline"
                        >
                          Create one
                        </Link>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ) : (
                visibleBanners.map((banner) => (
                  <TableRow key={banner.id}>
                    <TableCell>
                      {banner.bannerImageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={banner.bannerImageUrl}
                          alt=""
                          className="size-10 rounded-lg object-contain ring-1 ring-black/5"
                        />
                      ) : (
                        <div className="size-10 rounded-lg bg-[#F0EEE9] ring-1 ring-black/5" />
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{banner.title}</div>
                      <Typography
                        variant="caption-1"
                        as="div"
                        className="text-[#8A8A8A]"
                      >
                        {banner.name}
                      </Typography>
                    </TableCell>
                    <TableCell>{banner.displayOrder}</TableCell>
                    <TableCell>
                      {tab === "deleted" ? (
                        <Typography
                          variant="caption-1"
                          as="span"
                          className="text-[#5C5C5C]"
                        >
                          {formatDeletedAt(banner.deletedAt)}
                        </Typography>
                      ) : (
                        <Typography
                          variant="caption-1"
                          as="span"
                          className={`rounded-full px-2 py-0.5 ${
                            banner.isActive
                              ? "bg-[#E8F6EC] text-[#1B6B3A]"
                              : "bg-[#F4F4F4] text-[#5C5C5C]"
                          }`}
                        >
                          {banner.isActive ? "Active" : "Inactive"}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-0.5">
                        {tab === "deleted" ? (
                          <>
                            <Link
                              href={`/admin/home-banners/${banner.id}`}
                              className="inline-flex size-7 items-center justify-center rounded-lg text-[#5C5C5C] transition hover:bg-muted hover:text-[#212121]"
                              aria-label={`View ${banner.title}`}
                            >
                              <Eye className="size-4" />
                            </Link>
                            <Button
                              type="button"
                              variant="outline"
                              className="h-8 gap-1.5 border-black/10 bg-white px-2.5 font-medium text-[#212121] hover:bg-[#F0F0EC] hover:text-[#212121]"
                              disabled={restoringId === banner.id}
                              aria-label={`Restore ${banner.title}`}
                              onClick={() =>
                                void onRestore(banner.id, banner.title)
                              }
                            >
                              <RotateCcw className="size-3.5" />
                              <Typography variant="caption-1" as="span">
                                {restoringId === banner.id
                                  ? "Restoring…"
                                  : "Restore"}
                              </Typography>
                            </Button>
                          </>
                        ) : (
                          <>
                            <Link
                              href={`/admin/home-banners/${banner.id}`}
                              className="inline-flex size-7 items-center justify-center rounded-lg text-[#5C5C5C] transition hover:bg-muted hover:text-[#212121]"
                              aria-label={`View ${banner.title}`}
                            >
                              <Eye className="size-4" />
                            </Link>
                            <Link
                              href={`/admin/home-banners/${banner.id}/edit`}
                              className="inline-flex size-7 items-center justify-center rounded-lg text-[#5C5C5C] transition hover:bg-muted hover:text-[#212121]"
                              aria-label={`Edit ${banner.title}`}
                            >
                              <Pencil className="size-4" />
                            </Link>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-sm"
                              aria-label={`Delete ${banner.title}`}
                              onClick={() =>
                                void onDelete(banner.id, banner.title)
                              }
                            >
                              <Trash2 className="size-4 text-destructive" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          <CmsPagination meta={meta} onPageChange={setPage} />
        </CardContent>
      </Card>
    </div>
  );
}
