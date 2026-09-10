import LegalPageEditPage from "@/domains/cms/components/LegalPageEditPage";
import { TERMS_SECTION } from "@/domains/cms/lib/legal-sections";

export default function AdminTermsEditPage() {
  return <LegalPageEditPage section={TERMS_SECTION} />;
}
