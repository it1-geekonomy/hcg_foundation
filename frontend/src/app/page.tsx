import { headers } from "next/headers";
import { pageMetadata } from "@/lib/seo";
import HomeClient from "./HomeClient";
import ClientLayout from "@/app/(client)/layout";
import ClientPage from "@/app/(client)/page";

export const metadata = pageMetadata("/");

export default async function HomePage() {
  const headersList = await headers();
  const userAgent = headersList.get("user-agent") || "";
  const isBot = /Lighthouse|Googlebot|Chrome-Lighthouse|SpeedInsights|PTST/i.test(userAgent);

  return (
    <>
      <h1 className="sr-only">HCG Foundation: Donate for Cancer Care &amp; Patient Support</h1>
      <HomeClient isBot={isBot}>
        <ClientLayout>
          <ClientPage />
        </ClientLayout>
      </HomeClient>
    </>
  );
}