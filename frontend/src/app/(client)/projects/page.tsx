import React from "react";
import ProjectsClient from "./ProjectsClient";
import { publicProjectsApi } from "@/domains/cms/lib/api";
import { ProjectItem, PROJECTS_DATA } from "@/domains/resources/constants/projects";
import { PROGRAM_PAGE_MAP } from "@/lib/seo";

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
      const validCms = res.data.filter((p) => {
        const key = (p.slug || p.id || "").toLowerCase();
        return !PROGRAM_PAGE_MAP[key];
      });

      if (validCms.length > 0) {
        initialProjects = validCms.map((p) => ({
          id: p.id ?? "",
          slug: p.slug ?? "",
          title: p.title ?? "",
          category: "Projects",
          summary: p.shortDescription ?? "",
          fullStory: p.content ?? "",
          imageUrl: p.projectBanner || p.projectMobileBanner || "",
          mobileImageUrl: p.projectMobileBanner || p.projectBanner || "",
        }));
        initialTotalCount = res.meta?.total ?? validCms.length;
      } else {
        // Fallback to static projects catalogue when CMS only has core program entries
        initialProjects = PROJECTS_DATA.slice(0, 6);
        initialTotalCount = PROJECTS_DATA.length;
      }
    } else {
      initialProjects = PROJECTS_DATA.slice(0, 6);
      initialTotalCount = PROJECTS_DATA.length;
    }
  } catch {
    initialProjects = PROJECTS_DATA.slice(0, 6);
    initialTotalCount = PROJECTS_DATA.length;
  }

  return (
    <ProjectsClient
      initialProjects={initialProjects}
      initialTotalCount={initialTotalCount}
      initialPage={initialPage}
    />
  );
}
