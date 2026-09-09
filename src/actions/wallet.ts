"use server";

import { prisma } from "@/lib/db";
import { globalAny } from "@/lib/mock-data";

export async function fetchWalletDocuments(userId: string) {
  try {
    const docs = await prisma.document.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    if (docs.length > 0) {
      return docs
        .filter(doc => {
          // Dummy documents or old broken documents do not have a base64 data URI.
          // Only show manually uploaded verified documents with real file data.
          if (!doc.url || !doc.url.startsWith('data:')) {
            return false;
          }
          if (!doc.ocrData) return true;
          try {
            const meta = JSON.parse(doc.ocrData);
            return meta.isDummy !== true;
          } catch (e) {
            return true;
          }
        })
        .map(doc => {
          let meta: any = {};
        try {
          if (doc.ocrData) meta = JSON.parse(doc.ocrData);
        } catch (e) {}

        return {
          id: doc.id,
          type: doc.type,
          docNumber: meta.docNumber || "N/A",
          fileName: meta.fileName || "document",
          fileSize: meta.fileSize || "Unknown",
          uploadDate: doc.createdAt.toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
          }),
          expiryDate: meta.expiryDate || "Lifetime Validity",
          isExpiringSoon: meta.isExpiringSoon || false,
          daysToExpiry: meta.daysToExpiry,
          status: doc.isVerified ? "VERIFIED" : "PENDING",
          issuer: meta.issuer || "Unknown Issuer",
          verifiedBy: meta.verifiedBy || "System",
          linkedApplications: meta.linkedApplications || [],
          fileBase64: doc.url, // Store base64 here
        };
      });
    }
  } catch (err) {
    console.error("Failed to fetch wallet from DB:", err);
  }

  // Fallback to mock data if DB empty or fails
  if (!globalAny.mockWalletDocuments) {
    globalAny.mockWalletDocuments = {};
  }
  return globalAny.mockWalletDocuments[userId] || [];
}

export async function saveWalletDocument(userId: string, payload: any) {
  try {
    const uid = userId || "app-user-1";
    
    // Ensure the user exists in DB to prevent foreign key constraint failures
    await prisma.user.upsert({
      where: { id: uid },
      update: {},
      create: {
        id: uid,
        name: "Demo User",
        email: `${uid}@example.com`,
        role: "APPLICANT"
      }
    });

    const doc = await prisma.document.create({
      data: {
        userId: uid,
        type: payload.type,
        url: payload.fileBase64,
        isVerified: payload.status === "VERIFIED",
        ocrData: JSON.stringify({
          docNumber: payload.docNumber,
          fileName: payload.fileName,
          fileSize: payload.fileSize,
          issuer: payload.issuer,
          verifiedBy: payload.verifiedBy,
          linkedApplications: payload.linkedApplications,
          expiryDate: payload.expiryDate,
          isExpiringSoon: payload.isExpiringSoon,
          daysToExpiry: payload.daysToExpiry,
        }),
      },
    });

    return { success: true, id: doc.id };
  } catch (err) {
    console.error("Failed to save wallet doc to DB:", err);

    // Fallback to mock
    if (!globalAny.mockWalletDocuments) {
      globalAny.mockWalletDocuments = {};
    }
    if (!globalAny.mockWalletDocuments[userId]) {
      globalAny.mockWalletDocuments[userId] = [];
    }
    
    const newDoc = {
      ...payload,
      id: `DOC-NEW-${Date.now().toString().slice(-4)}`,
      uploadDate: "Just now",
    };
    globalAny.mockWalletDocuments[userId].unshift(newDoc);
    
    return { success: true, id: newDoc.id };
  }
}
