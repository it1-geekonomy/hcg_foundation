import type { Metadata } from "next";

import FontsShowcase from "./FontsShowcase";

export const metadata: Metadata = {
  title: "Fonts & Typography | HCG Foundation",
  description: "Typography and font showcase for the HCG Foundation design system.",
};

export default function FontsPage() {
  return <FontsShowcase />;
}
