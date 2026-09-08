import { getSession } from "@/lib/auth";
import MeetingRoom from "@/components/MeetingRoom";
import { redirect } from "next/navigation";

export default async function MeetingPage({ params }: { params: { id: string } }) {
  const session = await getSession();
  
  if (!session) {
    redirect("/login");
  }

  // Generate a safe user ID (no spaces or special chars for Stream)
  const safeUserId = session.id || session.name.replace(/[^a-zA-Z0-9]/g, "_").toLowerCase();

  return (
    <MeetingRoom callId={params.id} userId={safeUserId} userName={session.name} />
  );
}
