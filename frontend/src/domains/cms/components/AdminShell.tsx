"use client";

import { useCallback, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import AdminSidebar from "@/domains/cms/components/AdminSidebar";
import { adminMenu } from "@/navigation/admin-menu.config";

function titleFromPath(pathname: string) {
  const match = [...adminMenu]
    .sort((a, b) => b.href.length - a.href.length)
    .find(
      (item) =>
        pathname === item.href || pathname.startsWith(`${item.href}/`)
    );
  return match?.label ?? "Admin";
}

export default function AdminShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const title = titleFromPath(pathname);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const closeMobile = useCallback(() => setMobileOpen(false), []);

  return (
    <div className="flex min-h-screen bg-[#F7F7F5] font-manrope text-[#212121]">
      <AdminSidebar
        collapsed={collapsed}
        onCollapsedChange={setCollapsed}
        mobileOpen={mobileOpen}
        onMobileClose={closeMobile}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-[#E8E8E4] bg-[#F7F7F5]/95 px-4 backdrop-blur-md sm:h-16 sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="inline-flex size-9 items-center justify-center rounded-lg border border-black/8 bg-white text-[#212121] shadow-sm lg:hidden"
            aria-label="Open menu"
          >
            <Menu className="size-4" />
          </button>

          <div className="min-w-0 flex-1">
            <p className="font-manrope text-[10px] font-semibold tracking-[0.18em] text-[#9A7B00] uppercase">
              Content management
            </p>
            <h1 className="truncate font-manrope text-lg font-semibold tracking-tight text-[#141414] sm:text-xl">
              {title}
            </h1>
          </div>

          <div className="hidden items-center gap-2 sm:flex">
            <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 font-manrope text-xs font-medium text-[#5C5C5C] shadow-[0_1px_2px_rgba(0,0,0,0.04)] ring-1 ring-black/[0.06]">
              <span className="size-1.5 rounded-full bg-emerald-500" />
              Connected
            </span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
          <div className="mx-auto w-full max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
