import { getSession } from "@/lib/auth";
import MeetingRoom from "@/components/MeetingRoom";
import { redirect } from "next/navigation";

export default async function MeetingPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  
  if (!session) {
    redirect("/login");
  }

  const { id } = await params;

  // Generate a safe user ID (no spaces or special chars for Stream)
  const safeUserId = session.role === "APPLICANT" 
    ? "app-user-1" 
    : (session.userId || session.name.replace(/[^a-zA-Z0-9]/g, "_").toLowerCase());

  const userName = session.role === "OFFICER" && session.department 
    ? session.department 
    : session.name;

  return (
    <MeetingRoom callId={id} userId={safeUserId} userName={userName} />
  );
}
