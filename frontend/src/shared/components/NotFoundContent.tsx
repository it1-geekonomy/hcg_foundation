import { Compass } from "lucide-react";
import ContentNotice from "./ContentNotice";

export default function NotFoundContent() {
  return (
    <section className="flex min-h-[70vh] items-center bg-[#FFFBEA] px-4 py-24">
      <ContentNotice
        icon={Compass}
        headingAs="h1"
        title="We couldn't find that page"
        message="The page you're looking for may have moved or is no longer available. Let's get you back to where hope begins."
        action={{ label: "Back to home", href: "/" }}
      />
    </section>
  );
}
