import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, HelpCircle, FileText, Calendar, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import ReviewActions from "./review-actions";
import DocumentList from "./document-list";
import { prisma } from "@/lib/db";

export default async function ReviewPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ approval?: string }> }) {
  const session = await getSession();
  const { id } = await params;
  
  const dbApp = await prisma.application.findUnique({
    where: { id },
    include: {
      applicant: true,
      approvals: true,
      documents: true,
      reviews: true
    }
  });

  let app: any = null;
  if (dbApp) {
    app = {
      id: dbApp.id,
      applicantName: dbApp.applicant?.name || "Unknown Applicant",
      companyName: dbApp.applicant?.companyName || "Unknown Company",
      pan: dbApp.applicant?.panNumber || "N/A",
      gstin: "N/A", // We didn't store gstin directly on user, but it might be in docs
      sector: "Manufacturing",
      district: "Pune",
      address: "MIDC",
      riskCategory: dbApp.riskScore && dbApp.riskScore >= 80 ? "Red" : dbApp.riskScore && dbApp.riskScore >= 50 ? "Orange" : "Green",
      submittedAt: dbApp.submittedAt ? dbApp.submittedAt.toISOString() : new Date().toISOString(),
      documents: dbApp.documents.map(d => {
        let parsed = null;
        if (d.ocrData) {
          try { parsed = JSON.parse(d.ocrData); } catch(e) {}
        }
        return {
          id: d.id,
          name: d.type,
          fileName: parsed?.fileName || (d.url.length > 100 ? "Document File" : d.url),
          fileBase64: d.url.startsWith("data:") ? d.url : null,
          fileSize: "Unknown",
          uploadedAt: d.createdAt.toISOString(),
          verified: d.isVerified,
          ocrExtracted: parsed
        };
      }),
      approvals: dbApp.approvals.map(a => ({
        id: a.id,
        dept: a.department,
        name: a.approvalName,
        doc: "Required Document",
        status: a.status,
        reviewedAt: null, // to be populated if needed
        officerComment: ""
      }))
    };
  }
  
  if (!app) {
    return <div className="text-center py-20 text-slate-500">Application not found.</div>;
  }

  const dept = session?.department || "";
  const myApprovals = app.approvals.filter((a: any) => a.dept === dept || !dept);

  // Department specific document mapping
  const identityDocs = ["PAN card (Company/Proprietor)", "Aadhaar of Authorized Signatory", "Certificate of Incorporation / Udyam", "GST Registration Certificate"];
  
  const deptSpecificMap: Record<string, string[]> = {
    "MPCB": ["Consent to Establish (Water & Air)", "Project Report / Manufacturing Process Details", "Site Layout Plan / Building Plan Drawing", "Land Ownership / Lease Allotment"],
    "Fire Services Department": ["Provisional Fire NOC", "Site Layout Plan / Building Plan Drawing"],
    "Labour Department": ["Shops & Establishment Registration"],
    "DISH / Labour Department": ["Registration under Factories Act", "Worker safety & health policy"],
    "Directorate of Industries": ["Project Report / Manufacturing Process Details", "Land Ownership / Lease Allotment"],
    "MIDC": ["Factory Building Plan Approval", "Machinery layout & safety officer details"]
  };

  const allowedDocTypes = dept ? [...identityDocs, ...(deptSpecificMap[dept] || [])] : null;

  // Filter the application documents so officer only sees relevant ones
  const finalDocs = allowedDocTypes ? app.documents.filter((d: any) => allowedDocTypes.includes(d.name)) : app.documents;

  const riskColors: Record<string, string> = {
    Red: "bg-red-100 text-red-800 border-red-200",
    Orange: "bg-orange-100 text-orange-800 border-orange-200",
    Green: "bg-emerald-100 text-emerald-800 border-emerald-200",
    White: "bg-slate-100 text-slate-800 border-slate-200",
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-10">
      <div className="flex items-center gap-4 mb-4">
        <Link href="/officer/dashboard">
          <Button variant="outline" size="sm">&larr; Back to Queue</Button>
        </Link>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Application Review</h1>
          <p className="text-slate-700 font-mono mt-1 font-medium">{app.id}</p>
        </div>
        <div className="flex gap-2">
          <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${riskColors[app.riskCategory]}`}>
            {app.riskCategory} Category
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Business Details */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-slate-900">Business Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Company Name</p>
                  <p className="font-semibold text-slate-900">{app.companyName}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600 mb-1">Applicant</p>
                  <p className="font-semibold text-slate-900">{app.applicantName}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600 mb-1">PAN Number</p>
                  <p className="font-mono font-semibold text-slate-900">{app.pan}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600 mb-1">GSTIN</p>
                  <p className="font-mono font-semibold text-slate-900">{app.gstin}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600 mb-1">Sector</p>
                  <p className="font-semibold text-slate-900">{app.sector}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600 mb-1">District</p>
                  <p className="font-semibold text-slate-900">{app.district}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-slate-600 mb-1">Unit Address</p>
                  <p className="font-semibold text-slate-900">{app.address}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submitted Documents */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" /> Submitted Documents ({finalDocs.length})
              </CardTitle>
              <CardDescription className="text-slate-600">All required documents uploaded by the applicant for your department</CardDescription>
            </CardHeader>
            <CardContent>
              <DocumentList documents={finalDocs} appId={app.id} />
            </CardContent>
          </Card>
        </div>

        {/* RIGHT: Decision & Audit */}
        <div className="space-y-6">
          {/* Approvals for this department */}
          {myApprovals.map((approval: any) => (
            <Card key={approval.id} className="shadow-md border-blue-200">
              <CardHeader className="bg-blue-50 border-b border-blue-100">
                <CardTitle className="text-sm text-slate-900">{approval.name}</CardTitle>
                <CardDescription className="text-slate-700">Required doc: {approval.doc}</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <ReviewActions appId={app.id} approvalId={approval.id} currentStatus={approval.status} currentComment={approval.officerComment} />
              </CardContent>
            </Card>
          ))}

          {/* Audit Trail */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-600" /> Audit Trail
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-slate-700 space-y-3">
                {app.approvals.filter((a: any) => a.reviewedAt).map((a: any) => (
                  <p key={a.id}>• <span className="font-semibold">{a.dept}</span>: {a.status} — {new Date(a.reviewedAt!).toLocaleString("en-IN")} {a.officerComment && <span className="text-slate-600 italic">&ldquo;{a.officerComment}&rdquo;</span>}</p>
                ))}
                <p>• <span className="font-semibold">System</span>: Auto-routed to {app.approvals.length} departments — {new Date(app.submittedAt).toLocaleString("en-IN")}</p>
                <p>• <span className="font-semibold">AI Engine</span>: {app.documents.filter((d: any) => d.verified).length}/{app.documents.length} docs pre-verified</p>
                <p>• <span className="font-semibold">Applicant</span>: Submitted — {new Date(app.submittedAt).toLocaleString("en-IN")}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
