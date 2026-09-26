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
  Activity,
  AlertTriangle,
  ArrowUpRight,
  BarChart3,
  CheckCircle2,
  Clock,
  HelpCircle,
  Search,
  Star,
  User,
  Users,
  XCircle,
} from "lucide-react";
import { OFFICER_ACTIVITIES } from "@/lib/admin-mock-data";

const decisionColors: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
  APPROVED: {
    bg: "bg-emerald-100",
    text: "text-emerald-800",
    icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />,
  },
  REJECTED: {
    bg: "bg-red-100",
    text: "text-red-800",
    icon: <XCircle className="w-3.5 h-3.5 text-red-600" />,
  },
  QUERIED: {
    bg: "bg-amber-100",
    text: "text-amber-800",
    icon: <HelpCircle className="w-3.5 h-3.5 text-amber-600" />,
  },
};

function getPerformanceBadge(score: number) {
  if (score >= 90) return { label: "Excellent", color: "bg-emerald-100 text-emerald-800", icon: <Star className="w-3.5 h-3.5" /> };
  if (score >= 80) return { label: "Good", color: "bg-blue-100 text-blue-800", icon: <ArrowUpRight className="w-3.5 h-3.5" /> };
  if (score >= 70) return { label: "Average", color: "bg-amber-100 text-amber-800", icon: <BarChart3 className="w-3.5 h-3.5" /> };
  return { label: "Needs Improvement", color: "bg-red-100 text-red-800", icon: <AlertTriangle className="w-3.5 h-3.5" /> };
}

