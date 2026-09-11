"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Video, CheckCircle2, Clock, User, ChevronRight } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { useStreamVideoClient } from "@stream-io/video-react-sdk";

interface EligibleApp {
  id: string;
  userId: string;
  companyName: string;
  applicantName: string;
  riskCategory: string;
  riskScore: number;
}

export default function OfficerInspectionsClient({ officerId, department, eligibleApps, canVideoCall }: { officerId: string; department: string; eligibleApps: EligibleApp[]; canVideoCall: boolean }) {
  const [selectedApp, setSelectedApp] = useState<EligibleApp | null>(eligibleApps[0] || null);
  
  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [schedule, setSchedule] = useState<any>({
    date: "2026-09-20",
    time: "15:00",
    formatted: "20 Sep 2026, 03:00 PM",
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
        if (s) {
          setSchedule(s);
          setDate(s.date);
          setTime(s.time);
        }
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
    
    if (!selectedApp || !selectedApp.userId) {
      toast.error("Please select a valid applicant from the list.");
      return;
    }

    setIsCalling(true);
    try {
      // Use a consistent call ID based on the application to prevent duplicates
      const callId = `inspection-${selectedApp.id}`;
      const call = client.call("default", callId);

      const members = [{ user_id: officerId, role: "admin" }];
      // Add the specific applicant's user ID to the call
      if (officerId !== selectedApp.userId) {
        members.push({ user_id: selectedApp.userId, role: "user" });
      }

      await call.getOrCreate({ ring: true, data: { members } });
      toast.success(`Ringing ${selectedApp.applicantName}...`);
      router.push(`/meeting/${callId}`);
    } catch (err: any) {
      console.error(err);
      toast.error(`Call failed: ${err?.message ?? "Unknown error"}`);
    } finally {
      setIsCalling(false);
    }
  };

  const riskColors: Record<string, string> = {
    Red: "bg-red-100 text-red-800 border-red-200",
    Orange: "bg-orange-100 text-orange-800 border-orange-200",
    Green: "bg-emerald-100 text-emerald-800 border-emerald-200",
  };

  const isSelectedAppGreen = selectedApp?.riskCategory === "Green" || selectedApp?.riskCategory === "White";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Remote Verifications Queue</h1>
        <p className="text-slate-600 mt-2">Select an applicant from your queue to manage their inspection and initiate a video call.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-12">
        {/* Left Card: Applications Queue (Selectable List) */}
        <Card className="flex flex-col h-full md:col-span-5 lg:col-span-4 border-slate-200 shadow-sm">
          <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
            <CardTitle className="text-lg flex items-center gap-2 text-slate-900">
              <User className="h-5 w-5 text-indigo-600" />
              Your Department Queue
            </CardTitle>
            <CardDescription className="text-xs">Applicants waiting for {department || "your"} verification</CardDescription>
          </CardHeader>
          <CardContent className="p-0 flex-grow overflow-y-auto">
            {eligibleApps.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <p className="font-medium">No applications</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {eligibleApps.map(app => {
                  const needsManual = app.riskCategory === "Red" || app.riskCategory === "Orange";
                  const isSelected = selectedApp?.id === app.id;
                  
                  return (
                    <div 
                      key={app.id} 
                      onClick={() => setSelectedApp(app)}
                      className={`p-4 cursor-pointer transition-colors relative flex items-center justify-between
                        ${isSelected ? 'bg-indigo-50 border-l-4 border-l-indigo-600' : 'hover:bg-slate-50 border-l-4 border-l-transparent'}
                      `}
                    >
                      <div className="pr-4">
                        <p className={`font-bold text-sm ${isSelected ? 'text-indigo-900' : 'text-slate-900'}`}>
                          {app.companyName}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {app.applicantName}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${riskColors[app.riskCategory] || riskColors.Green}`}>
                            {app.riskCategory} Risk
                          </span>
                          {needsManual ? (
                            <Badge className="bg-red-100 text-red-800 border-red-200 text-[9px]">Manual Only</Badge>
                          ) : (
                            <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-[9px]">Video Ready</Badge>
                          )}
                        </div>
                      </div>
                      {isSelected && <ChevronRight className="h-5 w-5 text-indigo-400 absolute right-4" />}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right Card: Action Panel (Video Verification details) */}
        <Card className="flex flex-col h-full md:col-span-7 lg:col-span-8 border-slate-200 shadow-sm">
          {!selectedApp ? (
            <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-slate-400">
              <Video className="h-12 w-12 mb-4 text-slate-200" />
              <p>Select an applicant from the queue to view details.</p>
            </div>
          ) : (
            <>
              <CardHeader className="border-b border-slate-100 pb-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-xl flex items-center gap-2 text-slate-900">
                      <Video className="h-5 w-5 text-blue-600" />
                      Verification Room
                    </CardTitle>
                    <CardDescription>
                      Applicant: <span className="font-semibold text-slate-700">{selectedApp.companyName}</span>
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className={isSelectedAppGreen ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-red-50 text-red-700 border-red-200"}>
                    {isSelectedAppGreen ? "Clear for Video Call" : "Physical Visit Required"}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4 flex-grow pt-6">
                <div className="rounded-lg border bg-slate-50 p-5">
                  <h3 className="font-semibold text-slate-900 text-lg">
                    {isSelectedAppGreen ? "Low-Risk Self-Certification Review" : "High-Risk Compliance Inspection"}
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="space-y-1">
                      <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Representative</p>
                      <p className="text-sm font-medium text-slate-800 flex items-center gap-2">
                        <User className="h-4 w-4 text-indigo-500" /> {selectedApp.applicantName}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Scheduled For</p>
                      <p className="text-sm font-medium text-slate-800 flex items-center gap-2">
                        <Clock className="h-4 w-4 text-blue-500" /> {schedule.formatted}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3 mt-6 pt-6 border-t border-slate-200">
                    <h4 className="text-sm font-bold text-slate-900">Officer Verification Checklist:</h4>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2.5 text-sm text-slate-600">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 min-w-4" />
                        <span>Verify the applicant is physically at the registered office premises.</span>
                      </li>
                      <li className="flex items-start gap-2.5 text-sm text-slate-600">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 min-w-4" />
                        <span>Instruct them to show original documents matching the self-certification on camera.</span>
                      </li>
                      <li className="flex items-start gap-2.5 text-sm text-slate-600">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 min-w-4" />
                        <span>Confirm geolocation coordinates if possible during the call.</span>
                      </li>
                    </ul>
                  </div>

                  {schedule.status === "RESCHEDULE_REQUESTED" && schedule.initiator === "APPLICANT" && (
                    <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg shadow-sm">
                      <p className="text-sm font-bold text-amber-800 flex items-center gap-2">
                        <Clock className="w-4 h-4" /> Reschedule Request Pending
                      </p>
                      <p className="text-sm text-amber-900 mt-2">
                        Applicant wants to reschedule to <strong className="bg-amber-100 px-1 rounded">{schedule.proposedFormatted}</strong>.<br/>
                        <span className="opacity-80">Reason: {schedule.reason || "None provided"}</span>
                      </p>
                      <div className="flex gap-2 mt-4">
                        <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={handleApprove}>
                          Approve Request
                        </Button>
                        <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50 bg-white" onClick={handleReject}>
                          Decline
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>

              <CardFooter className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-100 bg-slate-50/50">
                {/* Reschedule Dialog */}
                <Dialog open={rescheduleOpen} onOpenChange={setRescheduleOpen}>
                  <DialogTrigger className={buttonVariants({ variant: "outline", className: "w-full sm:flex-1 cursor-pointer bg-white" })}>
                    Suggest Reschedule
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

                {/* Call Button - Only available for Green/White category applications */}
                {isSelectedAppGreen ? (
                  <Button
                    onClick={handleCallApplicant}
                    disabled={isCalling || !client}
                    className="w-full sm:flex-1 bg-blue-600 hover:bg-blue-700 text-white flex gap-2 justify-center shadow-md"
                  >
                    <Video className="h-4 w-4" />
                    {isCalling ? "Connecting..." : !client ? "Initializing..." : "Call Applicant"}
                  </Button>
                ) : (
                  <div className="w-full sm:flex-1 group relative">
                    <Button
                      disabled
                      className="w-full bg-slate-200 text-slate-500 cursor-not-allowed flex gap-2 justify-center"
                    >
                      <Video className="h-4 w-4" />
                      Call Disabled (High Risk)
                    </Button>
                    <div className="absolute opacity-0 group-hover:opacity-100 transition bottom-full left-1/2 -translate-x-1/2 mb-2 w-[250px] text-xs text-white bg-slate-800 p-2 rounded shadow-lg pointer-events-none text-center z-10">
                      High-Risk (Red & Orange) applications strictly mandate physical manual site visits. Remote video verification is prohibited.
                    </div>
                  </div>
                )}
              </CardFooter>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
