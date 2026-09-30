"use client";

import React, { use, useState, useEffect, useLayoutEffect } from "react";
import { notFound } from "next/navigation";
import { Calendar, MapPin } from "lucide-react";
import Typography from "@/lib/Typography";
import Banner from "@/shared/components/Herobannersection";
import DonateForm from "@/shared/components/DonateForm";
import ShareStory from "@/shared/components/ShareStory";
import RelatedEvents from "@/domains/resources/components/RelatedEvents";
import PuzzleImage from "@/shared/components/Puzzleimage";
import { EventItem } from "@/domains/resources/constants/events";
import { publicEventsApi } from "@/domains/cms/lib/api";

const CONTAINER = "max-w-[90rem] 2xl:max-w-[97.5rem] mx-auto px-4 sm:px-6 lg:px-8";

/* ------------------------------------------------------------------ */
/* Slide-in animations. Same timings as the Let's Connect section.     */
/* Works on all screen sizes.                                          */
/* ------------------------------------------------------------------ */
const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

type StyledEl = HTMLElement | SVGElement;

function startLeftAnimations(): () => void {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return () => {};

  const T = "opacity 700ms ease-out, transform 1000ms cubic-bezier(0.22, 1, 0.36, 1)";
  const X = -80; // default: from the left
  const X_RIGHT = 80; // "View all": from the right
  const STEP = 120;
  const MAXD = 1200;
  const DUR = 700; // when a line is visually settled (opacity finished; the easing tail is barely visible)

  const hide = (el: StyledEl, x: number = X) => {
    el.style.opacity = "0";
    el.style.transform = `translate3d(${x}px,0,0)`;
    el.style.transition = "none";
    el.style.willChange = "opacity, transform";
  };

  // The trigger is an element that stays on screen. The animated element
  // itself starts off-screen (translated), so it can't trigger itself.
  const watch = (el: Element, cb: () => void) => {
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          io.disconnect();
          cb();
        }
      },
      { threshold: 0.01, rootMargin: "0px 0px -5% 0px" },
    );
    io.observe(el);
  };

  const wrap = (root: HTMLElement): HTMLSpanElement[] => {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const nodes: Text[] = [];
    while (walker.nextNode()) nodes.push(walker.currentNode as Text);
    const spans: HTMLSpanElement[] = [];
    nodes.forEach((n) => {
      const t = n.nodeValue || "";
      if (!t.trim()) return;
      const frag = document.createDocumentFragment();
      t.split(/(\s+)/).forEach((p) => {
        if (!p) return;
        if (/^\s+$/.test(p)) {
          frag.appendChild(document.createTextNode(p));
          return;
        }
        const s = document.createElement("span");
        s.textContent = p;
        s.style.display = "inline-block";
        frag.appendChild(s);
        spans.push(s);
      });
      n.parentNode?.replaceChild(frag, n);
    });
    return spans;
  };

  // Line-by-line slide-in. onDone fires once the last line has finished animating.
  const lineText = (root: HTMLElement | null, delay: number, onDone?: () => void) => {
    if (!root) {
      onDone?.();
      return;
    }
    const spans = wrap(root);
    spans.forEach((s) => hide(s));
    void root.getBoundingClientRect();
    watch(root, () => {
      let line = -1;
      let top0 = -Infinity;
      const lines = spans.map((s) => {
        const top = s.getBoundingClientRect().top;
        if (Math.abs(top - top0) > 4) {
          line += 1;
          top0 = top;
        }
        return line;
      });
      spans.forEach((s, i) => {
        s.style.transition = T;
        s.style.transitionDelay = `${delay + Math.min(lines[i] * STEP, MAXD)}ms`;
        s.style.opacity = "1";
        s.style.transform = "translate3d(0,0,0)";
      });
      if (onDone) {
        const total = delay + Math.min(Math.max(line, 0) * STEP, MAXD) + DUR;
        window.setTimeout(onDone, total);
      }
    });
  };

  // Whole-element slide-in. Optional x (direction) and gate (wait for a promise before revealing).
  const slide = (
    el: StyledEl | null,
    delay: number,
    trigger?: Element | null,
    x: number = X,
    gate?: Promise<void>,
  ) => {
    if (!el) return;
    if (getComputedStyle(el).display === "inline") el.style.display = "inline-block";
    hide(el, x);
    void el.getBoundingClientRect();
    watch(trigger || el.parentElement || el, () => {
      const reveal = () => {
        el.style.transition = T;
        el.style.transitionDelay = `${delay}ms`;
        el.style.opacity = "1";
        el.style.transform = "translate3d(0,0,0)";
        window.setTimeout(() => {
          // give hover styles back
          el.style.opacity = "";
          el.style.transform = "";
          el.style.transition = "";
          el.style.transitionDelay = "";
          el.style.willChange = "";
        }, 1000 + delay + 100);
      };
      if (gate) gate.then(reveal);
      else reveal();
    });
  };

  const col = document.querySelector<HTMLElement>('[class*="sm:col-span-7"]');
  const main = document.querySelector<HTMLElement>("main");
  if (!col || !main) return () => {};

  main.style.overflowX = "clip"; // slide offsets must not create a horizontal scrollbar

  // Story column (runs once per mounted content)
  if (!col.dataset.leftAnim) {
    col.dataset.leftAnim = "1";

    // Title: line by line
    const h1 = col.querySelector<HTMLElement>("h1");
    lineText(h1, 0);

    // Metadata rows: icon + text come in together
    const meta = h1?.nextElementSibling as HTMLElement | null;
    if (meta && !meta.classList.contains("no-scrollbar") && meta.querySelector("svg")) {
      meta.querySelectorAll("svg").forEach((svg, i) => {
        const row = svg.parentElement as HTMLElement | null;
        if (!row) return;
        const d = 150 + i * 100;
        slide(svg, d, row);
        lineText(row.querySelector<HTMLElement>("span"), d);
      });
    }

    // Story body: line by line. Resolves the gate when the description finishes.
    const body = col.querySelector<HTMLElement>(".no-scrollbar");
    let resolveBody: () => void = () => {};
    const bodyDone = new Promise<void>((r) => {
      resolveBody = r;
    });
    lineText(body, 300, resolveBody);

    // Share story: starts only AFTER the description animation is done
    if (body) {
      let sib = body.nextElementSibling as HTMLElement | null;
      while (sib) {
        slide(sib, 0, body, X, bodyDone);
        sib = sib.nextElementSibling as HTMLElement | null;
      }
    }
  }

  // "Related..." heading (from left) and "View all" (from right, all screens):
  // scan now, and again if the related section renders late.
  const RELATED = /^related\b/i;
  const VIEW_ALL = /^view\s*all/i;

  const scanRelated = () => {
    const found = Array.from(
      main.querySelectorAll<HTMLElement>("h1, h2, h3, h4, h5, h6, a, button, span, p, div"),
    ).filter((el) => {
      if (col.contains(el)) return false;
      if (el.closest("[data-left-btn]")) return false;
      const t = (el.textContent || "").trim();
      // a row holding both texts is skipped so each animates on its own
      if (/^related\b/i.test(t) && /view\s*all/i.test(t)) return false;
      return t.length <= 40 && (RELATED.test(t) || VIEW_ALL.test(t));
    });
    found
      .filter((el) => !found.some((o) => o !== el && o.contains(el)))
      .forEach((el) => {
        el.setAttribute("data-left-btn", "1");
        const isViewAll = VIEW_ALL.test((el.textContent || "").trim());
        slide(el, isViewAll ? 150 : 0, null, isViewAll ? X_RIGHT : X);
      });
  };

  scanRelated();
  let raf: number | null = null;
  const mo = new MutationObserver(() => {
    if (raf != null) return;
    raf = requestAnimationFrame(() => {
      raf = null;
      scanRelated();
    });
  });
  mo.observe(main, { childList: true, subtree: true });
  const stop = window.setTimeout(() => mo.disconnect(), 10000);

  return () => {
    mo.disconnect();
    window.clearTimeout(stop);
    if (raf != null) cancelAnimationFrame(raf);
  };
}

