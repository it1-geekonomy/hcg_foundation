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
import type { CmsEvent, ContentStatus } from "@/domains/cms/lib/types";
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

export default function EventsListPage() {
  const [tab, setTab] = useState<CmsListTab>("active");
  const [events, setEvents] = useState<CmsEvent[]>([]);
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
          ? await cmsApi.listDeletedEvents({
              page,
              limit: PAGE_SIZE,
              search: search || undefined,
            })
          : await cmsApi.listEvents({
              page,
              limit: PAGE_SIZE,
              search: search || undefined,
              status: statusFilter || undefined,
            });
      setEvents(res.data ?? []);
      setMeta(res.meta ?? emptyMeta);
    } catch (err) {
      const message = cmsErrorMessage(err, "Failed to load events");
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
      const res = await cmsApi.deleteEvent(id);
      cmsToast.success(res?.message || "Event deleted successfully");
      await load();
    } catch (err) {
      cmsToast.error(cmsErrorMessage(err, "Failed to delete"));
    }
  };

  const onRestore = async (id: string, title: string) => {
    const ok = await cmsConfirm({
      title: "Restore event?",
      description: `“${title}” will be restored and show again in All events.`,
      confirmLabel: "Restore",
    });
    if (!ok) return;
    setRestoringId(id);
    try {
      const res = await cmsApi.restoreEvent(id);
      cmsToast.success(res.message || "Event restored successfully");
      await load();
    } catch (err) {
      cmsToast.error(cmsErrorMessage(err, "Failed to restore"));
    } finally {
      setRestoringId(null);
    }
  };

  return (
    <CmsListShell
      description="Manage events. Soft-deleted items stay in Recently Deleted until you restore them."
      createHref="/admin/events/new"
      createLabel="Add event"
      tab={tab}
      onTabChange={switchTab}
      activeTabLabel="All events"
      error={error}
    >
      <Card>
        <CardHeader>
          <CardTitle>
            {tab === "deleted" ? "Recently deleted" : "All events"}
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
              placeholder="Search title / slug / location…"
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
                <TableHead>Date</TableHead>
                {tab === "deleted" ? (
                  <TableHead>Deleted at</TableHead>
                ) : (
                  <TableHead>Status</TableHead>
                )}
                <TableHead className="w-40 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {events.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-muted-foreground">
                    {tab === "deleted" ? (
                      "No deleted events."
                    ) : (
                      <>
                        No events yet.{" "}
                        <Link
                          href="/admin/events/new"
                          className="font-medium text-[#9A7B00] underline-offset-2 hover:underline"
                        >
                          Create one
                        </Link>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ) : (
                events.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell>
                      {hasUrl(event.eventBanner) ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={event.eventBanner!}
                          alt=""
                          className="size-10 rounded-lg object-cover ring-1 ring-black/5"
                        />
                      ) : (
                        <div className="size-10 rounded-lg bg-[#F0EEE9] ring-1 ring-black/5" />
                      )}
                    </TableCell>
                    <TableCell>
                      <p className="font-medium">{event.title}</p>
                      <Typography
                        variant="caption-1"
                        as="p"
                        className="text-[#8A8A8A]"
                      >
                        /{event.slug}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {event.eventDate || "—"}
                      {event.eventTime
                        ? ` · ${event.eventTime.slice(0, 5)}`
                        : ""}
                    </TableCell>
                    <TableCell>
                      {tab === "deleted" ? (
                        <Typography
                          variant="caption-1"
                          as="span"
                          className="text-[#5C5C5C]"
                        >
                          {formatCmsDateTime(event.deletedAt)}
                        </Typography>
                      ) : (
                        <Typography
                          variant="caption-1"
                          as="span"
                          className="rounded-full bg-[#F4F4F4] px-2 py-0.5 text-[#5C5C5C]"
                        >
                          {event.status}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-0.5">
                        {tab === "deleted" ? (
                          <>
                            <Link
                              href={`/admin/events/${event.id}`}
                              className="inline-flex size-7 items-center justify-center rounded-lg text-[#5C5C5C] transition hover:bg-muted hover:text-[#212121]"
                              aria-label={`View ${event.title}`}
                            >
                              <Eye className="size-4" />
                            </Link>
                            <Button
                              type="button"
                              variant="outline"
                              className="h-8 gap-1.5 border-black/10 bg-white px-2.5 font-medium text-[#212121] hover:bg-[#F0F0EC] hover:text-[#212121]"
                              disabled={restoringId === event.id}
                              aria-label={`Restore ${event.title}`}
                              onClick={() =>
                                void onRestore(event.id, event.title)
                              }
                            >
                              <RotateCcw className="size-3.5" />
                              <Typography variant="caption-1" as="span">
                                {restoringId === event.id
                                  ? "Restoring…"
                                  : "Restore"}
                              </Typography>
                            </Button>
                          </>
                        ) : (
                          <>
                            <Link
                              href={`/admin/events/${event.id}`}
                              className="inline-flex size-7 items-center justify-center rounded-lg text-[#5C5C5C] transition hover:bg-muted hover:text-[#212121]"
                              aria-label={`View ${event.title}`}
                            >
                              <Eye className="size-4" />
                            </Link>
                            <Link
                              href={`/admin/events/${event.id}/edit`}
                              className="inline-flex size-7 items-center justify-center rounded-lg text-[#5C5C5C] transition hover:bg-muted hover:text-[#212121]"
                              aria-label={`Edit ${event.title}`}
                            >
                              <Pencil className="size-4" />
                            </Link>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-sm"
                              aria-label={`Delete ${event.title}`}
                              onClick={() =>
                                void onDelete(event.id, event.title)
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
