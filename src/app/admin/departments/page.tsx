"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import dynamic from "next/dynamic";
import {
  AlertTriangle,
  ArrowUpRight,
  Building2,
  CheckCircle2,
  Clock,
  HelpCircle,
  ShieldAlert,
  TrendingDown,
  TrendingUp,
  Users,
  XCircle,
} from "lucide-react";
import { DEPARTMENT_STATS } from "@/lib/admin-mock-data";

const ResponsiveContainer = dynamic(() => import("recharts").then((m) => m.ResponsiveContainer), { ssr: false });
const BarChartR = dynamic(() => import("recharts").then((m) => m.BarChart), { ssr: false });
const Bar = dynamic(() => import("recharts").then((m) => m.Bar), { ssr: false });
const XAxis = dynamic(() => import("recharts").then((m) => m.XAxis), { ssr: false });
const YAxis = dynamic(() => import("recharts").then((m) => m.YAxis), { ssr: false });
const CartesianGrid = dynamic(() => import("recharts").then((m) => m.CartesianGrid), { ssr: false });
const Tooltip = dynamic(() => import("recharts").then((m) => m.Tooltip), { ssr: false });
const Cell = dynamic(() => import("recharts").then((m) => m.Cell), { ssr: false });

export default function AdminDepartmentsPage() {
  const departments = DEPARTMENT_STATS;

  // Sort by SLA compliance for the bar chart (ascending — worst first)
  const chartData = [...departments]
    .sort((a, b) => a.slaCompliancePercent - b.slaCompliancePercent)
    .map((d) => ({
      name: d.code,
      compliance: d.slaCompliancePercent,
      avgDays: d.avgProcessingDays,
    }));

  const totalPending = departments.reduce((s, d) => s + d.pending, 0);
  const totalOverdue = departments.reduce((s, d) => s + d.bottleneckCount, 0);
  const avgSLA = (departments.reduce((s, d) => s + d.slaCompliancePercent, 0) / departments.length).toFixed(1);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Department Performance</h1>
        <p className="text-slate-500 mt-1">
          SLA compliance, processing speed, and bottleneck analysis for all {departments.length}{" "}
          departments.
        </p>
      </div>

      {/* Top-level Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-none shadow-sm">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 bg-amber-100 rounded-xl">
              <Clock className="w-6 h-6 text-amber-700" />
            </div>
            <div>
              <p className="text-3xl font-bold text-slate-900">{totalPending}</p>
              <p className="text-sm text-slate-500">Total Pending Reviews</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 bg-red-100 rounded-xl">
              <AlertTriangle className="w-6 h-6 text-red-700" />
            </div>
            <div>
              <p className="text-3xl font-bold text-red-700">{totalOverdue}</p>
              <p className="text-sm text-slate-500">Total SLA Breaches</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 bg-emerald-100 rounded-xl">
              <CheckCircle2 className="w-6 h-6 text-emerald-700" />
            </div>
            <div>
              <p className="text-3xl font-bold text-emerald-900">{avgSLA}%</p>
              <p className="text-sm text-slate-500">Avg SLA Compliance</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* SLA Compliance Bar Chart */}
      <Card className="border-none shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">SLA Compliance by Department</CardTitle>
          <CardDescription>
            Lower compliance indicates departments needing immediate attention. Target: 95%.
          </CardDescription>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChartR data={chartData} layout="vertical" margin={{ top: 10, right: 40, left: 60, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E4DCC8" />
              <XAxis type="number" domain={[70, 100]} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#5A5548" }} />
              <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#4D493D", fontWeight: 500 }} />
              <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid #E4DCC8", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }} formatter={(value: any) => [`${value}%`, "SLA Compliance"]} />
              <Bar dataKey="compliance" radius={[0, 4, 4, 0]} barSize={20} name="Compliance %">
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.compliance < 85 ? "#C94A38" : entry.compliance < 92 ? "#E8A33D" : "#2F4A34"} />
                ))}
              </Bar>
            </BarChartR>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Department Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {departments.map((dept) => {
          const complianceColor =
            dept.slaCompliancePercent >= 95
              ? "text-emerald-700 bg-emerald-50"
              : dept.slaCompliancePercent >= 88
              ? "text-amber-700 bg-amber-50"
              : "text-red-700 bg-red-50";

          const isStressed = dept.bottleneckCount >= 5;

          return (
            <Card
              key={dept.code}
              className={`border shadow-sm transition-all hover:shadow-md ${
                isStressed ? "border-red-200 bg-red-50/30" : "border-slate-200"
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base">{dept.code}</CardTitle>
                    <CardDescription className="text-xs mt-0.5">{dept.name}</CardDescription>
                  </div>
                  <Badge className={`${complianceColor} border-none font-bold text-sm`}>
                    {dept.slaCompliancePercent}%
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-600" />
                    <div>
                      <p className="text-lg font-bold text-slate-900">{dept.pending}</p>
                      <p className="text-xs text-slate-500">Pending</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <div>
                      <p className="text-lg font-bold text-emerald-800">{dept.approved}</p>
                      <p className="text-xs text-slate-500">Approved</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <XCircle className="w-4 h-4 text-red-600" />
                    <div>
                      <p className="text-lg font-bold text-red-700">{dept.rejected}</p>
                      <p className="text-xs text-slate-500">Rejected</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-purple-600" />
                    <div>
                      <p className="text-lg font-bold text-purple-700">{dept.queried}</p>
                      <p className="text-xs text-slate-500">Queried</p>
                    </div>
                  </div>
                </div>

                {/* Metrics */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-500">Avg Processing Time</span>
                    <span className={`text-sm font-bold ${dept.avgProcessingDays > dept.slaDays ? "text-red-700" : "text-slate-800"}`}>
                      {dept.avgProcessingDays}d
                      <span className="text-xs font-normal text-slate-400"> / {dept.slaDays}d SLA</span>
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-500">Active Officers</span>
                    <span className="text-sm font-bold text-slate-800 flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-slate-400" /> {dept.activeOfficers}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-500">SLA Breaches</span>
                    <span
                      className={`text-sm font-bold flex items-center gap-1 ${
                        dept.bottleneckCount >= 10
                          ? "text-red-700"
                          : dept.bottleneckCount >= 5
                          ? "text-amber-700"
                          : "text-emerald-700"
                      }`}
                    >
                      {dept.bottleneckCount >= 5 && <AlertTriangle className="w-3.5 h-3.5" />}
                      {dept.bottleneckCount}
                    </span>
                  </div>
                </div>

                {/* SLA bar */}
                <div className="pt-2">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-slate-500">SLA Compliance</span>
                    <span className="text-xs font-bold text-slate-700">{dept.slaCompliancePercent}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        dept.slaCompliancePercent >= 95
                          ? "bg-emerald-500"
                          : dept.slaCompliancePercent >= 88
                          ? "bg-amber-500"
                          : "bg-red-500"
                      }`}
                      style={{ width: `${dept.slaCompliancePercent}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
