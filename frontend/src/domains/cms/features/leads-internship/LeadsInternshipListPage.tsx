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
import type { LeadsInternship } from "@/domains/cms/lib/types";
import Typography from "@/lib/Typography";
import CmsListShell, { type CmsListTab } from "@/domains/cms/ui/CmsListShell";
import { cmsErrorMessage, formatCmsDateTime } from "@/domains/cms/ui/CmsViewChrome";
import { CmsPagination, type PaginationMeta } from "@/domains/cms/ui/CmsPagination";
import CmsSearchInput from "@/domains/cms/ui/CmsSearchInput";

const PAGE_SIZE = 20;

const emptyMeta: PaginationMeta = {
  total: 0,
  page: 1,
  limit: PAGE_SIZE,
  totalPages: 1,
};

export default function LeadsInternshipListPage() {
  const [tab, setTab] = useState<CmsListTab>("active");
  const [rows, setRows] = useState<LeadsInternship[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>(emptyMeta);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [restoringId, setRestoringId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res =
        tab === "deleted"
          ? await cmsApi.listDeletedLeadsInternship({
              page,
              limit: PAGE_SIZE,
              search: search || undefined,
            })
          : await cmsApi.listLeadsInternship({
              page,
              limit: PAGE_SIZE,
              search: search || undefined,
            });
      setRows(res.data ?? []);
      setMeta(res.meta ?? emptyMeta);
    } catch (err) {
      const message = cmsErrorMessage(err, "Failed to load internship leads");
      setError(message);
      cmsToast.error(message);
    } finally {
      setLoading(false);
    }
  }, [page, search, tab]);

  useEffect(() => {
    void load();
  }, [load]);

  const switchTab = (next: CmsListTab) => {
    if (next === tab) return;
    setTab(next);
    setPage(1);
    setSearch("");
  };

  const onDelete = async (id: string, name: string) => {
    const ok = await cmsConfirm({
      title: "Move to Recently Deleted?",
      description: `“${name}” will be soft-deleted.`,
      confirmLabel: "Move to deleted",
      tone: "danger",
    });
    if (!ok) return;
    try {
      const res = await cmsApi.deleteLeadsInternship(id);
      cmsToast.success(res?.message || "Lead deleted successfully");
      await load();
    } catch (err) {
      cmsToast.error(cmsErrorMessage(err, "Failed to delete"));
    }
  };

  const onRestore = async (id: string, name: string) => {
    const ok = await cmsConfirm({
      title: "Restore lead?",
      description: `“${name}” will be restored.`,
      confirmLabel: "Restore",
    });
    if (!ok) return;
    setRestoringId(id);
    try {
      const res = await cmsApi.restoreLeadsInternship(id);
      cmsToast.success(res.message || "Lead restored successfully");
      await load();
    } catch (err) {
      cmsToast.error(cmsErrorMessage(err, "Failed to restore"));
    } finally {
      setRestoringId(null);
    }
  };

  return (
    <CmsListShell
      description="Internship application forms submitted from the website."
      tab={tab}
      onTabChange={switchTab}
      activeTabLabel="All leads"
      error={error}
    >
      <Card>
        <CardHeader>
          <CardTitle>
            {tab === "deleted" ? "Recently deleted" : "All internship leads"}
          </CardTitle>
          <CardDescription>
            {loading
              ? "Loading…"
              : `${meta.total} total · page ${meta.page} of ${meta.totalPages}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <CmsSearchInput
              placeholder="Search name / email / phone / course…"
              value={search}
              onDebouncedChange={(next) => {
                setPage(1);
                setSearch(next);
              }}
            />
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Course</TableHead>
                  {tab === "deleted" ? (
                    <TableHead>Deleted at</TableHead>
                  ) : (
                    <TableHead>Submitted</TableHead>
                  )}
                  <TableHead className="w-40 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-muted-foreground">
                      {tab === "deleted"
                        ? "No deleted internship leads."
                        : "No internship leads yet."}
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell>
                        <Link
                          href={`/admin/leads-internship/${row.id}`}
                          className="font-medium text-[#9A7B00] underline-offset-2 hover:underline"
                        >
                          {row.fullName}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Typography variant="label-1" as="p">
                          {row.email || "—"}
                        </Typography>
                        <Typography
                          variant="caption-1"
                          as="p"
                          className="text-[#8A8A8A]"
                        >
                          {row.phone || "—"}
                        </Typography>
                      </TableCell>
                      <TableCell>{row.currentCourse || "—"}</TableCell>
                      <TableCell className="whitespace-nowrap text-muted-foreground">
                        {tab === "deleted"
                          ? formatCmsDateTime(row.deletedAt)
                          : new Date(row.createdAt).toLocaleDateString("en-IN")}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-0.5">
                          {tab === "deleted" ? (
                            <>
                              <Link
                                href={`/admin/leads-internship/${row.id}`}
                                className="inline-flex size-7 items-center justify-center rounded-lg text-[#5C5C5C] hover:bg-muted"
                              >
                                <Eye className="size-4" />
                              </Link>
                              <Button
                                type="button"
                                variant="outline"
                                className="h-8 gap-1.5 px-2.5"
                                disabled={restoringId === row.id}
                                onClick={() =>
                                  void onRestore(row.id, row.fullName)
                                }
                              >
                                <RotateCcw className="size-3.5" />
                                <Typography variant="caption-1" as="span">
                                  {restoringId === row.id
                                    ? "Restoring…"
                                    : "Restore"}
                                </Typography>
                              </Button>
                            </>
                          ) : (
                            <>
                              <Link
                                href={`/admin/leads-internship/${row.id}`}
                                className="inline-flex size-7 items-center justify-center rounded-lg text-[#5C5C5C] hover:bg-muted"
                              >
                                <Eye className="size-4" />
                              </Link>
                              <Link
                                href={`/admin/leads-internship/${row.id}/edit`}
                                className="inline-flex size-7 items-center justify-center rounded-lg text-[#5C5C5C] hover:bg-muted"
                              >
                                <Pencil className="size-4" />
                              </Link>
                              <button
                                type="button"
                                className="inline-flex size-7 items-center justify-center rounded-lg text-[#5C5C5C] hover:bg-red-50 hover:text-red-600"
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
    </CmsListShell>
  );
}
