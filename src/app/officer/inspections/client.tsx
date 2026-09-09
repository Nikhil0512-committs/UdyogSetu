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

interface EligibleApp {
  id: string;
  companyName: string;
  applicantName: string;
  riskCategory: string;
  riskScore: number;
}

export default function OfficerInspectionsClient({ officerId, department, eligibleApps, canVideoCall }: { officerId: string; department: string; eligibleApps: EligibleApp[]; canVideoCall: boolean }) {
  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [schedule, setSchedule] = useState<any>({
    date: "2026-08-28",
    time: "15:00",
    formatted: "28 Aug 2026, 03:00 PM",
    status: "SCHEDULED"
  });
  const [date, setDate] = useState(schedule.date);
  const [time, setTime] = useState(schedule.time);
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCalling, setIsCalling] = useState(false);
  const router = useRouter();
  const client = useStreamVideoClient();

  React.useEffect(() => {
    import("@/actions/inspections").then(({ fetchInspectionSchedule }) => {
      fetchInspectionSchedule().then((s) => {
        setSchedule(s);
        setDate(s.date);
        setTime(s.time);
      });
    });
  }, []);

  const handleRescheduleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const { requestReschedule } = await import("@/actions/inspections");
      await requestReschedule({
        newDate: date,
        newTime: time,
        reason,
        initiator: "OFFICER",
      });
      toast.success("Reschedule applied! The applicant has been notified.");
      setRescheduleOpen(false);
      setReason("");
      
      const { fetchInspectionSchedule } = await import("@/actions/inspections");
      const s = await fetchInspectionSchedule();
      setSchedule(s);
    } catch {
      toast.error("Failed to apply reschedule.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApprove = async () => {
    const { approveReschedule, fetchInspectionSchedule } = await import("@/actions/inspections");
    await approveReschedule();
    const s = await fetchInspectionSchedule();
    setSchedule(s);
  };

  const handleReject = async () => {
    const { rejectReschedule, fetchInspectionSchedule } = await import("@/actions/inspections");
    await rejectReschedule();
    const s = await fetchInspectionSchedule();
    setSchedule(s);
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

      const members = [{ user_id: officerId, role: "admin" }];
      if (officerId !== "app-user-1") {
        members.push({ user_id: "app-user-1", role: "user" });
      }

      await call.getOrCreate({ ring: true, data: { members } });
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
                <CardDescription>Applicant: {schedule?.companyName || "Applicant Enterprise"}</CardDescription>
              </div>
              <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Action Required</Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-4 flex-grow">
            <div className="rounded-lg border bg-slate-50 p-4">
              <h3 className="font-semibold text-slate-900">Low-Risk Self-Certification Review</h3>
              <p className="text-sm text-slate-600 mt-1 flex items-center gap-1">
                <User className="h-4 w-4" /> Applicant Rep: {schedule?.applicantName || "Applicant"}
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

              {schedule.status === "RESCHEDULE_REQUESTED" && schedule.initiator === "APPLICANT" && (
                <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md">
                  <p className="text-sm font-medium text-amber-800">
                    Reschedule Request
                  </p>
                  <p className="text-xs text-amber-700 mt-1">
                    Applicant wants to reschedule to <strong>{schedule.proposedFormatted}</strong>.<br/>
                    Reason: {schedule.reason || "None provided"}
                  </p>
                  <div className="flex gap-2 mt-3">
                    <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={handleApprove}>
                      Approve
                    </Button>
                    <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={handleReject}>
                      Reject
                    </Button>
                  </div>
                </div>
              )}
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

            {/* Call Button - Only available for Red/Orange category applications */}
            {canVideoCall ? (
              <Button
                onClick={handleCallApplicant}
                disabled={isCalling || !client}
                className="w-full sm:flex-1 bg-blue-600 hover:bg-blue-700 text-white flex gap-2 justify-center"
              >
                <Video className="h-4 w-4" />
                {isCalling ? "Connecting..." : !client ? "Initializing..." : "Call Applicant"}
              </Button>
            ) : (
              <div className="w-full sm:flex-1">
                <Button
                  disabled
                  className="w-full bg-slate-200 text-slate-500 cursor-not-allowed flex gap-2 justify-center"
                >
                  <Video className="h-4 w-4" />
                  Video Call Not Required
                </Button>
                <p className="text-xs text-slate-500 mt-1 text-center">
                  Video verification is only required for Red & Orange category applications. All current applications in your queue are Green (self-certification).
                </p>
              </div>
            )}
          </CardFooter>
        </Card>

        {/* Applications Queue with Risk Categories */}
        <Card className="flex flex-col h-full">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2 text-slate-900">
              <User className="h-5 w-5 text-indigo-600" />
              Applications in {department || "Your"} Queue
            </CardTitle>
            <CardDescription>Applications assigned to your department with their risk categories</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 flex-grow">
            {eligibleApps.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <p className="font-medium">No applications in your queue</p>
                <p className="text-sm mt-1">When applicants submit applications routed to your department, they will appear here.</p>
              </div>
            ) : (
              eligibleApps.map(app => {
                const riskColors: Record<string, string> = {
                  Red: "bg-red-100 text-red-800 border-red-200",
                  Orange: "bg-orange-100 text-orange-800 border-orange-200",
                  Green: "bg-emerald-100 text-emerald-800 border-emerald-200",
                };
                const needsVideo = app.riskCategory === "Red" || app.riskCategory === "Orange";
                return (
                  <div key={app.id} className={`p-3 rounded-lg border ${needsVideo ? 'border-amber-200 bg-amber-50' : 'border-slate-200 bg-slate-50'}`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-slate-900 text-sm">{app.companyName}</p>
                        <p className="text-xs text-slate-600">Applicant: {app.applicantName} • {app.id}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${riskColors[app.riskCategory] || riskColors.Green}`}>
                          {app.riskCategory}
                        </span>
                        {needsVideo ? (
                          <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-[10px]">Video Required</Badge>
                        ) : (
                          <Badge className="bg-slate-100 text-slate-600 border-slate-200 text-[10px]">Self-Cert</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
