import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "OFFICER") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { appId, approvalId, status, comment } = await request.json();
    
    await prisma.approvalRequirement.update({
      where: { id: approvalId },
      data: { status }
    });

    // Create an ApplicationReview record for the audit trail
    // Use the officer's real session userId and department
    const officerUserId = session.userId;
    const officerDept = session.department || "Unknown";

    // Ensure the officer user exists in DB before creating the review
    const officerExists = await prisma.user.findUnique({ where: { id: officerUserId } });
    
    if (officerExists) {
      await prisma.applicationReview.create({
        data: {
          applicationId: appId,
          officerId: officerUserId,
          department: officerDept,
          decision: status,
          comments: comment
        }
      });
    } else {
      console.warn(`Officer ${officerUserId} not found in DB, skipping audit trail record`);
    }

    revalidatePath(`/officer/review/${appId}`);
    revalidatePath(`/officer/dashboard`);
    revalidatePath(`/dashboard/track/${appId}`);
    revalidatePath(`/dashboard/applications`);
    
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Review update failed:", err);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
