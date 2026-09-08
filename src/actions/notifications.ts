"use server";

import { addNotification } from "@/lib/mock-data";

interface ReschedulePayload {
  to: "applicant" | "officer";
  newDate: string;
  newTime: string;
  reason: string;
  initiator: string;
}

export async function notifyReschedule({ to, newDate, newTime, reason, initiator }: ReschedulePayload) {
  const formattedDate = new Date(`${newDate}T${newTime}`).toLocaleString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const title = `Inspection Rescheduled by ${initiator}`;
  const message = `Your video verification has been rescheduled to ${formattedDate}.${reason ? ` Reason: ${reason}` : ""}`;

  // In a real app, you'd look up the recipient and send via email/push.
  // For this prototype, we write to the in-memory notification store.
  addNotification({
    title,
    message,
    type: "WARNING",
    link: to === "applicant" ? "/dashboard/inspections" : "/officer/inspections",
  });

  return { success: true };
}
