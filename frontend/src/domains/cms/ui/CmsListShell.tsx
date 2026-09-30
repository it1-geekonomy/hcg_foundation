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
  const tabs: { id: CmsListTab; label: string }[] = [
    { id: "active", label: activeTabLabel },
    { id: "deleted", label: deletedTabLabel },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Typography
          variant="label-1"
          as="p"
          className="max-w-2xl text-cms-muted"
        >
          {description}
        </Typography>

        {createHref && createLabel ? (
          <Link
            href={createHref}
            className="inline-flex h-9 items-center gap-2 rounded-lg bg-cms-primary px-3.5 text-sm font-medium text-white shadow-[0_1px_2px_rgba(16,24,40,0.08)] transition-colors hover:bg-cms-primary-hover"
          >
            <Plus className="size-4" />
            {createLabel}
          </Link>
        ) : null}
      </div>

      <div
        role="tablist"
        className="flex gap-6 border-b border-cms-border"
      >
        {tabs.map((t) => {
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onTabChange(t.id)}
              className={`-mb-px border-b-2 pb-2.5 text-sm font-medium transition-colors ${
                active
                  ? "border-cms-primary text-cms-ink"
                  : "border-transparent text-cms-muted hover:border-cms-border-strong hover:text-cms-ink"
              }`}
            >
              {t.label}
            </button>
          );
        })}
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
