export const STATS = [
  {
    value: "50K+",
    label: "Patients Supported",
    story: "It began with one person who needed care.",
  },
  {
    value: "1,200+",
    label: "Screening Camps",
    story: "One village at a time, the circle widened.",
  },
  {
    value: "15+",
    label: "Years of Service",
    story: "Fifteen years later, we are still growing.",
  },
];

export const T_SEED = 320;
export const T_GROW = 680;
export const T_SOLID = 480;
export const T_HOLD = 100;
export const T_EXIT = 200;
export const STAT_MS = T_SEED + T_GROW + T_SOLID + T_HOLD + T_EXIT;

export type Stage = "seed" | "grow" | "solid" | "hold" | "exit";
export type Phase = number | "brand" | "lift";

export type Particle = {
  sx: number;
  sy: number;
  mx: number;
  my: number;
  hx: number;
  hy: number;
  r: number;
  hue: number;
  d: number;
  fade: number;
};

// Footer Constants
export const FOOTER_COLORS = {
  background: "#373737",
  gold: "#FFD43B",
  darkBrown: "#8B7355",
  darkBrownHover: "#7A6548",
  text: "#FFFFFF",
  textMuted: "#9CA3AF",
  placeholder: "#FFD43B",
} as const;

export const FOOTER_QUICK_LINKS = [
  "Home",
  "About Us",
  "Patient Stories",
  "Patient Testimonials",
  "Patient Aid",
  "Donate Now",
  "Contact Us",
] as const;

export const FOOTER_INNER_PAGES = [
  "Team",
  "Trustees",
  "Events",
  "Projects",
  "Privacy Policy",
  "Terms and Conditions",
  "Disclaimer",
] as const;

export const FOOTER_CONTACT_INFO = {
  address: "Ground Floor, Tower Block, Unity Building Complex, Mission Road, Bangalore 560027, Karnataka, India",
  phone: "+91-80-4660-7760",
  email: "hcgfoundation@gmail.com",
  phoneLink: "tel:+918046607760",
  emailLink: "mailto:hcgfoundation@gmail.com",
} as const;

export const FOOTER_SOCIAL_LINKS = [
  { name: "Facebook", href: "" },
  { name: "LinkedIn", href: "" },
  { name: "Instagram", href: "" },
] as const;

export const FOOTER_DEVELOPER = {
  text: "Designed & Developed By",
  company: "Geekonomy",
  href: "https://thegeekonomy.com/"
} as const;

export const FOOTER_LEGAL_LINKS = [
  { label: "Terms & Conditions", href: "/terms" },
  { label: "Privacy Policy", href: "/privacy" },
] as const;
