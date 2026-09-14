"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  StreamCall,
  StreamTheme,
  PaginatedGridLayout,
  CallControls,
  useStreamVideoClient,
} from "@stream-io/video-react-sdk";
import "@stream-io/video-react-sdk/dist/css/styles.css";
import { useRouter } from "next/navigation";
import {
  Loader2, CheckCircle2, XCircle, MessageSquare,
  Building2, ChevronRight, ChevronLeft, Users,
  Shield, PartyPopper, Clock, AlertTriangle
} from "lucide-react";
import type { JointInspectionSession } from "@/lib/mock-data";

export default function MeetingRoom({
  callId,
  userId,
  userName,
  userRole,
}: {
  callId: string;
  userId: string;
  userName: string;
  userRole: string;
}) {
  const client = useStreamVideoClient();
  const [call, setCall] = useState<any>(null);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("Authenticating with video service...");
  const router = useRouter();
  const initDone = useRef(false);

  useEffect(() => {
    if (!client || !callId) return;

    let isMounted = true;
    const myCall = client.call("default", callId);

    const joinMeeting = async () => {
      try {
        // Safely check if we are already in the call to prevent React StrictMode ghost participants
        const currentState = myCall.state.callingState;
        if (currentState !== "joined" && currentState !== "joining") {
          await myCall.join({ create: true });
        }
        
        if (isMounted) {
          setCall(myCall);
        }
      } catch (err: any) {
        console.error("Error joining call:", err);
        if (isMounted) setError(err?.message || "Failed to join video call.");
      }
    };

    if (client.state.connectedUser) {
      joinMeeting();
    } else {
      // Wait for user to be connected before joining
      const sub = client.state.connectedUser$.subscribe((user) => {
        if (user) {
          sub.unsubscribe();
          joinMeeting();
        }
      });
    }

    return () => {
      isMounted = false;
      // Clean up the call when we navigate away
      if (myCall && myCall.state.callingState === "joined") {
        myCall.leave().catch(() => {});
      }
    };
  }, [client, callId]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-slate-900 text-white gap-4">
        <p className="text-red-400 text-center max-w-md px-4">{error}</p>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 bg-slate-700 rounded hover:bg-slate-600 text-sm"
        >
          Go Back
        </button>
      </div>
    );
  }

  if (!call) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-slate-900 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-white" />
        <p className="text-slate-400 text-sm">{status}</p>
      </div>
    );
  }

  return (
    <StreamTheme>
      <StreamCall call={call}>
        <MeetingUI call={call} userRole={userRole} callId={callId} userId={userId} userName={userName} />
      </StreamCall>
    </StreamTheme>
  );
}

import { useCallStateHooks } from "@stream-io/video-react-sdk";

