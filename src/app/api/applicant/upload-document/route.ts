import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json();
    const { applicationId, docType, fileBase64, fileName } = body;

    if (!applicationId || !docType || !fileBase64) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    // Verify the application belongs to this user
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      select: { applicantId: true }
    });

    if (!application) {
      return NextResponse.json({ success: false, error: "Application not found" }, { status: 404 });
    }

    if (application.applicantId !== session.userId) {
      return NextResponse.json({ success: false, error: "You do not own this application" }, { status: 403 });
    }

    // Check if a document of this type already exists for this application
    const existingDoc = await prisma.document.findFirst({
      where: {
        applicationId,
        type: docType
      }
    });

    if (existingDoc) {
      // Update existing document
      await prisma.document.update({
        where: { id: existingDoc.id },
        data: {
          url: fileBase64,
          isVerified: true,
          ocrData: JSON.stringify({ fileName, uploadedAt: new Date().toISOString(), isPostSubmission: true })
        }
      });
    } else {
      // Create new document linked to application
      await prisma.document.create({
        data: {
          userId: session.userId,
          applicationId,
          type: docType,
          url: fileBase64,
          isVerified: true,
          ocrData: JSON.stringify({ fileName, uploadedAt: new Date().toISOString(), isPostSubmission: true })
        }
      });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Upload document error:", err);
    return NextResponse.json({ success: false, error: "Failed to upload document" }, { status: 500 });
  }
}
