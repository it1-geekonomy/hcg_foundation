"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowLeft, Pencil, RotateCcw, Trash2 } from "lucide-react";
import Typography from "@/lib/Typography";
import { Button } from "@/shared/ui/button";
import CmsHtmlContent from "@/domains/cms/ui/CmsHtmlContent";

export function cmsErrorMessage(
  err: unknown,
  fallback = "Something went wrong",
) {
  return err instanceof Error ? err.message : fallback;
}

export function formatCmsDateTime(value?: string | null) {
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

export function CmsBadge({
  children,
  tone = "status",
}: {
  children: ReactNode;
  tone?: "status" | "info" | "danger" | "success";
}) {
  const tones = {
    status: "bg-[#FFF1C2] text-[#7A5A00]",
    info: "bg-[#E8F0F6] text-[#1A4A6E]",
    danger: "bg-red-50 text-red-700",
    success: "bg-[#E8F6EC] text-[#1B6B3A]",
  } as const;

  return (
    <Typography
      variant="caption-1"
      as="span"
      className={`rounded-full px-2.5 py-0.5 font-medium ${tones[tone]}`}
    >
      {children}
    </Typography>
  );
}

export function CmsBackLink({
  href,
  label = "Back to list",
}: {
  href: string;
  label?: string;
}) {
  return (
    <Link
      href={href}
      className="mb-3 inline-flex items-center gap-1.5 text-[#5C5C5C] transition hover:text-[#212121]"
    >
      <ArrowLeft className="size-3.5" />
      <Typography variant="label-1" as="span">
        {label}
      </Typography>
    </Link>
  );
}

export function CmsViewLoading({ label }: { label: string }) {
  return (
    <Typography
      variant="label-1"
      as="div"
      className="py-16 text-center text-muted-foreground"
    >
      {label}
    </Typography>
  );
}

export function CmsViewError({
  backHref,
  message,
}: {
  backHref: string;
  message: string;
}) {
  return (
    <div className="space-y-4">
      <CmsBackLink href={backHref} />
      <Typography
        variant="label-1"
        as="div"
        className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700"
      >
        {message}
      </Typography>
    </div>
  );
}

export function CmsViewHeader({
  backHref,
  title,
  badges,
  meta,
  actions,
}: {
  backHref: string;
  title: string;
  badges?: ReactNode;
  meta?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <CmsBackLink href={backHref} />
        <div className="flex flex-wrap items-center gap-3">
          <Typography
            variant="heading-8"
            as="h2"
            className="font-semibold text-[#212121]"
          >
            {title}
          </Typography>
          {badges}
        </div>
        {meta}
      </div>
      {actions ? (
        <div className="flex flex-wrap items-center gap-2">{actions}</div>
      ) : null}
    </div>
  );
}

/** Standard Edit / Delete / Restore action cluster for content views. */
export function CmsRecordActions({
  isDeleted,
  busy,
  editHref,
  onDelete,
  onRestore,
  extra,
}: {
  isDeleted: boolean;
  busy: boolean;
  editHref: string;
  onDelete: () => void;
  onRestore?: () => void;
  extra?: ReactNode;
}) {
  return (
    <>
      {extra}
      {isDeleted ? (
        onRestore ? (
          <Button
            type="button"
            variant="outline"
            className="h-9 gap-1.5 border-black/10 bg-white text-[#212121] hover:bg-[#F0F0EC] hover:text-[#212121]"
            disabled={busy}
            onClick={() => void onRestore()}
          >
            <RotateCcw className="size-3.5" />
            {busy ? "Restoring…" : "Restore"}
          </Button>
        ) : null
      ) : (
        <>
          <Link
            href={editHref}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#FCCC2D] px-3 text-[#212121] transition hover:brightness-105"
          >
            <Pencil className="size-3.5" />
            <Typography variant="button-3" as="span">
              Edit
            </Typography>
          </Link>
          <Button
            type="button"
            variant="outline"
            className="h-9 text-destructive"
            disabled={busy}
            onClick={() => void onDelete()}
          >
            <Trash2 className="size-3.5" />
            {busy ? "Deleting…" : "Delete"}
          </Button>
        </>
      )}
    </>
  );
}

export function CmsDetailCard({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl bg-white p-5 ring-1 ring-black/5 sm:p-6">
      <Typography
        variant="caption-1"
        as="h3"
        className="mb-3 font-semibold tracking-[0.16em] text-[#9A9A9A] uppercase"
      >
        {title}
      </Typography>
      {children}
    </section>
  );
}

export function CmsDetailField({
  label,
  value,
  empty = "—",
  className = "",
}: {
  label: string;
  value?: ReactNode;
  empty?: string;
  className?: string;
}) {
  const isEmpty =
    value == null ||
    value === "" ||
    (typeof value === "string" && !value.trim());

  return (
    <div className={className}>
      <Typography variant="caption-1" as="dt" className="mb-1 text-[#9A9A9A]">
        {label}
      </Typography>
      <Typography
        variant="label-1"
        as="dd"
        className={
          isEmpty
            ? "text-muted-foreground"
            : "leading-relaxed whitespace-pre-wrap text-[#212121]"
        }
      >
        {isEmpty ? empty : value}
      </Typography>
    </div>
  );
}

export function CmsHtmlContentCard({
  title = "Content",
  html,
  empty = "No content yet.",
}: {
  title?: string;
  html?: string | null;
  empty?: string;
}) {
  return (
    <CmsDetailCard title={title}>
      {html?.trim() ? (
        <CmsHtmlContent html={html} />
      ) : (
        <Typography
          variant="label-1"
          as="p"
          className="text-muted-foreground"
        >
          {empty}
        </Typography>
      )}
    </CmsDetailCard>
  );
}

export function CmsSeoCard({
  metaTitle,
  metaDescription,
  schemaCode,
}: {
  metaTitle?: string | null;
  metaDescription?: string | null;
  schemaCode?: string | null;
}) {
  return (
    <CmsDetailCard title="SEO">
      <dl className="grid gap-3 sm:grid-cols-2">
        <CmsDetailField label="Meta title" value={metaTitle} />
        <CmsDetailField label="Meta description" value={metaDescription} />
        <CmsDetailField
          label="Schema"
          value={schemaCode}
          className="sm:col-span-2"
        />
      </dl>
    </CmsDetailCard>
  );
}

export function CmsMediaTile({
  src,
  alt = "",
  label,
  empty = "No image",
  className = "h-56",
}: {
  src?: string | null;
  alt?: string;
  label?: string;
  empty?: string;
  className?: string;
}) {
  return (
    <div className="overflow-hidden rounded-xl bg-white shadow-[0_4px_14px_rgba(0,0,0,0.05)] ring-1 ring-black/5">
      {label ? (
        <Typography
          variant="caption-1"
          as="p"
          className="border-b border-black/5 px-3 py-2 font-medium text-[#9A9A9A]"
        >
          {label}
        </Typography>
      ) : null}
      <div className={`relative bg-[#F0EEE9] ${className}`}>
        {src?.trim() ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt={alt}
            className="absolute inset-0 h-full w-full object-contain object-center p-3"
          />
        ) : (
          <Typography
            variant="label-1"
            as="div"
            className="absolute inset-0 flex items-center justify-center text-[#9A9A9A]"
          >
            {empty}
          </Typography>
        )}
      </div>
    </div>
  );
}

/** Create / Edit page title block. */
export function CmsFormPageHeader({
  backHref,
  backLabel = "Back to list",
  title,
  description,
}: {
  backHref: string;
  backLabel?: string;
  title: string;
  description?: ReactNode;
}) {
  return (
    <div>
      <CmsBackLink href={backHref} label={backLabel} />
      <Typography
        variant="heading-8"
        as="h1"
        className="font-semibold text-[#212121]"
      >
        {title}
      </Typography>
      {description ? (
        <Typography
          variant="label-1"
          as="p"
          className="mt-1 text-muted-foreground"
        >
          {description}
        </Typography>
      ) : null}
    </div>
  );
}
