import type { Metadata } from "next";
import { publicLegalApi } from "@/domains/cms/lib/api";
import LegalDocumentPage from "@/domains/legal/components/LegalDocumentPage";

export async function generateMetadata(): Promise<Metadata> {
  try {
    const doc = await publicLegalApi.getPublishedPrivacyPolicy();
    return {
      title: doc?.metaTitle?.trim() || doc?.title?.trim() || "Privacy Policy",
      description:
        doc?.metaDescription?.trim() ||
        "Privacy Policy for The HCG Foundation.",
    };
  } catch {
    return {
      title: "Privacy Policy",
      description: "Privacy Policy for The HCG Foundation.",
    };
  }
}

export default async function PrivacyPolicyPage() {
  let document = null;
  try {
    document = await publicLegalApi.getPublishedPrivacyPolicy();
  } catch {
    document = null;
  }

  return (
    <LegalDocumentPage
      document={document}
      fallbackTitle="Privacy Policy"
      emptyMessage="Our Privacy Policy will appear here once it is published in the CMS."
    />
  );
}
