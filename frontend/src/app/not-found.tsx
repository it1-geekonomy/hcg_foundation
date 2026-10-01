import type { Metadata } from "next";
import ClientLayout from "./(client)/layout";
import NotFoundContent from "@/shared/components/NotFoundContent";

export const metadata: Metadata = {
  title: "Page not found | HCG Foundation",
};

/** Unmatched URLs render outside the (client) group, so the site chrome is added here. */
export default function NotFound() {
  return (
    <ClientLayout>
      <NotFoundContent />
    </ClientLayout>
  );
}
