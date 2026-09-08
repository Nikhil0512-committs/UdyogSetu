import { NextResponse } from "next/server";
import { acceptDocument } from "@/lib/mock-data";
import { revalidatePath } from "next/cache";

export async function POST(request: Request) {
  const { appId, docId } = await request.json();
  
  acceptDocument(appId, docId);
  revalidatePath(`/officer/review/${appId}`);
  
  return NextResponse.json({ success: true });
}
