import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Typography from "@/lib/Typography";
import Banner from "@/shared/components/Herobannersection";
import DonateForm from "@/shared/components/DonateForm";
import ShareStory from "@/shared/components/ShareStory";
import RelatedProjects from "@/domains/resources/components/RelatedProjects";
import SwasthiArtTherapySection from "@/domains/resources/components/SwastiArtTherapySection";
import PuzzleImage from "@/shared/components/Puzzleimage";
import { ProjectItem, PROJECTS_DATA } from "@/domains/resources/constants/projects";
import { isMissingContentError, publicProjectsApi } from "@/domains/cms/lib/api";
import ContentNotice, { LOAD_ERROR_MESSAGE } from "@/shared/components/ContentNotice";
import { detailMetadata, PROGRAM_PAGE_MAP } from "@/lib/seo";
import ProjectDetailClient from "./ProjectDetailClient";

const CONTAINER = "max-w-[90rem] 2xl:max-w-[97.5rem] mx-auto px-4 sm:px-6 lg:px-8";

interface ProjectDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: ProjectDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  if (id && PROGRAM_PAGE_MAP[id.toLowerCase()]) {
    notFound();
  }

  const res = await publicProjectsApi.getBySlug(id).catch(() => null);
  const item = res?.data?.detail;
  return detailMetadata({
    section: "/projects",
    sectionLabel: "Projects",
    id,
    item,
    image: item?.projectBanner || item?.projectMobileBanner,
  });
}

export default async function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const resolvedParams = await params;
  const targetId = resolvedParams.id;

  // Dedicated programs have their own standalone pages, not under /projects/
  if (targetId && PROGRAM_PAGE_MAP[targetId.toLowerCase()]) {
    notFound();
  }

  let projectItem: ProjectItem | null = null;
  let relatedProjects: ProjectItem[] = [];
  let is404 = false;
  let failed = false;

  try {
    const res = await publicProjectsApi.getBySlug(targetId);
    const p = res?.data?.detail;
    const rel = res?.data?.related?.data ?? [];

    if (p) {
      projectItem = {
        id: p.id ?? "",
        slug: p.slug ?? "",
        title: p.title ?? "",
        category: "Projects",
        summary: p.shortDescription ?? "",
        fullStory: p.content ?? "",
        imageUrl: p.projectBanner || p.projectMobileBanner || "",
        mobileImageUrl: p.projectMobileBanner || p.projectBanner || "",
      };
    }

    if (rel.length > 0) {
      relatedProjects = rel.map((item) => ({
        id: item.id ?? "",
        slug: item.slug ?? "",
        title: item.title ?? "",
        category: "Projects",
        summary: item.shortDescription ?? "",
        fullStory: item.content ?? "",
        imageUrl: item.projectBanner || item.projectMobileBanner || "",
        mobileImageUrl: item.projectMobileBanner || item.projectBanner || "",
      }));
    }
  } catch (err) {
    if (isMissingContentError(err)) {
      is404 = true;
    } else {
      failed = true;
    }
  }

  // Fallback to static projects data if CMS has no entry or fails
  if (!projectItem && !is404) {
    const fallback = PROJECTS_DATA.find(
      (item) => item.slug === targetId || item.id === targetId
    );
    if (fallback) {
      projectItem = fallback;
      relatedProjects = PROJECTS_DATA.filter((item) => item.id !== fallback.id).slice(0, 6);
      failed = false;
    }
  }

  if (is404 || (!projectItem && !failed)) {
    notFound();
  }

  const isArtTherapy = Boolean(
    projectItem &&
      (projectItem.slug?.toLowerCase().includes("art-therapy") ||
        projectItem.title?.toLowerCase().includes("art therapy") ||
        targetId?.toLowerCase().includes("art-therapy") ||
        targetId?.toLowerCase().includes("art-gallery"))
  );

  return (
    <main className="min-h-screen bg-[#FFF8E2]">
      <ProjectDetailClient id={projectItem?.id} />

      <Banner
        bgImage="/Resources/Resources banner image.png"
        bgImageAlt="Projects"
        breadcrumbs={[
          {
            label: "Home",
            href: "/",
          },
          { label: "Resources" },
        ]}
        title="Projects"
        titleAs="p"
      />

      <section className={`${CONTAINER} py-8 sm:py-12 lg:py-16`}>
        {failed ? (
          <ContentNotice
            tone="error"
            title="We couldn't load this project right now"
            message={LOAD_ERROR_MESSAGE}
            className="py-12"
          />
        ) : projectItem ? (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-12 sm:gap-10 lg:gap-14 items-start">
            {/* Left Column: Story Details (7 cols) */}
            <div className="sm:col-span-7 flex flex-col">
              <Typography
                variant="heading-2"
                as="h1"
                className="font-tiempos-headline font-normal italic text-left text-[#0D2838]"
              >
                {projectItem.title}
              </Typography>

              {/* Story Paragraphs */}
              <div className="mt-4 sm:mt-5 max-h-[25rem] sm:max-h-[30rem] lg:max-h-[35rem] xl:max-h-[40rem] overflow-y-auto no-scrollbar pr-2 sm:pr-4">
                {projectItem.fullStory.includes("<") ? (
                  <div
                    className="prose max-w-none text-left font-argestadisplay font-normal text-[#596D79] prose-headings:!text-[#0D2838] prose-a:!text-[#FCCC2D] [&_*]:!bg-transparent [&_p]:!text-[#596D79] [&_span]:!text-[#596D79] [&_div]:!text-[#596D79] [&_strong]:!text-[#596D79] [&_h1]:!text-[#0D2838] [&_h2]:!text-[#0D2838] [&_h3]:!text-[#0D2838] [&_h4]:!text-[#0D2838] [&_h5]:!text-[#0D2838] [&_h6]:!text-[#0D2838] [&_li]:!text-[#596D79] [&_td]:!text-[#596D79] [&_th]:!text-[#0D2838]"
                    dangerouslySetInnerHTML={{ __html: projectItem.fullStory }}
                  />
                ) : (
                  <div className="space-y-4 text-left">
                    {projectItem.fullStory.split("\n\n").map((paragraph, index) => (
                      <Typography
                        key={index}
                        variant="body-10"
                        as="p"
                        className="font-argestadisplay font-normal text-left text-[#596D79]"
                      >
                        {paragraph}
                      </Typography>
                    ))}
                  </div>
                )}
              </div>

              {/* Reusable Social Share Buttons */}
              <ShareStory />
            </div>

            {/* Right Column: Featured Image (5 cols) */}
            <div className="sm:col-span-5 flex flex-col items-start w-full order-first sm:order-last">
              <div className="relative aspect-[4/3] w-full max-w-[37.5rem] overflow-hidden rounded-xl">
                {projectItem.imageUrl ? (
                  <PuzzleImage
                    key={projectItem.id}
                    src={projectItem.imageUrl}
                    alt={projectItem.title}
                    rows={4}
                    cols={5}
                    fit="cover"
                    staggerDuration={1000}
                  />
                ) : null}
              </div>
            </div>
          </div>
        ) : null}

        {/* Swasthi Art Gallery & Art Therapy Program */}
        {projectItem && isArtTherapy && (
          <SwasthiArtTherapySection />
        )}
      </section>

      {/* Reusable Related Projects Section */}
      {projectItem && (
        <RelatedProjects
          currentProjectId={projectItem.id}
          projects={relatedProjects}
        />
      )}

      <div id="donate-form">
        <DonateForm />
      </div>
    </main>
  );
}