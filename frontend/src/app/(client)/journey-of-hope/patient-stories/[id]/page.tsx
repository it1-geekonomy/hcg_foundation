import React from "react";
import Link from "next/link";
import Script from "next/script";
import { notFound } from "next/navigation";
import { Calendar } from "lucide-react";
import DonateForm from "@/shared/components/DonateForm";
import Banner from "@/shared/components/Herobannersection";
import Typography from "@/lib/Typography";
import { PATIENT_STORIES, PatientStory } from "@/domains/journey-of-hope/constants/stories";
import ShareStory from "@/shared/components/ShareStory";
import { RelatedPatientStories } from "@/domains/journey-of-hope/components/RelatedPatientStories";
import { publicPatientStoriesApi } from "@/domains/cms/lib/api";
import { DetailTracker } from "@/shared/components/DetailTracker";
import PuzzleImage from "@/shared/components/Puzzleimage";

const CONTAINER = "max-w-[90rem] 2xl:max-w-[97.5rem] mx-auto px-4 sm:px-6 lg:px-8";

/* Animation script (added). Plain DOM code, so this file stays a server component. */
const ANIM_SCRIPT = String.raw`
(function () {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  var T = "opacity 700ms ease-out, transform 1000ms cubic-bezier(0.22, 1, 0.36, 1)";
  var STEP = 120, MAXD = 1200;
  var dir = window.innerWidth >= 640 ? 80 : -80; /* story text: right on sm+, left when stacked */

  function hide(el, x) {
    el.style.opacity = "0";
    el.style.transform = "translate3d(" + x + "px,0,0)";
    el.style.transition = "none";
    el.style.willChange = "opacity, transform";
  }
  function watch(el, cb) {
    var io = new IntersectionObserver(function (e) {
      if (e[0].isIntersecting) { io.disconnect(); cb(); }
    }, { threshold: 0.01, rootMargin: "0px 0px -5% 0px" });
    io.observe(el);
  }
  function wrap(root) {
    var w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT), nodes = [], spans = [];
    while (w.nextNode()) nodes.push(w.currentNode);
    nodes.forEach(function (n) {
      var t = n.nodeValue || "";
      if (!t.trim()) return;
      var frag = document.createDocumentFragment();
      t.split(/(\s+)/).forEach(function (p) {
        if (!p) return;
        if (/^\s+$/.test(p)) { frag.appendChild(document.createTextNode(p)); return; }
        var s = document.createElement("span");
        s.textContent = p;
        s.style.display = "inline-block";
        frag.appendChild(s);
        spans.push(s);
      });
      n.parentNode.replaceChild(frag, n);
    });
    return spans;
  }
  function lineText(root, delay) {
    if (!root) return;
    var spans = wrap(root);
    spans.forEach(function (s) { hide(s, dir); });
    void root.getBoundingClientRect();
    watch(root, function () {
      var line = -1, top0 = -Infinity;
      var lines = spans.map(function (s) {
        var top = s.getBoundingClientRect().top;
        if (Math.abs(top - top0) > 4) { line++; top0 = top; }
        return line;
      });
      spans.forEach(function (s, i) {
        s.style.transition = T;
        s.style.transitionDelay = (delay + Math.min(lines[i] * STEP, MAXD)) + "ms";
        s.style.opacity = "1";
        s.style.transform = "translate3d(0,0,0)";
      });
    });
  }
  /* trigger = the element whose visibility starts the animation.
     Defaults to the parent, because the element itself starts OFF-SCREEN
     (translated 80px sideways) and an off-screen element never "intersects". */
  function slide(el, x, delay, trigger) {
    if (!el) return;
    if (getComputedStyle(el).display === "inline") el.style.display = "inline-block";
    hide(el, x);
    void el.getBoundingClientRect();
    watch(trigger || el.parentElement || el, function () {
      el.style.transition = T;
      el.style.transitionDelay = delay + "ms";
      el.style.opacity = "1";
      el.style.transform = "translate3d(0,0,0)";
      setTimeout(function () {
        el.style.opacity = ""; el.style.transform = "";
        el.style.transition = ""; el.style.transitionDelay = ""; el.style.willChange = "";
      }, 1000 + delay + 100);
    });
  }

  /* "Read more stories": ALWAYS from the LEFT. "View all" (+ arrow): ALWAYS from the RIGHT. */
  var RM = /^read\s*more/i, VA = /^view\s*all/i;
  function scanButtons(scope, left, right) {
    var c = Array.prototype.slice.call(
      scope.querySelectorAll("h1, h2, h3, h4, h5, h6, a, button, span, p, div")
    ).filter(function (el) {
      if (right.contains(el) || left.contains(el)) return false; /* only the related-stories area */
      if (el.closest("[data-story-btn]")) return false; /* already animated (or inside one) */
      var t = (el.textContent || "").trim();
      /* skip a row that holds BOTH texts, so each one animates on its own */
      if (/read\s*more/i.test(t) && /view\s*all/i.test(t)) return false;
      /* short text only, so a whole card / whole row is never matched */
      return t.length <= 40 && (RM.test(t) || VA.test(t));
    });
    c.filter(function (el) {
      return !c.some(function (o) { return o !== el && o.contains(el); });
    }).forEach(function (el) {
      el.setAttribute("data-story-btn", "1");
      var isViewAll = VA.test((el.textContent || "").trim());
      slide(el, isViewAll ? 80 : -80, isViewAll ? 150 : 0);
    });
  }

  function init() {
    /* anchor on the story columns, NOT the first <section> (that is the banner) */
    var left = document.querySelector('[class*="sm:col-span-5"]');
    var right = document.querySelector('[class*="sm:col-span-7"]');
    if (!left || !right) return false;
    if (right.getAttribute("data-story-anim")) return true;
    right.setAttribute("data-story-anim", "1");

    var scope = right.closest("section") || document.body;
    scope.style.overflowX = "clip"; /* slide offsets must not create a horizontal scrollbar */

    /* name: line by line */
    var h1 = right.querySelector("h1");
    lineText(h1, 0);

    /* date: calendar icon + text come in together (row is the trigger) */
    var dateRow = h1 ? h1.nextElementSibling : null;
    if (dateRow) {
      slide(dateRow.querySelector("svg"), dir, 150, dateRow);
      lineText(dateRow.querySelector("span"), 150);
    }

    /* story body: line by line */
    lineText(right.querySelector(".no-scrollbar"), 300);

    /* social share: from the LEFT */
    slide(left.lastElementChild, -80, 150, left);

    /* Read more stories / View all: scan now, and again if the related stories render late */
    scanButtons(scope, left, right);
    var raf = null;
    var mo = new MutationObserver(function () {
      if (raf) return;
      raf = requestAnimationFrame(function () {
        raf = null;
        scanButtons(scope, left, right);
      });
    });
    mo.observe(scope, { childList: true, subtree: true });
    setTimeout(function () { mo.disconnect(); }, 6000);
    return true;
  }

  /* retry briefly in case the content isn't in the DOM yet */
  var tries = 0;
  (function attempt() {
    if (init() || ++tries > 20) return;
    setTimeout(attempt, 100);
  })();
})();
`;

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

