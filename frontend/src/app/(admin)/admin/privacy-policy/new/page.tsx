import LegalPageCreatePage from "@/domains/cms/features/legal/LegalPageCreatePage";
import { PRIVACY_SECTION } from "@/domains/cms/lib/legal-sections";

export default function AdminPrivacyPolicyNewPage() {
  return <LegalPageCreatePage section={PRIVACY_SECTION} />;
}
