"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Video, CheckCircle2, Clock, User, ChevronRight,
  Building2, Users, Phone, Shield, AlertTriangle,
  PlayCircle, Loader2
} from "lucide-react";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useStreamVideoClient } from "@stream-io/video-react-sdk";
import type { JointInspectionSession } from "@/lib/mock-data";

interface Props {
  officerId: string;
  department: string;
  jointInspections: JointInspectionSession[];
  offlineSchedule?: any;
  isLeadOfficer: boolean;
}

export default function OfficerInspectionsClient({ officerId, department, jointInspections, offlineSchedule, isLeadOfficer }: Props) {
  const [selectedInspection, setSelectedInspection] = useState<JointInspectionSession | null>(jointInspections[0] || null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const router = useRouter();
  const client = useStreamVideoClient();
  const [isProcessingReschedule, setIsProcessingReschedule] = useState(false);

  const isLeadForSelected = selectedInspection?.leadOfficerId === officerId;
  const myDeptInSelected = selectedInspection?.departments.find(d => d.department === department);

  const riskColors: Record<string, string> = {
    Red: "bg-red-100 text-red-800 border-red-200",
    Orange: "bg-orange-100 text-orange-800 border-orange-200",
    Green: "bg-emerald-100 text-emerald-800 border-emerald-200",
    White: "bg-slate-100 text-slate-700 border-slate-200",
  };

  const statusColors: Record<string, string> = {
    PENDING: "bg-amber-100 text-amber-800 border-amber-200",
    IN_PROGRESS: "bg-blue-100 text-blue-800 border-blue-200",
    COMPLETED: "bg-emerald-100 text-emerald-800 border-emerald-200",
    CANCELLED: "bg-slate-100 text-slate-500 border-slate-200",
  };

  const deptDecisionIcon = (decision: string | null) => {
    if (!decision) return <Clock className="h-4 w-4 text-slate-400" />;
    if (decision === "APPROVED") return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
    if (decision === "REJECTED") return <AlertTriangle className="h-4 w-4 text-red-500" />;
    return <Clock className="h-4 w-4 text-amber-500" />;
  };

  const handleStartJointInspection = async () => {
    if (!client || !selectedInspection) return;
    setIsStarting(true);

    try {
      // 1. Call server action to prepare the call and upsert users
      const { startJointInspectionCall, getJointInspectionCallMembers } = await import("@/actions/joint-inspection");
      const { callId } = await startJointInspectionCall(selectedInspection.id);

      // 2. Get call members
      const { members } = await getJointInspectionCallMembers(selectedInspection.id);

      // 3. Create the Stream call with ring:true so all officers get the incoming call modal
      const call = client.call("default", callId);
      await call.getOrCreate({ ring: true, data: { members } });

      toast.success("Joint Inspection started! Ringing all department officers...");
      setConfirmDialogOpen(false);

      // 4. Navigate to the meeting room
      router.push(`/meeting/${callId}`);
    } catch (err: any) {
      console.error("Failed to start joint inspection:", err);
      toast.error(`Failed to start: ${err?.message ?? "Unknown error"}`);
    } finally {
      setIsStarting(false);
    }
  };

  const handleJoinInspection = async () => {
    if (!client || !selectedInspection || !selectedInspection.streamCallId) return;
    setIsJoining(true);

    try {
      // Mark this department as joined
      const { joinJointInspection } = await import("@/actions/joint-inspection");
      await joinJointInspection(selectedInspection.id);

      // Navigate to the existing call
      router.push(`/meeting/${selectedInspection.streamCallId}`);
    } catch (err: any) {
      toast.error(`Failed to join: ${err?.message ?? "Unknown error"}`);
    } finally {
      setIsJoining(false);
    }
  };

  const handleApproveReschedule = async () => {
    if (!selectedInspection) return;
    setIsProcessingReschedule(true);
    try {
      const { approveJointRescheduleRequest } = await import("@/actions/joint-inspection");
      await approveJointRescheduleRequest(selectedInspection.id);
      toast.success("Reschedule request approved!");
      // The page will revalidate and update the state
      window.location.reload(); // Simple force refresh to get new mock state
    } catch (err: any) {
      toast.error(`Failed to approve: ${err?.message ?? "Unknown error"}`);
    } finally {
      setIsProcessingReschedule(false);
    }
  };

  const handleRejectReschedule = async () => {
    if (!selectedInspection) return;
    setIsProcessingReschedule(true);
    try {
      const { rejectJointRescheduleRequest } = await import("@/actions/joint-inspection");
      await rejectJointRescheduleRequest(selectedInspection.id);
      toast.success("Reschedule request rejected.");
      window.location.reload();
    } catch (err: any) {
      toast.error(`Failed to reject: ${err?.message ?? "Unknown error"}`);
    } finally {
      setIsProcessingReschedule(false);
    }
  };

  const handleApproveOfflineReschedule = async () => {
    setIsProcessingReschedule(true);
    try {
      const { approveReschedule } = await import("@/actions/inspections");
      await approveReschedule(); // backend infers user context
      toast.success("Offline reschedule request approved!");
      window.location.reload();
    } catch (err: any) {
      toast.error(`Failed to approve: ${err?.message ?? "Unknown error"}`);
    } finally {
      setIsProcessingReschedule(false);
    }
  };

  const handleRejectOfflineReschedule = async () => {
    setIsProcessingReschedule(true);
    try {
      const { rejectReschedule } = await import("@/actions/inspections");
      await rejectReschedule();
      toast.success("Offline reschedule request rejected.");
      window.location.reload();
    } catch (err: any) {
      toast.error(`Failed to reject: ${err?.message ?? "Unknown error"}`);
    } finally {
      setIsProcessingReschedule(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Joint Inspections</h1>
        <p className="text-slate-600 mt-2">
          Coordinated multi-department video inspections — one visit, all approvals.
        </p>
      </div>

      {/* Info Banner */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
          <Users className="h-5 w-5 text-blue-600" />
        </div>
        <div>
          <h3 className="font-semibold text-blue-900 text-sm">How Joint Inspections Work</h3>
          <p className="text-blue-700 text-xs mt-1 leading-relaxed">
            The <strong>Lead Officer</strong> visits the factory site and starts a multi-party video call.
            All required department officers are rung simultaneously and join the same call.
            Each department can approve, reject, or query directly during the call — saving time for everyone.
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-12">
        {/* Left Panel: Inspection Queue */}
        <Card className="flex flex-col h-full md:col-span-5 lg:col-span-4 border-slate-200 shadow-sm">
          <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
            <CardTitle className="text-lg flex items-center gap-2 text-slate-900">
              <Shield className="h-5 w-5 text-indigo-600" />
              Inspection Queue
            </CardTitle>
            <CardDescription className="text-xs">
              Joint inspections involving {department || "your department"}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 flex-grow overflow-y-auto">
            {jointInspections.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <Users className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                <p className="font-medium">No inspections scheduled</p>
                <p className="text-xs text-slate-400 mt-1">Joint inspections will appear here</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {jointInspections.map(ji => {
                  const isSelected = selectedInspection?.id === ji.id;
                  const isLead = ji.leadOfficerId === officerId;
                  const deptCount = ji.departments.length;
                  const approvedCount = ji.departments.filter(d => d.decision === "APPROVED").length;

                  return (
                    <div
                      key={ji.id}
                      onClick={() => setSelectedInspection(ji)}
                      className={`p-4 cursor-pointer transition-colors relative
                        ${isSelected ? 'bg-indigo-50 border-l-4 border-l-indigo-600' : 'hover:bg-slate-50 border-l-4 border-l-transparent'}
                      `}
                    >
                      <div className="pr-6">
                        <p className={`font-bold text-sm ${isSelected ? 'text-indigo-900' : 'text-slate-900'}`}>
                          {ji.companyName}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {ji.applicantName} • {ji.applicationId}
                        </p>
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${riskColors[ji.riskCategory] || riskColors.Green}`}>
                            {ji.riskCategory}
                          </span>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${statusColors[ji.status]}`}>
                            {ji.status.replace("_", " ")}
                          </span>
                          {isLead && (
                            <Badge className="bg-indigo-100 text-indigo-800 border-indigo-200 text-[9px]">
                              Lead Officer
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-1 mt-2 text-xs text-slate-500">
                          <Users className="h-3 w-3" />
                          <span>{approvedCount}/{deptCount} approved</span>
                          <span className="mx-1">•</span>
                          <Clock className="h-3 w-3" />
                          <span>{ji.scheduledFormatted}</span>
                        </div>
                      </div>
                      {isSelected && <ChevronRight className="h-5 w-5 text-indigo-400 absolute right-4 top-1/2 -translate-y-1/2" />}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right Panel: Inspection Detail */}
        <Card className="flex flex-col h-full md:col-span-7 lg:col-span-8 border-slate-200 shadow-sm">
          {!selectedInspection ? (
            <div className="flex flex-col items-center justify-center h-full min-h-[500px] text-slate-400">
              <Video className="h-12 w-12 mb-4 text-slate-200" />
              <p>Select an inspection from the queue.</p>
            </div>
          ) : (
            <>
              <CardHeader className="border-b border-slate-100 pb-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-xl flex items-center gap-2 text-slate-900">
                      <Video className="h-5 w-5 text-blue-600" />
                      Joint Inspection Room
                    </CardTitle>
                    <CardDescription>
                      <span className="font-semibold text-slate-700">{selectedInspection.companyName}</span>
                      {" — "}
                      <span className="text-slate-500">{selectedInspection.applicantName}</span>
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    {isLeadForSelected && (
                      <Badge className="bg-indigo-100 text-indigo-800 border-indigo-200">
                        <Shield className="h-3 w-3 mr-1" />
                        You are Lead
                      </Badge>
                    )}
                    <Badge variant="outline" className={statusColors[selectedInspection.status]}>
                      {selectedInspection.status.replace("_", " ")}
                    </Badge>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-5 flex-grow pt-6 overflow-y-auto">
                {/* Reschedule Request Panel */}
                {selectedInspection.status === "RESCHEDULE_REQUESTED" && (
                  <div className="rounded-lg border-2 border-amber-300 bg-amber-50 p-5">
                    <h3 className="font-semibold text-amber-900 text-lg flex items-center gap-2 mb-3">
                      <AlertTriangle className="h-5 w-5 text-amber-600" />
                      Reschedule Requested
                    </h3>
                    <p className="text-sm text-amber-800 mb-4">
                      The applicant has requested to reschedule this inspection to <strong>{selectedInspection.proposedFormatted}</strong>.
                      <br/>
                      <span className="text-xs">Reason: {selectedInspection.rescheduleReason || "No reason provided"}</span>
                    </p>
                    {isLeadForSelected ? (
                      <div className="flex gap-3">
                        <Button 
                          onClick={handleApproveReschedule} 
                          disabled={isProcessingReschedule} 
                          className="bg-amber-600 hover:bg-amber-700 text-white"
                        >
                          Approve Reschedule
                        </Button>
                        <Button 
                          onClick={handleRejectReschedule} 
                          disabled={isProcessingReschedule} 
                          variant="outline" 
                          className="border-amber-400 text-amber-700 hover:bg-amber-100"
                        >
                          Reject
                        </Button>
                      </div>
                    ) : (
                      <p className="text-xs text-amber-700 font-semibold bg-amber-100 p-2 rounded inline-block">
                        Waiting for Lead Officer ({selectedInspection.leadDepartment}) to respond to the request.
                      </p>
                    )}
                  </div>
                )}

                {/* Inspection Info */}
                <div className="rounded-lg border bg-slate-50 p-5">
                  <h3 className="font-semibold text-slate-900 text-lg flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-indigo-600" />
                    Multi-Department Coordinated Inspection
                  </h3>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="space-y-1">
                      <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Lead Department</p>
                      <p className="text-sm font-medium text-slate-800">
                        {selectedInspection.leadDepartment}
                        {isLeadForSelected && " (You)"}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Scheduled</p>
                      <p className="text-sm font-medium text-slate-800 flex items-center gap-2">
                        <Clock className="h-4 w-4 text-blue-500" />
                        {selectedInspection.scheduledFormatted}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Application</p>
                      <p className="text-sm font-medium text-slate-800">{selectedInspection.applicationId}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Risk Category</p>
                      <p className="text-sm font-medium">
                        <span className={`px-2 py-0.5 rounded-full text-xs border ${riskColors[selectedInspection.riskCategory]}`}>
                          {selectedInspection.riskCategory}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Department Participants Panel */}
                <div className="rounded-lg border bg-white p-5">
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-4">
                    <Users className="h-4 w-4 text-indigo-500" />
                    Department Participants ({selectedInspection.departments.length})
                  </h4>
                  <div className="space-y-2">
                    {selectedInspection.departments.map((dept, i) => {
                      const isMyDept = dept.department === department;
                      return (
                        <div
                          key={i}
                          className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                            isMyDept
                              ? "bg-indigo-50 border-indigo-200"
                              : "bg-slate-50 border-slate-200"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              dept.joined ? "bg-emerald-100" : "bg-slate-100"
                            }`}>
                              <Building2 className={`h-4 w-4 ${dept.joined ? "text-emerald-600" : "text-slate-400"}`} />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-slate-900 flex items-center gap-2">
                                {dept.department}
                                {isMyDept && (
                                  <span className="text-[10px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded-full font-semibold">
                                    Your Dept
                                  </span>
                                )}
                                {dept.department === selectedInspection.leadDepartment && (
                                  <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full font-semibold">
                                    Lead
                                  </span>
                                )}
                              </p>
                              <p className="text-xs text-slate-500 mt-0.5">
                                {dept.officerName || "Officer unassigned"}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {dept.decision ? (
                              <div className="flex items-center gap-1.5">
                                {deptDecisionIcon(dept.decision)}
                                <span className={`text-xs font-semibold ${
                                  dept.decision === "APPROVED" ? "text-emerald-700" :
                                  dept.decision === "REJECTED" ? "text-red-700" :
                                  "text-amber-700"
                                }`}>
                                  {dept.decision}
                                </span>
                              </div>
                            ) : dept.joined ? (
                              <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]">
                                <span className="relative flex h-2 w-2 mr-1">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
                                </span>
                                Connected
                              </Badge>
                            ) : selectedInspection.status === "IN_PROGRESS" ? (
                              <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-[10px] animate-pulse">
                                <Phone className="h-3 w-3 mr-1" />
                                Ringing...
                              </Badge>
                            ) : (
                              <Badge className="bg-slate-50 text-slate-500 border-slate-200 text-[10px]">
                                Waiting
                              </Badge>
                            )}
                          </div>
                        </div>
                      );
                    })}

                    {/* Applicant row */}
                    <div className="flex items-center justify-between p-3 rounded-lg border bg-amber-50 border-amber-200">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                          <User className="h-4 w-4 text-amber-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-900 flex items-center gap-2">
                            {selectedInspection.applicantName}
                            <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full font-semibold">
                              Applicant
                            </span>
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5">{selectedInspection.companyName}</p>
                        </div>
                      </div>
                      <Badge className="bg-amber-50 text-amber-700 border-amber-200 text-[10px]">
                        {selectedInspection.status === "IN_PROGRESS" ? "In Call" : "Will be rung"}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Checklist */}
                <div className="rounded-lg border bg-white p-5">
                  <h4 className="text-sm font-bold text-slate-900 mb-3">
                    {isLeadForSelected ? "Lead Officer On-Site Checklist" : "Remote Officer Checklist"}
                  </h4>
                  <ul className="space-y-2">
                    {isLeadForSelected ? (
                      <>
                        <li className="flex items-start gap-2.5 text-sm text-slate-600">
                          <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 min-w-4" />
                          <span>Physically verify the applicant is at the registered premises.</span>
                        </li>
                        <li className="flex items-start gap-2.5 text-sm text-slate-600">
                          <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 min-w-4" />
                          <span>Pan your camera to show the factory floor, safety equipment, and exits to remote officers.</span>
                        </li>
                        <li className="flex items-start gap-2.5 text-sm text-slate-600">
                          <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 min-w-4" />
                          <span>Ask the applicant to show original documents on camera for all departments.</span>
                        </li>
                        <li className="flex items-start gap-2.5 text-sm text-slate-600">
                          <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 min-w-4" />
                          <span>Confirm GPS coordinates and share geolocation with the system.</span>
                        </li>
                      </>
                    ) : (
                      <>
                        <li className="flex items-start gap-2.5 text-sm text-slate-600">
                          <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 min-w-4" />
                          <span>Join the call when rung by the Lead Officer on-site.</span>
                        </li>
                        <li className="flex items-start gap-2.5 text-sm text-slate-600">
                          <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 min-w-4" />
                          <span>Review live footage and ask the Lead Officer to show specific areas.</span>
                        </li>
                        <li className="flex items-start gap-2.5 text-sm text-slate-600">
                          <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 min-w-4" />
                          <span>Submit your department&apos;s approval/rejection directly in the call.</span>
                        </li>
                      </>
                    )}
                  </ul>
                </div>
              </CardContent>

              <CardFooter className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-100 bg-slate-50/50">
                {selectedInspection.status === "COMPLETED" ? (
                  <div className="w-full text-center py-2">
                    <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 text-sm px-4 py-1.5">
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Inspection Completed
                    </Badge>
                  </div>
                ) : selectedInspection.status === "IN_PROGRESS" && !isLeadForSelected ? (
                  /* Non-lead officers can join an in-progress call */
                  <Button
                    onClick={handleJoinInspection}
                    disabled={isJoining || !client}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white flex gap-2 justify-center shadow-md"
                  >
                    <Phone className="h-4 w-4" />
                    {isJoining ? "Joining..." : !client ? "Initializing..." : "Join Live Inspection Call"}
                  </Button>
                ) : isLeadForSelected && selectedInspection.status === "PENDING" ? (
                  /* Lead officer can start the joint inspection */
                  <Button
                    onClick={() => setConfirmDialogOpen(true)}
                    disabled={!client}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white flex gap-2 justify-center shadow-md text-base py-5"
                  >
                    <PlayCircle className="h-5 w-5" />
                    {!client ? "Initializing Video..." : "Start Joint Inspection"}
                  </Button>
                ) : isLeadForSelected && selectedInspection.status === "IN_PROGRESS" ? (
                  <Button
                    onClick={() => {
                      if (selectedInspection.streamCallId) {
                        router.push(`/meeting/${selectedInspection.streamCallId}`);
                      }
                    }}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white flex gap-2 justify-center shadow-md"
                  >
                    <Video className="h-4 w-4" />
                    Rejoin Inspection Call
                  </Button>
                ) : (
                  <div className="w-full text-center py-2">
                    <p className="text-sm text-slate-500 flex items-center justify-center gap-2">
                      <Clock className="h-4 w-4" />
                      Waiting for Lead Officer ({selectedInspection.leadDepartment}) to start the call
                    </p>
                  </div>
                )}
              </CardFooter>
            </>
          )}
        </Card>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <PlayCircle className="h-5 w-5 text-blue-600" />
              Start Joint Inspection
            </DialogTitle>
            <DialogDescription>
              You are about to start a multi-party video call. The following officers and the applicant will be rung simultaneously.
            </DialogDescription>
          </DialogHeader>

          {selectedInspection && (
            <div className="space-y-3 py-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm font-semibold text-blue-900">
                  {selectedInspection.companyName}
                </p>
                <p className="text-xs text-blue-700 mt-0.5">
                  Application: {selectedInspection.applicationId}
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Will be rung:</p>
                {selectedInspection.departments
                  .filter(d => d.officerId !== officerId)
                  .map((dept, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-slate-700 bg-slate-50 p-2 rounded-md border border-slate-100">
                      <Building2 className="h-4 w-4 text-indigo-500" />
                      <span className="font-medium">{dept.department}</span>
                      <span className="text-slate-400">— {dept.officerName || "Officer"}</span>
                    </div>
                  ))}
                <div className="flex items-center gap-2 text-sm text-slate-700 bg-amber-50 p-2 rounded-md border border-amber-100">
                  <User className="h-4 w-4 text-amber-600" />
                  <span className="font-medium">{selectedInspection.applicantName}</span>
                  <span className="text-slate-400">— Applicant (on-site)</span>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800">
                <strong>Note:</strong> The call will be automatically recorded for audit trail purposes.
                All participants will be notified.
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setConfirmDialogOpen(false)} disabled={isStarting}>
              Cancel
            </Button>
            <Button
              onClick={handleStartJointInspection}
              disabled={isStarting}
              className="bg-blue-600 hover:bg-blue-700 text-white min-w-[180px]"
            >
              {isStarting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Phone className="h-4 w-4 mr-2" />
                  Ring All & Start
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Offline Inspections Section */}
      {offlineSchedule && (
        <div className="mt-12 space-y-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Individual Site Inspections</h2>
            <p className="text-slate-600 mt-1">High-risk categories (Orange/Red) requiring traditional offline visits.</p>
          </div>
          <Card className="border-slate-200 shadow-sm max-w-4xl">
            <CardHeader className="bg-slate-50 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg text-slate-900">
                    {offlineSchedule.companyName}
                  </CardTitle>
                  <CardDescription>
                    Applicant: {offlineSchedule.applicantName}
                  </CardDescription>
                </div>
                <Badge variant="outline" className={statusColors[offlineSchedule.status] || "bg-slate-100"}>
                  {offlineSchedule.status.replace("_", " ")}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4 text-sm text-slate-700 mb-6">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span>Scheduled: {offlineSchedule.formatted}</span>
                </div>
              </div>

              {offlineSchedule.status === "RESCHEDULE_REQUESTED" && (
                <div className="rounded-lg border-2 border-amber-300 bg-amber-50 p-5">
                  <h3 className="font-semibold text-amber-900 text-lg flex items-center gap-2 mb-3">
                    <AlertTriangle className="h-5 w-5 text-amber-600" />
                    Reschedule Requested
                  </h3>
                  <p className="text-sm text-amber-800 mb-4">
                    The applicant has requested to reschedule this inspection to <strong>{offlineSchedule.proposedFormatted}</strong>.
                    <br/>
                    <span className="text-xs">Reason: {offlineSchedule.reason || "No reason provided"}</span>
                  </p>
                  <div className="flex gap-3">
                    <Button 
                      onClick={handleApproveOfflineReschedule} 
                      disabled={isProcessingReschedule} 
                      className="bg-amber-600 hover:bg-amber-700 text-white"
                    >
                      Approve Reschedule
                    </Button>
                    <Button 
                      onClick={handleRejectOfflineReschedule} 
                      disabled={isProcessingReschedule} 
                      variant="outline" 
                      className="border-amber-400 text-amber-700 hover:bg-amber-100"
                    >
                      Reject
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
