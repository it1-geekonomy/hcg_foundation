"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Calendar } from "lucide-react";
import Typography from "@/lib/Typography";
import { publicPatientStoriesApi } from "@/domains/cms/lib/api";
import type { PatientStory } from "@/domains/cms/lib/types";
import { formatStoryDate } from "@/domains/home/constants/smile";

export default function PatientStoriesPage() {
  const [stories, setStories] = useState<PatientStory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await publicPatientStoriesApi.listPublished({ limit: 50 });
        if (!cancelled) setStories(res.data ?? []);
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
  }, []);

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
      <div className="mx-auto max-w-2xl text-center">
        <Typography
          variant="heading-3"
          as="h1"
          className="text-[#382E07] font-manrope"
        >
          Patient Stories
        </Typography>
        <p className="mt-3 font-manrope text-sm text-[#5C5C5C] sm:text-base">
          Real journeys of hope, courage, and recovery.
        </p>
      </div>

      {loading ? (
        <p className="mt-16 text-center font-manrope text-sm text-muted-foreground">
          Loading stories…
        </p>
      ) : error ? (
        <p className="mt-16 text-center font-manrope text-sm text-red-600">
          {error}
        </p>
      ) : stories.length === 0 ? (
        <p className="mt-16 text-center font-manrope text-sm text-muted-foreground">
          No published stories yet.
        </p>
      ) : (
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {stories.map((story) => (
            <Link
              key={story.id}
              href={`/journey-of-hope/patient-stories/${story.slug}`}
              className="group overflow-hidden rounded-2xl bg-white shadow-[0_8px_24px_rgba(0,0,0,0.06)] ring-1 ring-black/[0.04] transition hover:-translate-y-0.5 hover:shadow-[0_14px_32px_rgba(0,0,0,0.1)]"
            >
              <div className="relative aspect-[4/5] bg-[#F0EEE9]">
                {story.patientImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={story.patientImage}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                  />
                ) : null}
              </div>
              <div className="space-y-1.5 p-4">
                <h2 className="font-manrope text-lg font-semibold text-[#212121]">
                  {story.title}
                </h2>
                {story.storyDate ? (
                  <p className="flex items-center gap-1.5 font-manrope text-xs text-[#8A8A8A]">
                    <Calendar className="size-3.5" />
                    {formatStoryDate(story.storyDate)}
                  </p>
                ) : null}
                {story.shortDescription ? (
                  <p className="line-clamp-2 font-manrope text-sm text-[#5C5C5C]">
                    {story.shortDescription}
                  </p>
                ) : null}
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
