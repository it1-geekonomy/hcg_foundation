"use client";

import React, { use, useState, useEffect, useRef } from "react";
import { notFound } from "next/navigation";
import { Calendar } from "lucide-react";
import Typography from "@/lib/Typography";
import Banner from "@/shared/components/Herobannersection";
import DonateForm from "@/shared/components/DonateForm";
import ShareStory from "@/shared/components/ShareStory";
import RelatedProjects from "@/domains/resources/components/RelatedProjects";
import SwasthiArtTherapySection from "@/domains/resources/components/SwasthiArtTherapySection";
import PuzzleImage from "@/shared/components/Puzzleimage";
import { ProjectItem, PROJECTS_DATA } from "@/domains/resources/constants/projects";
import { isMissingContentError, publicProjectsApi } from "@/domains/cms/lib/api";
import ContentNotice, { LOAD_ERROR_MESSAGE } from "@/shared/components/ContentNotice";
import { useDetailPageAnimations } from "@/shared/lib/detailPageAnimations";
import { PROJECT_FROM_HOME_KEY } from "@/domains/home/constants/project";

const CONTAINER = "max-w-[90rem] 2xl:max-w-[97.5rem] mx-auto px-4 sm:px-6 lg:px-8";

interface ProjectDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const resolvedParams = use(params);
  const [projectItem, setProjectItem] = useState<ProjectItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [relatedProjects, setRelatedProjects] = useState<ProjectItem[]>([]);

  const fromHome = useRef(false);

  // The flag moves onto this page's history entry: it survives refresh and back/forward
  // the way a ?from=home query did, without appearing in the URL.
  useEffect(() => {
    if (sessionStorage.getItem(PROJECT_FROM_HOME_KEY)) {
      sessionStorage.removeItem(PROJECT_FROM_HOME_KEY);
      window.history.replaceState({ ...window.history.state, [PROJECT_FROM_HOME_KEY]: true }, "");
    }
    fromHome.current = Boolean(window.history.state?.[PROJECT_FROM_HOME_KEY]);
    if (fromHome.current) sessionStorage.setItem("came_from_details", "projects");
  }, []);

  useEffect(() => {
    let cancelled = false;
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    (async () => {
      setLoading(true);
      setFailed(false);
      try {
        const res = await publicProjectsApi.getBySlug(resolvedParams.id);
        const p = res.data?.detail;
        const rel = res.data?.related?.data ?? [];

        if (!cancelled && p) {
          setProjectItem({
            id: p.id ?? "",
            slug: p.slug ?? "",
            title: p.title ?? "",
            date: p.projectDate ? new Date(p.projectDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "",
            category: "Projects",
            summary: p.shortDescription ?? "",
            fullStory: p.content ?? "",
            imageUrl: p.projectBanner || p.projectMobileBanner || "",
            mobileImageUrl: p.projectMobileBanner || p.projectBanner || "",
          });
        }

        if (!cancelled && rel.length > 0) {
          setRelatedProjects(
            rel.map((item) => ({
              id: item.id ?? "",
              slug: item.slug ?? "",
              title: item.title ?? "",
              date: item.projectDate ? new Date(item.projectDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "",
              category: "Projects",
              summary: item.shortDescription ?? "",
              fullStory: item.content ?? "",
              imageUrl: item.projectBanner || item.projectMobileBanner || "",
              mobileImageUrl: item.projectMobileBanner || item.projectBanner || "",
            }))
          );
        }
      } catch (err) {
        if (!cancelled) {
          const fallback = PROJECTS_DATA.find(
            (item) => item.slug === resolvedParams.id || item.id === resolvedParams.id
          );
          setProjectItem(fallback ?? null);
          if (fallback) {
            setRelatedProjects(
              PROJECTS_DATA.filter((item) => item.id !== fallback.id).slice(0, 6)
            );
          } else if (!isMissingContentError(err)) {
            setFailed(true);
          }
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [resolvedParams.id, attempt]);

  useDetailPageAnimations(!loading && Boolean(projectItem), projectItem?.id);

  if (!loading && !projectItem && !failed) {
    notFound();
  }

  const isArtTherapy = Boolean(
    projectItem &&
      (projectItem.slug?.toLowerCase().includes("art-therapy") ||
        projectItem.title?.toLowerCase().includes("art therapy") ||
        resolvedParams.id?.toLowerCase().includes("art-therapy") ||
        resolvedParams.id?.toLowerCase().includes("art-gallery"))
  );

  return (
    <main className="min-h-screen bg-[#FFF8E2]">
      <Banner
        bgImage={projectItem?.imageUrl || ""}
        bgImageMobile={projectItem?.mobileImageUrl || ""}
        bgImageAlt={projectItem?.title || "Projects"}
        breadcrumbs={[
          {
            label: "Home",
            href: "/",
            onClick: () => {
              sessionStorage.setItem("nav_action", fromHome.current ? "banner_home_section" : "banner_home_top");
              window.dispatchEvent(new Event("nav_action_event"));
            }
          },
          { label: "Resources" },
        ]}
        title={projectItem?.title || "Projects"}
      />

      <section className={`${CONTAINER} py-8 sm:py-12 lg:py-16`}>
        {failed ? (
          <ContentNotice
            tone="error"
            title="We couldn't load this project right now"
            message={LOAD_ERROR_MESSAGE}
            action={{ label: "Try again", onClick: () => setAttempt((n) => n + 1) }}
            className="py-12"
          />
        ) : loading || !projectItem ? (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-12 sm:gap-10 lg:gap-14 items-start animate-pulse">
            <div className="sm:col-span-7 flex flex-col space-y-4">
              <div className="h-10 bg-black/10 rounded w-3/4"></div>
              <div className="h-4 bg-black/10 rounded w-full"></div>
              <div className="h-4 bg-black/10 rounded w-full"></div>
              <div className="h-4 bg-black/10 rounded w-5/6"></div>
            </div>
            <div className="sm:col-span-5 flex flex-col items-start w-full order-first sm:order-last">
              <div className="relative aspect-[4/3] sm:aspect-[4/3] w-full max-w-[37.5rem] overflow-hidden rounded-xl bg-black/10 shadow-md"></div>
            </div>
          </div>
        ) : (
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

              {/* Metadata: Project date (same treatment as event date/location) */}
              {projectItem.date && (
                <div className="mt-3 sm:mt-4 flex flex-wrap items-center gap-4 sm:gap-6">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <Calendar className="size-4 text-[#C08600] shrink-0" />
                    <Typography variant="body-10" as="span" className="font-argestadisplay font-normal text-[#C08600]">
                      {projectItem.date}
                    </Typography>
                  </div>
                </div>
              )}

              {/* Story Paragraphs */}
              <div className="mt-4 sm:mt-5 max-h-[25rem] sm:max-h-[30rem] lg:max-h-[35rem] xl:max-h-[40rem] overflow-y-auto no-scrollbar pr-2 sm:pr-4">
                {projectItem.fullStory.includes("<") ? (
                  <div
                    className="prose max-w-none text-left font-argestadisplay font-normal text-justify text-[#596D79] prose-headings:!text-[#0D2838] prose-a:!text-[#FCCC2D] [&_*]:!bg-transparent [&_p]:!text-[#596D79] [&_span]:!text-[#596D79] [&_div]:!text-[#596D79] [&_strong]:!text-[#596D79] [&_h1]:!text-[#0D2838] [&_h2]:!text-[#0D2838] [&_h3]:!text-[#0D2838] [&_h4]:!text-[#0D2838] [&_h5]:!text-[#0D2838] [&_h6]:!text-[#0D2838] [&_li]:!text-[#596D79] [&_td]:!text-[#596D79] [&_th]:!text-[#0D2838]"
                    dangerouslySetInnerHTML={{ __html: projectItem.fullStory }}
                  />
                ) : (
                  <div className="space-y-4 text-left">
                    {projectItem.fullStory.split("\n\n").map((paragraph, index) => (
                      <Typography
                        key={index}
                        variant="body-10"
                        as="p"
                        className="font-argestadisplay font-normal text-justify text-[#596D79]"
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
                {/* Puzzle-piece reveal on the detail image only — pieces
                    fade/scale in at their own cell, in a randomized order,
                    the moment this box scrolls into view. */}
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
        )}

        {/* Swasthi Art Gallery & Art Therapy Program (Special section for Art Therapy & Wellness) */}
        {!loading && projectItem && isArtTherapy && (
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