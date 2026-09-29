"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import Typography from "@/lib/Typography";
import AdminSidebar from "@/domains/cms/shell/AdminSidebar";
import CmsConfirmDialog from "@/domains/cms/ui/CmsConfirmDialog";
import CmsToaster from "@/domains/cms/ui/CmsToaster";
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

  // Dialogs, selects and toasts portal to <body>; they need the CMS scope too.
  useEffect(() => {
    document.body.setAttribute("data-cms", "");
    return () => document.body.removeAttribute("data-cms");
  }, []);

  return (
    <div
      data-cms
      className="flex min-h-screen bg-cms-canvas text-cms-body"
    >
      <AdminSidebar
        collapsed={collapsed}
        onCollapsedChange={setCollapsed}
        mobileOpen={mobileOpen}
        onMobileClose={closeMobile}
      />

      <div className="relative z-0 flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-cms-border bg-white/90 px-4 backdrop-blur-md sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="inline-flex size-9 items-center justify-center rounded-lg border border-cms-border bg-white text-cms-ink lg:hidden"
            aria-label="Open menu"
          >
            <Menu className="size-4" />
          </button>

          <div className="flex min-w-0 flex-1 items-center gap-2 text-sm">
            <span className="hidden text-cms-muted sm:inline">Content management</span>
            <span className="hidden text-cms-faint sm:inline" aria-hidden>
              /
            </span>
            <Typography
              variant="label-1"
              as="h1"
              className="truncate font-semibold text-cms-ink"
            >
              {title}
            </Typography>
          </div>

          <span className="hidden items-center gap-2 rounded-md border border-cms-border bg-white px-2.5 py-1 text-xs font-medium text-cms-muted sm:inline-flex">
            <span className="size-1.5 rounded-full bg-emerald-500" />
            Connected
          </span>
        </header>

        <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <div className="mx-auto w-full max-w-[1440px]">{children}</div>
        </main>
      </div>

      <CmsToaster />
      <CmsConfirmDialog />
    </div>
  );
}
