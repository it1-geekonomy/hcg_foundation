import type { LegalPageType } from "@/domains/cms/lib/types";

export type LegalSectionConfig = {
  pageType: LegalPageType;
  apiPath: "/privacy-policy" | "/terms-and-conditions";
  basePath: string;
  label: string;
  singular: string;
  publicPath: string;
  defaultTitle: string;
};

export const PRIVACY_SECTION: LegalSectionConfig = {
  pageType: "privacy_policy",
  apiPath: "/privacy-policy",
  basePath: "/admin/privacy-policy",
  label: "Privacy Policy",
  singular: "privacy policy",
  publicPath: "/privacy",
  defaultTitle: "Privacy Policy",
};

export const TERMS_SECTION: LegalSectionConfig = {
  pageType: "terms_and_conditions",
  apiPath: "/terms-and-conditions",
  basePath: "/admin/terms",
  label: "Terms & Conditions",
  singular: "terms & conditions",
  publicPath: "/terms",
  defaultTitle: "Terms & Conditions",
};

export function legalApiPath(pageType: LegalPageType) {
  return pageType === "privacy_policy"
    ? "/privacy-policy"
    : "/terms-and-conditions";
}
