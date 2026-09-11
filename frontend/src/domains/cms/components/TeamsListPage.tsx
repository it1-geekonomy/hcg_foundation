"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Eye, Pencil, Plus, RotateCcw, Trash2 } from "lucide-react";
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
import type { ContentStatus, Team } from "@/domains/cms/lib/types";
import { cmsToast } from "@/domains/cms/lib/toast";
import { CmsPagination, type PaginationMeta } from "./CmsPagination";

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

export default function TeamsListPage() {
  const [tab, setTab] = useState<ListTab>("active");
  const [teams, setTeams] = useState<Team[]>([]);
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
          ? await cmsApi.listDeletedTeams({
              page,
              limit: PAGE_SIZE,
              search: search || undefined,
            })
          : await cmsApi.listTeams({
              page,
              limit: PAGE_SIZE,
              search: search || undefined,
              status: statusFilter || undefined,
            });
      setTeams(res.data ?? []);
      setMeta(res.meta ?? emptyMeta);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load teams";
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

  const onDelete = async (id: string, title: string) => {
    if (!window.confirm(`Move “${title}” to Recently Deleted?`)) return;
    try {
      const res = await cmsApi.deleteTeam(id);
      cmsToast.success(res?.message || "Team member deleted successfully");
      await load();
    } catch (err) {
      cmsToast.error(
        err instanceof Error ? err.message : "Failed to delete"
      );
    }
  };

  const onRestore = async (id: string, title: string) => {
    if (!window.confirm(`Restore “${title}”?`)) return;
    setRestoringId(id);
    try {
      const res = await cmsApi.restoreTeam(id);
      cmsToast.success(res.message || "Team member restored successfully");
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
        <p className="max-w-xl font-manrope text-sm text-muted-foreground">
          Manage team members. Soft-deleted items stay in Recently Deleted until
          you restore them.
        </p>

        <Link
          href="/admin/team/new"
          className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-[#C45A7A] px-4 font-manrope text-sm font-semibold text-white transition hover:bg-[#b04e6c]"
        >
          <Plus className="size-4" />
          Add member
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
          All members
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
            {tab === "deleted" ? "Recently deleted" : "All members"}
          </CardTitle>
          <CardDescription>
            {loading
              ? "Loading…"
              : `${meta.total} total · page ${meta.page} of ${meta.totalPages}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-col gap-2 sm:flex-row">
            <Input
              placeholder="Search name / designation…"
              value={search}
              onChange={(e) => {
                setPage(1);
                setSearch(e.target.value);
              }}
              className="sm:flex-1"
            />
            {tab === "active" ? (
              <select
                className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none"
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
            ) : null}
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-14">Image</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Designation</TableHead>
                {tab === "deleted" ? (
                  <TableHead>Deleted at</TableHead>
                ) : (
                  <TableHead>Status</TableHead>
                )}
                <TableHead className="w-36 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teams.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-muted-foreground">
                    {tab === "deleted" ? (
                      "No deleted members."
                    ) : (
                      <>
                        No members yet.{" "}
                        <Link
                          href="/admin/team/new"
                          className="font-medium text-[#9A7B00] underline-offset-2 hover:underline"
                        >
                          Create one
                        </Link>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ) : (
                teams.map((team) => (
                  <TableRow key={team.id}>
                    <TableCell>
                      {team.teamImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={team.teamImage}
                          alt=""
                          className="size-10 rounded-lg object-cover ring-1 ring-black/5"
                        />
                      ) : (
                        <div className="size-10 rounded-lg bg-[#F0EEE9] ring-1 ring-black/5" />
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{team.title}</TableCell>
                    <TableCell>{team.designation || "—"}</TableCell>
                    <TableCell>
                      {tab === "deleted" ? (
                        <span className="font-manrope text-xs text-[#5C5C5C]">
                          {formatDeletedAt(team.deletedAt)}
                        </span>
                      ) : (
                        <span className="rounded-full bg-[#F4F4F4] px-2 py-0.5 text-xs text-[#5C5C5C]">
                          {team.status}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-0.5">
                        {tab === "deleted" ? (
                          <Button
                            type="button"
                            variant="outline"
                            className="h-8 gap-1.5 px-2.5"
                            disabled={restoringId === team.id}
                            title="Restore"
                            onClick={() => void onRestore(team.id, team.title)}
                          >
                            <RotateCcw className="size-3.5" />
                            {restoringId === team.id ? "Restoring…" : "Restore"}
                          </Button>
                        ) : (
                          <>
                            <Link
                              href={`/admin/team/${team.id}`}
                              className="inline-flex size-7 items-center justify-center rounded-lg text-[#5C5C5C] transition hover:bg-muted hover:text-[#212121]"
                              title="View"
                              aria-label={`View ${team.title}`}
                            >
                              <Eye className="size-4" />
                            </Link>
                            <Link
                              href={`/admin/team/${team.id}/edit`}
                              className="inline-flex size-7 items-center justify-center rounded-lg text-[#5C5C5C] transition hover:bg-muted hover:text-[#212121]"
                              title="Edit"
                              aria-label={`Edit ${team.title}`}
                            >
                              <Pencil className="size-4" />
                            </Link>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-sm"
                              title="Delete"
                              onClick={() => void onDelete(team.id, team.title)}
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
