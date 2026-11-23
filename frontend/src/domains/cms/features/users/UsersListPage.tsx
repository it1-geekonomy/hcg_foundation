"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { KeyRound, Plus, Trash2, X } from "lucide-react";
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
import type { AdminUser } from "@/domains/cms/lib/types";
import { CmsFormField } from "@/domains/cms/ui/CmsFormField";
import { cmsErrorMessage } from "@/domains/cms/ui/CmsViewChrome";
import { CmsPagination, type PaginationMeta } from "@/domains/cms/ui/CmsPagination";
import CmsSearchInput from "@/domains/cms/ui/CmsSearchInput";

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
  const [passwordUser, setPasswordUser] = useState<AdminUser | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

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
      setError(cmsErrorMessage(err, "Failed to load users"));
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    void load();
  }, [load]);

  const closePasswordModal = () => {
    if (savingPassword) return;
    setPasswordUser(null);
    setNewPassword("");
    setConfirmPassword("");
    setPasswordError(null);
  };

  const onResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordUser || savingPassword) return;

    if (newPassword.trim().length < 8) {
      setPasswordError("Password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match.");
      return;
    }

    setSavingPassword(true);
    setPasswordError(null);
    try {
      await cmsApi.updateUser(passwordUser.id, { password: newPassword });
      cmsToast.success(`Password updated for ${passwordUser.fullName}`);
      setPasswordUser(null);
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      const message = cmsErrorMessage(err, "Failed to update password");
      setPasswordError(message);
      cmsToast.error(message);
    } finally {
      setSavingPassword(false);
    }
  };

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
      const message = cmsErrorMessage(err, "Failed to delete");
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
          className="max-w-xl text-cms-muted"
        >
          CMS admin accounts. You can add users and reset passwords from this
          page.
        </Typography>
        <Link
          href="/admin/users/new"
          className="inline-flex h-9 items-center gap-2 rounded-lg bg-cms-primary px-3.5 text-sm font-medium text-white transition-colors hover:bg-cms-primary-hover"
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
                  <TableHead className="w-24 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-cms-muted">
                      No users yet.{" "}
                      <Link
                        href="/admin/users/new"
                        className="font-medium text-cms-primary underline-offset-2 hover:underline"
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
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => {
                              setPasswordUser(user);
                              setNewPassword("");
                              setConfirmPassword("");
                              setPasswordError(null);
                            }}
                            aria-label={`Reset password for ${user.fullName}`}
                            title="Reset password"
                          >
                            <KeyRound className="size-4 text-cms-primary" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => void onDelete(user.id, user.fullName)}
                            aria-label={`Delete ${user.fullName}`}
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
          </div>

          <CmsPagination meta={meta} onPageChange={setPage} />
        </CardContent>
      </Card>

      {passwordUser ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="reset-password-title"
          onClick={closePasswordModal}
        >
          <form
            onSubmit={onResetPassword}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md space-y-4 rounded-xl border border-cms-border bg-white p-5 shadow-lg"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <Typography
                  id="reset-password-title"
                  variant="heading-8"
                  as="h2"
                  className="font-semibold text-cms-ink"
                >
                  Reset password
                </Typography>
                <Typography
                  variant="label-1"
                  as="p"
                  className="mt-1 text-cms-muted"
                >
                  {passwordUser.fullName} · {passwordUser.email}
                </Typography>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={closePasswordModal}
                aria-label="Close"
              >
                <X className="size-4" />
              </Button>
            </div>

            {passwordError ? (
              <Typography
                variant="label-1"
                as="div"
                className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-red-700"
              >
                {passwordError}
              </Typography>
            ) : null}

            <CmsFormField label="New password" htmlFor="new-password">
              <Input
                id="new-password"
                type="password"
                required
                minLength={8}
                autoFocus
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min 8 characters"
                disabled={savingPassword}
              />
            </CmsFormField>

            <CmsFormField label="Confirm password" htmlFor="confirm-password">
              <Input
                id="confirm-password"
                type="password"
                required
                minLength={8}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat password"
                disabled={savingPassword}
              />
            </CmsFormField>

            <div className="flex flex-wrap justify-end gap-2 pt-1">
              <Button
                type="button"
                variant="outline"
                onClick={closePasswordModal}
                disabled={savingPassword}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={savingPassword}
                className="bg-cms-primary text-white hover:bg-cms-primary/90"
              >
                {savingPassword ? "Saving…" : "Update password"}
              </Button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}
