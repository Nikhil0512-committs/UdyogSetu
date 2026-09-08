import { NextResponse } from "next/server";
import { updateApprovalStatus } from "@/lib/mock-data";
import { revalidatePath } from "next/cache";

export async function POST(request: Request) {
  const { appId, approvalId, status, comment } = await request.json();
  
  updateApprovalStatus(appId, approvalId, status, comment);
  revalidatePath(`/officer/review/${appId}`);
  revalidatePath(`/officer/dashboard`);
  
  return NextResponse.json({ success: true });
}
