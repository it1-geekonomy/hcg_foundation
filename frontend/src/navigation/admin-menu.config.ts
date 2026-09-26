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
  Award,
  CalendarDays,
  FolderKanban,
  PanelsTopLeft,
  Handshake,
  GraduationCap,
  Mail,
  MessageSquareQuote,
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
        label: "Home Banners",
        href: "/admin/home-banners",
        icon: PanelsTopLeft,
      },
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
        label: "Awards",
        href: "/admin/awards",
        icon: Award,
      },
      {
        label: "Events",
        href: "/admin/events",
        icon: CalendarDays,
      },
      {
        label: "Projects",
        href: "/admin/projects",
        icon: FolderKanban,
      },
      {
        label: "Patient Testimonials",
        href: "/admin/patient-testimonials",
        icon: MessageSquareQuote,
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
    ],
  },
  {
    label: "Forms",
    items: [
      {
        label: "Contact Leads",
        href: "/admin/leads-contact",
        icon: Mail,
      },
      {
        label: "Internship Leads",
        href: "/admin/leads-internship",
        icon: GraduationCap,
      },
      {
        label: "Partnership Inquiries",
        href: "/admin/partnership-inquiries",
        icon: Handshake,
      },
      {
        label: "Fundraising Campaigns",
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
        label: "Patients",
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
];

/** Flat list kept for any callers that still expect it */
export const adminMenu = adminMenuGroups.flatMap((group) => group.items);
