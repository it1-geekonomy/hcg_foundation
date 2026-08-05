import {
  LayoutDashboard,
  Users,
  HeartHandshake,
  Megaphone,
} from "lucide-react";

export const adminMenu = [
  {
    label: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
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
  {
    label: "Campaigns",
    href: "/admin/campaigns",
    icon: Megaphone,
  },
];