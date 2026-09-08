import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getUserById, addUser } from "@/lib/mock-data";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { role, name, department, id } = body;
    
    const inputId = id || (role === "APPLICANT" ? "admin@acme.com" : "OFF-001");
    const cleanId = inputId.toLowerCase().trim();
    
    let dbUser = null;
    let resolvedName = name || (role === "APPLICANT" ? "Rahul Sharma" : `Officer (${department || "Admin"})`);
    let resolvedUserId = role === "APPLICANT" ? cleanId : `off-${(department || "admin").toLowerCase().replace(/[^a-z0-9]/g, "")}-1`;

    if (role === "APPLICANT") {
      const userEmail = cleanId;

      // Seamlessly upsert any dummy ID directly into the Neon PostgreSQL database
      try {
        dbUser = await prisma.user.upsert({
          where: { email: userEmail },
          update: {
            name: name || undefined
          },
          create: {
            name: resolvedName,
            email: userEmail,
            companyName: "Acme Steel Industries",
            panNumber: "DEFAULT_PAN",
            role: "APPLICANT",
          }
        });
        if (dbUser) {
          resolvedName = dbUser.name;
          resolvedUserId = dbUser.id;
        }
      } catch (dbError) {
        console.warn("Database upsert fallback for dummy ID:", dbError);
      }

      // Also ensure local mock state knows about this user
      addUser({ id: cleanId, name: resolvedName, companyName: "Acme Steel Industries", role: "APPLICANT" });
    } else if (role === "OFFICER") {
      const deptKey = (department || "admin").toLowerCase().replace(/[^a-z0-9]/g, "");
      const officerEmail = `officer-${deptKey}@udyogsetu.gov.in`;
      resolvedUserId = `off-${deptKey}-1`;

      // Seamlessly upsert officer into Neon PostgreSQL database
      try {
        dbUser = await prisma.user.upsert({
          where: { email: officerEmail },
          update: { name: resolvedName },
          create: {
            id: resolvedUserId,
            name: resolvedName,
            email: officerEmail,
            role: "OFFICER",
            companyName: department || "Government Department",
          }
        });
      } catch (officerDbErr) {
        console.warn("Officer DB upsert warning:", officerDbErr);
      }
    }

    const session = {
      userId: resolvedUserId,
      role,
      name: resolvedName,
      department: department || undefined,
    };
    
    const cookieStore = await cookies();
    cookieStore.set("mock_session", JSON.stringify(session), {
      path: "/",
      httpOnly: true,
      maxAge: 60 * 60 * 24
    });
    
    return NextResponse.json({ success: true, session, user: dbUser });
  } catch (error: any) {
    console.error("Login API Error:", error);
    return NextResponse.json({ success: false, error: error.message || "Login failed" }, { status: 500 });
  }
}
