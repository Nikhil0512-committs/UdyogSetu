"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  Activity,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Building2,
  CheckCircle2,
  Clock,
  FileStack,
  ShieldAlert,
  TrendingUp,
  Users,
  XCircle,
  HelpCircle,
  FileText,
} from "lucide-react";
import {
  ADMIN_KPIS,
  DEPARTMENT_STATS,
  RECENT_ACTIVITY,
  DEPT_MONTHLY_TRENDS,
  SLA_COMPLIANCE_TRENDS,
} from "@/lib/admin-mock-data";

// Recharts lazy-loaded for SSR compat
const BarChartR = dynamic(() => import("recharts").then((m) => m.BarChart), { ssr: false });
const Bar = dynamic(() => import("recharts").then((m) => m.Bar), { ssr: false });
const XAxis = dynamic(() => import("recharts").then((m) => m.XAxis), { ssr: false });
const YAxis = dynamic(() => import("recharts").then((m) => m.YAxis), { ssr: false });
const CartesianGrid = dynamic(() => import("recharts").then((m) => m.CartesianGrid), { ssr: false });
const Tooltip = dynamic(() => import("recharts").then((m) => m.Tooltip), { ssr: false });
const ResponsiveContainer = dynamic(() => import("recharts").then((m) => m.ResponsiveContainer), { ssr: false });
const LineChart = dynamic(() => import("recharts").then((m) => m.LineChart), { ssr: false });
const Line = dynamic(() => import("recharts").then((m) => m.Line), { ssr: false });
const AreaChart = dynamic(() => import("recharts").then((m) => m.AreaChart), { ssr: false });
const Area = dynamic(() => import("recharts").then((m) => m.Area), { ssr: false });
const Legend = dynamic(() => import("recharts").then((m) => m.Legend), { ssr: false });

const kpis = ADMIN_KPIS;
const departments = DEPARTMENT_STATS;
const recentActivity = RECENT_ACTIVITY;

const activityIcons: Record<string, React.ReactNode> = {
  APPROVAL: <CheckCircle2 className="w-4 h-4 text-emerald-600" />,
  REJECTION: <XCircle className="w-4 h-4 text-red-600" />,
  QUERY: <HelpCircle className="w-4 h-4 text-amber-600" />,
  SUBMISSION: <FileText className="w-4 h-4 text-blue-600" />,
  DELAY_ALERT: <AlertTriangle className="w-4 h-4 text-red-600" />,
};

const activityColors: Record<string, string> = {
  APPROVAL: "border-l-emerald-500",
  REJECTION: "border-l-red-500",
  QUERY: "border-l-amber-500",
  SUBMISSION: "border-l-blue-500",
  DELAY_ALERT: "border-l-red-500",
};

