import { NextResponse } from "next/server";
import { addUser, getUserById } from "@/lib/mock-data";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, name, companyName, role } = body;
    
    if (!id || !name || !companyName) {
      return NextResponse.json({ success: false, error: "Missing required fields." }, { status: 400 });
    }

    const cleanId = id.replace(/\s+/g, "");
    const userEmail = `${cleanId}@udyogsetu.gov.in`;

    // Check if user already exists in Neon PostgreSQL database
    let existingUser = null;
    try {
      existingUser = await prisma.user.findFirst({
        where: {
          OR: [
            { email: userEmail },
            { panNumber: cleanId }
          ]
        }
      });
    } catch (dbErr) {
      console.warn("Database lookup warning, using fallback:", dbErr);
      existingUser = getUserById(cleanId);
    }

    if (existingUser) {
      return NextResponse.json({ success: false, error: "A user with this Aadhaar already exists." }, { status: 400 });
    }

    // Create user in Neon PostgreSQL database
    let dbUser = null;
    try {
      dbUser = await prisma.user.create({
        data: {
          name,
          email: userEmail,
          companyName,
          panNumber: cleanId,
          role: role || "APPLICANT",
        }
      });
    } catch (dbCreateErr) {
      console.warn("Database user create error, proceeding with local registration:", dbCreateErr);
    }

    // Also register in mock-data store to preserve complete UI compatibility
    addUser({ id: cleanId, name, companyName, role: role || "APPLICANT" });
    
    return NextResponse.json({ success: true, user: dbUser || { id: cleanId, name, companyName, role: role || "APPLICANT" } });
  } catch (error: any) {
    console.error("Signup API Error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to register user." }, { status: 500 });
  }
}
