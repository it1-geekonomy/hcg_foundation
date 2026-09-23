"use client";

import { useEffect, useState } from "react";
import Typography from "@/lib/Typography";
import { HeartHandshake, FolderKanban, Users, MessageSquareText, IndianRupee, CalendarDays, BarChart4 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { cmsApi } from "@/domains/cms/lib/api";
import { DashboardStats } from "@/domains/cms/lib/types";
import { formatCmsDateTime } from "@/domains/cms/ui/CmsViewChrome";

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

  const metrics = [
    {
      title: "Total Donations",
      value: `₹${stats?.totalDonationsAmount?.toLocaleString('en-IN') || 0}`,
      icon: IndianRupee,
      bgClass: "bg-gradient-to-br from-emerald-500/10 to-teal-500/10 hover:from-emerald-500/20 hover:to-teal-500/20",
      iconColor: "text-emerald-500",
    },
    {
      title: "Total Donors",
      value: stats?.totalDonors || 0,
      icon: HeartHandshake,
      bgClass: "bg-gradient-to-br from-blue-500/10 to-indigo-500/10 hover:from-blue-500/20 hover:to-indigo-500/20",
      iconColor: "text-blue-500",
    },
    {
      title: "Active Projects",
      value: stats?.activeProjects || 0,
      icon: FolderKanban,
      bgClass: "bg-gradient-to-br from-purple-500/10 to-pink-500/10 hover:from-purple-500/20 hover:to-pink-500/20",
      iconColor: "text-purple-500",
    },
    {
      title: "Active Campaigns",
      value: stats?.activeCampaigns || 0,
      icon: BarChart4,
      bgClass: "bg-gradient-to-br from-orange-500/10 to-red-500/10 hover:from-orange-500/20 hover:to-red-500/20",
      iconColor: "text-orange-500",
    },
    {
      title: "Active Events",
      value: stats?.activeEvents || 0,
      icon: CalendarDays,
      bgClass: "bg-gradient-to-br from-cyan-500/10 to-blue-500/10 hover:from-cyan-500/20 hover:to-blue-500/20",
      iconColor: "text-cyan-500",
    },
    {
      title: "Pending Partnerships",
      value: stats?.pendingPartnerships || 0,
      icon: MessageSquareText,
      bgClass: "bg-gradient-to-br from-yellow-500/10 to-amber-500/10 hover:from-yellow-500/20 hover:to-amber-500/20",
      iconColor: "text-amber-500",
    },
    {
      title: "Registered Users",
      value: stats?.totalUsers || 0,
      icon: Users,
      bgClass: "bg-gradient-to-br from-slate-500/10 to-gray-500/10 hover:from-slate-500/20 hover:to-gray-500/20",
      iconColor: "text-slate-500",
    },
  ];

  const distributionData = [
    { name: "Projects", value: stats?.activeProjects || 0, color: "#a855f7" },
    { name: "Campaigns", value: stats?.activeCampaigns || 0, color: "#f97316" },
    { name: "Events", value: stats?.activeEvents || 0, color: "#06b6d4" },
  ].filter(d => d.value > 0);
  
  if (distributionData.length === 0) {
    distributionData.push({ name: "No Data", value: 1, color: "#e2e8f0" });
  }

  return (
    <div className={`flex flex-col gap-8 p-6 md:p-8 transition-opacity duration-700 ${loading ? 'opacity-0' : 'opacity-100 animate-in fade-in slide-in-from-bottom-4'}`}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Typography variant="heading-5" as="h1" className="font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
            Overview
          </Typography>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4">
        {metrics.map((metric, i) => (
          <Card 
            key={metric.title} 
            className={`transition-all duration-300 hover:-translate-y-1 hover:shadow-xl border-border/50 bg-white/50 backdrop-blur-sm shadow-sm ${metric.bgClass} ${i === 0 ? "lg:col-span-2 bg-gradient-to-r from-emerald-500/10 to-teal-600/10" : ""}`}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-semibold text-foreground/70 uppercase tracking-wider">
                {metric.title}
              </CardTitle>
              <div className={`p-2.5 rounded-xl bg-white shadow-sm ${metric.iconColor}`}>
                <metric.icon className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent>
              <div className={`font-bold text-foreground tracking-tight ${i === 0 ? "text-4xl" : "text-3xl"}`}>
                {loading ? "..." : metric.value}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="transition-all duration-300 hover:shadow-lg border-border/50 bg-white/50 backdrop-blur-sm shadow-sm flex flex-col md:col-span-1">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-800">Content Distribution</CardTitle>
            <CardDescription className="font-medium">
              Breakdown of active entities.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-center">
            <div className="h-[250px] w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px' }}
                  />
                  <Pie
                    data={distributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={95}
                    paddingAngle={8}
                    dataKey="value"
                    stroke="none"
                    cornerRadius={6}
                  >
                    {distributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} className="hover:opacity-85 transition-opacity outline-none" />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap justify-center gap-5 mt-4">
              {distributionData.map((entry) => (
                <div key={entry.name} className="flex items-center gap-2 text-sm bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
                  <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: entry.color }} />
                  <span className="text-gray-600 font-medium">{entry.name}</span>
                  <span className="font-bold text-gray-900">{entry.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="transition-all duration-300 hover:shadow-lg border-border/50 bg-white/50 backdrop-blur-sm shadow-sm overflow-hidden md:col-span-2">
          <CardHeader className="bg-gray-50/80 border-b border-border/40 pb-5 pt-6 px-6 md:px-8">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-xl font-bold text-gray-800">Top Donors</CardTitle>
                <CardDescription className="font-medium mt-1">
                  Leading contributors to the foundation.
                </CardDescription>
              </div>
              <div className="p-2 bg-white rounded-lg shadow-sm border border-gray-100">
                <HeartHandshake className="w-5 h-5 text-gray-500" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-transparent">
                <TableRow className="hover:bg-transparent border-b-gray-100">
                  <TableHead className="pl-6 md:pl-8 h-14 font-semibold text-gray-600">Donor Name</TableHead>
                  <TableHead className="text-right pr-6 md:pr-8 font-semibold text-gray-600">Amount Donated</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center py-12 text-muted-foreground font-medium">
                      Loading top donors...
                    </TableCell>
                  </TableRow>
                ) : !stats?.topDonors?.length ? (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center py-12 text-muted-foreground font-medium">
                      No top donors found yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  stats.topDonors.map((donor: any, idx: number) => (
                    <TableRow key={idx} className="transition-colors hover:bg-gray-50/80 border-b-gray-50 last:border-0">
                      <TableCell className="font-bold text-gray-900 pl-6 md:pl-8 py-4">
                        {donor.name || "Anonymous"}
                      </TableCell>
                      <TableCell className="text-right pr-6 md:pr-8 py-4 text-emerald-600 font-semibold">
                        ₹{donor.amount?.toLocaleString('en-IN') || 0}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Card className="transition-all duration-300 hover:shadow-lg border-border/50 bg-white/50 backdrop-blur-sm shadow-sm overflow-hidden mt-2">
        <CardHeader className="bg-gray-50/80 border-b border-border/40 pb-5 pt-6 px-6 md:px-8">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-xl font-bold text-gray-800">Recent Contacts & Leads</CardTitle>
              <CardDescription className="font-medium mt-1">
                Latest submissions from the website contact forms.
              </CardDescription>
            </div>
            <div className="p-2 bg-white rounded-lg shadow-sm border border-gray-100">
              <Users className="w-5 h-5 text-gray-500" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-transparent">
              <TableRow className="hover:bg-transparent border-b-gray-100">
                <TableHead className="pl-6 md:pl-8 h-14 font-semibold text-gray-600">Name</TableHead>
                <TableHead className="font-semibold text-gray-600">Email</TableHead>
                <TableHead className="font-semibold text-gray-600">Date Received</TableHead>
                <TableHead className="text-right pr-6 md:pr-8 font-semibold text-gray-600">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-12 text-muted-foreground font-medium">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      Loading recent contacts...
                    </div>
                  </TableCell>
                </TableRow>
              ) : !stats?.recentContacts?.length ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-12 text-muted-foreground font-medium">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Users className="w-8 h-8 text-gray-300 mb-2" />
                      No recent contacts found.
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                stats.recentContacts.map((contact) => (
                  <TableRow key={contact.id} className="transition-colors hover:bg-gray-50/80 border-b-gray-50 last:border-0 cursor-pointer">
                    <TableCell className="font-bold text-gray-900 pl-6 md:pl-8 py-4">
                      {contact.fullName}
                    </TableCell>
                    <TableCell className="text-gray-600 font-medium py-4">
                      {contact.email}
                    </TableCell>
                    <TableCell className="text-gray-500 font-medium py-4">
                      {formatCmsDateTime(contact.createdAt)}
                    </TableCell>
                    <TableCell className="text-right pr-6 md:pr-8 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                        New Lead
                      </span>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
