import { MetadataRoute } from "next";
import { absoluteUrl, PAGE_SEO } from "@/lib/seo";
import {
  publicPatientStoriesApi,
  publicProjectsApi,
  publicEventsApi,
} from "@/domains/cms/lib/api";

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const routes: MetadataRoute.Sitemap = [];

  // 1. Static Pages
  for (const path of Object.keys(PAGE_SEO)) {
    routes.push({
      url: absoluteUrl(path),
      lastModified: new Date(),
      changeFrequency: path === "/" ? "daily" : "weekly",
      priority: path === "/" ? 1.0 : 0.8,
    });
    
  }

  try {
    // 2. Patient Stories
    let page = 1;
    let totalPages = 1;
    while (page <= totalPages) {
      const storiesRes = await publicPatientStoriesApi.listPublished({ page, limit: 100 });
      if (storiesRes?.meta?.totalPages) {
        totalPages = storiesRes.meta.totalPages;
      }
      if (storiesRes?.data) {
        for (const story of storiesRes.data) {
          routes.push({
            url: absoluteUrl(`/patient-stories/${story.slug || story.id}`),
            lastModified: story.updatedAt
              ? new Date(story.updatedAt)
              : story.createdAt
              ? new Date(story.createdAt)
              : new Date(),
            changeFrequency: "monthly",
            priority: 0.7,
          });
        }
      }
      page++;
    }

    // 3. Projects
    page = 1;
    totalPages = 1;
    while (page <= totalPages) {
      const projectsRes = await publicProjectsApi.listPublished({ page, limit: 100 });
      if (projectsRes?.meta?.totalPages) {
        totalPages = projectsRes.meta.totalPages;
      }
      if (projectsRes?.data) {
        for (const project of projectsRes.data) {
          routes.push({
            url: absoluteUrl(`/projects/${project.slug || project.id}`),
            lastModified: project.updatedAt
              ? new Date(project.updatedAt)
              : project.createdAt
              ? new Date(project.createdAt)
              : new Date(),
            changeFrequency: "monthly",
            priority: 0.7,
          });
        }
      }
      page++;
    }

    // 4. Events
    page = 1;
    totalPages = 1;
    while (page <= totalPages) {
      const eventsRes = await publicEventsApi.listPublished({ page, limit: 100 });
      if (eventsRes?.meta?.totalPages) {
        totalPages = eventsRes.meta.totalPages;
      }
      if (eventsRes?.data) {
        for (const event of eventsRes.data) {
          routes.push({
            url: absoluteUrl(`/events/${event.slug || event.id}`),
            lastModified: event.updatedAt
              ? new Date(event.updatedAt)
              : event.createdAt
              ? new Date(event.createdAt)
              : new Date(),
            changeFrequency: "monthly",
            priority: 0.7,
          });
        }
      }
      page++;
    }
  } catch (error) {
    console.error("Failed to fetch CMS content for sitemap:", error);
  }

  return routes;
}
