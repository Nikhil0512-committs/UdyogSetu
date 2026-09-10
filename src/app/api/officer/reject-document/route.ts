import { NextResponse } from "next/server";
import { rejectDocument } from "@/lib/mock-data";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function POST(request: Request) {
  const { appId, docId, reason, dept } = await request.json();
  
  try {
    if (docId) {
      await prisma.document.update({
        where: { id: docId },
        data: { isVerified: false }
      });
    }
  } catch (dbErr) {
    console.warn("DB doc reject error, falling back to mock:", dbErr);
  }

  rejectDocument(appId, docId, reason, dept);
  revalidatePath(`/officer/review/${appId}`);
  
  return NextResponse.json({ success: true });
}
