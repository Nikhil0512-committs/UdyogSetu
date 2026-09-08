import { requireAuth } from "@/lib/auth";
import OfficerInspectionsClient from "./client";

export default async function OfficerInspectionsPage() {
  const session = await requireAuth("OFFICER");
  // Compute the same safe ID used in StreamClientProvider
  const officerId = session.userId || session.name.replace(/[^a-zA-Z0-9]/g, "_").toLowerCase();

  return <OfficerInspectionsClient officerId={officerId} />;
}