export default function AdminDashboard() {
  const monthGrowth = (
    ((kpis.applicationsThisMonth - kpis.applicationsLastMonth) / kpis.applicationsLastMonth) *
    100
  ).toFixed(1);

  // Sort depts by bottleneck count for the heatmap
  const deptsByBottleneck = [...departments].sort((a, b) => b.bottleneckCount - a.bottleneckCount);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">System Overview</h1>
          <p className="text-slate-500 mt-1">
            Real-time monitoring of all departments, applications, and officer performance across
            UdyogSetu.
          </p>
        </div>
        <div className="flex gap-2">
          <Badge
            variant="outline"
            className="bg-emerald-50 text-emerald-700 border-emerald-200 py-1.5 px-3"
          >
            <Activity className="w-3.5 h-3.5 mr-1" /> Live
          </Badge>
          <Badge variant="outline" className="bg-white text-slate-700 py-1.5 px-3">
            Updated just now
          </Badge>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-none shadow-sm bg-white/80 backdrop-blur">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">Total Applications</p>
                <h3 className="text-3xl font-bold text-slate-900">
                  {kpis.totalApplications.toLocaleString()}
                </h3>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileStack className="w-5 h-5 text-blue-700" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-emerald-600 font-medium">
              <ArrowUpRight className="w-4 h-4 mr-1" /> +{monthGrowth}% this month ({kpis.applicationsThisMonth})
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white/80 backdrop-blur">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">Avg Clearance Time</p>
                <h3 className="text-3xl font-bold text-slate-900">
                  {kpis.avgClearanceTimeDays}
                  <span className="text-xl text-slate-500 font-normal"> Days</span>
                </h3>
              </div>
              <div className="p-2 bg-emerald-100 rounded-lg">
                <Clock className="w-5 h-5 text-emerald-700" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-emerald-600 font-medium">
              <ArrowUpRight className="w-4 h-4 mr-1" /> Down from 45 days pre-UdyogSetu
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white/80 backdrop-blur">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">Delayed / Overdue</p>
                <h3 className="text-3xl font-bold text-red-700">{kpis.totalDelayed}</h3>
              </div>
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-red-700" />
              </div>
            </div>
            <div className="mt-4">
              <Link
                href="/admin/delays"
                className="text-sm text-red-600 font-semibold hover:underline"
              >
                View all delays →
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white/80 backdrop-blur">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">SLA Compliance</p>
                <h3 className="text-3xl font-bold text-slate-900">
                  {kpis.slaCompliancePercent}
                  <span className="text-xl text-slate-500 font-normal">%</span>
                </h3>
              </div>
              <div className="p-2 bg-amber-100 rounded-lg">
                <BarChart3 className="w-5 h-5 text-amber-700" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-slate-500 font-medium">
              <Building2 className="w-4 h-4 mr-1" /> {kpis.totalDepartments} depts &middot;{" "}
              {kpis.totalOfficers} officers
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Dept Monthly Trends */}
        <Card className="border-none shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Department-wise Monthly Applications</CardTitle>
            <CardDescription>
              Volume of applications processed by each major department over the last 6 months.
            </CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChartR data={DEPT_MONTHLY_TRENDS} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E4DCC8" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#5A5548" }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#5A5548" }} />
                <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid #E4DCC8", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }} />
                <Legend />
                <Bar dataKey="MIDC" fill="#1E3A5F" radius={[2, 2, 0, 0]} name="MIDC" />
                <Bar dataKey="MPCB" fill="#B5502E" radius={[2, 2, 0, 0]} name="MPCB" />
                <Bar dataKey="Fire" fill="#E8A33D" radius={[2, 2, 0, 0]} name="Fire Services" />
                <Bar dataKey="DISH" fill="#2F4A34" radius={[2, 2, 0, 0]} name="DISH/Labour" />
                <Bar dataKey="Other" fill="#7CA3C8" radius={[2, 2, 0, 0]} name="Others" />
              </BarChartR>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* SLA Compliance Trend */}
        <Card className="border-none shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">SLA Compliance Trend</CardTitle>
            <CardDescription>
              System-wide SLA compliance rate vs. the 95% target over the last 6 months.
            </CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={SLA_COMPLIANCE_TRENDS} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSLA" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1E3A5F" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#1E3A5F" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E4DCC8" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#5A5548" }} />
                <YAxis domain={[85, 100]} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#5A5548" }} />
                <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid #E4DCC8", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }} />
                <Area type="monotone" dataKey="compliance" stroke="#1E3A5F" strokeWidth={3} fillOpacity={1} fill="url(#colorSLA)" name="Compliance %" />
                <Line type="monotone" dataKey="target" stroke="#C94A38" strokeWidth={2} strokeDasharray="6 4" dot={false} name="Target (95%)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Department Heatmap + Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Department Bottleneck Heatmap */}
        <Card className="lg:col-span-1 border-none shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <ShieldAlert className="w-5 h-5 text-red-500" /> Bottleneck Heatmap
            </CardTitle>
            <CardDescription>Departments with most SLA breaches right now.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100">
              {deptsByBottleneck.map((dept) => {
                const severity =
                  dept.bottleneckCount >= 10
                    ? "bg-red-100 text-red-800"
                    : dept.bottleneckCount >= 5
                    ? "bg-amber-100 text-amber-800"
                    : dept.bottleneckCount >= 2
                    ? "bg-orange-100 text-orange-800"
                    : "bg-emerald-100 text-emerald-800";
                return (
                  <div key={dept.code} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                    <div>
                      <p className="font-semibold text-slate-900 text-sm">{dept.code}</p>
                      <p className="text-xs text-slate-500">
                        {dept.pending} pending &middot; {dept.avgProcessingDays}d avg
                      </p>
                    </div>
                    <div className="text-right flex items-center gap-2">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${severity}`}>
                        {dept.bottleneckCount} overdue
                      </span>
                      <span className="text-xs text-slate-500">{dept.slaCompliancePercent}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="p-4 border-t border-slate-100">
              <Link href="/admin/departments" className="text-sm text-blue-600 font-semibold hover:underline">
                View all departments →
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity Feed */}
        <Card className="lg:col-span-2 border-none shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Activity className="w-5 h-5 text-blue-500" /> Recent Activity
            </CardTitle>
            <CardDescription>Latest actions, submissions, and alerts across the platform.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100">
              {recentActivity.map((item) => (
                <div
                  key={item.id}
                  className={`p-4 border-l-4 ${activityColors[item.type]} hover:bg-slate-50 transition-colors`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">{activityIcons[item.type]}</div>
                      <div>
                        <p className="font-semibold text-slate-900 text-sm">{item.title}</p>
                        <p className="text-xs text-slate-600 mt-0.5">{item.description}</p>
                        <div className="flex items-center gap-3 mt-2">
                          <Badge variant="outline" className="text-xs py-0 px-2">
                            {item.department}
                          </Badge>
                          <span className="text-xs text-slate-400">
                            {new Date(item.timestamp).toLocaleDateString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Link
                      href={`/admin/applications`}
                      className="text-xs text-blue-600 font-medium hover:underline shrink-0"
                    >
                      {item.applicationId}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-none shadow-sm bg-indigo-50/50">
          <CardContent className="p-5 text-center">
            <Users className="w-6 h-6 text-indigo-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-indigo-900">{kpis.totalOfficers}</p>
            <p className="text-xs text-indigo-600 font-medium">Active Officers</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-emerald-50/50">
          <CardContent className="p-5 text-center">
            <Building2 className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-emerald-900">{kpis.totalDepartments}</p>
            <p className="text-xs text-emerald-600 font-medium">Departments</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-amber-50/50">
          <CardContent className="p-5 text-center">
            <TrendingUp className="w-6 h-6 text-amber-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-amber-900">{kpis.totalInReview}</p>
            <p className="text-xs text-amber-600 font-medium">In Review</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-blue-50/50">
          <CardContent className="p-5 text-center">
            <CheckCircle2 className="w-6 h-6 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-blue-900">{kpis.totalApproved.toLocaleString()}</p>
            <p className="text-xs text-blue-600 font-medium">Total Approved</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
