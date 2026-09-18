"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Eye, Pencil, RotateCcw, Trash2 } from "lucide-react";
import Typography from "@/lib/Typography";
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
import type { Award, ContentStatus } from "@/domains/cms/lib/types";
import CmsListShell, { type CmsListTab } from "@/domains/cms/ui/CmsListShell";
import { cmsErrorMessage, formatCmsDateTime } from "@/domains/cms/ui/CmsViewChrome";
import { CmsPagination, type PaginationMeta } from "@/domains/cms/ui/CmsPagination";
import CmsSearchInput from "@/domains/cms/ui/CmsSearchInput";
import CmsSelect, { CONTENT_STATUS_FILTER_OPTIONS } from "@/domains/cms/ui/CmsSelect";

const PAGE_SIZE = 20;

const emptyMeta: PaginationMeta = {
  total: 0,
  page: 1,
  limit: PAGE_SIZE,
  totalPages: 1,
};

export default function AwardsListPage() {
  const [tab, setTab] = useState<CmsListTab>("active");
  const [awards, setAwards] = useState<Award[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>(emptyMeta);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ContentStatus | "">("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [restoringId, setRestoringId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res =
        tab === "deleted"
          ? await cmsApi.listDeletedAwards({
              page,
              limit: PAGE_SIZE,
              search: search || undefined,
            })
          : await cmsApi.listAwards({
              page,
              limit: PAGE_SIZE,
              search: search || undefined,
              status: statusFilter || undefined,
            });
      setAwards(res.data ?? []);
      setMeta(res.meta ?? emptyMeta);
    } catch (err) {
      const message = cmsErrorMessage(err, "Failed to load awards");
      setError(message);
      cmsToast.error(message);
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter, tab]);

  useEffect(() => {
    void load();
  }, [load]);

  const switchTab = (next: CmsListTab) => {
    if (next === tab) return;
    setTab(next);
    setPage(1);
    setSearch("");
    setStatusFilter("");
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
      const res = await cmsApi.deleteAward(id);
      cmsToast.success(res?.message || "Award deleted successfully");
      await load();
    } catch (err) {
      cmsToast.error(cmsErrorMessage(err, "Failed to delete"));
    }
  };

  const onRestore = async (id: string, title: string) => {
    const ok = await cmsConfirm({
      title: "Restore award?",
      description: `“${title}” will be restored and show again in All awards.`,
      confirmLabel: "Restore",
    });
    if (!ok) return;
    setRestoringId(id);
    try {
      const res = await cmsApi.restoreAward(id);
      cmsToast.success(res.message || "Award restored successfully");
      await load();
    } catch (err) {
      cmsToast.error(cmsErrorMessage(err, "Failed to restore"));
    } finally {
      setRestoringId(null);
    }
  };

  return (
    <CmsListShell
      description="Manage awards. Soft-deleted items stay in Recently Deleted until you restore them."
      createHref="/admin/awards/new"
      createLabel="Add award"
      tab={tab}
      onTabChange={switchTab}
      activeTabLabel="All awards"
      error={error}
    >
      <Card>
        <CardHeader>
          <CardTitle>
            {tab === "deleted" ? "Recently deleted" : "All awards"}
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
              placeholder="Search title / description…"
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
                options={CONTENT_STATUS_FILTER_OPTIONS}
                onChange={(next) => {
                  setPage(1);
                  setStatusFilter(next as ContentStatus | "");
                }}
              />
            ) : null}
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-14">Image</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Year</TableHead>
                {tab === "deleted" ? (
                  <TableHead>Deleted at</TableHead>
                ) : (
                  <TableHead>Status</TableHead>
                )}
                <TableHead className="w-40 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {awards.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-muted-foreground">
                    {tab === "deleted" ? (
                      "No deleted awards."
                    ) : (
                      <>
                        No awards yet.{" "}
                        <Link
                          href="/admin/awards/new"
                          className="font-medium text-[#9A7B00] underline-offset-2 hover:underline"
                        >
                          Create one
                        </Link>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ) : (
                awards.map((award) => (
                  <TableRow key={award.id}>
                    <TableCell>
                      {award.awardImageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={award.awardImageUrl}
                          alt=""
                          className="size-10 rounded-lg object-contain ring-1 ring-black/5"
                        />
                      ) : (
                        <div className="size-10 rounded-lg bg-[#F0EEE9] ring-1 ring-black/5" />
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{award.title}</TableCell>
                    <TableCell>{award.year ?? "—"}</TableCell>
                    <TableCell>
                      {tab === "deleted" ? (
                        <Typography
                          variant="caption-1"
                          as="span"
                          className="text-[#5C5C5C]"
                        >
                          {formatCmsDateTime(award.deletedAt)}
                        </Typography>
                      ) : (
                        <Typography
                          variant="caption-1"
                          as="span"
                          className="rounded-full bg-[#F4F4F4] px-2 py-0.5 text-[#5C5C5C]"
                        >
                          {award.status}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-0.5">
                        {tab === "deleted" ? (
                          <>
                            <Link
                              href={`/admin/awards/${award.id}`}
                              className="inline-flex size-7 items-center justify-center rounded-lg text-[#5C5C5C] transition hover:bg-muted hover:text-[#212121]"
                              aria-label={`View ${award.title}`}
                            >
                              <Eye className="size-4" />
                            </Link>
                            <Button
                              type="button"
                              variant="outline"
                              className="h-8 gap-1.5 border-black/10 bg-white px-2.5 font-medium text-[#212121] hover:bg-[#F0F0EC] hover:text-[#212121]"
                              disabled={restoringId === award.id}
                              aria-label={`Restore ${award.title}`}
                              onClick={() =>
                                void onRestore(award.id, award.title)
                              }
                            >
                              <RotateCcw className="size-3.5" />
                              <Typography variant="caption-1" as="span">
                                {restoringId === award.id
                                  ? "Restoring…"
                                  : "Restore"}
                              </Typography>
                            </Button>
                          </>
                        ) : (
                          <>
                            <Link
                              href={`/admin/awards/${award.id}`}
                              className="inline-flex size-7 items-center justify-center rounded-lg text-[#5C5C5C] transition hover:bg-muted hover:text-[#212121]"
                              aria-label={`View ${award.title}`}
                            >
                              <Eye className="size-4" />
                            </Link>
                            <Link
                              href={`/admin/awards/${award.id}/edit`}
                              className="inline-flex size-7 items-center justify-center rounded-lg text-[#5C5C5C] transition hover:bg-muted hover:text-[#212121]"
                              aria-label={`Edit ${award.title}`}
                            >
                              <Pencil className="size-4" />
                            </Link>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-sm"
                              aria-label={`Delete ${award.title}`}
                              onClick={() =>
                                void onDelete(award.id, award.title)
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
    </CmsListShell>
  );
}
