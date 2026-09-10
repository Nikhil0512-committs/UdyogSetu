import { NextResponse } from "next/server";
import { acceptDocument } from "@/lib/mock-data";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function POST(request: Request) {
  const { appId, docId } = await request.json();
  
  try {
    if (docId) {
      await prisma.document.update({
        where: { id: docId },
        data: { isVerified: true }
      });
    }
  } catch (dbErr) {
    console.warn("DB doc verify error, falling back to mock:", dbErr);
  }

  acceptDocument(appId, docId);
  revalidatePath(`/officer/review/${appId}`);
  
  return NextResponse.json({ success: true });
}
