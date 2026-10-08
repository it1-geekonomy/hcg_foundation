import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { fontVariableClassNames } from "@/lib/fonts";
import { PAGE_SEO, SITE_NAME, SITE_URL } from "@/lib/seo";
import PageTransition from "@/shared/components/PageTransition";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

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
      className={`${geistSans.variable} ${geistMono.variable} ${fontVariableClassNames} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <PageTransition>{children}</PageTransition>
      </body>
    </html>
  );
}