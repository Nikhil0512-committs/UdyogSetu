"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Video, CheckCircle2, Clock, User } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { useStreamVideoClient } from "@stream-io/video-react-sdk";
import { notifyReschedule, fetchMeetingSchedule } from "@/actions/notifications";

export default function OfficerInspectionsClient({ officerId }: { officerId: string }) {
  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [schedule, setSchedule] = useState({
    date: "2026-08-28",
    time: "15:00",
    formatted: "28 Aug 2026, 03:00 PM"
  });
  const [date, setDate] = useState(schedule.date);
  const [time, setTime] = useState(schedule.time);
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCalling, setIsCalling] = useState(false);
  const router = useRouter();
  const client = useStreamVideoClient();

  React.useEffect(() => {
    fetchMeetingSchedule().then((s) => {
      setSchedule(s);
      setDate(s.date);
      setTime(s.time);
    });
  }, []);

  const handleRescheduleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const res = await notifyReschedule({
        to: "applicant",
        newDate: date,
        newTime: time,
        reason,
        initiator: "Officer",
      });
      setSchedule(res.newSchedule);
      toast.success("Reschedule request sent! The applicant has been notified.");
      setRescheduleOpen(false);
      setReason("");
    } catch {
      toast.error("Failed to send reschedule notification.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCallApplicant = async () => {
    if (!client) {
      toast.error("Video client is still initializing. Please wait a moment.");
      return;
    }

    setIsCalling(true);
    try {
      const callId = `inspection-${Date.now()}`;
      const call = client.call("default", callId);

      // officerId comes from server session — always reliable, never empty
      const members = [{ user_id: officerId, role: "admin" }];
      // Only add applicant if it's a different user (avoids 'duplicate members' error when testing same browser)
      if (officerId !== "app-user-1") {
        members.push({ user_id: "app-user-1", role: "user" });
      }

      await call.getOrCreate({ ring: true, data: { members } });
      await call.ring();
      toast.success("Ringing applicant...");
      router.push(`/meeting/${callId}`);
    } catch (err: any) {
      console.error(err);
      toast.error(`Call failed: ${err?.message ?? "Unknown error"}`);
    } finally {
      setIsCalling(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Remote Verifications Queue</h1>
        <p className="text-slate-600 mt-2">Manage your video meetings and inspection scheduling with applicants.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="flex flex-col h-full">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <CardTitle className="text-xl flex items-center gap-2 text-slate-900">
                  <Video className="h-5 w-5 text-blue-600" />
                  Upcoming Video Verification
                </CardTitle>
                <CardDescription>Applicant: Acme Steel Industries Pvt Ltd</CardDescription>
              </div>
              <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Action Required</Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-4 flex-grow">
            <div className="rounded-lg border bg-slate-50 p-4">
              <h3 className="font-semibold text-slate-900">Low-Risk Self-Certification Review</h3>
              <p className="text-sm text-slate-600 mt-1 flex items-center gap-1">
                <User className="h-4 w-4" /> Applicant Rep: Rahul Sharma
              </p>
              <p className="text-sm text-slate-600 mt-1 flex items-center gap-1">
                <Clock className="h-4 w-4" /> {schedule.formatted}
              </p>
              <div className="space-y-2 mt-4">
                <h4 className="text-sm font-medium text-slate-900">Officer Guidelines:</h4>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-sm text-slate-600">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 min-w-4" />
                    <span>Verify the applicant is at the registered office premises.</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-slate-600">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 min-w-4" />
                    <span>Ask them to show the original documents matching the self-certification.</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col sm:flex-row gap-3 pt-4">
            {/* Reschedule Dialog */}
            <Dialog open={rescheduleOpen} onOpenChange={setRescheduleOpen}>
              <DialogTrigger className={buttonVariants({ variant: "outline", className: "w-full sm:flex-1 cursor-pointer" })}>
                Reschedule
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Propose New Date</DialogTitle>
                  <DialogDescription>
                    The applicant will be notified immediately with the new time.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="rs-date" className="text-right">Date</Label>
                    <Input id="rs-date" type="date" className="col-span-3" value={date} onChange={e => setDate(e.target.value)} />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="rs-time" className="text-right">Time</Label>
                    <Input id="rs-time" type="time" className="col-span-3" value={time} onChange={e => setTime(e.target.value)} />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="rs-reason" className="text-right">Reason</Label>
                    <Input id="rs-reason" placeholder="Brief reason" className="col-span-3" value={reason} onChange={e => setReason(e.target.value)} />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setRescheduleOpen(false)} disabled={isSubmitting}>Cancel</Button>
                  <Button onClick={handleRescheduleSubmit} disabled={isSubmitting}>
                    {isSubmitting ? "Sending..." : "Notify Applicant"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Call Button */}
            <Button
              onClick={handleCallApplicant}
              disabled={isCalling || !client}
              className="w-full sm:flex-1 bg-blue-600 hover:bg-blue-700 text-white flex gap-2 justify-center"
            >
              <Video className="h-4 w-4" />
              {isCalling ? "Connecting..." : !client ? "Initializing..." : "Call Applicant"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
