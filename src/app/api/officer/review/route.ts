import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function POST(request: Request) {
  try {
    const { appId, approvalId, status, comment } = await request.json();
    
    await prisma.approvalRequirement.update({
      where: { id: approvalId },
      data: { status }
    });

    // Optionally create an ApplicationReview record for the audit trail
    await prisma.applicationReview.create({
      data: {
        applicationId: appId,
        officerId: "officer-1", // hardcoded or from session
        department: "Dept", // hardcoded or from session
        decision: status,
        comments: comment
      }
    });

    revalidatePath(`/officer/review/${appId}`);
    revalidatePath(`/officer/dashboard`);
    revalidatePath(`/dashboard/track/${appId}`);
    
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Review update failed:", err);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
