"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { ChevronLeft, ChevronRight, LogOut, X } from "lucide-react";
import { authApi } from "@/domains/cms/lib/auth-api";
import { adminMenuGroups } from "@/navigation/admin-menu.config";
import { useAuthStore } from "@/store/auth.store";
import Typography from "@/lib/Typography";
import { cn } from "@/lib/utils";

function isActivePath(pathname: string, href: string) {
  if (pathname === href) return true;
  if (href === "/admin/dashboard") return false;
  return pathname.startsWith(`${href}/`) || pathname.startsWith(`${href}?`);
}

function initialsFromName(name?: string | null) {
  if (!name?.trim()) return "AD";
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() ?? "").join("") || "AD";
}

function SidebarNav({
  collapsed,
  onCollapsedChange,
  onNavigate,
  showDesktopToggle,
  showMobileClose,
}: {
  collapsed: boolean;
  onCollapsedChange: (value: boolean) => void;
  onNavigate?: () => void;
  showDesktopToggle?: boolean;
  showMobileClose?: boolean;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const accessToken = useAuthStore((s) => s.accessToken);
  const clearSession = useAuthStore((s) => s.clearSession);

  async function handleLogout() {
    try {
      await authApi.logout(accessToken);
    } finally {
      clearSession();
      router.replace("/login");
    }
  }

  return (
    <>
      <div
        className={cn(
          "relative flex shrink-0 items-center",
          collapsed && showDesktopToggle
            ? "h-20 justify-center px-2"
            : "h-24 px-5"
        )}
      >
        <Link
          href="/admin/dashboard"
          className={cn(
            "flex items-center overflow-hidden",
            collapsed && showDesktopToggle ? "w-9" : "min-w-0 flex-1"
          )}
          aria-label="HCG Foundation admin"
          onClick={onNavigate}
        >
          {/* Logo text is white, so it only reads on the dark sidebar. Collapsed = crop to the mark. */}
          <Image
            src="https://pub-bbab4b37d630465e8c49b68c7d045302.r2.dev/website/1790826091485-84k1a-group-3-1-.webp"
            alt="HCG Foundation"
            width={290}
            height={99}
            unoptimized
            className={cn(
              "w-auto max-w-none shrink-0 object-contain object-left",
              collapsed && showDesktopToggle ? "h-8" : "h-16"
            )}
            priority
          />
        </Link>

        {showMobileClose ? (
          <button
            type="button"
            onClick={onNavigate}
            className="flex size-8 items-center justify-center rounded-lg text-white/50 transition hover:bg-white/5 hover:text-white"
            aria-label="Close menu"
          >
            <X className="size-4" />
          </button>
        ) : null}

        {showDesktopToggle ? (
          <button
            type="button"
            onClick={() => onCollapsedChange(!collapsed)}
            className="absolute top-1/2 right-0 z-50 flex size-6 translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-cms-border bg-white text-cms-muted shadow-sm transition-colors hover:text-cms-ink"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <ChevronRight className="size-3.5" />
            ) : (
              <ChevronLeft className="size-3.5" />
            )}
          </button>
        ) : null}
      </div>

      <nav className="flex-1 overflow-x-hidden overflow-y-auto px-3 py-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        <div className="space-y-5">
          {adminMenuGroups.map((group) => (
            <div key={group.label}>
              {collapsed && showDesktopToggle ? (
                <div className="mx-auto mb-2 h-px w-5 bg-white/10" />
              ) : (
                <p className="mb-1.5 px-2.5 text-[11px] leading-4 font-medium tracking-[0.08em] text-white/40 uppercase">
                  {group.label}
                </p>
              )}

              <ul className="space-y-0.5">
                {group.items.map((item) => {
                  const active = isActivePath(pathname, item.href);
                  const Icon = item.icon;
                  const iconOnly = collapsed && showDesktopToggle;

                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        title={item.label}
                        onClick={onNavigate}
                        className={cn(
                          "group relative flex h-9 items-center gap-2.5 overflow-hidden rounded-md font-medium transition-colors duration-150",
                          iconOnly ? "justify-center px-0" : "px-2.5",
                          active
                            ? "bg-white/[0.09] text-white"
                            : "text-white/60 hover:bg-white/[0.05] hover:text-white"
                        )}
                      >
                        {active ? (
                          <span className="absolute top-1/2 left-0 h-4 w-[3px] -translate-y-1/2 rounded-r-full bg-cms-accent" />
                        ) : null}

                        <Icon
                          className={cn(
                            "size-4 shrink-0 transition-colors",
                            active
                              ? "text-cms-accent"
                              : "text-white/50 group-hover:text-white/80"
                          )}
                          strokeWidth={1.75}
                        />

                        {!iconOnly ? (
                          <Typography
                            variant="label-1"
                            as="span"
                            className="truncate"
                          >
                            {item.label}
                          </Typography>
                        ) : null}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </nav>

      <div className="shrink-0 border-t border-white/[0.06] p-3">
        {collapsed && showDesktopToggle ? (
          <button
            type="button"
            onClick={() => void handleLogout()}
            className="mx-auto flex size-9 items-center justify-center rounded-md text-white/50 transition hover:bg-white/5 hover:text-white"
            aria-label="Sign out"
            title="Sign out"
          >
            <LogOut className="size-4" />
          </button>
        ) : (
          <div className="flex items-center gap-2.5 rounded-md px-2 py-2">
            <Typography
              variant="caption-1"
              as="div"
              className="flex size-8 shrink-0 items-center justify-center rounded-full bg-cms-accent/15 font-semibold text-cms-accent"
            >
              {initialsFromName(user?.fullName)}
            </Typography>
            <div className="min-w-0 flex-1">
              <Typography
                variant="label-1"
                as="p"
                className="truncate font-semibold text-white"
              >
                {user?.fullName || "Admin"}
              </Typography>
              <Typography
                variant="caption-1"
                as="p"
                className="truncate text-white/45"
              >
                {user?.email || "CMS access"}
              </Typography>
            </div>
            <button
              type="button"
              onClick={() => void handleLogout()}
              className="flex size-8 shrink-0 items-center justify-center rounded-md text-white/45 transition hover:bg-white/5 hover:text-white"
              aria-label="Sign out"
              title="Sign out"
            >
              <LogOut className="size-4" />
            </button>
          </div>
        )}
      </div>
    </>
  );
}

type AdminSidebarProps = {
  collapsed: boolean;
  onCollapsedChange: (value: boolean) => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
};

export default function AdminSidebar({
  collapsed,
  onCollapsedChange,
  mobileOpen,
  onMobileClose,
}: AdminSidebarProps) {
  const pathname = usePathname();

  useEffect(() => {
    onMobileClose();
  }, [pathname, onMobileClose]);

  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/45 transition-opacity lg:hidden",
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={onMobileClose}
        aria-hidden
      />

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[min(280px,86vw)] flex-col bg-cms-sidebar text-white shadow-2xl transition-transform duration-300 ease-out lg:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <SidebarNav
          collapsed={false}
          onCollapsedChange={onCollapsedChange}
          onNavigate={onMobileClose}
          showMobileClose
        />
      </aside>

      <aside
        className={cn(
          "relative sticky top-0 z-50 hidden h-screen shrink-0 flex-col overflow-visible border-r border-white/[0.06] bg-cms-sidebar text-white transition-[width] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] lg:flex",
          collapsed ? "w-[68px]" : "w-[248px]"
        )}
      >
        <SidebarNav
          collapsed={collapsed}
          onCollapsedChange={onCollapsedChange}
          showDesktopToggle
        />
      </aside>
    </>
  );
}