interface EventDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function EventDetailPage({ params }: EventDetailPageProps) {
  const resolvedParams = use(params);
  const [eventItem, setEventItem] = useState<EventItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await publicEventsApi.getBySlug(resolvedParams.id);
        const e = res.data?.detail;
        if (!cancelled && e) {
          setEventItem({
            id: e.id ?? "",
            slug: e.slug ?? "",
            title: e.title ?? "",
            date: e.eventDate ? new Date(e.eventDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "",
            category: "Community Event" as const,
            summary: e.shortDescription ?? "",
            fullStory: e.content ?? "",
            imageUrl: e.eventBanner || e.eventMobileBanner || "https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=800&auto=format&fit=crop",
            location: e.eventLocation ?? "",
          });
        }
      } catch (err) {
        if (!cancelled) setEventItem(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [resolvedParams.id]);

  // Slide-in animations
  useIsoLayoutEffect(() => {
    if (loading || !eventItem) return;
    return startLeftAnimations();
  }, [loading, eventItem?.id]);

  if (!loading && !eventItem) {
    notFound();
  }

  useEffect(() => {
    sessionStorage.setItem("came_from_details", "events");
  }, []);

  return (
    <main className="min-h-screen bg-[#FFF8E2]">
      <Banner
        bgImage="/Resources/Resources banner image.png"
        bgImageAlt="Events"
        breadcrumbs={[
          { label: "Home", href: "/#events" },
          { label: "Resources" },
          { label: "Events" },
        ]}
        title="Events"
      />

      <section className={`${CONTAINER} py-8 sm:py-12 lg:py-16`}>
        {loading || !eventItem ? (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-12 sm:gap-10 lg:gap-14 items-start animate-pulse">
            <div className="sm:col-span-7 flex flex-col space-y-4">
              <div className="h-10 bg-black/10 rounded w-3/4"></div>
              <div className="h-4 bg-black/10 rounded w-full"></div>
              <div className="h-4 bg-black/10 rounded w-full"></div>
              <div className="h-4 bg-black/10 rounded w-5/6"></div>
            </div>
            <div className="sm:col-span-5 flex flex-col items-start w-full order-first sm:order-last">
              <div className="relative aspect-[4/3] w-full max-w-[37.5rem] overflow-hidden rounded-xl bg-black/10 shadow-md"></div>
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
                {eventItem.title}
              </Typography>

              {/* Metadata: Date and Location matching Figma Frame 36 */}
              <div className="mt-3 sm:mt-4 flex flex-wrap items-center gap-4 sm:gap-6">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <Calendar className="size-4 text-[#C08600] shrink-0" />
                  <Typography variant="body-10" as="span" className="font-argestadisplay font-normal text-[#C08600]">
                    {eventItem.date}
                  </Typography>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <MapPin className="size-4 text-[#C08600] shrink-0" />
                  <Typography variant="body-10" as="span" className="font-argestadisplay font-normal text-[#C08600]">
                    {eventItem.location || "Bangalore"}
                  </Typography>
                </div>
              </div>

              {/* Story Paragraphs */}
              <div className="mt-4 sm:mt-5 max-h-[25rem] sm:max-h-[30rem] lg:max-h-[35rem] xl:max-h-[40rem] overflow-y-auto no-scrollbar pr-2 sm:pr-4">
                {eventItem.fullStory.includes("<") ? (
                  <div
                    className="prose max-w-none text-left font-argestadisplay font-normal text-justify text-[#596D79] prose-headings:!text-[#0D2838] prose-a:!text-[#FCCC2D] [&_*]:!bg-transparent [&_p]:!text-[#596D79] [&_span]:!text-[#596D79] [&_div]:!text-[#596D79] [&_strong]:!text-[#596D79] [&_h1]:!text-[#0D2838] [&_h2]:!text-[#0D2838] [&_h3]:!text-[#0D2838] [&_h4]:!text-[#0D2838] [&_h5]:!text-[#0D2838] [&_h6]:!text-[#0D2838] [&_li]:!text-[#596D79] [&_td]:!text-[#596D79] [&_th]:!text-[#0D2838]"
                    dangerouslySetInnerHTML={{ __html: eventItem.fullStory }}
                  />
                ) : (
                  <div className="space-y-4 text-left">
                    {eventItem.fullStory.split("\n\n").map((paragraph, index) => (
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
                <PuzzleImage
                  key={eventItem.id}
                  src={eventItem.imageUrl}
                  alt={eventItem.title}
                  rows={4}
                  cols={5}
                  fit="cover"
                  staggerDuration={1000}
                />
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Reusable Related Events Section */}
      {eventItem && <RelatedEvents currentEventId={eventItem.id} />}

      <div id="donate-form">
        <DonateForm />
      </div>
    </main>
  );
}