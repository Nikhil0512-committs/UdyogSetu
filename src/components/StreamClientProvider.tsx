"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  StreamVideo,
  StreamVideoClient,
  useStreamVideoClient,
} from "@stream-io/video-react-sdk";
import "@stream-io/video-react-sdk/dist/css/styles.css";
import { generateStreamToken } from "@/actions/stream";
import { Button } from "@/components/ui/button";
import { Phone, PhoneOff } from "lucide-react";
import { useRouter } from "next/navigation";

const API_KEY = "9mqqvbvvtfs8";

import { useCalls, CallingState } from "@stream-io/video-react-sdk";

// Incoming call modal — lives inside <StreamVideo> so hooks work
function IncomingCallModal() {
  const router = useRouter();
  const calls = useCalls();
  const [activeCall, setActiveCall] = useState<any>(null);

  // Find the first incoming call that is ringing
  const ringingCall = calls.find(
    (call) => !call.isCreatedByMe && call.state.callingState === CallingState.RINGING
  );

  useEffect(() => {
    if (ringingCall && !activeCall) {
      setActiveCall(ringingCall);
    }
  }, [ringingCall, activeCall]);

  if (!activeCall) return null;

  const incomingCall = activeCall;

  return (
    <div className="fixed inset-0 z-[200] bg-black/70 flex items-center justify-center backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 w-full max-w-sm shadow-2xl flex flex-col items-center gap-6">
        <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center animate-pulse">
          <Phone className="w-10 h-10 text-white" />
        </div>
        <div className="text-center">
          <h2 className="text-xl font-bold text-white">Incoming Video Call</h2>
          <p className="text-slate-400 mt-1 text-sm">Government Officer is calling for inspection</p>
        </div>
        <div className="flex gap-8">
          <button
            onClick={() => { incomingCall.reject(); setActiveCall(null); }}
            className="w-16 h-16 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center transition shadow-lg"
          >
            <PhoneOff className="w-7 h-7 text-white" />
          </button>
          <button
            onClick={async () => {
              await incomingCall.accept();
              setActiveCall(null);
              router.push(`/meeting/${incomingCall.id}`);
            }}
            className="w-16 h-16 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center transition shadow-lg animate-bounce"
          >
            <Phone className="w-7 h-7 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function StreamClientProvider({
  children,
  userId,
  userName,
}: {
  children: React.ReactNode;
  userId: string;
  userName: string;
}) {
  const [videoClient, setVideoClient] = useState<StreamVideoClient | null>(null);
  // Track what user the client is currently built for
  const currentUserId = useRef<string>("");

  useEffect(() => {
    if (!userId || userId === currentUserId.current) return;

    // Clean up old client if it exists
    if (currentUserId.current && videoClient) {
      videoClient.disconnectUser().catch(() => {});
      setVideoClient(null);
    }

    currentUserId.current = userId;

    // Use getOrCreateInstance to avoid "already exists" warning
    const client = StreamVideoClient.getOrCreateInstance({
      apiKey: API_KEY,
      user: { id: userId, name: userName },
      tokenProvider: () => generateStreamToken(userId),
    });

    setVideoClient(client);

    return () => {
      // Only disconnect if still same user (avoid stale closure issues)
      if (currentUserId.current === userId) {
        client.disconnectUser().catch(() => {});
        currentUserId.current = "";
        setVideoClient(null);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  // Don't block rendering — show children even while client initialises
  if (!videoClient) return <>{children}</>;

  return (
    <StreamVideo client={videoClient}>
      {children}
      <IncomingCallModal />
    </StreamVideo>
  );
}
