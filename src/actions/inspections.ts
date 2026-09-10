"use server";

import { prisma } from "@/lib/db";
import { addNotification, updateMeetingSchedule, getMeetingSchedule, globalAny } from "@/lib/mock-data";
import { revalidatePath } from "next/cache";

interface RescheduleRequest {
  newDate: string;
  newTime: string;
  reason: string;
  initiator: "APPLICANT" | "OFFICER";
}

// Ensure mock global state has a pending status field
if (!globalAny.mockMeetingSchedule.status) {
  globalAny.mockMeetingSchedule.status = "SCHEDULED";
  globalAny.mockMeetingSchedule.proposedDate = null;
  globalAny.mockMeetingSchedule.proposedTime = null;
  globalAny.mockMeetingSchedule.reason = null;
  globalAny.mockMeetingSchedule.initiator = null;
}

import { getSession } from "@/lib/auth";

export async function fetchInspectionSchedule() {
  try {
    const session = await getSession();
    const isOfficer = session?.role === "OFFICER";
    
    // Try to get from database first
    const inspection = await prisma.inspection.findFirst({
      where: isOfficer && session?.department ? { department: session.department } : (session?.userId ? { applicantId: session.userId } : {}),
      orderBy: { createdAt: "desc" },
      include: { applicant: true }
    });
    if (inspection) {
      const scheduledDate = inspection.scheduledDate;
      const date = scheduledDate.toISOString().split("T")[0];
      const time = scheduledDate.toTimeString().split(" ")[0].slice(0, 5);
      const formatted = scheduledDate.toLocaleString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
      
      let proposedDateStr = null;
      let proposedTimeStr = null;
      let proposedFormatted = null;
      if (inspection.proposedDate) {
        proposedDateStr = inspection.proposedDate.toISOString().split("T")[0];
        proposedTimeStr = inspection.proposedDate.toTimeString().split(" ")[0].slice(0, 5);
        proposedFormatted = inspection.proposedDate.toLocaleString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
      }

      return {
        id: inspection.id,
        date,
        time,
        formatted,
        status: inspection.status, // SCHEDULED, RESCHEDULE_REQUESTED
        proposedDate: proposedDateStr,
        proposedTime: proposedTimeStr,
        proposedFormatted,
        reason: inspection.rescheduleReason,
        initiator: inspection.initiator,
        applicantName: inspection.applicant?.name || "Rahul Sharma",
        companyName: inspection.applicant?.companyName || "Acme Steel Industries",
      };
    }
  } catch (err) {
    // Database might not be migrated locally, fall back to mock
  }

  // Fallback to mock data
  const s = getMeetingSchedule();
  return {
    id: "mock-id",
    ...s,
    status: globalAny.mockMeetingSchedule.status,
    proposedDate: globalAny.mockMeetingSchedule.proposedDate,
    proposedTime: globalAny.mockMeetingSchedule.proposedTime,
    proposedFormatted: globalAny.mockMeetingSchedule.proposedFormatted,
    reason: globalAny.mockMeetingSchedule.reason,
    initiator: globalAny.mockMeetingSchedule.initiator,
    applicantName: "Rahul Sharma",
    companyName: "Acme Steel Industries",
  };
}

