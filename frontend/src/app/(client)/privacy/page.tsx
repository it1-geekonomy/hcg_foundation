import type { Metadata } from "next";
import { publicLegalApi } from "@/domains/cms/lib/api";
import LegalDocumentPage from "@/domains/legal/components/LegalDocumentPage";
import DonateForm from "@/shared/components/DonateForm";
import AnimatedLegalContent from "@/domains/privacypolicy/Animatedtext";
import { PAGE_SEO, buildMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const fallback = PAGE_SEO["/privacy"];
  const doc = await publicLegalApi.getPublishedPrivacyPolicy().catch(() => null);
  return buildMetadata({
    path: "/privacy",
    title: doc?.metaTitle?.trim() || fallback.title,
    description: doc?.metaDescription?.trim() || fallback.description,
  });
}

export default async function PrivacyPolicyPage() {
  let document = null;
  try {
    document = await publicLegalApi.getPublishedPrivacyPolicy();
  } catch {
    document = null;
  }

  return (
    <>
      <AnimatedLegalContent>
        <LegalDocumentPage
          document={document}
          fallbackTitle="Privacy Policy"
          emptyMessage="We are currently updating our Privacy Policy. Please check back soon, or contact us at hcgfoundation@gmail.com if you have any questions about how we handle your information."
        />
      </AnimatedLegalContent>
      <div id="donate-form">
        <DonateForm />
      </div>
    </>
  );
}