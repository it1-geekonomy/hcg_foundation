import type { Metadata } from "next";

export const SITE_NAME = "HCG Foundation";

/**
 * Canonical origin for every page. Whatever host serves the site (staging IP, localhost,
 * www or bare domain), canonicals and og:url always point here so search engines index
 * one copy. Override per environment with NEXT_PUBLIC_SITE_URL.
 */
const getSiteUrl = () => {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return "http://localhost:3000";
};

export const SITE_URL = getSiteUrl().trim().replace(/\/+$/, "");

type PageSeo = { title: string; description: string };

export const PAGE_SEO = {
  "/": {
    title: "HCG Foundation | Donate for Cancer Care & Patient Support",
    description:
      "HCG Foundation supports cancer patients with financial aid, screening camps, counselling and awareness. 80G approved. Donate and give hope today.",
  },
  "/about-us": {
    title: "About HCG Foundation | Cancer Support & Awareness",
    description:
      "HCG Foundation helps cancer patients with financial support, early detection camps, counselling and awareness programs. Learn about our mission.",
  },
  "/patient-aid": {
    title: "The Patient Aid Support Process | HCG Foundation",
    description:
      "HCG Foundation helps financially challenged cancer patients with treatment estimates, hospital discounts and fundraising. See how to refer a patient.",
  },
  "/awareness-and-screening-camps": {
    title: "Cancer Awareness & Screening Camps | HCG Foundation",
    description:
      "HCG Foundation organises cancer awareness and screening camps to help communities spot early signs and get checked in time. Learn more.",
  },
  "/swasti-art-gallery": {
    title: "Swasthi Art Gallery & Art Therapy | HCG Foundation",
    description:
      "Swasthi Art Gallery raises funds for cancer patients, and its art therapy sessions let patients create, reflect and express feelings. Visit the gallery.",
  },
  "/pink-hope-support-group": {
    title: "Pink Hope Patient Support Group | HCG Foundation",
    description:
      "Facing breast cancer? You don't have to do it alone. Pink Hope connects patients with survivors who understand, listen and share hope.",
  },
  "/innovation-and-technology": {
    title: "Innovation and Technology | HCG Foundation",
    description:
      "Learn about HCG Foundation's research and innovation work in cancer care. Details are coming soon, so check back for updates.",
  },
  "/csr-partner": {
    title: "CSR Partnership for Cancer Care | HCG Foundation",
    description:
      "Make your CSR count in cancer care. Fund a program and get quarterly impact reports, or donate, sponsor or volunteer with HCG Foundation.",
  },
  "/grant-and-philanthropy": {
    title: "Cancer Philanthropy and Grants | HCG Foundation",
    description:
      "Support cancer care through grants and philanthropy. Partner to expand access to treatment and create meaningful impact for patients and communities.",
  },
  "/participate": {
    title: "Volunteer, Fundraise & Intern | HCG Foundation",
    description:
      "Your time and skills can bring hope to cancer patients. Volunteer, fundraise or intern with HCG Foundation and make an impact. Apply now.",
  },
  "/transparency-and-knowledge-hub": {
    title: "Transparency & Annual Reports | HCG Foundation",
    description:
      "See where your support goes. Explore HCG Foundation's annual reports and the impact of our cancer awareness, patient support and community care.",
  },
  "/projects": {
    title: "Projects | HCG Foundation",
    description:
      "Explore HCG Foundation's projects in cancer care, from patient financial aid and screening camps to mobile clinics and HPV vaccination drives.",
  },
  "/events": {
    title: "Events | HCG Foundation",
    description:
      "Cultural charity events like Arambh and Sur Sandhya raise funds and awareness for cancer care. Be part of the next HCG Foundation event.",
  },
  "/testimonials": {
    title: "Patient Testimonials | HCG Foundation",
    description:
      "Hear from patients and families whose journeys inspire us. Read HCG Foundation's testimonials and see the hope, courage and care behind every story.",
  },
  "/patient-stories": {
    title: "Cancer Patient Stories | HCG Foundation",
    description:
      "Read the stories of cancer patients HCG Foundation is helping. See their journeys, understand their needs and support a patient's treatment today.",
  },
  "/contact": {
    title: "Contact Us | HCG Foundation",
    description:
      "Need patient support or want to partner with HCG Foundation? Reach our team by phone, email or message. We reply as soon as possible.",
  },
  "/privacy": {
    title: "Privacy Policy | HCG Foundation",
    description:
      "Read how HCG Foundation collects, uses and protects your personal information when you donate, volunteer or contact us.",
  },
  "/terms": {
    title: "Terms & Conditions | HCG Foundation",
    description:
      "Read HCG Foundation's donation terms and conditions, including receipts, 80G receipts, refunds, accepted cards and payment security.",
  },
} satisfies Record<string, PageSeo>;

export type SeoPath = keyof typeof PAGE_SEO;

/** Normalises a route path: leading slash, no query/hash, no trailing slash (except root). */
export function canonicalPath(path: string): string {
  const clean = path.split(/[?#]/)[0].trim();
  const withSlash = clean.startsWith("/") ? clean : `/${clean}`;
  return withSlash.length > 1 ? withSlash.replace(/\/+$/, "") : "/";
}

export function absoluteUrl(path: string): string {
  const p = canonicalPath(path);
  return p === "/" ? `${SITE_URL}/` : `${SITE_URL}${p}`;
}

type BuildOptions = {
  path: string;
  title: string;
  description?: string;
  image?: string | null;
};

export function buildMetadata({ path, title, description, image }: BuildOptions): Metadata {
  const url = absoluteUrl(path);
  const images = image ? [{ url: image }] : undefined;
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      locale: "en_IN",
      url,
      title,
      description,
      images,
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title,
      description,
      images: image ? [image] : undefined,
    },
  };
}

/** Metadata for a fixed page, with title and description from the SEO sheet. */
export function pageMetadata(path: SeoPath): Metadata {
  return buildMetadata({ path, ...PAGE_SEO[path] });
}

type DetailSeoSource = {
  slug?: string | null;
  title?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  shortDescription?: string | null;
  content?: string | null;
};

/**
 * Metadata for a CMS detail page (event, project, patient story). The canonical is the
 * section path plus the item's slug, falling back to the id from the requested URL.
 */
export function detailMetadata({
  section,
  sectionLabel,
  id,
  item,
  image,
}: {
  section: "/events" | "/projects" | "/patient-stories";
  sectionLabel: string;
  id: string;
  item?: DetailSeoSource | null;
  image?: string | null;
}): Metadata {
  const segment = encodeURIComponent(item?.slug?.trim() || id);
  const name = item?.title?.trim();
  return buildMetadata({
    path: `${section}/${segment}`,
    title:
      item?.metaTitle?.trim() ||
      (name ? `${name} | ${sectionLabel} | ${SITE_NAME}` : PAGE_SEO[section].title),
    description:
      item?.metaDescription?.trim() ||
      toMetaDescription(item?.shortDescription) ||
      toMetaDescription(item?.content) ||
      PAGE_SEO[section].description,
    image,
  });
}

/** Strips HTML and collapses whitespace, then trims to a search-snippet length. */
export function toMetaDescription(text: string | null | undefined, max = 160): string | undefined {
  const plain = (text ?? "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!plain) return undefined;
  if (plain.length <= max) return plain;
  const cut = plain.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(" ");
  return `${lastSpace > max / 2 ? cut.slice(0, lastSpace) : cut}…`;
}
