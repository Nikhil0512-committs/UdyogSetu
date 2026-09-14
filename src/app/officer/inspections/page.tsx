import { requireAuth } from "@/lib/auth";
import OfficerInspectionsClient from "./client";
import { getJointInspectionsForDepartment } from "@/lib/mock-data";

export default async function OfficerInspectionsPage() {
  const session = await requireAuth("OFFICER");
  // Compute the same safe ID used in StreamClientProvider
  const officerId = session.userId || session.name.replace(/[^a-zA-Z0-9]/g, "_").toLowerCase();
  const dept = session.department || "";

  // Fetch joint inspections for this department
  const jointInspections = getJointInspectionsForDepartment(dept);

  // Determine if this officer is the Lead for any inspection
  const isLead = jointInspections.some(ji => ji.leadOfficerId === officerId);

  return (
    <OfficerInspectionsClient
      officerId={officerId}
      department={dept}
      jointInspections={JSON.parse(JSON.stringify(jointInspections))}
      isLeadOfficer={isLead}
    />
  );
}
