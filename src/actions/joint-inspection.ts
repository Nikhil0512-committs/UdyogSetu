"use server";

import { getSession } from "@/lib/auth";
import {
  getJointInspectionById,
  getJointInspectionsForDepartment,
  getJointInspectionsForApplicant,
  getJointInspectionByCallId,
  updateJointInspectionStatus,
  setJointInspectionCallId,
  markDeptJoined,
  updateDeptDecision,
  addNotification,
  requestJointReschedule,
  approveJointReschedule,
  rejectJointReschedule,
  type JointInspectionSession,
} from "@/lib/mock-data";
import { ensureStreamUsers } from "@/actions/stream";
import { revalidatePath } from "next/cache";

/**
 * Fetch joint inspections relevant to the current user.
 * Officers see inspections for their department; applicants see their own.
 */
export async function fetchJointInspections(): Promise<JointInspectionSession[]> {
  const session = await getSession();
  if (!session) return [];

  if (session.role === "OFFICER" && session.department) {
    return getJointInspectionsForDepartment(session.department);
  } else if (session.role === "APPLICANT" && session.userId) {
    return getJointInspectionsForApplicant(session.userId);
  }

  return [];
}

/**
 * Fetch a single joint inspection by ID.
 */
export async function fetchJointInspectionById(id: string): Promise<JointInspectionSession | null> {
  return getJointInspectionById(id) || null;
}

/**
 * Fetch a joint inspection by its Stream call ID (used inside meeting room).
 */
export async function fetchJointInspectionByCallId(callId: string): Promise<JointInspectionSession | null> {
  return getJointInspectionByCallId(callId) || null;
}

/**
 * Start a joint inspection call — the Lead Officer triggers this.
 * 1. Upserts all participants into Stream
 * 2. Creates a Stream call with ring:true for all dept officers + applicant
 * 3. Updates the session status to IN_PROGRESS
 * Returns the Stream callId for navigation.
 */
export async function startJointInspectionCall(inspectionId: string): Promise<{ callId: string }> {
  const session = await getSession();
  if (!session || session.role !== "OFFICER") {
    throw new Error("Unauthorized: Only officers can start inspections");
  }

  const inspection = getJointInspectionById(inspectionId);
  if (!inspection) {
    throw new Error("Joint inspection not found");
  }

  if (inspection.leadOfficerId !== session.userId) {
    throw new Error("Only the Lead Officer can start this joint inspection");
  }

  // Build the list of all users who need to be in the call
  const allUsers: { id: string; name: string }[] = [];

  // Add Lead Officer (current user)
  allUsers.push({
    id: session.userId,
    name: session.department || session.name,
  });

  // Add all department officers
  for (const dept of inspection.departments) {
    if (dept.officerId && dept.officerId !== session.userId) {
      allUsers.push({
        id: dept.officerId,
        name: dept.officerName || `Officer (${dept.department})`,
      });
    }
  }

  // Add the applicant
  allUsers.push({
    id: inspection.applicantId,
    name: inspection.applicantName,
  });

  // Upsert all users into Stream's database
  await ensureStreamUsers(allUsers);

  // Generate a unique call ID
  const callId = `joint-${inspectionId}-${Date.now()}`;

  // Update the inspection record
  setJointInspectionCallId(inspectionId, callId);
  updateJointInspectionStatus(inspectionId, "IN_PROGRESS");
  markDeptJoined(inspectionId, session.department || "", session.userId);

  // Notify the applicant
  addNotification({
    title: "Joint Inspection Starting",
    message: `A joint inspection for your application ${inspection.applicationId} is starting now. Multiple department officers are joining.`,
    type: "INFO",
    link: "/dashboard/inspections",
  });

  revalidatePath("/officer/inspections");
  revalidatePath("/dashboard/inspections");

  return { callId };
}

/**
 * Get Stream call members for a joint inspection.
 * Returns { members, applicantId } for the caller to create the call.
 */
export async function getJointInspectionCallMembers(inspectionId: string): Promise<{
  members: { user_id: string; role: string }[];
  applicantId: string;
}> {
  const session = await getSession();
  if (!session) throw new Error("Not authenticated");

  const inspection = getJointInspectionById(inspectionId);
  if (!inspection) throw new Error("Inspection not found");

  const members: { user_id: string; role: string }[] = [];

  // Lead officer is admin
  members.push({ user_id: inspection.leadOfficerId, role: "admin" });

  // All other dept officers are users
  for (const dept of inspection.departments) {
    if (dept.officerId && dept.officerId !== inspection.leadOfficerId) {
      members.push({ user_id: dept.officerId, role: "user" });
    }
  }

  // Applicant is a user
  if (!members.find(m => m.user_id === inspection.applicantId)) {
    members.push({ user_id: inspection.applicantId, role: "user" });
  }

  return { members, applicantId: inspection.applicantId };
}

/**
 * Submit a department's decision during a joint inspection call.
 */
export async function submitDeptDecision(
  inspectionId: string,
  decision: "APPROVED" | "REJECTED" | "QUERIED",
  comments: string
): Promise<JointInspectionSession | null> {
  const session = await getSession();
  if (!session || session.role !== "OFFICER" || !session.department) {
    throw new Error("Unauthorized");
  }

  const updated = updateDeptDecision(inspectionId, session.department, decision, comments);
  
  revalidatePath("/officer/inspections");
  revalidatePath("/dashboard/inspections");

  return updated || null;
}

/**
 * Mark a department officer as having joined the call.
 */
export async function joinJointInspection(inspectionId: string): Promise<void> {
  const session = await getSession();
  if (!session || session.role !== "OFFICER" || !session.department) {
    throw new Error("Unauthorized");
  }

  markDeptJoined(inspectionId, session.department, session.userId);
  revalidatePath("/officer/inspections");
}

/**
 * Get the current state of a joint inspection (for polling in the meeting room).
 */
export async function pollJointInspectionState(inspectionId: string): Promise<JointInspectionSession | null> {
  return getJointInspectionById(inspectionId) || null;
}

/**
 * Request to reschedule a joint inspection
 */
export async function submitJointRescheduleRequest(
  inspectionId: string,
  newDate: string,
  newTime: string,
  reason: string,
  initiator: "APPLICANT" | "OFFICER"
) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");
  
  const proposedFormatted = new Date(`${newDate}T${newTime}:00`).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  requestJointReschedule(inspectionId, newDate, newTime, proposedFormatted, reason, initiator);
  
  revalidatePath("/dashboard/inspections");
  revalidatePath("/officer/inspections");
  return { success: true };
}

/**
 * Approve a joint inspection reschedule request
 */
export async function approveJointRescheduleRequest(inspectionId: string) {
  const session = await getSession();
  if (!session || session.role !== "OFFICER") throw new Error("Unauthorized");

  approveJointReschedule(inspectionId);

  revalidatePath("/dashboard/inspections");
  revalidatePath("/officer/inspections");
  return { success: true };
}

/**
 * Reject a joint inspection reschedule request
 */
export async function rejectJointRescheduleRequest(inspectionId: string) {
  const session = await getSession();
  if (!session || session.role !== "OFFICER") throw new Error("Unauthorized");

  rejectJointReschedule(inspectionId);

  revalidatePath("/dashboard/inspections");
  revalidatePath("/officer/inspections");
  return { success: true };
}
