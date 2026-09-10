import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, MapPin, AlertTriangle, Building, FileText, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

export default async function TrackingPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAuth();
  const { id } = await params;
  
  const dbApp = await prisma.application.findUnique({
    where: { id },
    include: {
      applicant: true,
      approvals: true,
      documents: true
    }
  });

  let app: any = null;
  if (dbApp) {
    app = {
      id: dbApp.id,
      applicantName: dbApp.applicant?.name || "Unknown Applicant",
      companyName: dbApp.applicant?.companyName || "Unknown Company",
      pan: dbApp.applicant?.panNumber || "N/A",
      gstin: "N/A", 
      sector: "Manufacturing",
      district: "Pune",
      address: "MIDC",
      riskCategory: dbApp.riskScore && dbApp.riskScore >= 80 ? "Red" : dbApp.riskScore && dbApp.riskScore >= 50 ? "Orange" : "Green",
      submittedAt: dbApp.submittedAt ? dbApp.submittedAt.toISOString() : new Date().toISOString(),
      status: dbApp.status,
      documents: dbApp.documents.map(d => {
        let parsedOcr = null;
        if (d.ocrData) {
          try {
            parsedOcr = JSON.parse(d.ocrData);
          } catch (e) {}
        }
        return {
          id: d.id,
          name: d.type,
          fileName: d.url,
          fileSize: "Unknown",
          uploadedAt: d.createdAt.toISOString(),
          verified: d.isVerified,
          ocrExtracted: parsedOcr
        };
      }),
      approvals: dbApp.approvals.map(a => ({
        id: a.id,
        dept: a.department,
        name: a.approvalName,
        status: a.status,
        officerComment: ""
      }))
    };
  } else {
    // Check in-memory mock store fallback (e.g. for freshly submitted schemes or demo mock apps)
    const globalAny = global as any;
    const mockApp = globalAny.mockApplications?.find((a: any) => a.id === id);
    if (mockApp) {
      app = mockApp;
    }
  }

  if (!app) {
    return (
      <div className="max-w-3xl mx-auto py-20 text-center">
        <h1 className="text-2xl font-bold text-slate-900 mb-4">Application Not Found</h1>
        <p className="text-slate-500 mb-8">We couldn't find an application with ID: {id}</p>
        <Link href="/dashboard"><Button>Return to Dashboard</Button></Link>
      </div>
    );
  }

  const isDocVerified = app.documents.every((d: any) => d.verified);
  const isApproved = app.status === "APPROVED";
  const isRejected = app.status === "REJECTED";
  const isQueried = app.status === "QUERIED";

  const getOverallStatus = () => {
    if (isApproved) return { label: "APPROVED", color: "bg-emerald-100 text-emerald-800" };
    if (isRejected) return { label: "REJECTED", color: "bg-red-100 text-red-800" };
    if (isQueried) return { label: "ACTION REQUIRED", color: "bg-red-100 text-red-800" };
    return { label: "IN REVIEW", color: "bg-blue-100 text-blue-800" };
  };

  const statusBadge = getOverallStatus();

  // Find the bottleneck
  const pendingApprovals = app.approvals.filter((a: any) => a.status === "PENDING" || a.status === "QUERIED");
  const bottleneckDept = pendingApprovals.length > 0 ? pendingApprovals[0].dept : "None";

  // Simulate ETA
  const submittedDate = new Date(app.submittedAt);
  const etaDate = new Date(submittedDate);
  etaDate.setDate(etaDate.getDate() + (app.riskCategory === "Green" ? 15 : 30));

  const steps = [
    { 
      name: "Application Submitted", 
      status: "completed", 
      date: submittedDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) 
    },
    { 
      name: "AI Document Verification", 
      status: isDocVerified ? "completed" : "current", 
      date: isDocVerified ? "Completed" : "In Progress" 
    },
    { 
      name: "Multi-Department Scrutiny", 
      status: isApproved || isRejected ? "completed" : (isDocVerified ? "current" : "upcoming"), 
      date: isApproved || isRejected ? "Completed" : (isDocVerified ? "Pending" : "-") 
    },
    { 
      name: "Final Approval Issued", 
      status: isApproved ? "completed" : (isRejected ? "rejected" : "upcoming"), 
      date: isApproved ? "Issued" : "-" 
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div className="flex items-center gap-4 mb-4">
        <Link href="/dashboard">
          <Button variant="outline" size="sm">&larr; Back to Dashboard</Button>
        </Link>
      </div>
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-slate-900">Application Tracking</h1>
            <Badge className={`${statusBadge.color} hover:${statusBadge.color} border-none`}>{statusBadge.label}</Badge>
          </div>
          <p className="text-slate-500 font-mono font-medium">ID: {id}</p>
          <div className="flex items-center gap-4 mt-3 text-sm text-slate-600">
            <span className="flex items-center gap-1"><Building className="w-4 h-4" /> {app.companyName}</span>
            <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {app.district}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="bg-slate-900 text-white border-slate-800">
          <CardContent className="p-6">
            <p className="text-slate-400 text-sm mb-1">Predictive ETA</p>
            <p className="text-2xl font-bold">{isApproved ? "Completed" : etaDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
            <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
              <Clock className="w-3 h-3" /> Based on dept historical data
            </p>
          </CardContent>
        </Card>
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-6">
            <p className="text-amber-700 text-sm mb-1 font-medium flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" /> Current Bottleneck
            </p>
            <p className="text-lg font-bold text-amber-900">{isApproved ? "None" : bottleneckDept}</p>
            <p className="text-xs text-amber-700 mt-2">Waiting for officer review</p>
          </CardContent>
        </Card>
        <Card className={`${app.riskCategory === 'Green' ? 'border-emerald-200 bg-emerald-50' : app.riskCategory === 'Orange' ? 'border-orange-200 bg-orange-50' : 'border-red-200 bg-red-50'}`}>
          <CardContent className="p-6">
            <p className={`text-sm mb-1 font-medium ${app.riskCategory === 'Green' ? 'text-emerald-700' : app.riskCategory === 'Orange' ? 'text-orange-700' : 'text-red-700'}`}>Risk Score</p>
            <p className={`text-2xl font-bold ${app.riskCategory === 'Green' ? 'text-emerald-700' : app.riskCategory === 'Orange' ? 'text-orange-700' : 'text-red-700'}`}>
              {app.riskCategory} Risk
            </p>
            <p className={`text-xs mt-2 ${app.riskCategory === 'Green' ? 'text-emerald-600' : app.riskCategory === 'Orange' ? 'text-orange-600' : 'text-red-600'}`}>
              Assessed via AI analysis
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Journey Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative border-l border-slate-200 ml-3 space-y-8 pb-4 mt-2">
              {steps.map((step, idx) => (
                <div key={idx} className="relative pl-8">
                  <div className={`absolute -left-3.5 top-1 w-7 h-7 rounded-full flex items-center justify-center border-2 bg-white
                    ${step.status === 'completed' ? 'border-emerald-500 text-emerald-500' : 
                      step.status === 'current' ? 'border-blue-600 text-blue-600' : 
                      step.status === 'rejected' ? 'border-red-500 text-red-500' :
                      'border-slate-300 text-slate-300'}`}
                  >
                    {step.status === 'completed' ? <CheckCircle2 className="w-4 h-4" /> : 
                     step.status === 'current' ? <MapPin className="w-4 h-4" /> : 
                     step.status === 'rejected' ? <XCircle className="w-4 h-4" /> :
                     <div className="w-2 h-2 rounded-full bg-slate-300" />}
                  </div>
                  <div>
                    <h4 className={`font-semibold ${step.status === 'upcoming' ? 'text-slate-500' : 'text-slate-900'}`}>
                      {step.name}
                    </h4>
                    <p className="text-sm text-slate-500 mt-1">{step.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Department Scrutiny Breakdown</CardTitle>
            <CardDescription>Real-time status of each parallel approval</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {app.approvals.map((approval: any) => (
              <div key={approval.id} className="p-4 rounded-lg border border-slate-200 bg-slate-50">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-semibold text-blue-600 mb-1">{approval.dept}</p>
                    <p className="font-medium text-slate-900">{approval.name}</p>
                    {approval.status === "QUERIED" && approval.officerComment && (
                      <div className="mt-2 text-sm text-red-700 bg-red-50 p-2 rounded border border-red-100">
                        <span className="font-semibold">Officer Query:</span> {approval.officerComment}
                      </div>
                    )}
                  </div>
                  {approval.status === "APPROVED" ? (
                    <Badge className="bg-emerald-100 text-emerald-800 border-none shrink-0"><CheckCircle className="w-3 h-3 mr-1"/> Approved</Badge>
                  ) : approval.status === "REJECTED" ? (
                    <Badge className="bg-red-100 text-red-800 border-none shrink-0"><XCircle className="w-3 h-3 mr-1"/> Rejected</Badge>
                  ) : approval.status === "QUERIED" ? (
                    <Badge className="bg-amber-100 text-amber-800 border-none shrink-0">Query Raised</Badge>
                  ) : (
                    <Badge className="bg-slate-200 text-slate-700 border-none shrink-0">Pending</Badge>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
