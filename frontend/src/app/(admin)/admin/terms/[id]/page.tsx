import LegalPageViewPage from "@/domains/cms/components/LegalPageViewPage";
import { TERMS_SECTION } from "@/domains/cms/lib/legal-sections";

export default function AdminTermsViewPage() {
  return <LegalPageViewPage section={TERMS_SECTION} />;
}
