import { NextResponse } from "next/server";
import { addUser } from "@/lib/mock-data";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, name, companyName, role } = body;
    
    // Fallback to legacy id property if still passed (for compatibility)
    const userEmail = (email || body.id || "admin@acme.com").toLowerCase().trim();

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
          panNumber: "DEFAULT_PAN",
          role: role || "APPLICANT",
        }
      });
    } catch (dbErr: any) {
      console.error("Database create/upsert error:", dbErr);
      return NextResponse.json({ success: false, error: "Database error during registration." }, { status: 500 });
    }

    // Register in mock store for UI compatibility
    addUser({ id: userEmail, name: userName, companyName: company, role: role || "APPLICANT" });
    
    return NextResponse.json({ success: true, user: dbUser || { id: userEmail, name: userName, companyName: company, role: role || "APPLICANT" } });
  } catch (error: any) {
    console.error("Signup API Error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to register user." }, { status: 500 });
  }
}
