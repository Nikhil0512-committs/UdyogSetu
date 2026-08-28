import { NextResponse } from "next/server";
import { addNotification } from "@/lib/mock-data";

export async function POST(request: Request) {
  const body = await request.json();
  const { date, time, reason } = body;
  
  // This sends a notification to the mock database which officers can see
  addNotification({
    title: "Reschedule Request: Labour Dept",
    message: `Applicant has requested to reschedule the video verification to ${date} at ${time}. Reason: ${reason || 'Not provided'}. Please review and approve.`,
    type: "WARNING",
  });

  return NextResponse.json({ success: true });
}
