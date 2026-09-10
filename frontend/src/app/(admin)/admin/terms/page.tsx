import LegalPagesListPage from "@/domains/cms/components/LegalPagesListPage";
import { TERMS_SECTION } from "@/domains/cms/lib/legal-sections";

export default function AdminTermsPage() {
  return <LegalPagesListPage section={TERMS_SECTION} />;
}
