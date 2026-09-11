"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  StreamCall,
  StreamTheme,
  PaginatedGridLayout,
  CallControls,
  useStreamVideoClient,
} from "@stream-io/video-react-sdk";
import "@stream-io/video-react-sdk/dist/css/styles.css";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

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
        <MeetingUI call={call} userRole={userRole} />
      </StreamCall>
    </StreamTheme>
  );
}

import { useCallStateHooks } from "@stream-io/video-react-sdk";

function MeetingUI({ call, userRole }: { call: any, userRole: string }) {
  const router = useRouter();
  const { useCallEndedAt } = useCallStateHooks();
  const callEndedAt = useCallEndedAt();

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

  return (
    <div className="h-screen w-full bg-slate-900 text-white flex flex-col relative">
      {/* Diagnostic Badge to prove cookie identity */}
      <div className="absolute top-4 left-4 z-50 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-mono border border-white/10 flex items-center gap-2">
        <span className={userRole === "OFFICER" ? "text-blue-400" : "text-emerald-400"}>
          You joined as: {userRole === "OFFICER" ? "Officer" : "Applicant"}
        </span>
      </div>

      <div className="flex-1 relative overflow-hidden flex items-center justify-center">
        <PaginatedGridLayout groupSize={2} />
      </div>
      <div className="bg-slate-800 p-4 border-t border-slate-700 flex justify-center">
        <CallControls onLeave={handleLeave} />
      </div>
    </div>
  );
}
