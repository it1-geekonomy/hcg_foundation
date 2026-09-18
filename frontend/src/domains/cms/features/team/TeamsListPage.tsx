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
import type { ContentStatus, Team, TeamType } from "@/domains/cms/lib/types";
import { cmsToast } from "@/domains/cms/lib/toast";
import { cmsConfirm } from "@/domains/cms/lib/confirm";
import CmsListShell, { type CmsListTab } from "@/domains/cms/ui/CmsListShell";
import { cmsErrorMessage, formatCmsDateTime } from "@/domains/cms/ui/CmsViewChrome";
import { CmsPagination, type PaginationMeta } from "@/domains/cms/ui/CmsPagination";
import CmsSearchInput from "@/domains/cms/ui/CmsSearchInput";
import CmsSelect, {
  CONTENT_STATUS_FILTER_OPTIONS,
  TEAM_TYPE_FILTER_OPTIONS,
} from "@/domains/cms/ui/CmsSelect";

const PAGE_SIZE = 20;

const emptyMeta: PaginationMeta = {
  total: 0,
  page: 1,
  limit: PAGE_SIZE,
  totalPages: 1,
};

export default function TeamsListPage() {
  const [tab, setTab] = useState<CmsListTab>("active");
  const [teams, setTeams] = useState<Team[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>(emptyMeta);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ContentStatus | "">("");
  const [typeFilter, setTypeFilter] = useState<TeamType | "">("");
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
              type: typeFilter || undefined,
            });
      setTeams(res.data ?? []);
      setMeta(res.meta ?? emptyMeta);
    } catch (err) {
      const message = cmsErrorMessage(err, "Failed to load teams");
      setError(message);
      cmsToast.error(message);
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter, typeFilter, tab]);

  useEffect(() => {
    void load();
  }, [load]);

  const switchTab = (next: CmsListTab) => {
    if (next === tab) return;
    setTab(next);
    setPage(1);
    setSearch("");
    setStatusFilter("");
    setTypeFilter("");
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
      const res = await cmsApi.deleteTeam(id);
      cmsToast.success(res?.message || "Team member deleted successfully");
      await load();
    } catch (err) {
      cmsToast.error(cmsErrorMessage(err, "Failed to delete"));
    }
  };

  const onRestore = async (id: string, title: string) => {
    const ok = await cmsConfirm({
      title: "Restore team member?",
      description: `“${title}” will be restored and show again in All members.`,
      confirmLabel: "Restore",
    });
    if (!ok) return;
    setRestoringId(id);
    try {
      const res = await cmsApi.restoreTeam(id);
      cmsToast.success(res.message || "Team member restored successfully");
      await load();
    } catch (err) {
      cmsToast.error(cmsErrorMessage(err, "Failed to restore"));
    } finally {
      setRestoringId(null);
    }
  };

  return (
    <CmsListShell
      description="Manage team members. Soft-deleted items stay in Recently Deleted until you restore them."
      createHref="/admin/team/new"
      createLabel="Add member"
      tab={tab}
      onTabChange={switchTab}
      activeTabLabel="All members"
      error={error}
    >
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
            <CmsSearchInput
              placeholder="Search name / designation…"
              value={search}
              onDebouncedChange={(next) => {
                setPage(1);
                setSearch(next);
              }}
              className="sm:flex-1"
            />
            {tab === "active" ? (
              <>
                <CmsSelect
                  size="sm"
                  className="sm:w-40"
                  value={typeFilter}
                  options={TEAM_TYPE_FILTER_OPTIONS}
                  onChange={(next) => {
                    setPage(1);
                    setTypeFilter(next as TeamType | "");
                  }}
                />
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
              </>
            ) : null}
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-14">Image</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
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
                  <TableCell colSpan={6} className="text-muted-foreground">
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
                        <Typography
                          variant="caption-1"
                          as="div"
                          className="flex size-10 items-center justify-center rounded-lg border border-red-200 bg-red-50 px-1 text-center leading-tight text-red-700"
                          title="Image not available"
                        >
                          N/A
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{team.title}</TableCell>
                    <TableCell>
                      <Typography
                        variant="caption-1"
                        as="span"
                        className="rounded-full bg-[#E8F0F6] px-2 py-0.5 capitalize text-[#1A4A6E]"
                      >
                        {team.type ?? "—"}
                      </Typography>
                    </TableCell>
                    <TableCell>{team.designation || "—"}</TableCell>
                    <TableCell>
                      {tab === "deleted" ? (
                        <Typography
                          variant="caption-1"
                          as="span"
                          className="text-[#5C5C5C]"
                        >
                          {formatCmsDateTime(team.deletedAt)}
                        </Typography>
                      ) : (
                        <Typography
                          variant="caption-1"
                          as="span"
                          className="rounded-full bg-[#F4F4F4] px-2 py-0.5 text-[#5C5C5C]"
                        >
                          {team.status}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-0.5">
                        {tab === "deleted" ? (
                          <Button
                            type="button"
                            variant="outline"
                            className="h-8 gap-1.5 border-black/10 bg-white px-2.5 font-medium text-[#212121] hover:bg-[#F0F0EC] hover:text-[#212121]"
                            disabled={restoringId === team.id}
                            aria-label={`Restore ${team.title}`}
                            onClick={() => void onRestore(team.id, team.title)}
                          >
                            <RotateCcw className="size-3.5" />
                            <Typography variant="caption-1" as="span">
                              {restoringId === team.id ? "Restoring…" : "Restore"}
                            </Typography>
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
    </CmsListShell>
  );
}
