import { NextResponse } from "next/server";
import { rejectDocument } from "@/lib/mock-data";
import { revalidatePath } from "next/cache";

export async function POST(request: Request) {
  const { appId, docId, reason, dept } = await request.json();
  
  rejectDocument(appId, docId, reason, dept);
  revalidatePath(`/officer/review/${appId}`);
  
  return NextResponse.json({ success: true });
}
