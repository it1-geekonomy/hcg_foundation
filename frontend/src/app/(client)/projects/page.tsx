import React from "react";
import ProjectsClient from "./ProjectsClient";
import { publicProjectsApi } from "@/domains/cms/lib/api";
import { ProjectItem } from "@/domains/resources/constants/projects";

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams?: Promise<{ page?: string }>;
}) {
  const resolvedParams = searchParams ? await searchParams : {};
  const pageParam = parseInt(resolvedParams.page || "1", 10);
  const initialPage = isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;

  let initialProjects: ProjectItem[] | null = null;
  let initialTotalCount: number | null = null;

  try {
    const res = await publicProjectsApi.listPublished({
      page: initialPage,
      limit: 6,
    });

    if (res?.data && res.data.length > 0) {
      initialProjects = res.data.map((p) => ({
        id: p.id ?? "",
        slug: p.slug ?? "",
        title: p.title ?? "",
        category: "Projects",
        summary: p.shortDescription ?? "",
        fullStory: p.content ?? "",
        imageUrl: p.projectBanner || p.projectMobileBanner || "",
        mobileImageUrl: p.projectMobileBanner || p.projectBanner || "",
      }));
      initialTotalCount = res.meta?.total ?? initialProjects.length;
    } else {
      initialProjects = [];
      initialTotalCount = 0;
    }
  } catch {
    initialProjects = null;
    initialTotalCount = null;
  }

  return (
    <ProjectsClient
      initialProjects={initialProjects}
      initialTotalCount={initialTotalCount}
      initialPage={initialPage}
    />
  );
}
