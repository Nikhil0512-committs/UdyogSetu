"use client";

import * as React from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Search,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  FileEdit,
  Send,
  ArrowUpRight,
  Filter,
  RefreshCw,
  Building2,
  Calendar,
  Sparkles,
  ShieldCheck,
} from "lucide-react";

export type ApplicationStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "IN_REVIEW"
  | "QUERIED"
  | "APPROVED"
  | "REJECTED";

export interface Application {
  id: string;
  approvalName: string;
  department: string;
  deptShort: string;
  status: ApplicationStatus;
  submittedDate: string;
  rawSubmittedDate: string; // for sorting
  eta: string;
  etaDaysLeft?: string;
  category: "Environment" | "Safety" | "Utilities" | "Labour" | "Land";
  queryNote?: string;
}

const INITIAL_APPLICATIONS: Application[] = [
  {
    id: "APP-2023-8912",
    approvalName: "Factory License & Establishment Setup",
    department: "Directorate of Industrial Safety & Health (DISH)",
    deptShort: "DISH",
    status: "IN_REVIEW",
    submittedDate: "18 Aug 2026",
    rawSubmittedDate: "2026-08-18",
    eta: "31 Aug 2026",
    etaDaysLeft: "2 days remaining",
    category: "Labour",
  },
  {
    id: "APP-2023-7431",
    approvalName: "Fire Safety Compliance & Height NOC",
    department: "Maharashtra Fire Services Department",
    deptShort: "Fire Dept",
    status: "QUERIED",
    submittedDate: "12 Aug 2026",
    rawSubmittedDate: "2026-08-12",
    eta: "Pending Your Response",
    etaDaysLeft: "Action Required",
    category: "Safety",
    queryNote: "Missing revised evacuation schematic for Floor 2.",
  },
  {
    id: "APP-2023-6112",
    approvalName: "Consent to Establish (CTE - Orange Category)",
    department: "Maharashtra Pollution Control Board (MPCB)",
    deptShort: "MPCB",
    status: "APPROVED",
    submittedDate: "15 Jul 2026",
    rawSubmittedDate: "2026-07-15",
    eta: "Issued on 02 Aug 2026",
    etaDaysLeft: "Completed",
    category: "Environment",
  },
  {
    id: "APP-2023-9081",
    approvalName: "High Tension Power Connection Feasibility",
    department: "Maharashtra State Electricity Distribution Co. (MSEDCL)",
    deptShort: "MSEDCL",
    status: "SUBMITTED",
    submittedDate: "24 Aug 2026",
    rawSubmittedDate: "2026-08-24",
    eta: "04 Sep 2026",
    etaDaysLeft: "6 days remaining",
    category: "Utilities",
  },
  {
    id: "APP-2023-9204",
    approvalName: "Industrial Water Pipeline Connection & Metering",
    department: "Maharashtra Jeevan Pradhikaran (MJP)",
    deptShort: "MJP",
    status: "DRAFT",
    submittedDate: "Not submitted",
    rawSubmittedDate: "2026-08-28",
    eta: "~7 days from filing",
    etaDaysLeft: "Draft saved",
    category: "Utilities",
  },
  {
    id: "APP-2023-5028",
    approvalName: "Tree Transit & Clearance Authorization",
    department: "Forest and Environment Department",
    deptShort: "Forest Dept",
    status: "REJECTED",
    submittedDate: "01 Jun 2026",
    rawSubmittedDate: "2026-06-01",
    eta: "Rejected on 14 Jun 2026",
    etaDaysLeft: "Appeal Open",
    category: "Land",
    queryNote: "Proposed footprint intersects protected buffer zone.",
  },
];

