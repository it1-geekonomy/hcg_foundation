import LegalPageEditPage from "@/domains/cms/components/LegalPageEditPage";
import { PRIVACY_SECTION } from "@/domains/cms/lib/legal-sections";

export default function AdminPrivacyPolicyEditPage() {
  return <LegalPageEditPage section={PRIVACY_SECTION} />;
}
