import LegalPagesListPage from "@/domains/cms/features/legal/LegalPagesListPage";
import { PRIVACY_SECTION } from "@/domains/cms/lib/legal-sections";

export default function AdminPrivacyPolicyPage() {
  return <LegalPagesListPage section={PRIVACY_SECTION} />;
}
