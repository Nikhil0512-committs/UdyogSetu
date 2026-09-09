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
}: {
  callId: string;
  userId: string;
  userName: string;
}) {
  const client = useStreamVideoClient();
  const [call, setCall] = useState<any>(null);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("Authenticating with video service...");
  const router = useRouter();
  const initDone = useRef(false);

  useEffect(() => {
    if (!client || initDone.current) return;

    let isMounted = true;
    let subscription: { unsubscribe: () => void } | null = null;
    let currentCall: any = null; // Track the call instance synchronously

    const joinCall = async (callInstance: any) => {
      currentCall = callInstance;
      try {
        setStatus("Joining call...");
        await callInstance.join({ create: true });
        
        if (!isMounted) {
          // Unmounted while join was in progress! Leave immediately.
          await callInstance.leave().catch(() => {});
          return;
        }
        
        setCall(callInstance);
      } catch (err: any) {
        console.error("join failed", err);
        if (isMounted) {
          setError(err?.message || "Failed to join the call.");
          initDone.current = false;
        }
      }
    };

    const callInstance = client.call("default", callId);

    // Check if already connected
    if (client.state.connectedUser) {
      initDone.current = true;
      joinCall(callInstance);
    } else {
      // Otherwise wait for the user to connect (token fetch is async)
      subscription = client.state.connectedUser$.subscribe((user) => {
        if (user && !initDone.current) {
          initDone.current = true;
          subscription?.unsubscribe();
          subscription = null;
          joinCall(callInstance);
        }
      });
    }

    const handleBeforeUnload = () => {
      if (currentCall) {
        currentCall.leave();
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      isMounted = false;
      window.removeEventListener("beforeunload", handleBeforeUnload);
      subscription?.unsubscribe();
      if (currentCall) {
        currentCall.leave().catch(() => {});
      }
      initDone.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [client]);

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
        <div className="h-screen w-full bg-slate-900 text-white flex flex-col">
          <div className="flex-1 relative overflow-hidden flex items-center justify-center">
            <PaginatedGridLayout groupSize={2} />
          </div>
          <div className="bg-slate-800 p-4 border-t border-slate-700 flex justify-center">
            <CallControls onLeave={() => router.back()} />
          </div>
        </div>
      </StreamCall>
    </StreamTheme>
  );
}