export default function AdminOfficersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [deptFilter, setDeptFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("performance");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const allDepts = Array.from(new Set(OFFICER_ACTIVITIES.map((o) => o.department))).sort();

  let filtered = OFFICER_ACTIVITIES.filter((officer) => {
    const matchesSearch =
      !searchQuery ||
      officer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      officer.department.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDept = deptFilter === "ALL" || officer.department === deptFilter;

    return matchesSearch && matchesDept;
  });

  // Sort
  filtered = [...filtered].sort((a, b) => {
    if (sortBy === "performance") return b.performanceScore - a.performanceScore;
    if (sortBy === "workload") return b.currentWorkload - a.currentWorkload;
    if (sortBy === "reviews") return b.totalReviews - a.totalReviews;
    if (sortBy === "speed") return a.avgReviewTimeDays - b.avgReviewTimeDays;
    return 0;
  });

  const totalOfficers = OFFICER_ACTIVITIES.length;
  const avgPerformance = (OFFICER_ACTIVITIES.reduce((s, o) => s + o.performanceScore, 0) / totalOfficers).toFixed(0);
  const totalWorkload = OFFICER_ACTIVITIES.reduce((s, o) => s + o.currentWorkload, 0);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Officer Activity</h1>
        <p className="text-slate-500 mt-1">
          Monitor officer workload, review speed, decision distribution, and recent actions across
          all departments.
        </p>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-none shadow-sm">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 bg-indigo-100 rounded-xl">
              <Users className="w-6 h-6 text-indigo-700" />
            </div>
            <div>
              <p className="text-3xl font-bold text-slate-900">{totalOfficers}</p>
              <p className="text-sm text-slate-500">Active Officers</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 bg-emerald-100 rounded-xl">
              <Star className="w-6 h-6 text-emerald-700" />
            </div>
            <div>
              <p className="text-3xl font-bold text-emerald-900">{avgPerformance}</p>
              <p className="text-sm text-slate-500">Avg Performance Score</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 bg-amber-100 rounded-xl">
              <Clock className="w-6 h-6 text-amber-700" />
            </div>
            <div>
              <p className="text-3xl font-bold text-amber-900">{totalWorkload}</p>
              <p className="text-sm text-slate-500">Total Pending Items</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-xl">
              <Activity className="w-6 h-6 text-blue-700" />
            </div>
            <div>
              <p className="text-3xl font-bold text-blue-900">
                {OFFICER_ACTIVITIES.reduce((s, o) => s + o.totalReviews, 0)}
              </p>
              <p className="text-sm text-slate-500">Total Reviews Done</p>
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
                placeholder="Search by officer name or department..."
                className="pl-9 bg-white"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={deptFilter} onValueChange={(v) => v && setDeptFilter(v)}>
              <SelectTrigger className="w-full md:w-52">
                <SelectValue placeholder="Department" />
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
            <Select value={sortBy} onValueChange={(v) => v && setSortBy(v)}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="performance">Performance Score</SelectItem>
                <SelectItem value="workload">Current Workload</SelectItem>
                <SelectItem value="reviews">Total Reviews</SelectItem>
                <SelectItem value="speed">Review Speed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Officer Cards */}
      <div className="space-y-4">
        {filtered.map((officer) => {
          const perf = getPerformanceBadge(officer.performanceScore);
          const isExpanded = expandedId === officer.id;
          const approvalRate = ((officer.approved / officer.totalReviews) * 100).toFixed(0);
          const rejectionRate = ((officer.rejected / officer.totalReviews) * 100).toFixed(0);
          const queryRate = ((officer.queried / officer.totalReviews) * 100).toFixed(0);

          return (
            <Card
              key={officer.id}
              className="border-none shadow-sm hover:shadow-md transition-all cursor-pointer"
              onClick={() => setExpandedId(isExpanded ? null : officer.id)}
            >
              <CardContent className="p-5">
                {/* Main Row */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex items-center gap-4 flex-1">
                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-lg shrink-0">
                      {officer.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}
                    </div>
                    <div>
                      <div className="flex items-center gap-3 flex-wrap">
                        <p className="font-semibold text-slate-900">{officer.name}</p>
                        <Badge className={`${perf.color} border-none text-xs font-semibold flex items-center gap-1`}>
                          {perf.icon} {perf.label}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-500">{officer.department}</p>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-6 flex-wrap">
                    <div className="text-center">
                      <p className="text-xl font-bold text-slate-900">{officer.performanceScore}</p>
                      <p className="text-xs text-slate-500">Score</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xl font-bold text-slate-900">{officer.totalReviews}</p>
                      <p className="text-xs text-slate-500">Reviews</p>
                    </div>
                    <div className="text-center">
                      <p className={`text-xl font-bold ${officer.currentWorkload > 12 ? "text-red-700" : "text-slate-900"}`}>
                        {officer.currentWorkload}
                      </p>
                      <p className="text-xs text-slate-500">Pending</p>
                    </div>
                    <div className="text-center">
                      <p className={`text-xl font-bold ${officer.avgReviewTimeDays > 12 ? "text-amber-700" : "text-slate-900"}`}>
                        {officer.avgReviewTimeDays}d
                      </p>
                      <p className="text-xs text-slate-500">Avg Time</p>
                    </div>
                  </div>
                </div>

                {/* Decision Distribution Bar */}
                <div className="mt-4 flex items-center gap-2">
                  <div className="flex-1 h-3 rounded-full overflow-hidden bg-slate-100 flex">
                    <div
                      className="bg-emerald-500 transition-all"
                      style={{ width: `${approvalRate}%` }}
                      title={`Approved: ${approvalRate}%`}
                    />
                    <div
                      className="bg-red-500 transition-all"
                      style={{ width: `${rejectionRate}%` }}
                      title={`Rejected: ${rejectionRate}%`}
                    />
                    <div
                      className="bg-amber-400 transition-all"
                      style={{ width: `${queryRate}%` }}
                      title={`Queried: ${queryRate}%`}
                    />
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-600 shrink-0">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" /> {approvalRate}%
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-red-500" /> {rejectionRate}%
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-amber-400" /> {queryRate}%
                    </span>
                  </div>
                </div>

                {/* Expanded: Recent Actions */}
                {isExpanded && officer.recentActions.length > 0 && (
                  <div className="mt-5 pt-4 border-t border-slate-100 space-y-3">
                    <p className="text-sm font-semibold text-slate-700">Recent Actions</p>
                    {officer.recentActions.map((action, idx) => {
                      const dc = decisionColors[action.decision];
                      return (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            {dc.icon}
                            <div>
                              <p className="text-sm text-slate-800 font-medium">
                                {action.approvalName}
                              </p>
                              <p className="text-xs text-slate-500">
                                {action.companyName} &middot; {action.applicationId}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge className={`${dc.bg} ${dc.text} border-none text-xs`}>
                              {action.decision}
                            </Badge>
                            <p className="text-xs text-slate-400 mt-1">
                              {action.timeTakenDays}d &middot;{" "}
                              {new Date(action.timestamp).toLocaleDateString("en-IN", {
                                day: "2-digit",
                                month: "short",
                              })}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {isExpanded && officer.recentActions.length === 0 && (
                  <div className="mt-5 pt-4 border-t border-slate-100">
                    <p className="text-sm text-slate-400 italic">No recent actions recorded.</p>
                  </div>
                )}

                {/* Expand hint */}
                <p className="text-xs text-slate-400 text-center mt-3">
                  {isExpanded ? "Click to collapse" : "Click to see recent actions"}
                </p>
              </CardContent>
            </Card>
          );
        })}

        {filtered.length === 0 && (
          <Card className="border-none shadow-sm">
            <CardContent className="p-12 text-center">
              <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-lg font-semibold text-slate-700">No officers found</p>
              <p className="text-sm text-slate-500 mt-1">
                Try adjusting your search or filter criteria.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
