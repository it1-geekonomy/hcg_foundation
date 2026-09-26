"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { Plus } from "lucide-react";
import Typography from "@/lib/Typography";

export type CmsListTab = "active" | "deleted";

type Props = {
  description: ReactNode;
  createHref?: string;
  createLabel?: string;
  tab: CmsListTab;
  onTabChange: (tab: CmsListTab) => void;
  activeTabLabel: string;
  deletedTabLabel?: string;
  error?: string | null;
  children: ReactNode;
};

/**
 * Shared list chrome: intro + create CTA, All / Recently deleted tabs, error banner.
 * Entity tables / grids stay as children.
 */
export default function CmsListShell({
  description,
  createHref,
  createLabel,
  tab,
  onTabChange,
  activeTabLabel,
  deletedTabLabel = "Recently deleted",
  error,
  children,
}: Props) {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <Typography
          variant="label-1"
          as="p"
          className="max-w-xl text-muted-foreground"
        >
          {description}
        </Typography>

        {createHref && createLabel ? (
          <Link
            href={createHref}
            className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-[#C45A7A] px-4 text-white transition hover:bg-[#b04e6c]"
          >
            <Plus className="size-4" />
            <Typography variant="button-3" as="span">
              {createLabel}
            </Typography>
          </Link>
        ) : null}
      </div>

      <div className="inline-flex rounded-xl bg-white p-1 ring-1 ring-black/5">
        <button
          type="button"
          onClick={() => onTabChange("active")}
          className={`rounded-lg px-3.5 py-1.5 font-medium transition ${
            tab === "active"
              ? "bg-[#C45A7A] text-white"
              : "text-[#5C5C5C] hover:text-[#212121]"
          }`}
        >
          <Typography variant="label-1" as="span">
            {activeTabLabel}
          </Typography>
        </button>
        <button
          type="button"
          onClick={() => onTabChange("deleted")}
          className={`rounded-lg px-3.5 py-1.5 font-medium transition ${
            tab === "deleted"
              ? "bg-[#C45A7A] text-white"
              : "text-[#5C5C5C] hover:text-[#212121]"
          }`}
        >
          <Typography variant="label-1" as="span">
            {deletedTabLabel}
          </Typography>
        </button>
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

      {children}
    </div>
  );
}
