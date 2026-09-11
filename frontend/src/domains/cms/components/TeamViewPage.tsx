"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, ExternalLink, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/shared/ui/button";
import TeamMemberCard from "@/domains/about/components/TeamMemberCard";
import { cmsApi } from "@/domains/cms/lib/api";
import type { Team } from "@/domains/cms/lib/types";
import { cmsToast } from "@/domains/cms/lib/toast";
import CmsHtmlContent from "./CmsHtmlContent";

function plainText(value?: string | null) {
  if (!value) return "";
  return value
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export default function TeamViewPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await cmsApi.getTeam(id);
        if (!cancelled) setTeam(res.data);
      } catch (err) {
        if (!cancelled) {
          const message =
            err instanceof Error ? err.message : "Failed to load";
          setError(message);
          cmsToast.error(message);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id]);

  const onDelete = async () => {
    if (!team || !window.confirm(`Delete “${team.title}”?`)) return;
    setDeleting(true);
    try {
      const res = await cmsApi.deleteTeam(team.id);
      cmsToast.success(res?.message || "Team member deleted successfully");
      router.replace("/admin/team");
    } catch (err) {
      cmsToast.error(
        err instanceof Error ? err.message : "Failed to delete"
      );
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-16 text-center font-manrope text-sm text-muted-foreground">
        Loading trustee…
      </div>
    );
  }

  if (error || !team) {
    return (
      <div className="space-y-4">
        <Link
          href="/admin/team"
          className="inline-flex items-center gap-1.5 font-manrope text-sm text-[#5C5C5C] hover:text-[#212121]"
        >
          <ArrowLeft className="size-3.5" />
          Back to list
        </Link>
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 font-manrope text-sm text-red-700">
          {error || "Trustee not found"}
        </div>
      </div>
    );
  }

  const hoverDescription =
    plainText(team.content) || plainText(team.shortDescription);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link
            href="/admin/team"
            className="mb-3 inline-flex items-center gap-1.5 font-manrope text-sm text-[#5C5C5C] transition hover:text-[#212121]"
          >
            <ArrowLeft className="size-3.5" />
            Back to list
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="font-manrope text-xl font-semibold text-[#212121] sm:text-2xl">
              {team.title}
            </h2>
            <span className="rounded-full bg-[#E8F0F6] px-2.5 py-0.5 font-manrope text-xs font-medium capitalize text-[#1A4A6E]">
              {team.memberType ?? "trustee"}
            </span>
            <span className="rounded-full bg-[#FFF1C2] px-2.5 py-0.5 font-manrope text-xs font-medium text-[#7A5A00]">
              {team.status}
            </span>
          </div>
          {team.designation ? (
            <p className="mt-1 font-manrope text-sm text-[#9A7B00]">
              {team.designation}
            </p>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {team.status === "published" ? (
            <Link
              href="/about/our-team"
              target="_blank"
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-black/10 bg-white px-3 font-manrope text-sm text-[#212121] transition hover:bg-[#F7F7F5]"
            >
              <ExternalLink className="size-3.5" />
              Public page
            </Link>
          ) : null}
          <Link
            href={`/admin/team/${team.id}/edit`}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#FCCC2D] px-3 font-manrope text-sm font-semibold text-[#212121] transition hover:brightness-105"
          >
            <Pencil className="size-3.5" />
            Edit
          </Link>
          <Button
            type="button"
            variant="outline"
            className="h-9 text-destructive"
            disabled={deleting}
            onClick={() => void onDelete()}
          >
            <Trash2 className="size-3.5" />
            {deleting ? "Deleting…" : "Delete"}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(240px,300px)_minmax(0,1fr)]">
        {/* Card preview — hover shows short description */}
        <div className="rounded-3xl bg-[#F3EEE3] p-5 sm:p-6">
          <p className="mb-4 text-center font-manrope text-[11px] font-semibold tracking-[0.16em] text-[#8A7A55] uppercase">
            Card preview · hover to slide content up
          </p>
          <div className="mx-auto w-full max-w-[260px]">
            <TeamMemberCard
              name={team.title}
              designation={team.designation}
              imageUrl={team.teamImage}
              description={hoverDescription || undefined}
              variant={team.memberType === "team" ? "team" : "trustee"}
            />
          </div>
        </div>

        {/* CMS content always visible */}
        <div className="space-y-4">
          <section className="rounded-2xl bg-white p-5 ring-1 ring-black/5 sm:p-6">
            <h3 className="mb-3 font-manrope text-xs font-semibold tracking-[0.16em] text-[#9A9A9A] uppercase">
              Short description
            </h3>
            {team.shortDescription ? (
              <p className="font-manrope text-sm leading-relaxed text-[#444]">
                {team.shortDescription}
              </p>
            ) : (
              <p className="font-manrope text-sm text-muted-foreground">
                No short description — add one in Edit for the card hover.
              </p>
            )}
          </section>

          <section className="rounded-2xl bg-white p-5 ring-1 ring-black/5 sm:p-6">
            <h3 className="mb-3 font-manrope text-xs font-semibold tracking-[0.16em] text-[#9A9A9A] uppercase">
              Content
            </h3>
            {team.content ? (
              <CmsHtmlContent html={team.content} className="text-sm" />
            ) : (
              <p className="font-manrope text-sm text-muted-foreground">
                No content yet — add it in Edit (TinyMCE).
              </p>
            )}
          </section>

          <section className="rounded-2xl bg-white p-5 ring-1 ring-black/5 sm:p-6">
            <h3 className="mb-3 font-manrope text-xs font-semibold tracking-[0.16em] text-[#9A9A9A] uppercase">
              SEO
            </h3>
            <dl className="grid gap-3 font-manrope text-sm sm:grid-cols-2">
              <div>
                <dt className="text-xs text-muted-foreground">Meta title</dt>
                <dd className="mt-0.5">{team.metaTitle || "—"}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">
                  Meta description
                </dt>
                <dd className="mt-0.5">{team.metaDescription || "—"}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-xs text-muted-foreground">Schema</dt>
                <dd className="mt-0.5 whitespace-pre-wrap break-all">
                  {team.schemaCode || "—"}
                </dd>
              </div>
            </dl>
          </section>
        </div>
      </div>
    </div>
  );
}
