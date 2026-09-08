"use client";

import React, { useEffect, useState } from "react";
import {
  StreamVideo,
  StreamVideoClient,
  StreamCall,
  StreamTheme,
  SpeakerLayout,
  CallControls,
  CallParticipantsList,
} from "@stream-io/video-react-sdk";
import "@stream-io/video-react-sdk/dist/css/styles.css";
import { generateStreamToken } from "@/actions/stream";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function MeetingRoom({ callId, userId, userName }: { callId: string, userId: string, userName: string }) {
  const [client, setClient] = useState<StreamVideoClient>();
  const [call, setCall] = useState<any>();
  const router = useRouter();

  useEffect(() => {
    if (!userId || !callId) return;

    let activeClient: StreamVideoClient;
    let activeCall: any;

    const init = async () => {
      try {
        const token = await generateStreamToken(userId);
        
        activeClient = new StreamVideoClient({
          apiKey: process.env.NEXT_PUBLIC_STREAM_API_KEY || "9mqqvbvvtfs8",
          user: { id: userId, name: userName },
          token,
        });

        activeCall = activeClient.call("default", callId);
        await activeCall.join({ create: true });

        setClient(activeClient);
        setCall(activeCall);
      } catch (error) {
        console.error("Error joining call:", error);
      }
    };

    init();

    return () => {
      if (activeCall) {
        activeCall.leave().catch(console.error);
      }
      if (activeClient) {
        activeClient.disconnectUser().catch(console.error);
      }
    };
  }, [callId, userId, userName]);

  if (!client || !call) return <div className="flex items-center justify-center h-screen"><Loader2 className="w-8 h-8 animate-spin" /></div>;

  return (
    <StreamVideo client={client}>
      <StreamTheme>
        <StreamCall call={call}>
          <div className="h-screen w-full bg-slate-900 text-white flex flex-col">
            <div className="flex-1 relative">
              <SpeakerLayout />
            </div>
            <div className="bg-slate-800 p-4 border-t border-slate-700">
              <CallControls onLeave={() => router.back()} />
            </div>
          </div>
        </StreamCall>
      </StreamTheme>
    </StreamVideo>
  );
}
