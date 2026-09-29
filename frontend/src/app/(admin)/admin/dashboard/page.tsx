"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Typography from "@/lib/Typography";
import {
  HeartHandshake,
  FolderKanban,
  Users,
  MessageSquareText,
  IndianRupee,
  CalendarDays,
  BarChart4,
  Loader2,
  type LucideIcon,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";
import {
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { cmsApi } from "@/domains/cms/lib/api";
import { DashboardStats } from "@/domains/cms/lib/types";
import { formatCmsDateTime } from "@/domains/cms/ui/CmsViewChrome";

type Metric = {
  title: string;
  value: string | number;
  icon: LucideIcon;
  tint: string;
  href?: string;
};

function MetricCard({
  metric,
  loading,
  className = "",
}: {
  metric: Metric;
  loading: boolean;
  className?: string;
}) {
  const body = (
    <>
      <div className="flex items-start justify-between gap-3">
        <p className="text-[13px] font-medium text-cms-muted">{metric.title}</p>
        <span
          className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${metric.tint}`}
        >
          <metric.icon className="size-4" strokeWidth={1.75} />
        </span>
      </div>
      <p className="mt-3 text-2xl leading-8 font-semibold tracking-tight text-cms-ink tabular-nums">
        {loading ? (
          <span className="inline-block h-7 w-20 animate-pulse rounded bg-cms-subtle align-middle" />
        ) : (
          metric.value
        )}
      </p>
    </>
  );

  const base = `block rounded-xl border border-cms-border bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)] ${className}`;

  return metric.href ? (
    <Link
      href={metric.href}
      className={`${base} transition-colors hover:border-cms-border-strong`}
    >
      {body}
    </Link>
  ) : (
    <div className={base}>{body}</div>
  );
}

function Panel({
  title,
  description,
  action,
  children,
  className = "",
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`flex flex-col overflow-hidden rounded-xl border border-cms-border bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)] ${className}`}
    >
      <div className="flex items-start justify-between gap-3 border-b border-cms-border px-5 py-4">
        <div className="min-w-0">
          <Typography variant="heading-7" as="h2" className="text-cms-ink">
            {title}
          </Typography>
          {description ? (
            <p className="mt-0.5 text-[13px] text-cms-muted">{description}</p>
          ) : null}
        </div>
        {action}
      </div>
      <div className="flex-1">{children}</div>
    </section>
  );
}

function EmptyRow({ colSpan, children }: { colSpan: number; children: React.ReactNode }) {
  return (
    <TableRow className="hover:bg-transparent">
      <TableCell colSpan={colSpan} className="h-32 text-center text-cms-muted">
        {children}
      </TableCell>
    </TableRow>
  );
}

export default function Page() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const res = await cmsApi.getDashboardStats();
        if (res.data) {
          setStats(res.data);
        }
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    void loadData();
  }, []);

  const metrics: Metric[] = [
    {
      title: "Total donations",
      value: `₹${stats?.totalDonationsAmount?.toLocaleString("en-IN") || 0}`,
      icon: IndianRupee,
      tint: "bg-emerald-50 text-emerald-600",
      href: "/admin/donations",
    },
    {
      title: "Total donors",
      value: stats?.totalDonors || 0,
      icon: HeartHandshake,
      tint: "bg-sky-50 text-sky-600",
      href: "/admin/donations",
    },
    {
      title: "Active projects",
      value: stats?.activeProjects || 0,
      icon: FolderKanban,
      tint: "bg-violet-50 text-violet-600",
      href: "/admin/projects",
    },
    {
      title: "Active campaigns",
      value: stats?.activeCampaigns || 0,
      icon: BarChart4,
      tint: "bg-orange-50 text-orange-600",
      href: "/admin/campaigns",
    },
    {
      title: "Active events",
      value: stats?.activeEvents || 0,
      icon: CalendarDays,
      tint: "bg-cyan-50 text-cyan-600",
      href: "/admin/events",
    },
    {
      title: "Pending partnerships",
      value: stats?.pendingPartnerships || 0,
      icon: MessageSquareText,
      tint: "bg-amber-50 text-amber-600",
      href: "/admin/partnership-inquiries",
    },
    {
      title: "Registered users",
      value: stats?.totalUsers || 0,
      icon: Users,
      tint: "bg-cms-subtle text-cms-muted",
      href: "/admin/users",
    },
  ];

  const distributionData = [
    { name: "Projects", value: stats?.activeProjects || 0, color: "#8b5cf6" },
    { name: "Campaigns", value: stats?.activeCampaigns || 0, color: "#f97316" },
    { name: "Events", value: stats?.activeEvents || 0, color: "#06b6d4" },
  ].filter((d) => d.value > 0);

  const hasDistribution = distributionData.length > 0;
  if (!hasDistribution) {
    distributionData.push({ name: "No data", value: 1, color: "#e5e7eb" });
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="border-b border-cms-border pb-5">
        <Typography variant="heading-5" as="h1" className="text-cms-ink">
          Overview
        </Typography>
        <Typography variant="label-1" as="p" className="mt-1 text-cms-muted">
          A snapshot of donations, published content and incoming requests.
        </Typography>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric, i) => (
          <MetricCard
            key={metric.title}
            metric={metric}
            loading={loading}
            className={i === 0 ? "sm:col-span-2" : ""}
          />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Panel
          title="Content distribution"
          description="Active projects, campaigns and events."
        >
          <div className="p-5">
            <div className="relative h-[220px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  {hasDistribution ? (
                    <Tooltip
                      contentStyle={{
                        borderRadius: 8,
                        border: "1px solid #e5e7eb",
                        boxShadow: "0 8px 20px rgba(16,24,40,0.08)",
                        padding: "8px 12px",
                        fontSize: 13,
                      }}
                    />
                  ) : null}
                  <Pie
                    data={distributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={64}
                    outerRadius={88}
                    paddingAngle={hasDistribution ? 3 : 0}
                    dataKey="value"
                    stroke="none"
                    cornerRadius={4}
                  >
                    {distributionData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} className="outline-none" />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-semibold text-cms-ink tabular-nums">
                  {hasDistribution
                    ? distributionData.reduce((sum, d) => sum + d.value, 0)
                    : 0}
                </span>
                <span className="text-xs text-cms-muted">active items</span>
              </div>
            </div>
            <ul className="mt-4 divide-y divide-cms-border">
              {(hasDistribution ? distributionData : []).map((entry) => (
                <li
                  key={entry.name}
                  className="flex items-center justify-between py-2 text-sm"
                >
                  <span className="flex items-center gap-2 text-cms-body">
                    <span
                      className="size-2.5 rounded-sm"
                      style={{ backgroundColor: entry.color }}
                    />
                    {entry.name}
                  </span>
                  <span className="font-medium text-cms-ink tabular-nums">
                    {entry.value}
                  </span>
                </li>
              ))}
              {!hasDistribution && !loading ? (
                <li className="py-2 text-center text-sm text-cms-muted">
                  Nothing active yet.
                </li>
              ) : null}
            </ul>
          </div>
        </Panel>

        <Panel
          title="Top donors"
          description="Leading contributors to the foundation."
          className="lg:col-span-2"
          action={
            <Link
              href="/admin/donations"
              className="shrink-0 text-[13px] font-medium text-cms-primary hover:underline"
            >
              View all
            </Link>
          }
        >
          <Table flush>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-5">Donor</TableHead>
                <TableHead className="pr-5 text-right">Amount donated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <EmptyRow colSpan={2}>
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="size-4 animate-spin" />
                    Loading top donors…
                  </span>
                </EmptyRow>
              ) : !stats?.topDonors?.length ? (
                <EmptyRow colSpan={2}>No donations recorded yet.</EmptyRow>
              ) : (
                stats.topDonors.map(
                  (donor: { fullName?: string; amount?: number }, idx: number) => (
                    <TableRow key={idx}>
                      <TableCell className="pl-5 font-medium text-cms-ink">
                        {donor.fullName || "Anonymous"}
                      </TableCell>
                      <TableCell className="pr-5 text-right font-medium text-cms-ink tabular-nums">
                        ₹{donor.amount?.toLocaleString("en-IN") || 0}
                      </TableCell>
                    </TableRow>
                  ),
                )
              )}
            </TableBody>
          </Table>
        </Panel>
      </div>

      <Panel
        title="Recent contacts & leads"
        description="Latest submissions from the website contact forms."
        action={
          <Link
            href="/admin/leads-contact"
            className="shrink-0 text-[13px] font-medium text-cms-primary hover:underline"
          >
            View all
          </Link>
        }
      >
        <Table flush>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-5">Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Received</TableHead>
              <TableHead className="pr-5 text-right">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <EmptyRow colSpan={4}>
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="size-4 animate-spin" />
                  Loading recent contacts…
                </span>
              </EmptyRow>
            ) : !stats?.recentContacts?.length ? (
              <EmptyRow colSpan={4}>No recent contacts found.</EmptyRow>
            ) : (
              stats.recentContacts.map((contact) => (
                <TableRow key={contact.id}>
                  <TableCell className="pl-5 font-medium text-cms-ink">
                    {contact.fullName}
                  </TableCell>
                  <TableCell className="text-cms-muted">{contact.email}</TableCell>
                  <TableCell className="text-cms-muted">
                    {formatCmsDateTime(contact.createdAt)}
                  </TableCell>
                  <TableCell className="pr-5 text-right">
                    <span className="inline-flex items-center rounded-md bg-sky-50 px-2 py-0.5 text-xs font-medium text-sky-800 ring-1 ring-sky-600/20 ring-inset">
                      New lead
                    </span>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Panel>
    </div>
  );
}
