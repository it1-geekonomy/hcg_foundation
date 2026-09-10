"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Eye, Pencil, Plus, Trash2 } from "lucide-react";
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
import type { ContentStatus, Team, TeamMemberType } from "@/domains/cms/lib/types";
import { CmsPagination, type PaginationMeta } from "./CmsPagination";

const PAGE_SIZE = 10;

const emptyMeta: PaginationMeta = {
  total: 0,
  page: 1,
  limit: PAGE_SIZE,
  totalPages: 1,
};

export default function TeamsListPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>(emptyMeta);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ContentStatus | "">("");
  const [typeFilter, setTypeFilter] = useState<TeamMemberType | "">("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await cmsApi.listTeams({
        page,
        limit: PAGE_SIZE,
        search: search || undefined,
        status: statusFilter || undefined,
        memberType: typeFilter || undefined,
      });
      setTeams(res.data ?? []);
      setMeta(res.meta ?? emptyMeta);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load teams");
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter, typeFilter]);

  useEffect(() => {
    void load();
  }, [load]);

  const onDelete = async (id: string, title: string) => {
    if (!window.confirm(`Delete “${title}”?`)) return;
    setError(null);
    try {
      await cmsApi.deleteTeam(id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <p className="max-w-xl font-manrope text-sm text-muted-foreground">
          Manage trustees and team members (same fields, different type).
          Published ones show on{" "}
          <Link
            href="/about/our-team"
            target="_blank"
            className="font-medium text-[#9A7B00] underline-offset-2 hover:underline"
          >
            /about/our-team
          </Link>
          .
        </p>

        <Link
          href="/admin/team/new"
          className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-[#C45A7A] px-4 font-manrope text-sm font-semibold text-white transition hover:bg-[#b04e6c]"
        >
          <Plus className="size-4" />
          Add member
        </Link>
      </div>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 font-manrope text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>All members</CardTitle>
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
            <select
              className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none"
              value={typeFilter}
              onChange={(e) => {
                setPage(1);
                setTypeFilter(e.target.value as TeamMemberType | "");
              }}
            >
              <option value="">All types</option>
              <option value="trustee">trustee</option>
              <option value="team">team</option>
            </select>
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
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Designation</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-28 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teams.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-muted-foreground">
                    No members yet.{" "}
                    <Link
                      href="/admin/team/new"
                      className="font-medium text-[#9A7B00] underline-offset-2 hover:underline"
                    >
                      Create one
                    </Link>
                  </TableCell>
                </TableRow>
              ) : (
                teams.map((team) => (
                  <TableRow key={team.id}>
                    <TableCell className="font-medium">{team.title}</TableCell>
                    <TableCell>
                      <span
                        className={
                          team.memberType === "team"
                            ? "rounded-full bg-[#E8F0F6] px-2 py-0.5 text-xs text-[#1A4A6E]"
                            : "rounded-full bg-[#FFF1C2] px-2 py-0.5 text-xs text-[#7A5A00]"
                        }
                      >
                        {team.memberType ?? "trustee"}
                      </span>
                    </TableCell>
                    <TableCell>{team.designation || "—"}</TableCell>
                    <TableCell>
                      <span className="rounded-full bg-[#F4F4F4] px-2 py-0.5 text-xs text-[#5C5C5C]">
                        {team.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-0.5">
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
