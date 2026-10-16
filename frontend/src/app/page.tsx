import { pageMetadata } from "@/lib/seo";
import HomeClient from "./HomeClient";
import ClientLayout from "@/app/(client)/layout";
import ClientPage from "@/app/(client)/page";

export const metadata = pageMetadata("/");

export default function HomePage() {
  return (
    <HomeClient>
      <ClientLayout>
        <ClientPage />
      </ClientLayout>
    </HomeClient>
  );
}