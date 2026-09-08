import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getUserById, addUser } from "@/lib/mock-data";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { role, name, department, id } = body;
    
    let resolvedUserId = "";
    let resolvedName = name || "Rahul Sharma";
    let dbUser = null;

    if (role === "APPLICANT" && id) {
      const cleanId = id.replace(/\s+/g, "");
      const userEmail = `${cleanId}@udyogsetu.gov.in`;

      // 1. Query Neon PostgreSQL database for user
      try {
        dbUser = await prisma.user.findFirst({
          where: {
            OR: [
              { email: userEmail },
              { panNumber: cleanId }
            ]
          }
        });
      } catch (dbError) {
        console.warn("Prisma lookup error, using fallback:", dbError);
      }

      // 2. Fallback to mock data if not in DB
      const mockUser = getUserById(id);

      if (!dbUser && !mockUser) {
        // Auto-create applicant in Postgres DB for seamless experience
        try {
          dbUser = await prisma.user.create({
            data: {
              name: resolvedName,
              email: userEmail,
              companyName: "Acme Steel Industries",
              panNumber: cleanId,
              role: "APPLICANT",
            }
          });
          addUser({ id: cleanId, name: resolvedName, companyName: "Acme Steel Industries", role: "APPLICANT" });
        } catch (createErr) {
          console.warn("Database auto-register fallback:", createErr);
        }
      } else if (dbUser) {
        resolvedName = dbUser.name;
        resolvedUserId = dbUser.id;
      } else if (mockUser) {
        resolvedName = mockUser.name;
        resolvedUserId = mockUser.id;
        
        // Sync mock user to DB
        try {
          dbUser = await prisma.user.create({
            data: {
              name: mockUser.name,
              email: userEmail,
              companyName: mockUser.companyName || "Acme Industries",
              panNumber: cleanId,
              role: "APPLICANT",
            }
          });
        } catch (syncErr) {
          // ignore duplicate errors
        }
      }

      if (!resolvedUserId) {
        resolvedUserId = dbUser?.id || cleanId || "app-user-1";
      }
    } else if (role === "OFFICER") {
      const deptKey = (department || "admin").toLowerCase().replace(/[^a-z0-9]/g, "");
      const officerEmail = `officer-${deptKey}@udyogsetu.gov.in`;
      const officerId = `off-${deptKey}-1`;
      resolvedUserId = officerId;
      resolvedName = name || `Officer (${department || "Admin"})`;

      // Sync Officer to Postgres Database
      try {
        dbUser = await prisma.user.upsert({
          where: { email: officerEmail },
          update: { name: resolvedName },
          create: {
            id: officerId,
            name: resolvedName,
            email: officerEmail,
            role: "OFFICER",
            companyName: department || "Government Department",
          }
        });
      } catch (officerDbErr) {
        console.warn("Officer DB sync warning:", officerDbErr);
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
