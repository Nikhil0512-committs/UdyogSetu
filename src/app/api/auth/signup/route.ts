import { NextResponse } from "next/server";
import { addUser } from "@/lib/mock-data";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, name, companyName, role } = body;
    
    const inputId = id || "1234 5678 9012";
    const cleanId = inputId.replace(/\s+/g, "").toLowerCase();
    const userEmail = `${cleanId}@udyogsetu.gov.in`;

    const userName = name || "Rahul Sharma";
    const company = companyName || "Acme Industries";

    // Upsert dummy user into Neon PostgreSQL database
    let dbUser = null;
    try {
      dbUser = await prisma.user.upsert({
        where: { email: userEmail },
        update: {
          name: userName,
          companyName: company,
        },
        create: {
          name: userName,
          email: userEmail,
          companyName: company,
          panNumber: cleanId,
          role: role || "APPLICANT",
        }
      });
    } catch (dbErr) {
      console.warn("Database create/upsert warning:", dbErr);
    }

    // Register in mock store for UI compatibility
    addUser({ id: cleanId, name: userName, companyName: company, role: role || "APPLICANT" });
    
    return NextResponse.json({ success: true, user: dbUser || { id: cleanId, name: userName, companyName: company, role: role || "APPLICANT" } });
  } catch (error: any) {
    console.error("Signup API Error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to register user." }, { status: 500 });
  }
}
