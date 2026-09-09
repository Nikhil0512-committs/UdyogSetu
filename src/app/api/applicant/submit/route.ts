import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { checklist, riskCategory, formData, uploadedDocs } = body;
    
    const session = await getSession();
    const uid = session?.userId || "app-user-1";
    const newAppId = `APP-${new Date().getFullYear()}-${Math.floor(Math.random() * 90000) + 10000}`;

    // Ensure user exists
    await prisma.user.upsert({
      where: { id: uid },
      update: {
        companyName: formData.companyName,
        panNumber: formData.pan
      },
      create: {
        id: uid,
        name: session?.name || "Applicant",
        email: `${uid}@example.com`,
        role: "APPLICANT",
        companyName: formData.companyName,
        panNumber: formData.pan
      }
    });

    const newApp = await prisma.application.create({
      data: {
        id: newAppId,
        applicantId: uid,
        status: "IN_REVIEW",
        riskScore: riskCategory === "Red" ? 90 : riskCategory === "Orange" ? 60 : 30,
        submittedAt: new Date(),
        approvals: {
          create: checklist.map((item: any) => ({
            department: item.dept,
            approvalName: item.name,
            status: "PENDING"
          }))
        }
      }
    });

    for (const [docName, info] of Object.entries(uploadedDocs)) {
      const typedInfo = info as any;
      if (typedInfo.uploaded) {
        await prisma.document.create({
          data: {
            userId: uid,
            applicationId: newAppId,
            type: docName,
            url: typedInfo.fileBase64 || typedInfo.fileName, // Use base64 if available
            isVerified: true,
            ocrData: JSON.stringify({ ...formData, fileName: typedInfo.fileName })
          }
        });
      }
    }

    return NextResponse.json({ success: true, appId: newAppId });
  } catch (err) {
    console.error("Application submission failed:", err);
    return NextResponse.json({ success: false, error: "Failed to submit" }, { status: 500 });
  }
}

