"use client";

import { useEffect } from "react";
import { getPusherClient } from "@/lib/pusher";
import { toast } from "sonner";
import { usePathname } from "next/navigation";

export default function RealtimeNotifications() {
  const pathname = usePathname();

  useEffect(() => {
    const pusher = getPusherClient();
    if (!pusher) return;

    // Subscribe to the generic channel
    const channel = pusher.subscribe("global-notifications");

    // Listen for new notifications
    channel.bind("new-notification", (data: any) => {
      // Determine toast style based on type
      if (data.type === "SUCCESS") {
        toast.success(data.title, { description: data.message });
      } else if (data.type === "ERROR") {
        toast.error(data.title, { description: data.message });
      } else if (data.type === "WARNING") {
        toast.warning(data.title, { description: data.message });
      } else {
        toast(data.title, { description: data.message });
      }
    });

    return () => {
      pusher.unsubscribe("global-notifications");
      channel.unbind_all();
    };
  }, [pathname]);

  return null; // This is a logic-only component
}
