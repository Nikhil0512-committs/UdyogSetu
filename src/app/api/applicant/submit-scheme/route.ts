import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export async function POST(request: Request) {
  const { schemeId, schemeName } = await request.json();
  const session = await getSession();
  
  const globalAny = global as any;
  if (!globalAny.mockApplications) {
    globalAny.mockApplications = [];
  }

  const newAppId = `SCH-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000) + 1000}`;
  
  const isDummyAccount = session?.userId === "admin@company.com" || session?.userId === "admin@acme.com";
  
  const newSchemeApp = {
    id: newAppId,
    applicantName: session?.name || "Rahul Sharma",
    companyName: isDummyAccount ? "Acme Steel Industries Pvt Ltd" : `${session?.name || "Applicant"}'s Enterprise`,
    pan: isDummyAccount ? "ABCDE1234F" : "N/A",
    gstin: isDummyAccount ? "27ABCDE1234F1Z5" : "N/A",
    address: isDummyAccount ? "Unit 4, MIDC Industrial Area, Pune" : "Address Not Provided",
    sector: "Manufacturing",
    scale: "Micro",
    district: "Pune",
    riskCategory: "Green",
    submittedAt: new Date().toISOString(),
    status: "IN_REVIEW",
    documents: [
      {
        id: "doc-1",
        name: "PAN Card",
        fileName: "pan_card.pdf",
        fileSize: "1.2 MB",
        uploadedAt: new Date().toISOString(),
        ocrExtracted: { "PAN Number": isDummyAccount ? "ABCDE1234F" : "N/A", "Name": session?.name || "Rahul Sharma" },
        verified: true,
      },
      {
        id: "doc-2",
        name: "Project Report / DBP",
        fileName: "project_report.pdf",
        fileSize: "4.5 MB",
        uploadedAt: new Date().toISOString(),
        ocrExtracted: null,
        verified: false,
      }
    ],
    approvals: [
      {
        id: 1,
        dept: "Directorate of Industries",
        name: schemeName,
        doc: "Project Report",
        status: "PENDING",
      }
    ]
  };

  globalAny.mockApplications.push(newSchemeApp);

  return NextResponse.json({ success: true, appId: newAppId });
}
