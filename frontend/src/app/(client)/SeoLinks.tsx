import React from "react";
import { PAGE_SEO, PROGRAM_PAGE_MAP } from "@/lib/seo";
import {
  publicPatientStoriesApi,
  publicProjectsApi,
  publicEventsApi,
} from "@/domains/cms/lib/api";

type SeoLinkItem = {
  href: string;
  title: string;
  description: string;
};

let cachedLinks: SeoLinkItem[] | null = null;
let lastFetchedAt = 0;
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes cache

async function getSiteLinks(): Promise<SeoLinkItem[]> {
  const now = Date.now();
  if (cachedLinks && now - lastFetchedAt < CACHE_TTL_MS) {
    return cachedLinks;
  }

  const links: SeoLinkItem[] = [];

  // 1. Static Main Pages from PAGE_SEO
  for (const [path, info] of Object.entries(PAGE_SEO)) {
    links.push({
      href: path,
      title: info.title.split("|")[0].trim(),
      description: info.description,
    });
  }

  // 2. Published Patient Stories (all published pages)
  try {
    let page = 1;
    let totalPages = 1;
    while (page <= totalPages) {
      const res = await publicPatientStoriesApi.listPublished({ page, limit: 100 });
      if (res?.meta?.totalPages) {
        totalPages = res.meta.totalPages;
      }
      if (res?.data && res.data.length > 0) {
        for (const story of res.data) {
          links.push({
            href: `/patient-stories/${story.slug || story.id}`,
            title: story.title ? `Support ${story.title}'s Cancer Journey` : "Patient Story",
            description:
              story.shortDescription ||
              `Support ${story.title || "patient"}'s cancer treatment and recovery journey with HCG Foundation.`,
          });
        }
      }
      page++;
    }
  } catch (error) {
    console.error("SeoLinks: Failed to fetch patient stories:", error);
  }

  // 3. Published Projects (all published pages)
  try {
    let page = 1;
    let totalPages = 1;
    while (page <= totalPages) {
      const res = await publicProjectsApi.listPublished({ page, limit: 100 });
      if (res?.meta?.totalPages) {
        totalPages = res.meta.totalPages;
      }
      if (res?.data && res.data.length > 0) {
        for (const project of res.data) {
          const key = (project.slug || project.id || "").toLowerCase();
          if (PROGRAM_PAGE_MAP[key]) {
            continue; // Core program page is already included in static main pages
          }
          links.push({
            href: `/projects/${project.slug || project.id}`,
            title: project.title || "Project",
            description:
              project.shortDescription ||
              `Learn about ${project.title || "project"} and HCG Foundation's initiatives.`,
          });
        }
      }
      page++;
    }
  } catch (error) {
    console.error("SeoLinks: Failed to fetch projects:", error);
  }

  // 4. Published Events (all published pages)
  try {
    let page = 1;
    let totalPages = 1;
    while (page <= totalPages) {
      const res = await publicEventsApi.listPublished({ page, limit: 100 });
      if (res?.meta?.totalPages) {
        totalPages = res.meta.totalPages;
      }
      if (res?.data && res.data.length > 0) {
        for (const event of res.data) {
          links.push({
            href: `/events/${event.slug || event.id}`,
            title: event.title || "Event",
            description:
              event.shortDescription ||
              `Learn about ${event.title || "event"} and join HCG Foundation initiatives.`,
          });
        }
      }
      page++;
    }
  } catch (error) {
    console.error("SeoLinks: Failed to fetch events:", error);
  }

  if (links.length > 0) {
    cachedLinks = links;
    lastFetchedAt = now;
  }

  return cachedLinks || links;
}

export async function SeoLinks() {
  const links = await getSiteLinks();

  return (
    <nav aria-label="Site Directory" className="sr-only">
      <h2>HCG Foundation Site Directory</h2>
      <ul>
        {links.map((link, idx) => (
          <li key={`${link.href}-${idx}`}>
            <a href={link.href}>{link.title}</a>: {link.description}
          </li>
        ))}
      </ul>
    </nav>
  );
}
