"use client";

import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

interface Notification {
  id: string;
  title: string;
  message: string;
  date: string;
  read: boolean;
  type: string;
  link?: string;
}

export default function NotificationsMenu() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  useEffect(() => {
    fetch("/api/applicant/notifications")
      .then(res => res.json())
      .then(data => setNotifications(data.notifications || []));
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAsRead = async (id: string) => {
    await fetch("/api/applicant/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id })
    });
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  return (
    <Popover>
      <PopoverTrigger 
        className={buttonVariants({ variant: "ghost", size: "icon", className: "relative cursor-pointer" })}
      >
        <Bell className="w-5 h-5 text-slate-600" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
        )}
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0 shadow-lg">
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-900">Notifications</h3>
          <Badge variant="secondary" className="text-xs">{unreadCount} new</Badge>
        </div>
        <div className="max-h-80 overflow-y-auto p-2">
          {notifications.length === 0 ? (
            <p className="text-center text-sm text-slate-500 py-6">No notifications yet.</p>
          ) : (
            notifications.map(n => (
              <div key={n.id} className={`p-3 rounded-lg mb-1 transition-colors ${n.read ? 'opacity-70 hover:bg-slate-50' : 'bg-blue-50/50 hover:bg-blue-50'}`} onClick={() => !n.read && handleMarkAsRead(n.id)}>
                <div className="flex items-start justify-between gap-2">
                  <h4 className={`text-sm ${n.read ? 'font-medium text-slate-700' : 'font-semibold text-slate-900'}`}>{n.title}</h4>
                  <span className="text-[10px] text-slate-500 flex-shrink-0">
                    {new Date(n.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1">{n.message}</p>
                {n.link && (
                  <Link href={n.link} className="text-xs text-blue-600 font-medium hover:underline mt-2 inline-block">
                    Take Action &rarr;
                  </Link>
                )}
              </div>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
