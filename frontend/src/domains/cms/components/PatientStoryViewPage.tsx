"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, ExternalLink, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { cmsApi } from "@/domains/cms/lib/api";
import type { PatientStory } from "@/domains/cms/lib/types";

function formatDate(value?: string | null) {
  if (!value) return null;
  const d = new Date(value.slice(0, 10) + "T00:00:00");
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString(undefined, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function PatientStoryViewPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [story, setStory] = useState<PatientStory | null>(null);
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
        const res = await cmsApi.getPatientStory(id);
        if (!cancelled) setStory(res.data);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load");
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
    if (!story || !window.confirm(`Delete “${story.title}”?`)) return;
    setDeleting(true);
    try {
      await cmsApi.deletePatientStory(story.id);
      router.replace("/admin/patients");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete");
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-16 text-center font-manrope text-sm text-muted-foreground">
        Loading story…
      </div>
    );
  }

  if (error || !story) {
    return (
      <div className="space-y-4">
        <Link
          href="/admin/patients"
          className="inline-flex items-center gap-1.5 font-manrope text-sm text-[#5C5C5C] hover:text-[#212121]"
        >
          <ArrowLeft className="size-3.5" />
          Back to list
        </Link>
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 font-manrope text-sm text-red-700">
          {error || "Story not found"}
        </div>
      </div>
    );
  }

  const publicHref = `/journey-of-hope/patient-stories/${story.slug}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link
            href="/admin/patients"
            className="mb-3 inline-flex items-center gap-1.5 font-manrope text-sm text-[#5C5C5C] transition hover:text-[#212121]"
          >
            <ArrowLeft className="size-3.5" />
            Back to list
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="font-manrope text-xl font-semibold text-[#212121] sm:text-2xl">
              {story.title}
            </h2>
            <span className="rounded-full bg-[#FFF1C2] px-2.5 py-0.5 font-manrope text-xs font-medium text-[#7A5A00]">
              {story.status}
            </span>
          </div>
          <p className="mt-1 font-manrope text-sm text-muted-foreground">
            /{story.slug}
            {story.donationState ? ` · ${story.donationState}` : ""}
            {formatDate(story.storyDate)
              ? ` · ${formatDate(story.storyDate)}`
              : ""}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {story.status === "published" ? (
            <Link
              href={publicHref}
              target="_blank"
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-black/10 bg-white px-3 font-manrope text-sm text-[#212121] transition hover:bg-[#F7F7F5]"
            >
              <ExternalLink className="size-3.5" />
              Public page
            </Link>
          ) : null}
          <Link
            href={`/admin/patients/${story.id}/edit`}
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

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(180px,220px)_minmax(0,1fr)]">
        <div className="w-full self-start overflow-hidden rounded-xl bg-white shadow-[0_4px_14px_rgba(0,0,0,0.05)] ring-1 ring-black/[0.05]">
          <div className="relative h-40 bg-[#F0EEE9]">
            {story.patientImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={story.patientImage}
                alt={story.title}
                className="absolute inset-0 h-full w-full object-contain object-center p-2"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center font-manrope text-sm text-[#9A9A9A]">
                No image
              </div>
            )}
          </div>
          <div className="border-t border-black/[0.04] px-3 py-2.5 text-center">
            <p className="font-manrope text-sm font-semibold text-[#212121] line-clamp-2">
              {story.title}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <section className="rounded-2xl bg-white p-5 ring-1 ring-black/5 sm:p-6">
            <h3 className="mb-3 font-manrope text-xs font-semibold tracking-[0.16em] text-[#9A9A9A] uppercase">
              Short description
            </h3>
            {story.shortDescription ? (
              <p className="font-manrope text-sm leading-relaxed text-[#444]">
                {story.shortDescription}
              </p>
            ) : (
              <p className="font-manrope text-sm text-muted-foreground">—</p>
            )}
          </section>

          <section className="rounded-2xl bg-white p-5 ring-1 ring-black/5 sm:p-6">
            <h3 className="mb-3 font-manrope text-xs font-semibold tracking-[0.16em] text-[#9A9A9A] uppercase">
              Content
            </h3>
            {story.content ? (
              <div
                className="prose prose-sm max-w-none font-manrope text-[#212121]"
                dangerouslySetInnerHTML={{ __html: story.content }}
              />
            ) : (
              <p className="font-manrope text-sm text-muted-foreground">
                No content yet.
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
                <dd className="mt-0.5">{story.metaTitle || "—"}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">
                  Meta description
                </dt>
                <dd className="mt-0.5">{story.metaDescription || "—"}</dd>
              </div>
            </dl>
          </section>
        </div>
      </div>
    </div>
  );
}
