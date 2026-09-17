"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
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
import type { AdminUser } from "@/domains/cms/lib/types";
import { CmsPagination, type PaginationMeta } from "./CmsPagination";
import CmsSearchInput from "./CmsSearchInput";

const PAGE_SIZE = 10;

const emptyMeta: PaginationMeta = {
  total: 0,
  page: 1,
  limit: PAGE_SIZE,
  totalPages: 1,
};

export default function UsersListPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>(emptyMeta);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await cmsApi.listUsers({
        page,
        limit: PAGE_SIZE,
        search: search || undefined,
      });
      setUsers(res.data ?? []);
      setMeta(res.meta ?? emptyMeta);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load users");
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    void load();
  }, [load]);

  const onDelete = async (id: string, name: string) => {
    const ok = await cmsConfirm({
      title: "Delete user?",
      description: `“${name}” will be removed from CMS admin accounts.`,
      confirmLabel: "Delete",
      tone: "danger",
    });
    if (!ok) return;
    setError(null);
    try {
      await cmsApi.deleteUser(id);
      cmsToast.success("User deleted successfully");
      await load();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to delete";
      setError(message);
      cmsToast.error(message);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <Typography
          variant="label-1"
          as="p"
          className="max-w-xl text-muted-foreground"
        >
          CMS admin accounts. Create users separately — this page is the list
          only.
        </Typography>
        <Link
          href="/admin/users/new"
          className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-[#FCCC2D] px-4 text-[#212121] transition hover:brightness-105"
        >
          <Plus className="size-4" />
          <Typography variant="button-3" as="span">
            Add user
          </Typography>
        </Link>
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
          <CardTitle>All users</CardTitle>
          <CardDescription>
            {loading
              ? "Loading…"
              : `${meta.total} total · page ${meta.page} of ${meta.totalPages}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <CmsSearchInput
              placeholder="Search name / email / username…"
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
                  <TableHead>Email</TableHead>
                  <TableHead>Username</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-muted-foreground">
                      No users yet.{" "}
                      <Link
                        href="/admin/users/new"
                        className="font-medium text-[#9A7B00] underline-offset-2 hover:underline"
                      >
                        Create one
                      </Link>
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        {user.fullName}
                      </TableCell>
                      <TableCell className="max-w-[160px] truncate sm:max-w-none">
                        {user.email}
                      </TableCell>
                      <TableCell>{user.username}</TableCell>
                      <TableCell>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => void onDelete(user.id, user.fullName)}
                          aria-label={`Delete ${user.fullName}`}
                        >
                          <Trash2 className="size-4 text-destructive" />
                        </Button>
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
