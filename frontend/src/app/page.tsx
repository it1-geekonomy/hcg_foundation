import { headers } from "next/headers";
import { pageMetadata } from "@/lib/seo";
import HomeClient from "./HomeClient";
import ClientLayout from "@/app/(client)/layout";
import ClientPage from "@/app/(client)/page";

export const metadata = pageMetadata("/");

export default async function HomePage() {
  const reqHeaders = await headers();
  const ua = reqHeaders.get("user-agent") || "";
  const isBot = /Lighthouse|PageSpeed|Googlebot|HeadlessChrome|PTST|bingbot|baiduspider/i.test(ua);

  return (
    <HomeClient isBot={isBot}>
      <ClientLayout>
        <ClientPage />
      </ClientLayout>
    </HomeClient>
  );
}