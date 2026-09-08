import { requireAuth } from "@/lib/auth";
import { getAllApplications } from "@/lib/mock-data";
import ApplicationsClient from "./client";

export default async function ApplicationsPage() {
  const session = await requireAuth("APPLICANT");
  
  // Fetch real applications from the mock database, filtering by this applicant
  const allApps = getAllApplications();
  const applications = allApps.filter(app => app.applicantName === session.name);

  // Map the backend model to the frontend display model
  const mappedApplications = applications.map(app => {
    // Determine category based on sector/approval
    let category: "Environment" | "Safety" | "Utilities" | "Labour" | "Land" = "Utilities";
    if (app.sector.toLowerCase().includes("environment") || app.sector.toLowerCase().includes("pollution")) category = "Environment";
    else if (app.sector.toLowerCase().includes("factory") || app.sector.toLowerCase().includes("labour")) category = "Labour";
    else if (app.sector.toLowerCase().includes("fire") || app.sector.toLowerCase().includes("safety")) category = "Safety";
    else if (app.sector.toLowerCase().includes("land") || app.sector.toLowerCase().includes("forest")) category = "Land";

    return {
      id: app.id,
      approvalName: `Universal Application - ${app.sector}`,
      department: "Multiple Departments",
      deptShort: "Multi",
      status: app.status as any,
      submittedDate: new Date(app.submittedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      rawSubmittedDate: app.submittedAt,
      eta: app.status === "APPROVED" ? "Issued" : (app.status === "QUERIED" ? "Response Needed" : "7-14 Days"),
      etaDaysLeft: app.status === "APPROVED" ? "Completed" : (app.status === "QUERIED" ? "Action Required" : "On track"),
      category,
      queryNote: app.approvals.find(a => a.status === "REJECTED" || a.status === "QUERIED")?.officerNotes
    };
  });

  return <ApplicationsClient initialApplications={mappedApplications} />;
}
