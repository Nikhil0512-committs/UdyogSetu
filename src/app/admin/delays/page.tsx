"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertOctagon,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  MapPin,
  Search,
  Shield,
  User,
  Flame,
} from "lucide-react";
import { DELAYED_APPLICATIONS } from "@/lib/admin-mock-data";

const severityConfig: Record<string, { color: string; bg: string; border: string; icon: React.ReactNode }> = {
  CRITICAL: {
    color: "text-red-800",
    bg: "bg-red-50",
    border: "border-red-300",
    icon: <AlertOctagon className="w-5 h-5 text-red-600" />,
  },
  HIGH: {
    color: "text-amber-800",
    bg: "bg-amber-50",
    border: "border-amber-300",
    icon: <AlertTriangle className="w-5 h-5 text-amber-600" />,
  },
  MEDIUM: {
    color: "text-orange-800",
    bg: "bg-orange-50",
    border: "border-orange-300",
    icon: <Clock className="w-5 h-5 text-orange-600" />,
  },
};

const riskColors: Record<string, string> = {
  Red: "bg-red-100 text-red-800",
  Orange: "bg-orange-100 text-orange-800",
  Green: "bg-emerald-100 text-emerald-800",
  White: "bg-slate-100 text-slate-800",
};

export default function AdminDelaysPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [severityFilter, setSeverityFilter] = useState("ALL");
  const [deptFilter, setDeptFilter] = useState("ALL");

  const allDepts = Array.from(new Set(DELAYED_APPLICATIONS.map((a) => a.bottleneckDepartment))).sort();

  const filtered = DELAYED_APPLICATIONS.filter((app) => {
    const matchesSearch =
      !searchQuery ||
      app.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.applicantName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSeverity = severityFilter === "ALL" || app.severity === severityFilter;
    const matchesDept = deptFilter === "ALL" || app.bottleneckDepartment === deptFilter;

    return matchesSearch && matchesSeverity && matchesDept;
  });

  const criticalCount = DELAYED_APPLICATIONS.filter((a) => a.severity === "CRITICAL").length;
  const highCount = DELAYED_APPLICATIONS.filter((a) => a.severity === "HIGH").length;
  const mediumCount = DELAYED_APPLICATIONS.filter((a) => a.severity === "MEDIUM").length;
  const totalOverdueDays = DELAYED_APPLICATIONS.reduce((s, a) => s + a.daysOverdue, 0);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
          Delay & Bottleneck Tracker
        </h1>
        <p className="text-slate-500 mt-1">
          Applications exceeding their SLA deadlines, sorted by severity. Immediate attention
          required for critical cases.
        </p>
      </div>

      {/* Severity Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-none shadow-sm border-l-4 border-l-red-500">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 bg-red-100 rounded-xl">
              <AlertOctagon className="w-6 h-6 text-red-700" />
            </div>
            <div>
              <p className="text-3xl font-bold text-red-800">{criticalCount}</p>
              <p className="text-sm text-slate-500 font-medium">Critical</p>
              <p className="text-xs text-red-600">15+ days overdue</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm border-l-4 border-l-amber-500">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 bg-amber-100 rounded-xl">
              <AlertTriangle className="w-6 h-6 text-amber-700" />
            </div>
            <div>
              <p className="text-3xl font-bold text-amber-800">{highCount}</p>
              <p className="text-sm text-slate-500 font-medium">High</p>
              <p className="text-xs text-amber-600">5-14 days overdue</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm border-l-4 border-l-orange-400">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 bg-orange-100 rounded-xl">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-3xl font-bold text-orange-800">{mediumCount}</p>
              <p className="text-sm text-slate-500 font-medium">Medium</p>
              <p className="text-xs text-orange-600">1-4 days overdue</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm border-l-4 border-l-slate-400">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 bg-slate-100 rounded-xl">
              <Flame className="w-6 h-6 text-slate-600" />
            </div>
            <div>
              <p className="text-3xl font-bold text-slate-800">{totalOverdueDays}</p>
              <p className="text-sm text-slate-500 font-medium">Total Overdue Days</p>
              <p className="text-xs text-slate-500">Across all delayed apps</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-none shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search by App ID, Company, Applicant..."
                className="pl-9 bg-white"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={severityFilter} onValueChange={(v) => v && setSeverityFilter(v)}>
              <SelectTrigger className="w-full md:w-44">
                <SelectValue placeholder="Severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Severity</SelectItem>
                <SelectItem value="CRITICAL">🔴 Critical</SelectItem>
                <SelectItem value="HIGH">🟠 High</SelectItem>
                <SelectItem value="MEDIUM">🟡 Medium</SelectItem>
              </SelectContent>
            </Select>
            <Select value={deptFilter} onValueChange={(v) => v && setDeptFilter(v)}>
              <SelectTrigger className="w-full md:w-52">
                <SelectValue placeholder="Bottleneck Dept" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Departments</SelectItem>
                {allDepts.map((d) => (
                  <SelectItem key={d} value={d}>
                    {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Delayed Application Cards */}
      <div className="space-y-4">
        {filtered.map((app) => {
          const sev = severityConfig[app.severity];
          return (
            <Card
              key={app.id}
              className={`${sev.bg} ${sev.border} border shadow-sm transition-all hover:shadow-md`}
            >
              <CardContent className="p-5">
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  {/* Left */}
                  <div className="flex items-start gap-4 flex-1">
                    <div className="mt-1">{sev.icon}</div>
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="font-mono text-sm font-bold text-slate-800">{app.id}</span>
                        <Badge
                          className={`${riskColors[app.riskCategory]} border-none text-xs font-semibold`}
                        >
                          {app.riskCategory} Category
                        </Badge>
                        <Badge className={`${sev.color} bg-white/50 border-none text-xs font-bold`}>
                          {app.severity}
                        </Badge>
                      </div>
                      <p className="font-semibold text-slate-900">{app.companyName}</p>
                      <div className="flex items-center gap-4 text-xs text-slate-600 flex-wrap">
                        <span className="flex items-center gap-1">
                          <User className="w-3.5 h-3.5" /> {app.applicantName}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" /> {app.district}
                        </span>
                        <span>{app.sector}</span>
                      </div>

                      <div className="mt-3 p-3 bg-white/60 rounded-lg border border-white/80">
                        <p className="text-xs text-slate-500 mb-1">Last Action</p>
                        <p className="text-sm text-slate-800 font-medium">{app.lastAction}</p>
                        <p className="text-xs text-slate-400 mt-1">
                          {new Date(app.lastActionDate).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Right — Bottleneck Info */}
                  <div className="lg:w-72 space-y-3 lg:text-right">
                    <div>
                      <p className="text-xs text-slate-500">Bottleneck Department</p>
                      <p className="text-sm font-bold text-slate-900">{app.bottleneckDepartment}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Assigned Officer</p>
                      <p className="text-sm font-semibold text-slate-800">{app.assignedOfficer}</p>
                    </div>
                    <div className="flex lg:justify-end items-center gap-4">
                      <div>
                        <p className="text-xs text-slate-500">Overdue</p>
                        <p className="text-2xl font-bold text-red-700">+{app.daysOverdue}d</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">SLA</p>
                        <p className="text-lg font-semibold text-slate-600">{app.slaDays}d</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Total</p>
                        <p className="text-lg font-semibold text-slate-700">{app.totalDaysInSystem}d</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {filtered.length === 0 && (
          <Card className="border-none shadow-sm">
            <CardContent className="p-12 text-center">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
              <p className="text-lg font-semibold text-slate-700">No delayed applications found</p>
              <p className="text-sm text-slate-500 mt-1">
                All applications matching your filters are within their SLA deadlines.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
