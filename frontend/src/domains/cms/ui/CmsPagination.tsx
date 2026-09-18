"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Typography from "@/lib/Typography";
import { Button } from "@/shared/ui/button";
import { cn } from "@/lib/utils";

export type PaginationMeta = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

type CmsPaginationProps = {
  meta: PaginationMeta;
  onPageChange: (page: number) => void;
  className?: string;
};

/** Matches backend `{ data, meta: { total, page, limit, totalPages } }` */
export function CmsPagination({
  meta,
  onPageChange,
  className,
}: CmsPaginationProps) {
  const { page, totalPages, total, limit } = meta;
  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-3 pt-4",
        className
      )}
    >
      <Typography variant="caption-1" as="p" className="text-muted-foreground">
        Showing {from}–{to} of {total}
      </Typography>

      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="h-8 gap-1"
        >
          <ChevronLeft className="size-3.5" />
          <Typography variant="caption-1" as="span">
            Prev
          </Typography>
        </Button>
        <Typography
          variant="caption-1"
          as="span"
          className="min-w-[4.5rem] text-center font-medium text-[#212121]"
        >
          {page} / {totalPages}
        </Typography>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="h-8 gap-1"
        >
          <Typography variant="caption-1" as="span">
            Next
          </Typography>
          <ChevronRight className="size-3.5" />
        </Button>
      </div>
    </div>
  );
}
