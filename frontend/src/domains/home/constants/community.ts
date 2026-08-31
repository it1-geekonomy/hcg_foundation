export const communityTags = [
  "Patient Support",
  "Financial Assistance",
  "Early Detection",
  "Awareness",
  "Community Outreach",
  "Education",
];

export const communityTagRows = [
  communityTags.slice(0, 3),
  communityTags.slice(3, 6),
] as const;

/** Figma community chips + type colors */
export const communityTheme = {
  tagBg: "#876900",
  tagText: "#FFFFFF",
  heading: "#382E07",
  body: "rgba(45, 35, 0, 0.76)",
} as const;

export const communityContent = {
  heading: "Creating Healthier Communities, Together",
  description:
    "Every initiative is designed to improve lives through compassionate care, awareness, early detection, education, and meaningful partnerships that create lasting impact.",
  overlay: {
    label: "Your Contribution Matters",
    heading: "Bring Hope to Every Journey",
    description:
      "Help patients access life-changing care through your generous support.",
    buttonText: "DONATE NOW",
  },
  image: {
    src: "/community/community.png",
    alt: "Two women sharing a warm, hopeful moment together",
  },
};
