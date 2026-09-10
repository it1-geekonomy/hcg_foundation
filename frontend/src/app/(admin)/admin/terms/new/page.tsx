import LegalPageCreatePage from "@/domains/cms/components/LegalPageCreatePage";
import { TERMS_SECTION } from "@/domains/cms/lib/legal-sections";

export default function AdminTermsNewPage() {
  return <LegalPageCreatePage section={TERMS_SECTION} />;
}