export default function ApplicationsPage() {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("ALL");
  const [departmentFilter, setDepartmentFilter] = React.useState<string>("ALL");
  const [sortBy, setSortBy] = React.useState<"newest" | "oldest" | "name">("newest");

  // Summary counts
  const totalCount = INITIAL_APPLICATIONS.length;
  const inReviewCount = INITIAL_APPLICATIONS.filter(
    (a) => a.status === "IN_REVIEW" || a.status === "SUBMITTED"
  ).length;
  const actionRequiredCount = INITIAL_APPLICATIONS.filter(
    (a) => a.status === "QUERIED"
  ).length;
  const approvedCount = INITIAL_APPLICATIONS.filter(
    (a) => a.status === "APPROVED"
  ).length;
  const draftCount = INITIAL_APPLICATIONS.filter(
    (a) => a.status === "DRAFT"
  ).length;

  // Filtered & sorted applications
  const filteredApplications = React.useMemo(() => {
    return INITIAL_APPLICATIONS.filter((app) => {
      const matchesSearch =
        searchTerm.trim() === "" ||
        app.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.approvalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.deptShort.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "ALL" || app.status === statusFilter;

      const matchesDepartment =
        departmentFilter === "ALL" || app.deptShort === departmentFilter;

      return matchesSearch && matchesStatus && matchesDepartment;
    }).sort((a, b) => {
      if (sortBy === "newest") {
        return b.rawSubmittedDate.localeCompare(a.rawSubmittedDate);
      }
      if (sortBy === "oldest") {
        return a.rawSubmittedDate.localeCompare(b.rawSubmittedDate);
      }
      return a.approvalName.localeCompare(b.approvalName);
    });
  }, [searchTerm, statusFilter, departmentFilter, sortBy]);

  const departmentsList = React.useMemo(() => {
    const list = Array.from(new Set(INITIAL_APPLICATIONS.map((a) => a.deptShort)));
    return list;
  }, []);

  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter("ALL");
    setDepartmentFilter("ALL");
    setSortBy("newest");
  };

  const getStatusBadge = (status: ApplicationStatus) => {
    switch (status) {
      case "DRAFT":
        return (
          <Badge className="bg-slate-100 text-slate-800 border-slate-300 font-semibold flex items-center gap-1.5 px-2.5 py-0.5">
            <FileEdit className="w-3.5 h-3.5 text-slate-600" />
            DRAFT
          </Badge>
        );
      case "SUBMITTED":
        return (
          <Badge className="bg-sky-50 text-sky-800 border-sky-200 font-semibold flex items-center gap-1.5 px-2.5 py-0.5">
            <Send className="w-3.5 h-3.5 text-sky-600" />
            SUBMITTED
          </Badge>
        );
      case "IN_REVIEW":
        return (
          <Badge className="bg-blue-50 text-blue-800 border-blue-200 font-semibold flex items-center gap-1.5 px-2.5 py-0.5">
            <Clock className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
            IN REVIEW
          </Badge>
        );
      case "QUERIED":
        return (
          <Badge className="bg-amber-50 text-amber-900 border-amber-300 font-semibold flex items-center gap-1.5 px-2.5 py-0.5">
            <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
            QUERIED
          </Badge>
        );
      case "APPROVED":
        return (
          <Badge className="bg-emerald-50 text-emerald-800 border-emerald-200 font-semibold flex items-center gap-1.5 px-2.5 py-0.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            APPROVED
          </Badge>
        );
      case "REJECTED":
        return (
          <Badge className="bg-rose-50 text-rose-800 border-rose-200 font-semibold flex items-center gap-1.5 px-2.5 py-0.5">
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
            REJECTED
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getEtaDisplay = (app: Application) => {
    switch (app.status) {
      case "APPROVED":
        return (
          <div>
            <p className="font-semibold text-emerald-700 text-sm flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {app.eta}
            </p>
            <p className="text-xs text-slate-500 font-medium">Ready for download</p>
          </div>
        );
      case "QUERIED":
        return (
          <div>
            <p className="font-semibold text-amber-800 text-sm flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
              Response Needed
            </p>
            <p className="text-xs text-amber-700 font-medium truncate max-w-[180px]">
              {app.queryNote || "Query raised by officer"}
            </p>
          </div>
        );
      case "REJECTED":
        return (
          <div>
            <p className="font-semibold text-rose-700 text-sm flex items-center gap-1">
              <XCircle className="w-3.5 h-3.5" />
              {app.eta}
            </p>
            <p className="text-xs text-slate-500 font-medium">Appeal within 30 days</p>
          </div>
        );
      case "DRAFT":
        return (
          <div>
            <p className="font-medium text-slate-700 text-sm">{app.eta}</p>
            <p className="text-xs text-slate-500">Resume to submit</p>
          </div>
        );
      default:
        return (
          <div>
            <p className="font-semibold text-slate-900 text-sm flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-blue-600" />
              {app.eta}
            </p>
            <p className="text-xs text-slate-600 font-medium">{app.etaDaysLeft}</p>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900">All Applications</h1>
            <Badge variant="secondary" className="font-semibold text-slate-700">
              {totalCount} Total
            </Badge>
          </div>
          <p className="text-slate-600 text-sm mt-1">
            Track status, respond to department queries, and access granted statutory certificates.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/dashboard/new">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center gap-1.5 shadow-sm">
              <Plus className="w-4 h-4" />
              New Application
            </Button>
          </Link>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card
          onClick={() => setStatusFilter("ALL")}
          className={`cursor-pointer transition-all border ${
            statusFilter === "ALL"
              ? "ring-2 ring-blue-600 bg-blue-50/40 border-blue-200"
              : "hover:border-slate-300 bg-white"
          }`}
        >
          <CardHeader className="p-3 pb-1">
            <CardDescription className="text-xs font-semibold text-slate-600">
              All Applications
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-slate-900">
              {totalCount}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <p className="text-xs text-slate-500 font-medium">Full repository</p>
          </CardContent>
        </Card>

        <Card
          onClick={() => setStatusFilter("IN_REVIEW")}
          className={`cursor-pointer transition-all border ${
            statusFilter === "IN_REVIEW"
              ? "ring-2 ring-blue-600 bg-blue-50/40 border-blue-200"
              : "hover:border-slate-300 bg-white"
          }`}
        >
          <CardHeader className="p-3 pb-1">
            <CardDescription className="text-xs font-semibold text-blue-700 flex items-center gap-1">
              <Clock className="w-3 h-3 text-blue-600" /> In Review / Submitted
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-blue-600">
              {inReviewCount}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <p className="text-xs text-blue-600/80 font-medium">Under active processing</p>
          </CardContent>
        </Card>

        <Card
          onClick={() => setStatusFilter("QUERIED")}
          className={`cursor-pointer transition-all border ${
            statusFilter === "QUERIED"
              ? "ring-2 ring-amber-500 bg-amber-50/40 border-amber-300"
              : "hover:border-slate-300 bg-white"
          }`}
        >
          <CardHeader className="p-3 pb-1">
            <CardDescription className="text-xs font-semibold text-amber-800 flex items-center gap-1">
              <AlertCircle className="w-3 h-3 text-amber-600" /> Action Required
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-amber-600">
              {actionRequiredCount}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <p className="text-xs text-amber-700 font-medium">Clarification needed</p>
          </CardContent>
        </Card>

        <Card
          onClick={() => setStatusFilter("APPROVED")}
          className={`cursor-pointer transition-all border ${
            statusFilter === "APPROVED"
              ? "ring-2 ring-emerald-500 bg-emerald-50/40 border-emerald-300"
              : "hover:border-slate-300 bg-white"
          }`}
        >
          <CardHeader className="p-3 pb-1">
            <CardDescription className="text-xs font-semibold text-emerald-800 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Approved
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-emerald-600">
              {approvedCount}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <p className="text-xs text-emerald-700 font-medium">NOCs / Licenses issued</p>
          </CardContent>
        </Card>

        <Card
          onClick={() => setStatusFilter("DRAFT")}
          className={`cursor-pointer transition-all border col-span-2 md:col-span-1 ${
            statusFilter === "DRAFT"
              ? "ring-2 ring-slate-600 bg-slate-100 border-slate-400"
              : "hover:border-slate-300 bg-white"
          }`}
        >
          <CardHeader className="p-3 pb-1">
            <CardDescription className="text-xs font-semibold text-slate-700 flex items-center gap-1">
              <FileEdit className="w-3 h-3 text-slate-600" /> Drafts
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-slate-800">
              {draftCount}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <p className="text-xs text-slate-500 font-medium">Pending submission</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <Card className="border-slate-200 shadow-sm bg-white">
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <Input
                type="text"
                placeholder="Search by ID (e.g. APP-2023-8912), approval name, or department..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-500 text-sm h-10 w-full focus-visible:bg-white"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-500 hover:text-slate-800"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Filter Group */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Status Filter */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-medium text-slate-600 hidden sm:inline">
                  Status:
                </span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="h-10 px-3 text-sm bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="DRAFT">Draft</option>
                  <option value="SUBMITTED">Submitted</option>
                  <option value="IN_REVIEW">In Review</option>
                  <option value="QUERIED">Queried (Action Required)</option>
                  <option value="APPROVED">Approved</option>
                  <option value="REJECTED">Rejected</option>
                </select>
              </div>

              {/* Department Filter */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-medium text-slate-600 hidden sm:inline">
                  Dept:
                </span>
                <select
                  value={departmentFilter}
                  onChange={(e) => setDepartmentFilter(e.target.value)}
                  className="h-10 px-3 text-sm bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <option value="ALL">All Departments</option>
                  {departmentsList.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort By */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-medium text-slate-600 hidden sm:inline">
                  Sort:
                </span>
                <select
                  value={sortBy}
                  onChange={(e) =>
                    setSortBy(e.target.value as "newest" | "oldest" | "name")
                  }
                  className="h-10 px-3 text-sm bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="name">Approval Name</option>
                </select>
              </div>

              {/* Reset button */}
              {(searchTerm || statusFilter !== "ALL" || departmentFilter !== "ALL" || sortBy !== "newest") && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetFilters}
                  className="h-10 text-slate-700 hover:text-slate-900 border-slate-200"
                >
                  <RefreshCw className="w-3.5 h-3.5 mr-1" />
                  Reset
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Applications Table Card */}
      <Card className="border-slate-200 shadow-sm bg-white overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-slate-900 text-lg">Applications Master List</h2>
            <p className="text-xs text-slate-600">
              Showing {filteredApplications.length} of {totalCount} registered applications
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-xs text-slate-600 font-medium bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              Statutory SLA Tracked
            </span>
          </div>
        </div>

        {filteredApplications.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50/80">
                <TableRow className="border-slate-200">
                  <TableHead className="font-semibold text-slate-900 py-3.5 pl-6">
                    Application ID
                  </TableHead>
                  <TableHead className="font-semibold text-slate-900 py-3.5">
                    Approval Type & Department
                  </TableHead>
                  <TableHead className="font-semibold text-slate-900 py-3.5">
                    Status
                  </TableHead>
                  <TableHead className="font-semibold text-slate-900 py-3.5">
                    Submitted Date
                  </TableHead>
                  <TableHead className="font-semibold text-slate-900 py-3.5">
                    Predictive ETA / Note
                  </TableHead>
                  <TableHead className="font-semibold text-slate-900 py-3.5 text-right pr-6">
                    Action
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredApplications.map((app) => (
                  <TableRow
                    key={app.id}
                    className="border-slate-100 hover:bg-slate-50/60 transition-colors"
                  >
                    {/* Application ID */}
                    <TableCell className="pl-6 py-4 align-top">
                      <div className="flex flex-col gap-1">
                        <span className="font-mono text-sm font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 w-fit">
                          {app.id}
                        </span>
                        <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
                          Category: {app.category}
                        </span>
                      </div>
                    </TableCell>

                    {/* Approval Type & Department */}
                    <TableCell className="py-4 align-top max-w-sm">
                      <div className="space-y-1">
                        <p className="font-bold text-slate-900 text-sm leading-snug">
                          {app.approvalName}
                        </p>
                        <p className="text-xs text-slate-600 flex items-center gap-1 font-medium">
                          <Building2 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          {app.department}
                        </p>
                      </div>
                    </TableCell>

                    {/* Status Badge */}
                    <TableCell className="py-4 align-top whitespace-nowrap">
                      {getStatusBadge(app.status)}
                    </TableCell>

                    {/* Submitted Date */}
                    <TableCell className="py-4 align-top whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-sm text-slate-700 font-medium">
                        <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        {app.submittedDate}
                      </div>
                    </TableCell>

                    {/* Predictive ETA */}
                    <TableCell className="py-4 align-top min-w-[180px]">
                      {getEtaDisplay(app)}
                    </TableCell>

                    {/* Action Links */}
                    <TableCell className="py-4 pr-6 text-right align-top whitespace-nowrap">
                      {app.status === "DRAFT" ? (
                        <Link href={`/dashboard/apply?id=${app.id}`}>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-slate-800 hover:text-blue-700 hover:border-blue-300 font-medium text-xs h-8 px-3"
                          >
                            <FileEdit className="w-3.5 h-3.5 mr-1 text-slate-600" />
                            Resume Draft
                          </Button>
                        </Link>
                      ) : (
                        <Link href={`/dashboard/track/${app.id}`}>
                          <Button
                            size="sm"
                            variant={app.status === "QUERIED" ? "default" : "outline"}
                            className={`font-semibold text-xs h-8 px-3 ${
                              app.status === "QUERIED"
                                ? "bg-amber-600 hover:bg-amber-700 text-white"
                                : "text-slate-800 hover:text-blue-700 hover:border-blue-300"
                            }`}
                          >
                            {app.status === "QUERIED" ? "Respond Query" : "Track Journey"}
                            <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
                          </Button>
                        </Link>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          /* Empty Search State */
          <div className="py-12 px-4 text-center">
            <div className="w-12 h-12 bg-slate-100 text-slate-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <Filter className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">No applications matched</h3>
            <p className="text-sm text-slate-600 max-w-sm mx-auto mt-1 mb-4">
              We couldn't find any applications matching your filters or search keywords.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={resetFilters}
              className="text-slate-800 font-semibold"
            >
              <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
              Clear all filters
            </Button>
          </div>
        )}
      </Card>

      {/* Advisory & Help Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-slate-200 bg-slate-50/70 p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-blue-100 text-blue-700 mt-0.5">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">AI Predictive Timelines</h4>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                ETAs are forecasted dynamically using live departmental throughput, officer workloads, and inspection queues.
              </p>
            </div>
          </div>
        </Card>

        <Card className="border-slate-200 bg-slate-50/70 p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700 mt-0.5">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Deemed Clearance Guarantee</h4>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Under the Single Window Act, statutory approvals with zero pending queries auto-issue upon SLA expiration.
              </p>
            </div>
          </div>
        </Card>

        <Card className="border-slate-200 bg-slate-50/70 p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-amber-100 text-amber-700 mt-0.5">
              <AlertCircle className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Query Resolution SLA</h4>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Please provide clarification or supplementary documents within 7 working days to avoid application timeout.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