function MeetingUI({
  call,
  userRole,
  callId,
  userId,
  userName,
}: {
  call: any;
  userRole: string;
  callId: string;
  userId: string;
  userName: string;
}) {
  const router = useRouter();
  const { useCallEndedAt } = useCallStateHooks();
  const callEndedAt = useCallEndedAt();
  const [panelOpen, setPanelOpen] = useState(false);
  const [inspection, setInspection] = useState<JointInspectionSession | null>(null);
  const [isJointCall, setIsJointCall] = useState(false);
  const [pollCounter, setPollCounter] = useState(0);

  // Check if this is a joint inspection call
  useEffect(() => {
    if (callId.startsWith("joint-")) {
      setIsJointCall(true);
      // Extract inspection ID from callId: "joint-{inspectionId}-{timestamp}"
      const parts = callId.split("-");
      // The inspection ID is like "JI-2026-001", so we need to reconstruct it
      // callId format: "joint-JI-2026-001-1726300000000"
      const inspectionId = parts.slice(1, -1).join("-");
      
      import("@/actions/joint-inspection").then(({ fetchJointInspectionById }) => {
        fetchJointInspectionById(inspectionId).then(ji => {
          if (ji) setInspection(ji);
        });
      });
    }
  }, [callId]);

  // Poll for updates every 3 seconds during a joint inspection
  useEffect(() => {
    if (!isJointCall || !inspection) return;
    const timer = setInterval(() => {
      setPollCounter(c => c + 1);
    }, 3000);
    return () => clearInterval(timer);
  }, [isJointCall, inspection]);

  // Fetch updated state on poll
  useEffect(() => {
    if (!isJointCall || !inspection || pollCounter === 0) return;
    import("@/actions/joint-inspection").then(({ pollJointInspectionState }) => {
      pollJointInspectionState(inspection.id).then(ji => {
        if (ji) setInspection(ji);
      });
    });
  }, [pollCounter, isJointCall, inspection?.id]);

  useEffect(() => {
    if (callEndedAt) {
      router.back();
    }
  }, [callEndedAt, router]);

  const handleLeave = async () => {
    try {
      // If we are the admin/officer, end the call for everyone
      if (userRole === "OFFICER") {
        await call.endCall();
      } else {
        await call.leave();
      }
    } catch (err) {
      console.error("Error ending/leaving call", err);
    }
    router.back();
  };

  // Check if all departments approved (celebration state)
  const allApproved = inspection?.departments.every(d => d.decision === "APPROVED");
  const allDecided = inspection?.departments.every(d => d.decision !== null);

  return (
    <div className="h-screen w-full bg-slate-900 text-white flex relative overflow-hidden">
      {/* Main video area */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${panelOpen && isJointCall ? "mr-[360px]" : ""}`}>
        {/* Top bar */}
        <div className="absolute top-4 left-4 z-50 flex items-center gap-3">
          <div className="bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-mono border border-white/10 flex items-center gap-2">
            <span className={userRole === "OFFICER" ? "text-blue-400" : "text-emerald-400"}>
              You: {userRole === "OFFICER" ? "Officer" : "Applicant"}
            </span>
          </div>
          
          {isJointCall && (
            <div className="bg-indigo-500/30 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-semibold border border-indigo-400/30 flex items-center gap-2">
              <Users className="h-3 w-3 text-indigo-300" />
              <span className="text-indigo-200">Joint Inspection</span>
              {inspection && (
                <span className="text-indigo-400">
                  • {inspection.departments.filter(d => d.decision === "APPROVED").length}/{inspection.departments.length} approved
                </span>
              )}
            </div>
          )}
        </div>

        {/* Toggle panel button */}
        {isJointCall && (
          <button
            onClick={() => setPanelOpen(!panelOpen)}
            className="absolute top-4 right-4 z-50 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-2 transition shadow-lg"
          >
            {panelOpen ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
            {panelOpen ? "Hide Panel" : "Approval Panel"}
          </button>
        )}

        {/* All Approved Celebration Banner */}
        {allApproved && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 bg-emerald-500/90 backdrop-blur-md text-white px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-bounce">
            <PartyPopper className="h-6 w-6" />
            <div>
              <p className="font-bold text-lg">All Departments Approved! 🎉</p>
              <p className="text-emerald-100 text-xs">Application cleared by all participating departments.</p>
            </div>
          </div>
        )}

        <div className="flex-1 relative overflow-hidden flex items-center justify-center">
          <PaginatedGridLayout groupSize={4} />
        </div>
        <div className="bg-slate-800 p-4 border-t border-slate-700 flex justify-center">
          <CallControls onLeave={handleLeave} />
        </div>
      </div>

      {/* Side Panel — In-Call Approval */}
      {isJointCall && (
        <div
          className={`fixed top-0 right-0 h-full w-[360px] bg-slate-800 border-l border-slate-700 z-40 transition-transform duration-300 flex flex-col ${
            panelOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="p-4 border-b border-slate-700 bg-slate-800/90 backdrop-blur">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Shield className="h-4 w-4 text-indigo-400" />
              Joint Inspection Panel
            </h3>
            {inspection && (
              <p className="text-xs text-slate-400 mt-1">{inspection.companyName}</p>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {inspection ? (
              <>
                {/* Department Status Cards */}
                <div className="space-y-2">
                  <p className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider">Department Decisions</p>
                  {inspection.departments.map((dept, i) => {
                    const isMyDept = userRole === "OFFICER" && dept.department === userName;
                    return (
                      <DeptDecisionCard
                        key={i}
                        dept={dept}
                        isMyDept={isMyDept}
                        inspectionId={inspection.id}
                        onDecisionSubmitted={() => setPollCounter(c => c + 1)}
                      />
                    );
                  })}
                </div>

                {/* Summary */}
                <div className="bg-slate-700/50 rounded-lg p-3 border border-slate-600">
                  <p className="text-xs font-semibold text-slate-300 mb-2">Progress</p>
                  <div className="w-full bg-slate-600 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${
                        allApproved ? "bg-emerald-500" : "bg-blue-500"
                      }`}
                      style={{
                        width: `${(inspection.departments.filter(d => d.decision !== null).length / inspection.departments.length) * 100}%`
                      }}
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1.5">
                    {inspection.departments.filter(d => d.decision !== null).length} of {inspection.departments.length} departments decided
                  </p>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-slate-500" />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Individual department decision card inside the approval panel.
 * If it's the current officer's department and they haven't decided yet, shows approve/reject buttons.
 */
function DeptDecisionCard({
  dept,
  isMyDept,
  inspectionId,
  onDecisionSubmitted,
}: {
  dept: JointInspectionSession["departments"][number];
  isMyDept: boolean;
  inspectionId: string;
  onDecisionSubmitted: () => void;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [comment, setComment] = useState("");
  const [showActions, setShowActions] = useState(false);

  const handleSubmitDecision = async (decision: "APPROVED" | "REJECTED" | "QUERIED") => {
    setIsSubmitting(true);
    try {
      const { submitDeptDecision } = await import("@/actions/joint-inspection");
      await submitDeptDecision(inspectionId, decision, comment);
      onDecisionSubmitted();
    } catch (err: any) {
      console.error("Decision submission failed:", err);
    } finally {
      setIsSubmitting(false);
      setShowActions(false);
    }
  };

  const decisionColor = {
    APPROVED: "border-emerald-500/30 bg-emerald-500/10",
    REJECTED: "border-red-500/30 bg-red-500/10",
    QUERIED: "border-amber-500/30 bg-amber-500/10",
  };

  const decisionIcon = {
    APPROVED: <CheckCircle2 className="h-4 w-4 text-emerald-400" />,
    REJECTED: <XCircle className="h-4 w-4 text-red-400" />,
    QUERIED: <MessageSquare className="h-4 w-4 text-amber-400" />,
  };

  return (
    <div className={`rounded-lg border p-3 transition-all ${
      dept.decision
        ? decisionColor[dept.decision as keyof typeof decisionColor] || "border-slate-600 bg-slate-700/50"
        : isMyDept
        ? "border-indigo-500/50 bg-indigo-500/10 ring-1 ring-indigo-500/30"
        : "border-slate-600 bg-slate-700/50"
    }`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Building2 className="h-3.5 w-3.5 text-slate-400" />
          <span className="text-xs font-semibold text-slate-200">{dept.department}</span>
          {isMyDept && !dept.decision && (
            <span className="text-[9px] bg-indigo-500 text-white px-1.5 py-0.5 rounded-full animate-pulse">
              Your Turn
            </span>
          )}
        </div>
        {dept.decision ? (
          <div className="flex items-center gap-1">
            {decisionIcon[dept.decision as keyof typeof decisionIcon]}
            <span className={`text-[10px] font-bold ${
              dept.decision === "APPROVED" ? "text-emerald-400" :
              dept.decision === "REJECTED" ? "text-red-400" :
              "text-amber-400"
            }`}>
              {dept.decision}
            </span>
          </div>
        ) : dept.joined ? (
          <span className="text-[10px] text-emerald-400 flex items-center gap-1">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
            </span>
            Online
          </span>
        ) : (
          <Clock className="h-3 w-3 text-slate-500" />
        )}
      </div>

      {/* Decision actions for current officer's department */}
      {isMyDept && !dept.decision && (
        <>
          {!showActions ? (
            <button
              onClick={() => setShowActions(true)}
              className="w-full mt-1 text-[11px] bg-indigo-600 hover:bg-indigo-700 text-white py-1.5 rounded-md font-semibold transition"
            >
              Submit Decision
            </button>
          ) : (
            <div className="mt-2 space-y-2">
              <input
                type="text"
                placeholder="Optional comments..."
                value={comment}
                onChange={e => setComment(e.target.value)}
                className="w-full bg-slate-600 border border-slate-500 rounded-md px-2 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <div className="flex gap-1.5">
                <button
                  disabled={isSubmitting}
                  onClick={() => handleSubmitDecision("APPROVED")}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white py-1.5 rounded-md text-[10px] font-bold flex items-center justify-center gap-1 transition"
                >
                  <CheckCircle2 className="h-3 w-3" />
                  Approve
                </button>
                <button
                  disabled={isSubmitting}
                  onClick={() => handleSubmitDecision("QUERIED")}
                  className="flex-1 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white py-1.5 rounded-md text-[10px] font-bold flex items-center justify-center gap-1 transition"
                >
                  <MessageSquare className="h-3 w-3" />
                  Query
                </button>
                <button
                  disabled={isSubmitting}
                  onClick={() => handleSubmitDecision("REJECTED")}
                  className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white py-1.5 rounded-md text-[10px] font-bold flex items-center justify-center gap-1 transition"
                >
                  <XCircle className="h-3 w-3" />
                  Reject
                </button>
              </div>
              <button
                onClick={() => setShowActions(false)}
                className="w-full text-[10px] text-slate-400 hover:text-slate-300 py-1"
              >
                Cancel
              </button>
            </div>
          )}
        </>
      )}

      {/* Show comments if decision was made */}
      {dept.decision && dept.comments && (
        <p className="text-[10px] text-slate-400 mt-1 italic">&quot;{dept.comments}&quot;</p>
      )}
    </div>
  );
}
