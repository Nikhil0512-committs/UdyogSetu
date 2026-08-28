import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export async function POST(request: Request) {
  const body = await request.json();
  const { checklist, riskCategory, formData, uploadedDocs } = body;
  
  const session = await getSession();
  
  const globalAny = global as any;
  if (!globalAny.mockApplications) {
    globalAny.mockApplications = [];
  }

  const newAppId = `APP-2026-${Math.floor(Math.random() * 9000) + 1000}`;
  
  // Format the uploaded docs
  const formattedDocs = Object.keys(uploadedDocs).map((docName, index) => ({
    id: `doc-${index}`,
    name: docName,
    fileName: uploadedDocs[docName].fileName,
    fileSize: "2.4 MB",
    uploadedAt: new Date().toISOString(),
    ocrExtracted: docName.includes("PAN") ? { "PAN Number": formData.pan, "Name": formData.companyName } : null,
    verified: true,
  }));
  
  // Format the approvals from the checklist
  const formattedApprovals = checklist.map((item: any) => ({
    id: item.id,
    dept: item.dept,
    name: item.name,
    doc: item.doc,
    status: "PENDING",
  }));

  const newApp = {
    id: newAppId,
    applicantName: session?.name || "Applicant",
    companyName: formData.companyName || "Acme Industries",
    pan: formData.pan || "ABCDE1234F",
    gstin: formData.gstin || "27ABCDE1234F1Z5",
    address: formData.address || "MIDC",
    sector: "Manufacturing", // mock
    scale: "Medium",
    district: "Pune",
    riskCategory: riskCategory || "Orange",
    submittedAt: new Date().toISOString(),
    status: "IN_REVIEW",
    documents: formattedDocs,
    approvals: formattedApprovals
  };

  globalAny.mockApplications.push(newApp);

  return NextResponse.json({ success: true, appId: newAppId });
}
