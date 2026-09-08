import LegalPageViewPage from "@/domains/cms/components/LegalPageViewPage";
import { PRIVACY_SECTION } from "@/domains/cms/lib/legal-sections";

export default function AdminPrivacyPolicyViewPage() {
  return <LegalPageViewPage section={PRIVACY_SECTION} />;
}
