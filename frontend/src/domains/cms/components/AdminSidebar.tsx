"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { ChevronLeft, ChevronRight, LogOut, X } from "lucide-react";
import { authApi } from "@/domains/cms/lib/auth-api";
import { adminMenuGroups } from "@/navigation/admin-menu.config";
import { useAuthStore } from "@/store/auth.store";
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
          "relative flex h-16 shrink-0 items-center border-b border-white/[0.06] px-3.5 lg:h-[72px]",
          collapsed && showDesktopToggle && "justify-center"
        )}
      >
        <Link
          href="/admin/dashboard"
          className="flex h-10 min-w-0 flex-1 items-center overflow-hidden lg:h-11"
          aria-label="HCG Foundation admin"
          onClick={onNavigate}
        >
          <Image
            src="/footer/Logo.png"
            alt="HCG Foundation"
            width={180}
            height={52}
            className="h-10 w-[160px] max-w-none shrink-0 object-contain object-left lg:h-11 lg:w-[180px]"
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
            className="absolute top-1/2 right-0 z-40 flex size-7 translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/12 bg-[#171717] text-white/70 shadow-[0_4px_12px_rgba(0,0,0,0.4)] transition-colors hover:border-[#FCCC2D]/50 hover:text-[#FCCC2D]"
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

      <nav className="flex-1 overflow-x-hidden overflow-y-auto px-3 py-5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        <div className="space-y-7">
          {adminMenuGroups.map((group) => (
            <div key={group.label}>
              {collapsed && showDesktopToggle ? (
                <div className="mx-auto mb-2.5 h-px w-5 bg-white/10" />
              ) : (
                <p className="mb-2.5 px-3 font-manrope text-[10px] font-semibold tracking-[0.2em] text-white/30 uppercase">
                  {group.label}
                </p>
              )}

              <ul className="space-y-1">
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
                          "group relative flex items-center gap-3 overflow-hidden rounded-xl py-2.5 font-manrope text-sm font-medium transition-colors duration-200",
                          iconOnly ? "justify-center px-0" : "px-3",
                          active
                            ? "bg-[linear-gradient(90deg,rgba(252,204,45,0.16),rgba(252,204,45,0.04))] text-[#FCCC2D]"
                            : "text-white/60 hover:bg-white/[0.04] hover:text-white"
                        )}
                      >
                        {active ? (
                          <span className="absolute top-1/2 left-0 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-[#FCCC2D]" />
                        ) : null}

                        <span
                          className={cn(
                            "flex size-9 shrink-0 items-center justify-center rounded-lg transition-colors",
                            active
                              ? "bg-[#FCCC2D] text-[#141414] shadow-[0_6px_16px_rgba(252,204,45,0.28)]"
                              : "bg-white/[0.04] text-white/65 group-hover:bg-white/[0.08] group-hover:text-white"
                          )}
                        >
                          <Icon className="size-4" strokeWidth={1.75} />
                        </span>

                        {!iconOnly ? (
                          <span className="truncate tracking-[-0.01em]">
                            {item.label}
                          </span>
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
            className="mx-auto flex size-10 items-center justify-center rounded-xl bg-white/[0.03] text-white/50 ring-1 ring-white/[0.06] transition hover:bg-white/5 hover:text-white"
            aria-label="Sign out"
            title="Sign out"
          >
            <LogOut className="size-4" />
          </button>
        ) : (
          <div className="flex items-center gap-3 rounded-xl bg-white/[0.03] px-3 py-3 ring-1 ring-white/[0.06]">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#FCCC2D]/15 font-manrope text-xs font-bold text-[#FCCC2D]">
              {initialsFromName(user?.fullName)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-manrope text-sm font-semibold text-white">
                {user?.fullName || "Admin"}
              </p>
              <p className="truncate font-manrope text-xs text-white/35">
                {user?.email || "CMS access"}
              </p>
            </div>
            <button
              type="button"
              onClick={() => void handleLogout()}
              className="flex size-8 shrink-0 items-center justify-center rounded-lg text-white/40 transition hover:bg-white/5 hover:text-white"
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
          "fixed inset-y-0 left-0 z-50 flex w-[min(280px,86vw)] flex-col bg-[#0C0C0C] text-white shadow-2xl transition-transform duration-300 ease-out lg:hidden",
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
          "relative sticky top-0 z-30 hidden h-screen shrink-0 flex-col overflow-visible border-r border-white/[0.06] bg-[#0C0C0C] text-white transition-[width] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] lg:flex",
          collapsed ? "w-[88px]" : "w-[280px]"
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
