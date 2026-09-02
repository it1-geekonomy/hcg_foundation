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
  location: string;
  image: string;
  title: string;
  description: string;
}

export const TOGETHER_CONTENT: TogetherContent = {
  heading: "Together We Create Hope",
  description:
    "Every event brings people together to spread awareness, support patients, and build healthier communities through compassion and meaningful action.",
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
    location: "Bengaluru",
    image: "/Togethercreatehope/carousal1.png",
    title: "Cancer Awareness & Screening Camps",
    description:
      "Through community outreach programs, free screenings, and educational initiatives, we empower individuals with knowledge and encourage early detection.",
  },
  {
    location: "Bengaluru",
    image: "/Togethercreatehope/carousal2.png",
    title: "Christmas and New Year Celebration",
    description:
      "Christmas and New Year Celebration at Swasti Gallery, the New Year and Christmas celebrations were nothing short of heartwarming.",
  },
  {
    location: "Bengaluru",
    image: "/Togethercreatehope/carousal3.png",
    title: "Cancer Awareness & Screening Camps",
    description:
      "Through community outreach programs, free screenings, and educational initiatives, we empower individuals with knowledge and encourage early detection.",
  },
];

export const AUTO_ADVANCE_MS = 3000;