import type { Metadata, Viewport } from "next";
import "./globals.css";
import { fontVariableClassNames } from "@/lib/fonts";
import { PAGE_SEO, SITE_NAME, SITE_URL } from "@/lib/seo";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

// No canonical here: it would be inherited by every route that doesn't set its own.
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: PAGE_SEO["/"].title,
  description: PAGE_SEO["/"].description,
  applicationName: SITE_NAME,
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "en_IN",
  },
  icons: {
    icon: "/hcgfavicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${fontVariableClassNames} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
      </body>
    </html>
  );
}