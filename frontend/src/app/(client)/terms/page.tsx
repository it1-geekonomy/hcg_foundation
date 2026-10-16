import type { Metadata } from "next";
import { publicLegalApi } from "@/domains/cms/lib/api";
import LegalDocumentPage from "@/domains/legal/components/LegalDocumentPage";
import DonateForm from "@/shared/components/DonateForm";
import { PAGE_SEO, buildMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const fallback = PAGE_SEO["/terms"];
  const doc = await publicLegalApi.getPublishedTerms().catch(() => null);
  return buildMetadata({
    path: "/terms",
    title: doc?.metaTitle?.trim() || fallback.title,
    description: doc?.metaDescription?.trim() || fallback.description,
  });
}

export default async function TermsAndConditionsPage() {
  let document = null;
  try {
    document = await publicLegalApi.getPublishedTerms();
  } catch {
    document = null;
  }

  return (
    <>
      <LegalDocumentPage
        document={document}
        fallbackTitle="Terms & Conditions"
        emptyMessage="We are currently updating our Terms & Conditions. Please check back soon, or contact us at info@hcgfoundation.org if you have any questions."
      />
      <div id="donate-form">
        <DonateForm />
      </div>
    </>
  );
}