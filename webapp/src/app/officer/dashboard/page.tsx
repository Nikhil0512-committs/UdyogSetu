import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertCircle, Clock, ShieldAlert, CheckCircle2, FileText, Search } from "lucide-react";
import { getSession } from "@/lib/auth";
import { getApplicationsForDepartment, getAllApplications } from "@/lib/mock-data";
import { Input } from "@/components/ui/input";

export default async function OfficerDashboard() {
  const session = await getSession();
  const dept = session?.department || "";

  const apps = dept ? getApplicationsForDepartment(dept) : getAllApplications();

  const riskColors: Record<string, string> = {
    Red: "bg-red-100 text-red-800",
    Orange: "bg-orange-100 text-orange-800",
    Green: "bg-emerald-100 text-emerald-800",
    White: "bg-slate-100 text-slate-800",
  };

  const statusColors: Record<string, string> = {
    PENDING: "bg-amber-100 text-amber-800",
    APPROVED: "bg-emerald-100 text-emerald-800",
    REJECTED: "bg-red-100 text-red-800",
    QUERIED: "bg-blue-100 text-blue-800",
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {dept ? `${dept} — Review Queue` : "All Applications (Admin)"}
          </h1>
          <p className="text-slate-600 mt-1">
            {apps.length} application(s) with approvals for your department
          </p>
        </div>
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input placeholder="Search by App ID, Name, Document Type... (Smart Search)" className="pl-9 bg-white" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="shadow-sm border-amber-200 bg-amber-50">
          <CardContent className="p-5">
            <p className="text-amber-800 text-sm font-semibold flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4" /> Pending Review
            </p>
            <p className="text-3xl font-bold text-amber-900">
              {apps.reduce((acc, app) => acc + app.approvals.filter(a => a.dept === dept && a.status === "PENDING").length, 0)}
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-emerald-200 bg-emerald-50">
          <CardContent className="p-5">
            <p className="text-emerald-800 text-sm font-semibold flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-4 h-4" /> Approved
            </p>
            <p className="text-3xl font-bold text-emerald-900">
              {apps.reduce((acc, app) => acc + app.approvals.filter(a => a.dept === dept && a.status === "APPROVED").length, 0)}
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-red-200 bg-red-50">
          <CardContent className="p-5">
            <p className="text-red-800 text-sm font-semibold flex items-center gap-2 mb-2">
              <ShieldAlert className="w-4 h-4" /> Red Category
            </p>
            <p className="text-3xl font-bold text-red-900">
              {apps.filter(a => a.riskCategory === "Red").length}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm border-slate-200">
        <CardHeader>
          <CardTitle className="text-slate-900">Applications Routed to {dept || "Your Department"}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-slate-700">App ID</TableHead>
                <TableHead className="text-slate-700">Applicant / Company</TableHead>
                <TableHead className="text-slate-700">Approval Required</TableHead>
                <TableHead className="text-slate-700">Risk</TableHead>
                <TableHead className="text-slate-700">Submitted</TableHead>
                <TableHead className="text-slate-700">Your Status</TableHead>
                <TableHead className="text-slate-700">Documents</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {apps.map(app => {
                const myApprovals = app.approvals.filter(a => a.dept === dept || !dept);
                return myApprovals.map((approval, idx) => (
                  <TableRow key={`${app.id}-${approval.id}`}>
                    {idx === 0 ? (
                      <>
                        <TableCell rowSpan={myApprovals.length} className="font-mono text-slate-800 font-medium align-top">{app.id}</TableCell>
                        <TableCell rowSpan={myApprovals.length} className="align-top">
                          <p className="font-semibold text-slate-900">{app.companyName}</p>
                          <p className="text-xs text-slate-600">{app.applicantName}</p>
                        </TableCell>
                      </>
                    ) : null}
                    <TableCell className="text-slate-800 font-medium">{approval.name}</TableCell>
                    <TableCell>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${riskColors[app.riskCategory] || ""}`}>
                        {app.riskCategory}
                      </span>
                    </TableCell>
                    <TableCell className="text-slate-700 text-sm">
                      {new Date(app.submittedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                    </TableCell>
                    <TableCell>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusColors[approval.status] || ""}`}>
                        {approval.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-xs text-slate-700">
                        <FileText className="w-3 h-3" /> {app.documents.length} docs
                      </div>
                    </TableCell>
                    <TableCell>
                      <Link href={`/officer/review/${app.id}?approval=${approval.id}`} className="text-blue-600 font-semibold text-sm hover:underline">
                        Review →
                      </Link>
                    </TableCell>
                  </TableRow>
                ));
              })}
              {apps.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-slate-500">
                    No applications have been routed to your department yet.
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
