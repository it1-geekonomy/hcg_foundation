import React from "react";
import { PAGE_SEO } from "@/lib/seo";
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

export async function SeoLinks() {
  const links: SeoLinkItem[] = [];

  // 1. Static Main Pages from PAGE_SEO
  for (const [path, info] of Object.entries(PAGE_SEO)) {
    links.push({
      href: path,
      title: info.title.split("|")[0].trim(),
      description: info.description,
    });
  }

  // Optional supplementary team route if desired
  links.push({
    href: "/team",
    title: "HCG Foundation Team",
    description: "Find hope and support with HCG Foundation's team.",
  });

  // 2. Published Patient Stories (dynamically fetched from API so newly published stories automatically appear)
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

  // 3. Published Projects
  try {
    let page = 1;
    let totalPages = 1;
    while (page <= totalPages) {
      const res = await publicProjectsApi.listPublished({ page, limit: 50 });
      if (res?.meta?.totalPages) {
        totalPages = res.meta.totalPages;
      }
      if (res?.data && res.data.length > 0) {
        for (const project of res.data) {
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

  // 4. Published Events
  try {
    let page = 1;
    let totalPages = 1;
    while (page <= totalPages) {
      const res = await publicEventsApi.listPublished({ page, limit: 50 });
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

  return (
    <div className="sr-only" aria-hidden="true">
      <h2>Site Index</h2>
      <ul>
        {links.map((link, idx) => (
          <li key={`${link.href}-${idx}`}>
            <a href={link.href}>{link.title}</a>: {link.description}
          </li>
        ))}
      </ul>
    </div>
  );
}
