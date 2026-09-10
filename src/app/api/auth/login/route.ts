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

    let resolvedCompanyName = role === "APPLICANT" ? "Acme Steel Industries" : (department || "Government Department");

    if (role === "APPLICANT") {
      const userEmail = cleanId;
      const isDummyAccount = userEmail === "admin@company.com" || userEmail === "admin@acme.com";

      try {
        if (isDummyAccount) {
          dbUser = await prisma.user.upsert({
            where: { email: userEmail },
            update: { name: name || undefined },
            create: {
              name: resolvedName,
              email: userEmail,
              companyName: "Acme Steel Industries",
              panNumber: "DEFAULT_PAN",
              role: "APPLICANT",
            }
          });
          
          // Seed 3 applications for testing (different risk categories)
          const existingApps = await prisma.application.findMany({
            where: { applicantId: dbUser.id }
          });
          
          if (existingApps.length < 3) {
            // Clear old incomplete seed data first
            for (const oldApp of existingApps) {
              await prisma.approvalRequirement.deleteMany({ where: { applicationId: oldApp.id } });
              await prisma.applicationReview.deleteMany({ where: { applicationId: oldApp.id } });
              await prisma.document.deleteMany({ where: { applicationId: oldApp.id } });
            }
            await prisma.application.deleteMany({ where: { applicantId: dbUser.id } });

            // App 1: Green (low risk) — eligible for video call
            await prisma.application.create({
              data: {
                id: `APP-2026-${Math.floor(Math.random() * 90000) + 10000}`,
                applicantId: dbUser.id,
                status: "IN_REVIEW",
                riskScore: 25,
                submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
                approvals: {
                  create: [
                    { department: "MIDC", approvalName: "Consent to Establish", status: "PENDING" },
                    { department: "MPCB", approvalName: "Consent to Operate (Water)", status: "PENDING" },
                  ]
                }
              }
            });

            // App 2: Orange (medium risk) — manual visit required
            await prisma.application.create({
              data: {
                id: `APP-2026-${Math.floor(Math.random() * 90000) + 10000}`,
                applicantId: dbUser.id,
                status: "IN_REVIEW",
                riskScore: 65,
                submittedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
                approvals: {
                  create: [
                    { department: "MIDC", approvalName: "Factory Building Plan Approval", status: "APPROVED" },
                    { department: "Fire Services Department", approvalName: "Provisional Fire NOC", status: "PENDING" },
                  ]
                }
              }
            });

            // App 3: Green (low risk) — also eligible for video call
            await prisma.application.create({
              data: {
                id: `APP-2026-${Math.floor(Math.random() * 90000) + 10000}`,
                applicantId: dbUser.id,
                status: "SUBMITTED",
                riskScore: 20,
                submittedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
                approvals: {
                  create: [
                    { department: "MIDC", approvalName: "Land Allotment Verification", status: "PENDING" },
                  ]
                }
              }
            });
          }
          
          // Seed an inspection for testing reschedule and video call
          const existingInspection = await prisma.inspection.findFirst({
            where: { applicantId: dbUser.id }
          });
          
          if (!existingInspection) {
            const nextWeek = new Date();
            nextWeek.setDate(nextWeek.getDate() + 7);
            nextWeek.setHours(15, 0, 0, 0);
            await prisma.inspection.create({
              data: {
                applicantId: dbUser.id,
                department: "MIDC",
                status: "SCHEDULED",
                scheduledDate: nextWeek,
              }
            });
          }
        } else {
          dbUser = await prisma.user.findUnique({
            where: { email: userEmail }
          });
          
          if (!dbUser) {
            return NextResponse.json({ success: false, error: "Account not found. Please register your business first." }, { status: 401 });
          }
        }

        if (dbUser) {
          resolvedName = dbUser.name;
          resolvedUserId = dbUser.id;
          resolvedCompanyName = dbUser.companyName || "Acme Steel Industries";
        }
      } catch (dbError) {
        console.warn("Database fallback for dummy ID:", dbError);
      }

      // Also ensure local mock state knows about this user
      addUser({ id: cleanId, name: resolvedName, companyName: resolvedCompanyName, role: "APPLICANT" });
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
      companyName: resolvedCompanyName,
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
