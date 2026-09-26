import { ADMIN_APPLICATIONS, AdminApplication } from "@/lib/admin-mock-data";
import { prisma } from "@/lib/db";
import AdminApplicationsClient from "./applications-client";

export const dynamic = "force-dynamic";

export default async function AdminApplicationsPage() {
  let dbApps: any[] = [];
  try {
    dbApps = await prisma.application.findMany({
      include: {
        applicant: true,
        unit: true,
        approvals: true,
      },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.warn("Failed to fetch real applications from DB in admin dashboard:", error);
  }

  const realApps: AdminApplication[] = dbApps.map((app) => {
    // Determine current dept, assigned officer, etc.
    const pendingApproval = app.approvals?.find(
      (a: any) => a.status === "PENDING" || a.status === "QUERIED"
    );
    const currentDept = pendingApproval ? pendingApproval.department : "—";

    // Calculate days in queue
    const submittedAt = app.submittedAt || app.createdAt;
    const daysInQueue = Math.floor(
      (new Date().getTime() - new Date(submittedAt).getTime()) / (1000 * 60 * 60 * 24)
    );
    const slaDays = 15; // default SLA

    return {
      id: app.id,
      applicantName: app.applicant?.name || "Unknown",
      companyName: app.applicant?.companyName || app.unit?.name || "Unknown Company",
      sector: app.unit?.sector || "General",
      district: app.unit?.location || "Maharashtra",
      scale: app.unit?.scale || "Small",
      riskCategory:
        (app.riskScore ?? 0) > 70 ? "Red" : (app.riskScore ?? 0) > 40 ? "Orange" : "Green",
      submittedAt: submittedAt.toISOString(),
      status: app.status as any,
      currentDepartment: currentDept,
      assignedOfficer: "Pending Assignment", // Could be mapped from officer if available
      daysInQueue,
      slaDays,
      isDelayed: daysInQueue > slaDays,
      delayReason: daysInQueue > slaDays ? "Exceeded standard SLA processing time" : undefined,
      approvals:
        app.approvals?.map((a: any) => ({
          department: a.department,
          approvalName: a.approvalName,
          status: a.status as any,
          assignedOfficer: "Pending",
          receivedAt: submittedAt.toISOString(),
          daysElapsed: daysInQueue,
          slaDays: 15,
          isOverdue: daysInQueue > 15 && a.status === "PENDING",
        })) || [],
    };
  });

  const mergedApps = [...realApps, ...ADMIN_APPLICATIONS];

  return <AdminApplicationsClient initialData={mergedApps} />;
}
