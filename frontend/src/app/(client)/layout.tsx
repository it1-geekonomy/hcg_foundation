import type { ReactNode } from "react";

import Navbar from "@/shared/components/navbar/navbar";
import Footer from "@/shared/components/footer/footer";

interface ClientLayoutProps {
  children: ReactNode;
}

export default function ClientLayout({
  children,
}: ClientLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1">{children}</main>

      <Footer />
    </div>
  );
}