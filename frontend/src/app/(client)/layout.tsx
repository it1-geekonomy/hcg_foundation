import type { ReactNode } from "react";

import Navbar from "@/shared/components/navbar/navbar";
import Footer from "@/shared/components/footer/footer";
import DonateButton from "@/shared/components/DonateButton";

interface ClientLayoutProps {
  children: ReactNode;
}

export default function ClientLayout({
  children,
}: ClientLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      {/* <Navbar /> */}

      <main className="flex-1">{children}</main>

      <DonateButton />

      <Footer />
    </div>
  );
}