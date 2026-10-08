import { pageMetadata } from "@/lib/seo";
import HomeClient from "./HomeClient";

export const metadata = pageMetadata("/");

export default function HomePage() {
  return <HomeClient />;
}