export async function requestReschedule(payload: RescheduleRequest) {
  try {
    const session = await getSession();
    const isOfficer = session?.role === "OFFICER";
    
    const proposedDateTime = new Date(`${payload.newDate}T${payload.newTime}:00`);
    const inspection = await prisma.inspection.findFirst({
      where: isOfficer && session?.department ? { department: session.department } : (session?.userId ? { applicantId: session.userId } : {}),
      orderBy: { createdAt: "desc" },
    });

    if (inspection) {
      if (payload.initiator === "OFFICER") {
        // Officer can forcibly change the schedule
        await prisma.inspection.update({
          where: { id: inspection.id },
          data: {
            scheduledDate: proposedDateTime,
            status: "SCHEDULED",
            proposedDate: null,
            rescheduleReason: null,
            initiator: null,
          },
        });
      } else {
        // Applicant requests reschedule
        await prisma.inspection.update({
          where: { id: inspection.id },
          data: {
            status: "RESCHEDULE_REQUESTED",
            proposedDate: proposedDateTime,
            rescheduleReason: payload.reason,
            initiator: payload.initiator,
          },
        });
      }
    } else {
      throw new Error("No inspection found in DB");
    }
  } catch (err) {
    if (payload.initiator === "OFFICER") {
      // Officer forces change
      updateMeetingSchedule(payload.newDate, payload.newTime);
      globalAny.mockMeetingSchedule.status = "SCHEDULED";
      globalAny.mockMeetingSchedule.proposedDate = null;
      globalAny.mockMeetingSchedule.proposedTime = null;
      globalAny.mockMeetingSchedule.reason = null;
      globalAny.mockMeetingSchedule.initiator = null;
    } else {
      // Applicant requests change
      globalAny.mockMeetingSchedule.status = "RESCHEDULE_REQUESTED";
      globalAny.mockMeetingSchedule.proposedDate = payload.newDate;
      globalAny.mockMeetingSchedule.proposedTime = payload.newTime;
      
      const formatted = new Date(`${payload.newDate}T${payload.newTime}:00`).toLocaleString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
      globalAny.mockMeetingSchedule.proposedFormatted = formatted;
      globalAny.mockMeetingSchedule.reason = payload.reason;
      globalAny.mockMeetingSchedule.initiator = payload.initiator;
    }
  }

  // Notifications
  if (payload.initiator === "APPLICANT") {
    addNotification({
      title: "Reschedule Requested",
      message: `Applicant requested to reschedule inspection to ${payload.newDate} ${payload.newTime}. Reason: ${payload.reason}`,
      type: "WARNING",
      link: "/officer/inspections",
    });
  } else {
    addNotification({
      title: "Inspection Rescheduled",
      message: `Officer has rescheduled your inspection to ${payload.newDate} ${payload.newTime}.`,
      type: "WARNING",
      link: "/dashboard/inspections",
    });
  }

  revalidatePath("/dashboard/inspections");
  revalidatePath("/officer/inspections");
  
  return { success: true };
}

export async function approveReschedule() {
  try {
    const session = await getSession();
    const isOfficer = session?.role === "OFFICER";

    const inspection = await prisma.inspection.findFirst({
      where: isOfficer && session?.department ? { department: session.department } : (session?.userId ? { applicantId: session.userId } : {}),
      orderBy: { createdAt: "desc" },
    });

    if (inspection && inspection.proposedDate) {
      await prisma.inspection.update({
        where: { id: inspection.id },
        data: {
          scheduledDate: inspection.proposedDate,
          status: "SCHEDULED",
          proposedDate: null,
          rescheduleReason: null,
          initiator: null,
        },
      });
    } else {
      throw new Error("No inspection found in DB");
    }
  } catch (err) {
    if (globalAny.mockMeetingSchedule.proposedDate) {
      updateMeetingSchedule(
        globalAny.mockMeetingSchedule.proposedDate,
        globalAny.mockMeetingSchedule.proposedTime
      );
    }
    globalAny.mockMeetingSchedule.status = "SCHEDULED";
    globalAny.mockMeetingSchedule.proposedDate = null;
    globalAny.mockMeetingSchedule.proposedTime = null;
    globalAny.mockMeetingSchedule.reason = null;
    globalAny.mockMeetingSchedule.initiator = null;
  }

  addNotification({
    title: "Reschedule Approved",
    message: `The officer approved your requested reschedule.`,
    type: "SUCCESS",
    link: "/dashboard/inspections",
  });

  revalidatePath("/dashboard/inspections");
  revalidatePath("/officer/inspections");

  return { success: true };
}

export async function rejectReschedule() {
  try {
    const session = await getSession();
    const isOfficer = session?.role === "OFFICER";

    const inspection = await prisma.inspection.findFirst({
      where: isOfficer && session?.department ? { department: session.department } : (session?.userId ? { applicantId: session.userId } : {}),
      orderBy: { createdAt: "desc" },
    });

    if (inspection) {
      await prisma.inspection.update({
        where: { id: inspection.id },
        data: {
          status: "SCHEDULED",
          proposedDate: null,
          rescheduleReason: null,
          initiator: null,
        },
      });
    } else {
      throw new Error("No inspection found in DB");
    }
  } catch (err) {
    globalAny.mockMeetingSchedule.status = "SCHEDULED";
    globalAny.mockMeetingSchedule.proposedDate = null;
    globalAny.mockMeetingSchedule.proposedTime = null;
    globalAny.mockMeetingSchedule.reason = null;
    globalAny.mockMeetingSchedule.initiator = null;
  }

  addNotification({
    title: "Reschedule Rejected",
    message: `The officer rejected your reschedule request. The original schedule remains.`,
    type: "WARNING",
    link: "/dashboard/inspections",
  });

  revalidatePath("/dashboard/inspections");
  revalidatePath("/officer/inspections");

  return { success: true };
}
