import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

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
    companyName: isDummyAccount ? "Acme Steel Industries Pvt Ltd" : (session?.companyName || `${session?.name || "Applicant"}'s Enterprise`),
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

  // Also persist in Neon DB if available so tracking and officer review work seamlessly
  try {
    const uid = session?.userId || "app-user-1";
    
    // Ensure applicant exists
    await prisma.user.upsert({
      where: { id: uid },
      update: {},
      create: {
        id: uid,
        name: session?.name || "Rahul Sharma",
        email: `${uid}@example.com`,
        role: "APPLICANT",
        companyName: newSchemeApp.companyName,
      }
    });

    await prisma.application.create({
      data: {
        id: newAppId,
        applicantId: uid,
        status: "IN_REVIEW",
        riskScore: 20,
        submittedAt: new Date(),
        approvals: {
          create: [
            {
              department: "Directorate of Industries",
              approvalName: schemeName,
              status: "PENDING"
            }
          ]
        },
        documents: {
          create: [
            {
              userId: uid,
              type: "PAN Card",
              url: "pan_card.pdf",
              isVerified: true,
              ocrData: JSON.stringify({ "PAN Number": newSchemeApp.pan, "Name": newSchemeApp.applicantName, fileName: "pan_card.pdf" })
            },
            {
              userId: uid,
              type: "Project Report / DBP",
              url: "project_report.pdf",
              isVerified: false,
              ocrData: JSON.stringify({ fileName: "project_report.pdf" })
            }
          ]
        }
      }
    });
  } catch (dbErr) {
    console.warn("Could not persist scheme app to DB, using mock fallback:", dbErr);
  }

  return NextResponse.json({ success: true, appId: newAppId });
}
