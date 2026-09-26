import { ADMIN_KPIS, RECENT_ACTIVITY, AdminKPIs, RecentActivityItem } from "@/lib/admin-mock-data";
import { prisma } from "@/lib/db";
import AdminDashboardClient from "./dashboard-client";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  let dbApps: any[] = [];
  try {
    dbApps = await prisma.application.findMany({
      include: { applicant: true, unit: true },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.warn("Failed to fetch real applications from DB for admin dashboard:", error);
  }

  // Calculate live DB stats
  const dbTotal = dbApps.length;
  const dbInReview = dbApps.filter(a => a.status === "IN_REVIEW").length;
  const dbApproved = dbApps.filter(a => a.status === "APPROVED").length;
  
  // A rough estimate for delays in DB
  const dbDelayed = dbApps.filter(a => {
    const submittedAt = a.submittedAt || a.createdAt;
    const days = Math.floor((new Date().getTime() - new Date(submittedAt).getTime()) / (1000 * 60 * 60 * 24));
    return days > 15;
  }).length;

  const combinedKpis: AdminKPIs = {
    ...ADMIN_KPIS,
    totalApplications: ADMIN_KPIS.totalApplications + dbTotal,
    totalInReview: ADMIN_KPIS.totalInReview + dbInReview,
    totalApproved: ADMIN_KPIS.totalApproved + dbApproved,
    totalDelayed: ADMIN_KPIS.totalDelayed + dbDelayed,
    applicationsThisMonth: ADMIN_KPIS.applicationsThisMonth + dbTotal,
  };

  // Convert real recent applications into recent activity format
  const recentRealApps: RecentActivityItem[] = dbApps.slice(0, 5).map(app => {
    const isApproved = app.status === "APPROVED";
    return {
      id: `real-${app.id}`,
      type: isApproved ? "APPROVAL" : "SUBMISSION",
      title: isApproved ? "Application Approved" : "New Application Submitted",
      description: `${app.applicant?.companyName || "An applicant"} ${isApproved ? "was approved" : "submitted a new application"} for ${app.unit?.sector || "processing"}.`,
      department: "Cross-Department",
      timestamp: (app.submittedAt || app.createdAt).toISOString(),
      applicationId: app.id,
    };
  });

  // Combine real DB activity with mock activity, sorted by timestamp
  const combinedActivity = [...recentRealApps, ...RECENT_ACTIVITY].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  ).slice(0, 8); // Keep top 8

  return <AdminDashboardClient kpis={combinedKpis} recentActivity={combinedActivity} />;
}
