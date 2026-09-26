"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileStack,
  HelpCircle,
  Search,
  XCircle,
} from "lucide-react";
import { ADMIN_APPLICATIONS } from "@/lib/admin-mock-data";

const riskColors: Record<string, string> = {
  Red: "bg-red-100 text-red-800",
  Orange: "bg-orange-100 text-orange-800",
  Green: "bg-emerald-100 text-emerald-800",
  White: "bg-slate-100 text-slate-800",
};

const statusColors: Record<string, string> = {
  SUBMITTED: "bg-blue-100 text-blue-800",
  IN_REVIEW: "bg-amber-100 text-amber-800",
  APPROVED: "bg-emerald-100 text-emerald-800",
  REJECTED: "bg-red-100 text-red-800",
  QUERIED: "bg-purple-100 text-purple-800",
};

const statusIcons: Record<string, React.ReactNode> = {
  SUBMITTED: <FileStack className="w-3.5 h-3.5" />,
  IN_REVIEW: <Clock className="w-3.5 h-3.5" />,
  APPROVED: <CheckCircle2 className="w-3.5 h-3.5" />,
  REJECTED: <XCircle className="w-3.5 h-3.5" />,
  QUERIED: <HelpCircle className="w-3.5 h-3.5" />,
};

export default function AdminApplicationsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [deptFilter, setDeptFilter] = useState("ALL");
  const [delayFilter, setDelayFilter] = useState("ALL");

  const allDepts = Array.from(
    new Set(ADMIN_APPLICATIONS.flatMap((app) => app.approvals.map((a) => a.department)))
  ).sort();

  const filtered = ADMIN_APPLICATIONS.filter((app) => {
    const matchesSearch =
      !searchQuery ||
      app.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.applicantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.sector.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.district.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "ALL" || app.status === statusFilter;

    const matchesDept =
      deptFilter === "ALL" ||
      app.currentDepartment === deptFilter ||
      app.approvals.some((a) => a.department === deptFilter);

    const matchesDelay =
      delayFilter === "ALL" ||
      (delayFilter === "DELAYED" && app.isDelayed) ||
      (delayFilter === "ON_TRACK" && !app.isDelayed);

    return matchesSearch && matchesStatus && matchesDept && matchesDelay;
  });

  const totalDelayed = ADMIN_APPLICATIONS.filter((a) => a.isDelayed).length;
  const totalInReview = ADMIN_APPLICATIONS.filter((a) => a.status === "IN_REVIEW").length;
  const totalApproved = ADMIN_APPLICATIONS.filter((a) => a.status === "APPROVED").length;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">All Applications</h1>
        <p className="text-slate-500 mt-1">
          Cross-department view of every application in the system with delay tracking.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-none shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileStack className="w-5 h-5 text-blue-700" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{ADMIN_APPLICATIONS.length}</p>
              <p className="text-xs text-slate-500">Total Applications</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <Clock className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <p className="text-2xl font-bold text-amber-900">{totalInReview}</p>
              <p className="text-xs text-slate-500">In Review</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-700" />
            </div>
            <div>
              <p className="text-2xl font-bold text-red-700">{totalDelayed}</p>
              <p className="text-xs text-slate-500">Delayed</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-emerald-700" />
            </div>
            <div>
              <p className="text-2xl font-bold text-emerald-900">{totalApproved}</p>
              <p className="text-xs text-slate-500">Approved</p>
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
                placeholder="Search by App ID, Company, Applicant, Sector, District..."
                className="pl-9 bg-white"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={(v) => v && setStatusFilter(v)}>
              <SelectTrigger className="w-full md:w-44">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Statuses</SelectItem>
                <SelectItem value="SUBMITTED">Submitted</SelectItem>
                <SelectItem value="IN_REVIEW">In Review</SelectItem>
                <SelectItem value="APPROVED">Approved</SelectItem>
                <SelectItem value="REJECTED">Rejected</SelectItem>
                <SelectItem value="QUERIED">Queried</SelectItem>
              </SelectContent>
            </Select>
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
            <Select value={delayFilter} onValueChange={(v) => v && setDelayFilter(v)}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Delay" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All</SelectItem>
                <SelectItem value="DELAYED">Delayed Only</SelectItem>
                <SelectItem value="ON_TRACK">On Track</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Applications Table */}
      <Card className="border-none shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-slate-900">
            {filtered.length} Application{filtered.length !== 1 ? "s" : ""} Found
          </CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-slate-700">App ID</TableHead>
                <TableHead className="text-slate-700">Applicant / Company</TableHead>
                <TableHead className="text-slate-700">Sector</TableHead>
                <TableHead className="text-slate-700">District</TableHead>
                <TableHead className="text-slate-700">Risk</TableHead>
                <TableHead className="text-slate-700">Status</TableHead>
                <TableHead className="text-slate-700">Current Dept</TableHead>
                <TableHead className="text-slate-700">Officer</TableHead>
                <TableHead className="text-slate-700">Days</TableHead>
                <TableHead className="text-slate-700">Delay</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((app) => (
                <TableRow key={app.id} className={app.isDelayed ? "bg-red-50/40" : ""}>
                  <TableCell className="font-mono text-slate-800 font-medium text-sm">
                    {app.id}
                  </TableCell>
                  <TableCell>
                    <p className="font-semibold text-slate-900 text-sm">{app.companyName}</p>
                    <p className="text-xs text-slate-500">{app.applicantName}</p>
                  </TableCell>
                  <TableCell className="text-sm text-slate-700">{app.sector}</TableCell>
                  <TableCell className="text-sm text-slate-700">{app.district}</TableCell>
                  <TableCell>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${riskColors[app.riskCategory]}`}>
                      {app.riskCategory}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full inline-flex items-center gap-1 ${statusColors[app.status]}`}>
                      {statusIcons[app.status]} {app.status.replace("_", " ")}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-slate-700 font-medium">
                    {app.currentDepartment}
                  </TableCell>
                  <TableCell className="text-sm text-slate-600">{app.assignedOfficer}</TableCell>
                  <TableCell>
                    <span className={`text-sm font-bold ${app.daysInQueue > app.slaDays ? "text-red-700" : "text-slate-700"}`}>
                      {app.daysInQueue}
                      <span className="text-xs font-normal text-slate-400">/{app.slaDays}d</span>
                    </span>
                  </TableCell>
                  <TableCell>
                    {app.isDelayed ? (
                      <div className="flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4 text-red-600" />
                        <span className="text-xs text-red-700 font-semibold">OVERDUE</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span className="text-xs text-emerald-700 font-medium">On Track</span>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-8 text-slate-500">
                    No applications match your filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
