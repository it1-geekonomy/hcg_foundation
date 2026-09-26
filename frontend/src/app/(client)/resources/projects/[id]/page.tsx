"use client";

import React, { use, useState, useEffect, useRef } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import Typography from "@/lib/Typography";
import Banner from "@/shared/components/Herobannersection";
import DonateForm from "@/shared/components/DonateForm";
import PaginationControls from "@/shared/components/PaginationControls";
import ShareStory from "@/shared/components/ShareStory";
import ProjectCard from "@/domains/resources/components/ProjectCard";
import SwasthiArtTherapySection from "@/domains/resources/components/SwasthiArtTherapySection";
import { ProjectItem, PROJECTS_DATA } from "@/domains/resources/constants/projects";
import { publicProjectsApi } from "@/domains/cms/lib/api";

const CONTAINER = "max-w-[90rem] 2xl:max-w-[97.5rem] mx-auto px-4 sm:px-6 lg:px-8";

interface ProjectDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const resolvedParams = use(params);
  const [projectItem, setProjectItem] = useState<ProjectItem | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [allRelatedProjects, setAllRelatedProjects] = useState<ProjectItem[]>([]);
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const clickedLinkRef = useRef<boolean>(false);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!scrollContainerRef.current) return;
    setIsDragging(true);
    clickedLinkRef.current = false;
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeft(scrollContainerRef.current.scrollLeft);
    scrollContainerRef.current.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || !scrollContainerRef.current) return;
    e.preventDefault();
    clickedLinkRef.current = true;
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    scrollContainerRef.current.scrollLeft = scrollLeft - walk;
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.releasePointerCapture(e.pointerId);
    }
  };

  const handleLinkClick = (e: React.MouseEvent) => {
    if (clickedLinkRef.current) {
      e.preventDefault();
    }
  };

  const [fromHome, setFromHome] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && window.location.search.includes("from=home")) {
      setFromHome(true);
      sessionStorage.setItem("came_from_details", "projects");
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await publicProjectsApi.getBySlug(resolvedParams.id);
        const p = res.data?.detail;
        if (!cancelled && p) {
          setProjectItem({
            id: p.id ?? "",
            slug: p.slug ?? "",
            title: p.title ?? "",
            date: p.projectDate ? new Date(p.projectDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "",
            category: "Projects",
            summary: p.shortDescription ?? "",
            fullStory: p.content ?? "",
            imageUrl:
              p.projectBanner ||
              p.projectMobileBanner ||
              "/Resources/Resources banner image.png",
            mobileImageUrl:
              p.projectMobileBanner ||
              p.projectBanner ||
              "/Resources/Resources banner image.png",
          });
        }
      } catch (err) {
        if (!cancelled) {
          const fallback = PROJECTS_DATA.find(
            (item) => item.slug === resolvedParams.id || item.id === resolvedParams.id
          );
          setProjectItem(fallback ?? null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [resolvedParams.id]);

  useEffect(() => {
    let cancelled = false;
    if (projectItem) {
      (async () => {
        try {
          const res = await publicProjectsApi.listPublished({ limit: 12 });
          if (!cancelled) {
            const related = (res.data ?? [])
              .filter(p => p.id !== projectItem.id)
              .map(p => ({
                id: p.id ?? "",
                slug: p.slug ?? "",
                title: p.title ?? "",
                date: p.projectDate ? new Date(p.projectDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "",
                category: "Projects",
                summary: p.shortDescription ?? "",
                fullStory: p.content ?? "",
                imageUrl:
                  p.projectBanner ||
                  p.projectMobileBanner ||
                  "/Resources/Resources banner image.png",
                mobileImageUrl:
                  p.projectMobileBanner ||
                  p.projectBanner ||
                  "/Resources/Resources banner image.png",
              }));
            setAllRelatedProjects(related);
          }
        } catch {
          // ignore
        }
      })();
    }
    return () => {
      cancelled = true;
    };
  }, [projectItem?.id]);

  if (!loading && !projectItem) {
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
        bgImage="/Resources/Resources banner image.png"
        bgImageAlt="Projects"
        breadcrumbs={[
          {
            label: "Home",
            href: "/",
            onClick: (e) => {
              sessionStorage.setItem("nav_action", fromHome ? "banner_home_section" : "banner_home_top");
              window.dispatchEvent(new Event("nav_action_event"));
            }
          },
          { label: "Resources" },
        ]}
        title="Projects"
      />

      <section className={`${CONTAINER} py-8 sm:py-12 lg:py-16`}>
        {loading || !projectItem ? (
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
            <div className="sm:col-span-7 flex flex-col">
              <Typography
                variant="heading-2"
                as="h1"
                className="font-tiempos-headline font-normal italic text-left text-[#0D2838]"
              >
                {projectItem.title}
              </Typography>

              {/* Full Story HTML / Text Narrative */}
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

            <div className="sm:col-span-5 flex flex-col items-start w-full order-first sm:order-last">
              <div className="relative aspect-[4/3] sm:aspect-[4/3] w-full max-w-[37.5rem] overflow-hidden rounded-xl bg-[#EFEAD8] shadow-md">
                <img
                  src={projectItem.imageUrl}
                  alt={projectItem.title}
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          </div>
        )}

        {/* Swasthi Art Gallery & Art Therapy Program (Special section for Art Therapy & Wellness) */}
        {!loading && projectItem && isArtTherapy && (
          <SwasthiArtTherapySection />
        )}
      </section>

      {/* Related Articles Section matching Figma Frame 10 */}
      <section className={`${CONTAINER} py-8 sm:py-12 border-t border-[#E8DFC5]`}>
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <Typography
            variant="heading-6"
            as="h2"
            className="font-tiempos-headline font-normal italic text-left text-[#0D2838]"
          >
            Related Articles
          </Typography>
          <Link
            href="/resources/projects"
            className="inline-flex items-center gap-1 text-[#2D2D2D] transition hover:text-[#B88700]"
          >
            <Typography variant="body-9" as="span" className="font-manrope font-semibold text-[#2D2D2D]">
              View All
            </Typography>
            <ArrowUpRight className="size-4 text-[#2D2D2D]" />
          </Link>
        </div>

        <div 
          ref={scrollContainerRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onDragStart={(e) => e.preventDefault()}
          className={`mt-6 sm:mt-8 flex overflow-x-auto gap-6 sm:gap-8 no-scrollbar pb-4 sm:pb-0 touch-pan-y ${isDragging ? "cursor-grabbing scroll-auto" : "cursor-grab snap-x snap-mandatory scroll-smooth"}`}
        >
          {allRelatedProjects.map((item) => (
            <div key={item.id} className="shrink-0 w-[calc(100%-1rem)] md:w-[calc(50%-1rem)] xl:w-[calc(50%-1.5rem)] snap-center flex select-none [&_img]:pointer-events-none" onClickCapture={handleLinkClick}>
              <ProjectCard project={item} headingTag="h3" />
            </div>
          ))}
        </div>
      </section>

      <div id="donate-form">
        <DonateForm />
      </div>
    </main>
  );
}
