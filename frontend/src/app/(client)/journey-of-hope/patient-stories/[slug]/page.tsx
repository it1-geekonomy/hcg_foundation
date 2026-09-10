"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, Calendar } from "lucide-react";
import Typography from "@/lib/Typography";
import { publicPatientStoriesApi } from "@/domains/cms/lib/api";
import type { PatientStory } from "@/domains/cms/lib/types";
import { formatStoryDate } from "@/domains/home/constants/smile";

export default function PatientStoryDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [story, setStory] = useState<PatientStory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await publicPatientStoriesApi.getBySlug(slug);
        if (!cancelled) {
          if (res.data.status !== "published") {
            setError("Story not found");
            setStory(null);
          } else {
            setStory(res.data);
          }
        }
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
  }, [slug]);

  if (loading) {
    return (
      <div className="py-24 text-center font-manrope text-sm text-muted-foreground">
        Loading story…
      </div>
    );
  }

  if (error || !story) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <Link
          href="/journey-of-hope/patient-stories"
          className="inline-flex items-center gap-1.5 font-manrope text-sm text-[#5C5C5C] hover:text-[#212121]"
        >
          <ArrowLeft className="size-3.5" />
          All stories
        </Link>
        <p className="mt-6 font-manrope text-sm text-red-600">
          {error || "Story not found"}
        </p>
      </div>
    );
  }

  return (
    <article className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6 lg:py-16">
      <Link
        href="/journey-of-hope/patient-stories"
        className="mb-8 inline-flex items-center gap-1.5 font-manrope text-sm text-[#5C5C5C] transition hover:text-[#212121]"
      >
        <ArrowLeft className="size-3.5" />
        All stories
      </Link>

      <div className="grid gap-8 lg:grid-cols-[minmax(220px,280px)_minmax(0,1fr)]">
        <div className="overflow-hidden rounded-2xl bg-[#F0EEE9]">
          <div className="relative aspect-[3/4]">
            {story.patientImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={story.patientImage}
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
              />
            ) : null}
          </div>
        </div>

        <div>
          <Typography
            variant="heading-3"
            as="h1"
            className="text-[#382E07] font-manrope"
          >
            {story.title}
          </Typography>
          <div className="mt-3 flex flex-wrap gap-3 font-manrope text-sm text-[#5C5C5C]">
            {story.storyDate ? (
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="size-4" />
                {formatStoryDate(story.storyDate)}
              </span>
            ) : null}
            {story.donationState ? (
              <span className="rounded-full bg-[#FFF1C2] px-2.5 py-0.5 text-xs font-medium text-[#7A5A00]">
                {story.donationState}
              </span>
            ) : null}
          </div>
          {story.shortDescription ? (
            <p className="mt-4 font-manrope text-base leading-relaxed text-[#444]">
              {story.shortDescription}
            </p>
          ) : null}
          {story.content ? (
            <div
              className="prose prose-sm mt-8 max-w-none font-manrope text-[#212121]"
              dangerouslySetInnerHTML={{ __html: story.content }}
            />
          ) : null}
        </div>
      </div>
    </article>
  );
}
