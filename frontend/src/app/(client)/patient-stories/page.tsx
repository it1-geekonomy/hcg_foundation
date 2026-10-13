import React from "react";
import PatientStoriesClient from "./PatientStoriesClient";
import { publicPatientStoriesApi } from "@/domains/cms/lib/api";
import { PatientStory } from "@/domains/journey-of-hope/constants/stories";

function formatStoryDate(dateStr?: string | null): string {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export default async function PatientStoriesPage({
  searchParams,
}: {
  searchParams?: Promise<{ page?: string; search?: string }>;
}) {
  const resolvedParams = searchParams ? await searchParams : {};
  const pageParam = parseInt(resolvedParams.page || "1", 10);
  const initialPage = isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;
  const initialSearch = resolvedParams.search || "";

  let initialStories: PatientStory[] | null = null;
  let initialTotalCount: number | null = null;

  try {
    const res = await publicPatientStoriesApi.listPublished({
      page: initialPage,
      limit: 8,
      search: initialSearch || undefined,
    });

    if (res?.data && res.data.length > 0) {
      initialStories = res.data.map((item) => ({
        id: item.id,
        slug: item.slug,
        patientName: item.title,
        date: formatStoryDate(item.storyDate),
        conditionTag: item.donationState || "Patient Journey",
        excerpt: item.shortDescription || "",
        fullStory: item.content || "",
        imageUrl: item.patientImage || "",
        heroImageUrl: item.patientImage || "",
      }));
      initialTotalCount = res.meta?.total ?? initialStories.length;
    } else {
      initialStories = [];
      initialTotalCount = 0;
    }
  } catch {
    // If API is unreachable during SSR, client component will attempt fetching
    initialStories = null;
    initialTotalCount = null;
  }

  return (
    <PatientStoriesClient
      initialStories={initialStories}
      initialTotalCount={initialTotalCount}
      initialPage={initialPage}
      initialSearch={initialSearch}
    />
  );
}
