"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowLeft, Loader2, Pencil, RotateCcw, Trash2 } from "lucide-react";
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
    status: "bg-amber-50 text-amber-800 ring-amber-600/20",
    info: "bg-sky-50 text-sky-800 ring-sky-600/20",
    danger: "bg-red-50 text-red-700 ring-red-600/20",
    success: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  } as const;

  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium capitalize ring-1 ring-inset ${tones[tone]}`}
    >
      {children}
    </span>
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
      className="mb-3 inline-flex w-fit items-center gap-1.5 text-[13px] font-medium text-cms-muted transition-colors hover:text-cms-ink"
    >
      <ArrowLeft className="size-3.5" />
      {label}
    </Link>
  );
}

export function CmsViewLoading({ label }: { label: string }) {
  return (
    <div className="flex min-h-[40vh] items-center justify-center gap-2 text-sm text-cms-muted">
      <Loader2 className="size-4 animate-spin" />
      {label}
    </div>
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
    <div className="space-y-2">
      <CmsBackLink href={backHref} />
      <Typography
        variant="label-1"
        as="div"
        className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 font-medium text-red-700"
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
    <div className="border-b border-cms-border pb-5">
      <CmsBackLink href={backHref} />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <Typography
              variant="heading-5"
              as="h1"
              className="min-w-0 break-words text-cms-ink"
            >
              {title}
            </Typography>
            {badges ? (
              <div className="flex flex-wrap items-center gap-1.5">{badges}</div>
            ) : null}
          </div>
          {meta ? (
            <div className="mt-1 text-sm text-cms-muted [&_*]:!text-cms-muted">
              {meta}
            </div>
          ) : null}
        </div>
        {actions ? (
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            {actions}
          </div>
        ) : null}
      </div>
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
            disabled={busy}
            onClick={() => void onRestore()}
          >
            <RotateCcw className="size-4" />
            {busy ? "Restoring…" : "Restore"}
          </Button>
        ) : null
      ) : (
        <>
          <Button
            type="button"
            variant="destructive"
            disabled={busy}
            onClick={() => void onDelete()}
          >
            <Trash2 className="size-4" />
            {busy ? "Deleting…" : "Delete"}
          </Button>
          <Link
            href={editHref}
            className="inline-flex h-9 items-center gap-2 rounded-lg bg-cms-primary px-3.5 text-sm font-medium text-white shadow-[0_1px_2px_rgba(16,24,40,0.08)] transition-colors hover:bg-cms-primary-hover"
          >
            <Pencil className="size-4" />
            Edit
          </Link>
        </>
      )}
    </>
  );
}

export function CmsDetailCard({
  title,
  children,
  className = "",
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`overflow-hidden rounded-xl border border-cms-border bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)] ${className}`}
    >
      <div className="border-b border-cms-border px-5 py-3.5">
        <Typography variant="heading-7" as="h3" className="text-cms-ink">
          {title}
        </Typography>
      </div>
      <div className="p-5">{children}</div>
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
    <div className={`flex min-w-0 flex-col gap-1 ${className}`}>
      <dt className="text-xs font-medium text-cms-muted">{label}</dt>
      <Typography
        variant="label-1"
        as="dd"
        className={
          isEmpty
            ? "text-cms-faint"
            : "break-words whitespace-pre-line text-cms-ink"
        }
      >
        {isEmpty ? empty : value}
      </Typography>
    </div>
  );
}

/** Horizontal label / value row for record detail lists. Wrap rows in a `<dl>`. */
export function CmsDetailRow({
  label,
  value,
}: {
  label: string;
  value?: ReactNode;
}) {
  const isEmpty =
    value == null ||
    value === "" ||
    (typeof value === "string" && !value.trim());

  return (
    <div className="grid gap-1 border-b border-cms-border py-3 first:pt-0 last:border-0 last:pb-0 sm:grid-cols-[200px_minmax(0,1fr)] sm:gap-6">
      <dt className="text-[13px] font-medium text-cms-muted">{label}</dt>
      <dd
        className={`min-w-0 text-sm break-words whitespace-pre-wrap ${
          isEmpty ? "text-cms-faint" : "text-cms-ink"
        }`}
      >
        {isEmpty ? "—" : value}
      </dd>
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
        <Typography variant="label-1" as="p" className="text-cms-faint">
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
      <dl className="grid gap-4">
        <CmsDetailField label="Meta title" value={metaTitle} />
        <CmsDetailField label="Meta description" value={metaDescription} />
        <CmsDetailField
          label="Schema"
          value={
            schemaCode?.trim() ? (
              <code className="block max-h-48 overflow-auto rounded-md bg-cms-subtle p-3 font-mono text-xs text-cms-body">
                {schemaCode}
              </code>
            ) : null
          }
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
    <div className="overflow-hidden rounded-lg border border-cms-border bg-white">
      {label ? (
        <p className="border-b border-cms-border px-3 py-2 text-xs font-medium text-cms-muted">
          {label}
        </p>
      ) : null}
      <div
        className={`relative bg-cms-subtle bg-[linear-gradient(45deg,#eef0f3_25%,transparent_25%,transparent_75%,#eef0f3_75%),linear-gradient(45deg,#eef0f3_25%,transparent_25%,transparent_75%,#eef0f3_75%)] bg-[length:16px_16px] bg-[position:0_0,8px_8px] ${className}`}
      >
        {src?.trim() ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt={alt}
            className="absolute inset-0 h-full w-full object-contain object-center p-3"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-sm text-cms-faint">
            {empty}
          </div>
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
    <div className="border-b border-cms-border pb-5">
      <CmsBackLink href={backHref} label={backLabel} />
      <Typography variant="heading-8" as="h1" className="text-cms-ink">
        {title}
      </Typography>
      {description ? (
        <Typography variant="label-1" as="p" className="mt-1 text-cms-muted">
          {description}
        </Typography>
      ) : null}
    </div>
  );
}
