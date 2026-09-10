import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Users,
  HeartHandshake,
  Megaphone,
  UserRound,
  UserCog,
  Settings,
  FileText,
  Shield,
  ScrollText,
} from "lucide-react";

export type AdminMenuItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

export type AdminMenuGroup = {
  label: string;
  items: AdminMenuItem[];
};

export const adminMenuGroups: AdminMenuGroup[] = [
  {
    label: "Overview",
    items: [
      {
        label: "Dashboard",
        href: "/admin/dashboard",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    label: "Content",
    items: [
      {
        label: "Teams",
        href: "/admin/team",
        icon: UserRound,
      },
      {
        label: "Annual Reports",
        href: "/admin/annual-reports",
        icon: FileText,
      },
      {
        label: "Privacy Policy",
        href: "/admin/privacy-policy",
        icon: Shield,
      },
      {
        label: "Terms & Conditions",
        href: "/admin/terms",
        icon: ScrollText,
      },
      {
        label: "Campaigns",
        href: "/admin/campaigns",
        icon: Megaphone,
      },
    ],
  },
  {
    label: "People",
    items: [
      {
        label: "Users",
        href: "/admin/users",
        icon: UserCog,
      },
      {
        label: "Patient Stories",
        href: "/admin/patients",
        icon: Users,
      },
      {
        label: "Donations",
        href: "/admin/donations",
        icon: HeartHandshake,
      },
    ],
  },
  {
    label: "System",
    items: [
      {
        label: "Settings",
        href: "/admin/settings/general",
        icon: Settings,
      },
    ],
  },
];

/** Flat list kept for any callers that still expect it */
export const adminMenu = adminMenuGroups.flatMap((group) => group.items);
