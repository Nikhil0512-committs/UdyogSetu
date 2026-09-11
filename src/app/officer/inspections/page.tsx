import { requireAuth } from "@/lib/auth";
import OfficerInspectionsClient from "./client";
import { prisma } from "@/lib/db";

export default async function OfficerInspectionsPage() {
  const session = await requireAuth("OFFICER");
  // Compute the same safe ID used in StreamClientProvider
  const officerId = session.userId || session.name.replace(/[^a-zA-Z0-9]/g, "_").toLowerCase();
  const dept = session.department || "";

  // Fetch applications assigned to this department with their risk scores
  const apps = await prisma.application.findMany({
    where: {
      approvals: { some: { department: dept } },
      status: { in: ["IN_REVIEW", "SUBMITTED", "QUERIED"] }
    },
    include: { applicant: true },
    orderBy: { submittedAt: "desc" }
  });

  // Determine which risk categories allow video calls for this dept
  // Green & White are low-risk and allow remote video verification.
  // Red & Orange are high-risk and mandate strict physical manual visits.
  const eligibleApps = apps
    .map(a => ({
      id: a.id,
      userId: a.applicantId,
      companyName: a.applicant?.companyName || "Unknown",
      applicantName: a.applicant?.name || "Unknown",
      riskCategory: a.riskScore && a.riskScore >= 80 ? "Red" : a.riskScore && a.riskScore >= 50 ? "Orange" : "Green",
      riskScore: a.riskScore || 0
    }));

  const canVideoCall = eligibleApps.some(a => a.riskCategory === "Green" || a.riskCategory === "White");

  return <OfficerInspectionsClient officerId={officerId} department={dept} eligibleApps={eligibleApps} canVideoCall={canVideoCall} />;
}
