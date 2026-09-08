"use client";

import React, { useEffect, useState } from "react";
import { StreamVideo, StreamVideoClient, StreamCall, useCall, useCallStateHooks } from "@stream-io/video-react-sdk";
import "@stream-io/video-react-sdk/dist/css/styles.css";
import { generateStreamToken } from "@/actions/stream";
import { Button } from "@/components/ui/button";
import { Phone, PhoneOff } from "lucide-react";
import { useRouter } from "next/navigation";

function IncomingCallModal() {
  const router = useRouter();
  const [incomingCall, setIncomingCall] = useState<any | null>(null);
  const client = useStreamVideoClient();

  useEffect(() => {
    if (!client) return;
    const unsubscribe = client.on("call.ring", (event) => {
      if (event.call_cid) {
        const callType = event.call_cid.split(":")[0];
        const callId = event.call_cid.split(":")[1];
        const call = client.call(callType, callId);
        setIncomingCall(call);
      }
    });
    return () => unsubscribe();
  }, [client]);

  if (!incomingCall) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl flex flex-col items-center animate-in zoom-in-95 duration-200">
        <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center animate-pulse mb-6">
          <Phone className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Incoming Video Call</h2>
        <p className="text-slate-400 mb-8">Labour Department Officer</p>
        
        <div className="flex gap-6 w-full justify-center">
          <button 
            onClick={() => {
              incomingCall.reject();
              setIncomingCall(null);
            }}
            className="w-16 h-16 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center transition shadow-lg shadow-red-500/20"
          >
            <PhoneOff className="w-7 h-7 text-white" />
          </button>
          
          <button 
            onClick={async () => {
              await incomingCall.accept();
              setIncomingCall(null);
              router.push(`/meeting/${incomingCall.id}`);
            }}
            className="w-16 h-16 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center transition shadow-lg shadow-green-500/20 animate-bounce"
          >
            <Phone className="w-7 h-7 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}

// Hook to get client safely
import { useStreamVideoClient } from "@stream-io/video-react-sdk";

export default function StreamClientProvider({ children, userId, userName }: { children: React.ReactNode, userId: string, userName: string }) {
  const [videoClient, setVideoClient] = useState<StreamVideoClient>();

  useEffect(() => {
    if (!userId) return;

    let client: StreamVideoClient;
    
    const init = async () => {
      const token = await generateStreamToken(userId);
      client = new StreamVideoClient({
        apiKey: "9mqqvbvvtfs8",
        user: { id: userId, name: userName },
        token,
      });
      setVideoClient(client);
    };

    init();

    return () => {
      if (client) {
        client.disconnectUser();
      }
    };
  }, [userId, userName]);

  if (!videoClient) return <>{children}</>;

  return (
    <StreamVideo client={videoClient}>
      {children}
      <IncomingCallModal />
    </StreamVideo>
  );
}
