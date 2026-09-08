import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { FileText, Clock, CheckCircle2, AlertCircle, ArrowRight, Plus } from "lucide-react";

import { requireAuth } from "@/lib/auth";
import { getAllApplications } from "@/lib/mock-data";

export default async function DashboardPage() {
  const session = await requireAuth("APPLICANT");
  
  // Fetch real applications from the mock database, filtering by this applicant
  const allApps = getAllApplications();
  const applications = allApps.filter(app => app.applicantName === session.name);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "APPROVED": return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "QUERIED": return "bg-red-100 text-red-800 border-red-200";
      case "IN_REVIEW": return "bg-blue-100 text-blue-800 border-blue-200";
      case "SUBMITTED": return "bg-indigo-100 text-indigo-800 border-indigo-200";
      case "REJECTED": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-slate-100 text-slate-800 border-slate-200";
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Welcome back, {session.name.split(' ')[0]}</h1>
          <p className="text-slate-500 mt-1">Here is the status of your industrial approvals and compliance tasks.</p>
        </div>
        <div className="flex gap-4 items-center">
          <div className="flex gap-3 items-center bg-white border border-slate-200 px-3 py-2 rounded-lg shadow-sm">
            <span className="text-xs text-slate-500 font-medium">Enterprise Unit:</span>
            <select className="text-sm font-semibold text-slate-900 bg-transparent outline-none">
              <option>Acme Steel (Unit 1 - Pune)</option>
              <option>Acme Steel (Unit 2 - Nashik)</option>
              <option>Acme Warehouse (Thane)</option>
            </select>
          </div>
          <Link href="/dashboard/new">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm h-10">
              <Plus className="w-4 h-4 mr-2" /> New Application
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="pb-2">
            <CardDescription className="text-slate-600 font-medium">Total Applications</CardDescription>
            <CardTitle className="text-3xl text-slate-900">4</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-slate-600 flex items-center gap-1">
              <FileText className="w-4 h-4" /> Across 2 units
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-blue-200 bg-blue-50/50">
          <CardHeader className="pb-2">
            <CardDescription className="text-blue-700 font-medium">In Review</CardDescription>
            <CardTitle className="text-3xl text-blue-700">1</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-blue-700 flex items-center gap-1">
              <Clock className="w-4 h-4" /> On track
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-amber-200 bg-amber-50/50">
          <CardHeader className="pb-2">
            <CardDescription className="text-amber-700 font-medium">Action Required</CardDescription>
            <CardTitle className="text-3xl text-amber-700">1</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-amber-700 font-medium flex items-center gap-1">
              <AlertCircle className="w-4 h-4" /> 1 Query raised
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-emerald-200 bg-emerald-50/50">
          <CardHeader className="pb-2">
            <CardDescription className="text-emerald-700 font-medium">Approved</CardDescription>
            <CardTitle className="text-3xl text-emerald-700">1</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-emerald-700 font-medium flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> Ready to download
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">Recent Applications</h2>
          <Link href="/dashboard/applications" className="text-blue-600 text-sm font-medium hover:underline flex items-center gap-1">
            View All <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="grid gap-4">
          {applications.map((app) => (
            <Card key={app.id} className="shadow-sm border-slate-200 hover:border-slate-300 transition-colors">
              <CardContent className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-sm text-slate-700 font-medium">{app.id}</span>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${getStatusColor(app.status)}`}>
                      {app.status.replace("_", " ")}
                    </span>
                  </div>
                  <h3 className="font-semibold text-slate-900 text-lg">Universal Application - {app.sector}</h3>
                  <p className="text-sm text-slate-600 mt-0.5">Departments: <span className="font-medium text-slate-700">{app.approvals.length} Approvals Required</span></p>
                </div>
                <div className="text-left md:text-right">
                  <p className="text-sm text-slate-600 mb-1">Submission Date</p>
                  <p className="font-semibold text-slate-900">{new Date(app.submittedAt).toLocaleDateString()}</p>
                  <Link href={`/dashboard/track/${app.id}`} className="text-blue-600 text-sm font-semibold hover:underline mt-2 inline-flex items-center gap-1">
                    Track Application <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
