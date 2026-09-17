import type { Metadata } from "next";
import { publicLegalApi } from "@/domains/cms/lib/api";
import LegalDocumentPage from "@/domains/legal/components/LegalDocumentPage";

export async function generateMetadata(): Promise<Metadata> {
  try {
    const doc = await publicLegalApi.getPublishedTerms();
    return {
      title:
        doc?.metaTitle?.trim() || doc?.title?.trim() || "Terms & Conditions",
      description:
        doc?.metaDescription?.trim() ||
        "Terms & Conditions for The HCG Foundation.",
    };
  } catch {
    return {
      title: "Terms & Conditions",
      description: "Terms & Conditions for The HCG Foundation.",
    };
  }
}

export default async function TermsAndConditionsPage() {
  let document = null;
  try {
    document = await publicLegalApi.getPublishedTerms();
  } catch {
    document = null;
  }

  return (
    <LegalDocumentPage
      document={document}
      fallbackTitle="Terms & Conditions"
      emptyMessage="Our Terms & Conditions will appear here once they are published in the CMS."
    />
  );
}
