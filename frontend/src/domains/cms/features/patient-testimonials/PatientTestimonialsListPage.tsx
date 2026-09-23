"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Eye, Pencil, RotateCcw, Trash2, Users } from "lucide-react";
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
import type { ContentStatus, PatientTestimonial } from "@/domains/cms/lib/types";
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

function hasUrl(value?: string | null) {
  return Boolean(value && value.trim());
}

export default function PatientTestimonialsListPage() {
  const [tab, setTab] = useState<CmsListTab>("active");
  const [testimonials, setTestimonials] = useState<PatientTestimonial[]>([]);
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
          ? await cmsApi.listDeletedPatientTestimonials({
              page,
              limit: PAGE_SIZE,
              search: search || undefined,
            })
          : await cmsApi.listPatientTestimonials({
              page,
              limit: PAGE_SIZE,
              search: search || undefined,
              status: statusFilter || undefined,
            });
      setTestimonials(res.data ?? []);
      setMeta(res.meta ?? emptyMeta);
    } catch (err) {
      const message = cmsErrorMessage(err, "Failed to load patient testimonials");
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

  const onDelete = async (id: string, name: string) => {
    const ok = await cmsConfirm({
      title: "Move to Recently Deleted?",
      description: `“${name}” will be soft-deleted. You can restore it later from Recently Deleted.`,
      confirmLabel: "Move to deleted",
      tone: "danger",
    });
    if (!ok) return;
    try {
      const res = await cmsApi.deletePatientTestimonial(id);
      cmsToast.success(res?.message || "Patient testimonial deleted successfully");
      await load();
    } catch (err) {
      cmsToast.error(cmsErrorMessage(err, "Failed to delete"));
    }
  };

  const onRestore = async (id: string, name: string) => {
    const ok = await cmsConfirm({
      title: "Restore patient testimonial?",
      description: `“${name}” will be restored and show again in All patient testimonials.`,
      confirmLabel: "Restore",
    });
    if (!ok) return;
    setRestoringId(id);
    try {
      const res = await cmsApi.restorePatientTestimonial(id);
      cmsToast.success(res.message || "Patient testimonial restored successfully");
      await load();
    } catch (err) {
      cmsToast.error(cmsErrorMessage(err, "Failed to restore"));
    } finally {
      setRestoringId(null);
    }
  };

  return (
    <CmsListShell
      description="Manage patient testimonials that appear on the website."
      createHref="/admin/patient-testimonials/new"
      createLabel="Add testimonial"
      tab={tab}
      onTabChange={switchTab}
      activeTabLabel="All patient testimonials"
      error={error}
    >
      <Card>
        <CardHeader>
          <CardTitle>
            {tab === "deleted" ? "Recently deleted" : "All patient testimonials"}
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
              placeholder="Search title…"
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
                <TableHead className="w-14">Banner</TableHead>
                <TableHead>Title</TableHead>
                <TableHead className="hidden md:table-cell">Short Description</TableHead>
                <TableHead>Date Added</TableHead>
                {tab === "deleted" ? (
                  <TableHead>Deleted at</TableHead>
                ) : (
                  <TableHead>Status</TableHead>
                )}
                <TableHead className="w-40 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {testimonials.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-muted-foreground">
                    {tab === "deleted" ? (
                      "No deleted patient testimonials."
                    ) : (
                      <>
                        No patient testimonials yet.{" "}
                        <Link
                          href="/admin/patient-testimonials/new"
                          className="font-medium text-[#9A7B00] underline-offset-2 hover:underline"
                        >
                          Create one
                        </Link>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ) : (
                testimonials.map((testimonial) => (
                  <TableRow key={testimonial.id}>
                    <TableCell>
                      {hasUrl(testimonial.patientTestimonialBanner) ? (
                        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md border border-black/10 bg-[#f4ebd0]/30">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={testimonial.patientTestimonialBanner!}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-dashed border-black/15 bg-black/[0.02] text-muted-foreground">
                          <Users className="size-4" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">
                      <Link
                        href={`/admin/patient-testimonials/${testimonial.id}`}
                        className="hover:underline"
                      >
                        {testimonial.title}
                      </Link>
                    </TableCell>
                    <TableCell className="hidden text-sm text-muted-foreground md:table-cell max-w-[200px] truncate">
                      {testimonial.shortDescription || "—"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {testimonial.createdAt ? String(testimonial.createdAt).slice(0, 10) : "—"}
                    </TableCell>
                    <TableCell>
                      {tab === "deleted" ? (
                        <Typography
                          variant="caption-1"
                          as="span"
                          className="text-[#5C5C5C]"
                        >
                          {formatCmsDateTime(testimonial.deletedAt)}
                        </Typography>
                      ) : (
                        <Typography
                          variant="caption-1"
                          as="span"
                          className="rounded-full bg-[#F4F4F4] px-2 py-0.5 text-[#5C5C5C]"
                        >
                          {testimonial.status}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-0.5">
                        {tab === "deleted" ? (
                          <>
                            <Link
                              href={`/admin/patient-testimonials/${testimonial.id}`}
                              className="inline-flex size-7 items-center justify-center rounded-lg text-[#5C5C5C] transition hover:bg-muted hover:text-[#212121]"
                              aria-label={`View ${testimonial.title}`}
                            >
                              <Eye className="size-4" />
                            </Link>
                            <Button
                              type="button"
                              variant="outline"
                              className="h-8 gap-1.5 border-black/10 bg-white px-2.5 font-medium text-[#212121] hover:bg-[#F0F0EC] hover:text-[#212121]"
                              disabled={restoringId === testimonial.id}
                              aria-label={`Restore ${testimonial.title}`}
                              onClick={() => void onRestore(testimonial.id, testimonial.title)}
                            >
                              <RotateCcw className="size-3.5" />
                              <Typography variant="caption-1" as="span">
                                {restoringId === testimonial.id
                                  ? "Restoring…"
                                  : "Restore"}
                              </Typography>
                            </Button>
                          </>
                        ) : (
                          <>
                            <Link
                              href={`/admin/patient-testimonials/${testimonial.id}`}
                              className="inline-flex size-7 items-center justify-center rounded-lg text-[#5C5C5C] transition hover:bg-muted hover:text-[#212121]"
                              aria-label={`View ${testimonial.title}`}
                            >
                              <Eye className="size-4" />
                            </Link>
                            <Link
                              href={`/admin/patient-testimonials/${testimonial.id}/edit`}
                              className="inline-flex size-7 items-center justify-center rounded-lg text-[#5C5C5C] transition hover:bg-muted hover:text-[#212121]"
                              aria-label={`Edit ${testimonial.title}`}
                            >
                              <Pencil className="size-4" />
                            </Link>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-sm"
                              aria-label={`Delete ${testimonial.title}`}
                              onClick={() => void onDelete(testimonial.id, testimonial.title)}
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