export default async function StoryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const targetId = resolvedParams.id;

  let story: PatientStory | null = null;
  let relatedStories: PatientStory[] = [];
  let errorMsg: string | null = null;
  let is404 = false;

  // 1. Try fetching from public API
  try {
    const res = await publicPatientStoriesApi.getBySlug(targetId);
    if (res.data?.detail) {
      const item = res.data.detail;
      story = {
        id: item.id,
        slug: item.slug,
        patientName: item.title,
        date: formatStoryDate(item.storyDate),
        conditionTag: item.donationState || "Patient Journey",
        excerpt: item.shortDescription || "",
        fullStory: item.content || "",
        imageUrl: item.patientImage || "https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?q=80&w=800&auto=format&fit=crop",
        heroImageUrl: item.patientImage || "https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?q=80&w=1600&auto=format&fit=crop",
      };

      if (res.data.related?.data) {
        relatedStories = res.data.related.data.map((r) => ({
          id: r.id,
          slug: r.slug,
          patientName: r.title,
          date: formatStoryDate(r.storyDate),
          conditionTag: r.donationState || "Patient Journey",
          excerpt: r.shortDescription || "",
          fullStory: r.content || "",
          imageUrl: r.patientImage || "https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?q=80&w=800&auto=format&fit=crop",
          heroImageUrl: r.patientImage || "https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?q=80&w=1600&auto=format&fit=crop",
        }));
      }
    } else {
      is404 = true;
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "";
    if (/\b404\b|not found/i.test(message)) {
      is404 = true;
    } else {
      errorMsg = message || "Failed to connect to the server. Please check your connection and try again later.";
    }
  }

  if (is404 || (!story && !errorMsg)) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[#FFFBEA] text-[#2F2707] font-manrope">
      <DetailTracker type="smilestories" />
      <Banner
        bgImage="/journey-of-hope/Journey of Hope banner image.png"
        bgImageAlt="Patient Stories"
        breadcrumbs={[
          { label: "Home", href: "/#smilestories" },
          { label: "Journey of Hope", href: "/journey-of-hope/patient-stories" },
        ]}
        title="Patient Stories"
      />

      {/* Main Story Detail Section */}
      <section className={`${CONTAINER} py-8 sm:py-12 lg:py-16`}>
        {errorMsg ? (
          <div className="flex flex-col justify-center items-center py-20 min-h-[40vh] text-center max-w-2xl mx-auto px-4">
            <Typography variant="heading-3" as="h2" className="text-[#842A2A] mb-4 font-tiempos-headline italic">
              Connection Issue
            </Typography>
            <Typography variant="body-9" as="p" className="text-[#343E43]">
              {errorMsg}
            </Typography>
          </div>
        ) : story ? (
          <>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-12 sm:gap-8 lg:gap-12 items-start">
              {/* Left Column: Patient Image + Social Share Buttons */}
              <div className="sm:col-span-5 flex flex-col items-start w-full">
                <div className="relative aspect-[615/646] w-full max-w-[37.5rem] sm:max-w-[26.25rem] md:max-w-[30rem] lg:max-w-[32.5rem] xl:max-w-[35rem] overflow-hidden rounded-md bg-[#EFEAD8] shadow-xs">
                  {/* Puzzle-piece reveal on the detail image only — pieces
                      fade/scale in at their own cell, in a randomized order,
                      the moment this box scrolls into view. Same behavior
                      as the Projects detail page. */}
                  <PuzzleImage
                    key={story.id}
                    src={story.imageUrl}
                    alt={story.patientName}
                    rows={4}
                    cols={5}
                    fit="cover"
                    staggerDuration={1000}
                  />
                </div>
                <ShareStory className="!mt-4 sm:!mt-6" />
              </div>

              {/* Right Column: Patient Name Title, Date, and Full Story Narrative */}
              <div className="sm:col-span-7 flex flex-col">
                <Typography
                  variant="heading-2"
                  as="h1"
                  className="font-tiempos-headline font-normal italic text-left text-[#0D2838]"
                >
                  {story.patientName}
                </Typography>

                {story.date ? (
                  <div className="mt-2 sm:mt-2.5 flex items-center gap-2">
                    <Calendar className="size-4 text-[#C08600] shrink-0" />
                    <Typography variant="body-10" as="span" className="font-argestadisplay font-normal text-[#C08600]">
                      {story.date}
                    </Typography>
                  </div>
                ) : null}

                {/* Full Story HTML / Text Narrative */}
                <div className="mt-4 sm:mt-5 max-h-[25rem] sm:max-h-[30rem] lg:max-h-[35rem] xl:max-h-[40rem] overflow-y-auto no-scrollbar pr-2 sm:pr-4">
                  {story.fullStory.includes("<") ? (
                    <div
                      className="prose prose-stone max-w-none text-justify text-[#343E43] prose-headings:!text-[#0D2838] prose-a:!text-[#FCCC2D] [&_*]:!bg-transparent [&_p]:!text-[#343E43] [&_span]:!text-[#343E43] [&_div]:!text-[#343E43] [&_strong]:!text-[#343E43] [&_h1]:!text-[#0D2838] [&_h2]:!text-[#0D2838] [&_h3]:!text-[#0D2838] [&_h4]:!text-[#0D2838] [&_h5]:!text-[#0D2838] [&_h6]:!text-[#0D2838] [&_li]:!text-[#343E43] [&_td]:!text-[#343E43] [&_th]:!text-[#0D2838]"
                      dangerouslySetInnerHTML={{ __html: story.fullStory }}
                    />
                  ) : (
                    <div className="space-y-3.5 text-justify">
                      {story.fullStory.split("\n\n").map((paragraph, index) => (
                        <Typography
                          key={index}
                          variant="body-10"
                          as="p"
                          className="font-argestadisplay font-normal text-[#343E43]"
                        >
                          {paragraph}
                        </Typography>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Separator Line */}
            <div className="my-14 sm:my-18 border-t border-[#EFEAD8]" />

            {/* Bottom Section: Related Stories */}
            {relatedStories.length > 0 && (
              <RelatedPatientStories stories={relatedStories} />
            )}
          </>
        ) : null}
      </section>

      {/* Donate Section at the Bottom */}
      <div id="donate-form">
        <DonateForm />
      </div>

      <Script
        id={`story-anim-${targetId}`}
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: ANIM_SCRIPT }}
      />
    </main>
  );
}