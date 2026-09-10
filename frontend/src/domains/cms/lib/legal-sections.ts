import type { LegalPageType } from "@/domains/cms/lib/types";

export type LegalSectionConfig = {
  pageType: LegalPageType;
  basePath: string;
  label: string;
  singular: string;
  publicPath: string;
  defaultTitle: string;
  defaultSlug: string;
};

export const PRIVACY_SECTION: LegalSectionConfig = {
  pageType: "privacy_policy",
  basePath: "/admin/privacy-policy",
  label: "Privacy Policy",
  singular: "privacy policy",
  publicPath: "/privacy",
  defaultTitle: "Privacy Policy",
  defaultSlug: "privacy-policy",
};

export const TERMS_SECTION: LegalSectionConfig = {
  pageType: "terms_and_conditions",
  basePath: "/admin/terms",
  label: "Terms & Conditions",
  singular: "terms & conditions",
  publicPath: "/terms",
  defaultTitle: "Terms & Conditions",
  defaultSlug: "terms-and-conditions",
};
