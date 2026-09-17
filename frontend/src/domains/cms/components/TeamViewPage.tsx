"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import Typography from "@/lib/Typography";
import { Button } from "@/shared/ui/button";
import { PersonCard } from "@/domains/about/components/teamsection";
import { mapTeamToPerson } from "@/domains/about/constants/teams";
import { cmsApi } from "@/domains/cms/lib/api";
import type { Team } from "@/domains/cms/lib/types";
import { cmsToast } from "@/domains/cms/lib/toast";
import { cmsConfirm } from "@/domains/cms/lib/confirm";
import CmsHtmlContent from "./CmsHtmlContent";

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
    if (!team) return;
    const ok = await cmsConfirm({
      title: "Move to Recently Deleted?",
      description: `“${team.title}” will be soft-deleted. You can restore it later from Recently Deleted.`,
      confirmLabel: "Move to deleted",
      tone: "danger",
    });
    if (!ok) return;
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
      <Typography
        variant="label-1"
        as="div"
        className="py-16 text-center text-muted-foreground"
      >
        Loading member…
      </Typography>
    );
  }

  if (error || !team) {
    return (
      <div className="space-y-4">
        <Link
          href="/admin/team"
          className="inline-flex items-center gap-1.5 text-[#5C5C5C] hover:text-[#212121]"
        >
          <ArrowLeft className="size-3.5" />
          <Typography variant="label-1" as="span">
            Back to list
          </Typography>
        </Link>
        <Typography
          variant="label-1"
          as="div"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700"
        >
          {error || "Member not found"}
        </Typography>
      </div>
    );
  }

  const person = mapTeamToPerson(team);
  const isTrustee = team.type === "trustee";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link
            href="/admin/team"
            className="mb-3 inline-flex items-center gap-1.5 text-[#5C5C5C] transition hover:text-[#212121]"
          >
            <ArrowLeft className="size-3.5" />
            <Typography variant="label-1" as="span">
              Back to list
            </Typography>
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <Typography
              variant="heading-8"
              as="h2"
              className="font-semibold text-[#212121]"
            >
              {team.title}
            </Typography>
            <Typography
              variant="caption-1"
              as="span"
              className="rounded-full bg-[#E8F0F6] px-2.5 py-0.5 font-medium capitalize text-[#1A4A6E]"
            >
              {team.type ?? "team"}
            </Typography>
            <Typography
              variant="caption-1"
              as="span"
              className="rounded-full bg-[#FFF1C2] px-2.5 py-0.5 font-medium text-[#7A5A00]"
            >
              {team.status}
            </Typography>
          </div>
          {team.designation ? (
            <Typography
              variant="label-1"
              as="p"
              className="mt-1 text-[#9A7B00]"
            >
              {team.designation}
            </Typography>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/admin/team/${team.id}/edit`}
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
            disabled={deleting}
            onClick={() => void onDelete()}
          >
            <Trash2 className="size-3.5" />
            {deleting ? "Deleting…" : "Delete"}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(280px,340px)_minmax(0,1fr)]">
        <div className="overflow-hidden rounded-3xl bg-[#FFF6D8] p-6 sm:p-8">
          <Typography
            variant="caption-1"
            as="p"
            className="mb-2 text-center font-semibold tracking-[0.16em] text-[#8A7A55] uppercase"
          >
            Website preview · {isTrustee ? "Trustee" : "Team"} card
          </Typography>
          <Typography
            variant="caption-1"
            as="p"
            className="mb-8 text-center text-[#9A9A9A]"
          >
            Same flip card visitors see on About Us — click the arrow to open
          </Typography>
          <div className="mx-auto flex justify-center pt-10">
            <PersonCard {...person} />
          </div>
        </div>

        <div className="space-y-4">
          <section className="rounded-2xl bg-white p-5 ring-1 ring-black/5 sm:p-6">
            <Typography
              variant="caption-1"
              as="h3"
              className="mb-3 font-semibold tracking-[0.16em] text-[#9A9A9A] uppercase"
            >
              Content
            </Typography>
            {team.content ? (
              <CmsHtmlContent html={team.content} />
            ) : (
              <Typography
                variant="label-1"
                as="p"
                className="text-muted-foreground"
              >
                No content yet — add it in Edit (TinyMCE).
              </Typography>
            )}
          </section>

          <section className="rounded-2xl bg-white p-5 ring-1 ring-black/5 sm:p-6">
            <Typography
              variant="caption-1"
              as="h3"
              className="mb-3 font-semibold tracking-[0.16em] text-[#9A9A9A] uppercase"
            >
              SEO
            </Typography>
            <dl className="grid gap-3 sm:grid-cols-2">
              <div>
                <Typography
                  variant="caption-1"
                  as="dt"
                  className="text-muted-foreground"
                >
                  Meta title
                </Typography>
                <Typography variant="label-1" as="dd" className="mt-0.5">
                  {team.metaTitle || "—"}
                </Typography>
              </div>
              <div>
                <Typography
                  variant="caption-1"
                  as="dt"
                  className="text-muted-foreground"
                >
                  Meta description
                </Typography>
                <Typography variant="label-1" as="dd" className="mt-0.5">
                  {team.metaDescription || "—"}
                </Typography>
              </div>
              <div className="sm:col-span-2">
                <Typography
                  variant="caption-1"
                  as="dt"
                  className="text-muted-foreground"
                >
                  Schema
                </Typography>
                <Typography
                  variant="label-1"
                  as="dd"
                  className="mt-0.5 whitespace-pre-wrap break-all"
                >
                  {team.schemaCode || "—"}
                </Typography>
              </div>
            </dl>
          </section>
        </div>
      </div>
    </div>
  );
}
