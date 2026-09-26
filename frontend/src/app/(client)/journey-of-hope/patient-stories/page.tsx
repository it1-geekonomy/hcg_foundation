"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Calendar, ArrowUpRight, Search } from "lucide-react";
import Typography from "@/lib/Typography";
import Banner from "@/shared/components/Herobannersection";
import DonateForm from "@/shared/components/DonateForm";
import PaginationControls from "@/shared/components/PaginationControls";
import { PatientStory } from "@/domains/journey-of-hope/constants/stories";
import { publicPatientStoriesApi } from "@/domains/cms/lib/api";

const CONTAINER = "max-w-[90rem] 2xl:max-w-[97.5rem] mx-auto px-4 sm:px-6 lg:px-8";

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

export default function PatientStoriesPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState<number | null>(null);
  const [apiStories, setApiStories] = useState<PatientStory[] | null>(null);
  const [totalCount, setTotalCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const isInitialMount = useRef(true);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  useEffect(() => {
    const updateItemsPerPage = () => {
      if (window.innerWidth < 640) {
        setItemsPerPage(4);
      } else if (window.innerWidth < 768) {
        setItemsPerPage(6);
      } else if (window.innerWidth < 1280) {
        setItemsPerPage(6);
      } else {
        setItemsPerPage(8);
      }
    };
    updateItemsPerPage();
    window.addEventListener("resize", updateItemsPerPage);
    return () => window.removeEventListener("resize", updateItemsPerPage);
  }, []);

  useEffect(() => {
    if (itemsPerPage === null) return;
    let cancelled = false;
    
    if (!apiStories) {
      setLoading(true);
    } else {
      setIsFetching(true);
    }
    
    setError(null);
    (async () => {
      try {
        const res = await publicPatientStoriesApi.listPublished({
          page: currentPage,
          limit: itemsPerPage,
          search: debouncedSearch || undefined,
        });
        if (cancelled) return;
        if (res.data && res.data.length > 0) {
          const mapped: PatientStory[] = res.data.map((item) => ({
            id: item.id,
            slug: item.slug,
            patientName: item.title,
            date: formatStoryDate(item.storyDate),
            conditionTag: item.donationState || "Patient Journey",
            excerpt: item.shortDescription || "",
            fullStory: item.content || "",
            imageUrl: item.patientImage || "https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?q=80&w=800&auto=format&fit=crop",
            heroImageUrl: item.patientImage || "https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?q=80&w=1600&auto=format&fit=crop",
          }));
          setApiStories(mapped);
          setTotalCount(res.meta.total);
        } else {
          setApiStories([]);
          setTotalCount(0);
        }
      } catch (err: any) {
        if (!cancelled) {
          setApiStories([]);
          setTotalCount(0);
          setError(err.message || "Failed to connect to the server. Please check your connection and try again later.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
          setIsFetching(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [currentPage, itemsPerPage, debouncedSearch]);

  // If the API call succeeded we use those stories; otherwise show a friendly empty state.
  const sourceStories = apiStories ?? [];
  const totalItems = totalCount ?? 0;
  const itemsPerPg = itemsPerPage || 8;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPg));
  const safePage = Math.min(currentPage, totalPages);
  const currentStories = sourceStories;


  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <main className="min-h-screen bg-[#FFFBEA] text-[#2F2707] font-manrope">
      <Banner
        bgImage="/journey-of-hope/Journey of Hope banner image.png"
        bgImageAlt="Patient Stories"
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Journey of Hope" },
        ]}
        title="Patient Stories"
      />

      {/* Main Patient Stories Grid Section */}
      <section className={`${CONTAINER} py-8 sm:py-10 lg:py-12`}>
        {/* Search Bar */}
        <div className="mb-10 flex justify-center">
          <div className="relative w-full max-w-lg">
            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
              <Search className="size-5 text-[#8C826B]" />
            </div>
            <input
              type="text"
              placeholder="Search by patient name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-full border border-[#DCD5C3] bg-white py-3.5 pl-11 pr-4 text-base text-[#2D2D2D] shadow-sm outline-none transition focus:border-[#FDC61D] focus:ring-2 focus:ring-[#FDC61D]/20 placeholder:text-[#8C826B]"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20 min-h-[40vh]">
            <Typography variant="heading-6" as="p" className="text-[#343E43] animate-pulse">
              Loading patient stories...
            </Typography>
          </div>
        ) : error ? (
          <div className="flex flex-col justify-center items-center py-20 min-h-[40vh] text-center max-w-2xl mx-auto px-4">
            <Typography variant="heading-3" as="h2" className="text-[#842A2A] mb-4 font-tiempos-headline italic">
              Connection Issue
            </Typography>
            <Typography variant="body-9" as="p" className="text-[#343E43]">
              {error}
            </Typography>
          </div>
        ) : currentStories.length === 0 ? (
          <div className="flex flex-col justify-center items-center py-20 min-h-[40vh] text-center max-w-2xl mx-auto px-4">
            <Typography variant="heading-3" as="h2" className="text-[#0D2838] mb-4 font-tiempos-headline italic">
              No Stories Found
            </Typography>
            <Typography variant="body-9" as="p" className="text-[#343E43]">
              There are currently no patient stories available to display. Please check back later.
            </Typography>
          </div>
        ) : (
          <div
            key={`${safePage}-${itemsPerPage}`}
            className={`flex flex-col gap-16 pb-4 lg:pb-0 lg:grid lg:grid-cols-3 xl:grid-cols-4 lg:gap-7 transition-all duration-500 ease-in-out ${
              isFetching ? "opacity-40 scale-[0.98] blur-[1px] pointer-events-none" : "opacity-100 scale-100 blur-0"
            }`}
          >
            {currentStories.map((story, index) => (
              <Link
              key={story.id}
              href={`/journey-of-hope/patient-stories/${story.slug || story.id}`}
              className="group sticky top-[var(--mobile-top)] lg:top-auto lg:relative flex flex-col justify-between aspect-[385/493] w-full max-w-[28rem] mx-auto lg:max-w-none overflow-hidden rounded-[1.375rem] border border-white/50 bg-[#EFEAD8] p-[1.1rem] sm:p-[1.35rem] pb-0 sm:pb-0 shadow-2xl shadow-black/10 lg:shadow-sm transition-all duration-500 hover:shadow-3xl hover:border-white/70"
              style={{
                "--mobile-top": `calc(6rem + ${index * 1.5}rem)`,
                zIndex: index,
              } as React.CSSProperties}
            >
              {/* 1. Full-bleed background photo */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={story.imageUrl}
                alt=""
                aria-hidden="true"
                className="absolute inset-0 h-full w-full object-cover scale-110 filter blur-[0.75rem] opacity-90 transition duration-500 group-hover:scale-115"
              />

              {/* 2. Soft translucent glass tint over outer card */}
              <div className="absolute inset-0 bg-white/20 backdrop-blur-md transition duration-300 group-hover:bg-white/25" />

              {/* 3. Inner Card */}
              <div className="relative z-10 w-full aspect-[339/368] overflow-hidden rounded-[1.25rem] shadow-xs">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={story.imageUrl}
                  alt={story.patientName}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  loading="lazy"
                />
              </div>

              {/* 4. Bottom Info Bar: Name & Date (Left) + Circular Arrow Button (Right) */}
              <div className="relative z-10 h-[5.5rem] sm:h-[6.375rem] px-1 flex items-center justify-between gap-3">
                {/* Left: Patient Name & Date */}
                <div className="flex flex-col text-white min-w-0">
                  <div className="truncate">
                    <Typography
                      variant="heading-8"
                      as="h3"
                      className="font-manrope font-bold text-white"
                    >
                      {story.patientName}
                    </Typography>
                  </div>
                  <div className="mt-1 flex items-center gap-1.5 text-[#FFFFFF]">
                    <Calendar className="size-3.5 sm:size-4 text-[#FFFFFF] shrink-0" />
                    <Typography
                      variant="body-8"
                      as="span"
                      className="font-manrope font-medium text-[#FFFFFF]"
                    >
                      {story.date}
                    </Typography>
                  </div>
                </div>

                {/* Right: Circular Arrow Button */}
                <div className="flex size-10 sm:size-11 shrink-0 items-center justify-center rounded-full bg-white text-[#1E1E1E] shadow-sm transition duration-300 group-hover:scale-110">
                  <ArrowUpRight className="size-5 sm:size-5.5 text-[#1E1E1E]" />
                </div>
              </div>
              </Link>
            ))}
          </div>
        )}

        {/* Bottom Centered Pagination Navigation */}
        {totalPages > 1 ? (
          <PaginationControls
            currentPage={safePage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            showArrows={true}
            showNumbers={true}
            className="mt-12 sm:mt-16"
          />
        ) : null}
      </section>

      {/* Donate Section at the Bottom */}
      <div id="donate-form">
        <DonateForm />
      </div>
    </main>
  );
}
