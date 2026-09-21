export interface TogetherStat {
  value: string;
  label: string;
}

export interface TogetherContentCta {
  label: string;
  href: string;
}

export interface TogetherContentBlock {
  heading: string;
  description: string;
  cta: TogetherContentCta;
}

export interface TogetherContent {
  heading: string;
  description: string;
  stat: TogetherStat;
  calendarIcon: string;
  eventImage: string;
  content: TogetherContentBlock;
}

export interface CarouselSlide {
  id?: string;
  image: string;
  title: string;
  description: string;
  href?: string;
}

/** Homepage carousel / CMS desktop banner — matches Figma export */
export const EVENT_BANNER_SIZE = { width: 849, height: 984 } as const;

/** Map a published CMS event → homepage carousel slide (image design). */
export function mapEventToCarouselSlide(event: {
  id?: string;
  title: string;
  slug?: string;
  eventBanner?: string | null;
  eventMobileBanner?: string | null;
  eventLocation?: string | null;
  shortDescription?: string | null;
}): CarouselSlide {
  return {
    id: event.id,
    image:
      event.eventBanner?.trim() ||
      event.eventMobileBanner?.trim() ||
      "",
    title: event.title,
    description:
      event.shortDescription?.trim() ||
      "Through community outreach programs, free screenings, and educational initiatives, we empower individuals with knowledge and encourage early detection.",
    href: event.slug ? `/resources/events/${event.slug}` : undefined,
  };
}

export const TOGETHER_CONTENT: TogetherContent = {
  heading: "Together We Create Hope",
  description:
    "From awareness events to art and creative activities, every initiative brings people together to spread hope, support patients, and build stronger communities.",
  stat: {
    value: "482+",
    label: "Community Events",
  },
  calendarIcon: "/Togethercreatehope/calender.png",
  eventImage: "/Togethercreatehope/eventimg.png",
  content: {
    heading: "Creating Healthier Communities Together",
    description:
      "Through community outreach programs, free screenings, and educational initiatives, we empower individuals with knowledge and encourage early detection.",
    cta: {
      label: "View All Events",
      href: "/",
    },
  },
};

export const CAROUSEL_SLIDES: CarouselSlide[] = [
  {
    image: "/Togethercreatehope/carousal1.png",
    title: "Cancer Awareness & Screening Camps",
    description:
      "Through community outreach programs, free screenings, and educational initiatives, we empower individuals with knowledge and encourage early detection.",
  },
  {
    image: "/Togethercreatehope/carousal2.png",
    title: "Christmas and New Year Celebration",
    description:
      "Christmas and New Year Celebration at Swasti Gallery, the New Year and Christmas celebrations were nothing short of heartwarming.",
  },
  {
    image: "/Togethercreatehope/carousal3.png",
    title: "Cancer Awareness & Screening Camps",
    description:
      "Through community outreach programs, free screenings, and educational initiatives, we empower individuals with knowledge and encourage early detection.",
  },
];

export const AUTO_ADVANCE_MS = 3000;