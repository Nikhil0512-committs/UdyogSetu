"use client";

import React from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Calendar, Video, CheckCircle2, Clock, MapPin, Building2, Users } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { notifyReschedule, fetchMeetingSchedule } from "@/actions/notifications";

export default function InspectionsPage() {
  const [rescheduleOpen, setRescheduleOpen] = React.useState(false);
  const [reqOpen, setReqOpen] = React.useState(false);
  
  const [schedule, setSchedule] = React.useState({
    date: "2026-08-28",
    time: "15:00",
    formatted: "28 Aug 2026, 03:00 PM"
  });
  const [date, setDate] = React.useState(schedule.date);
  const [time, setTime] = React.useState(schedule.time);

  const [reason, setReason] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  
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
        to: "officer",
        newDate: date,
        newTime: time,
        reason,
        initiator: "Applicant",
      });
      setSchedule(res.newSchedule);
      toast.success("Reschedule request sent! The officer has been notified.");
      setRescheduleOpen(false);
      setReason("");
    } catch (err) {
      toast.error("Failed to send reschedule notification.");
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Inspections & Verification
        </h1>
        <p className="text-slate-600 mt-2">
          Manage your coordinated inspection planning and remote/video verifications.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Section 1: Coordinated Inspections */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <CardTitle className="text-xl flex items-center gap-2 text-slate-900">
                  <Calendar className="h-5 w-5 text-indigo-600" />
                  Upcoming Coordinated Inspections
                </CardTitle>
                <CardDescription>
                  Multiple departments visiting on the same date
                </CardDescription>
              </div>
              <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">
                Scheduled
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border bg-slate-50 p-4">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-semibold text-slate-900">Joint Factory Inspection</h3>
                  <p className="text-sm text-slate-600 mt-1 flex items-center gap-1">
                    <Clock className="h-4 w-4" /> 15 Oct 2026, 10:00 AM - 02:00 PM
                  </p>
                  <p className="text-sm text-slate-600 mt-1 flex items-center gap-1">
                    <MapPin className="h-4 w-4" /> Unit 4, MIDC Industrial Area
                  </p>
                </div>
              </div>
              
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-slate-900 flex items-center gap-2">
                  <Users className="h-4 w-4" /> Participating Departments:
                </h4>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between bg-white p-2 rounded border text-sm">
                    <span className="flex items-center gap-2 font-medium text-slate-700">
                      <Building2 className="h-4 w-4 text-emerald-600" />
                      MPCB (Pollution Control Board)
                    </span>
                    <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50">
                      Confirmed
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between bg-white p-2 rounded border text-sm">
                    <span className="flex items-center gap-2 font-medium text-slate-700">
                      <Building2 className="h-4 w-4 text-orange-600" />
                      Fire Department
                    </span>
                    <Badge variant="secondary" className="bg-orange-50 text-orange-700 hover:bg-orange-50">
                      Confirmed
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Dialog open={reqOpen} onOpenChange={setReqOpen}>
              <DialogTrigger className={buttonVariants({ className: "w-full bg-slate-900 hover:bg-slate-800 text-white cursor-pointer" })}>
                View Inspection Requirements
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Site Preparation Checklist</DialogTitle>
                  <DialogDescription>
                    Please ensure the following are ready before the joint inspection on 15 Oct 2026.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <h4 className="font-semibold text-emerald-700 flex items-center gap-2 mb-2"><Building2 className="w-4 h-4"/> MPCB Requirements</h4>
                    <ul className="text-sm space-y-2 text-slate-600 ml-6 list-disc">
                      <li>Effluent Treatment Plant (ETP) logbooks updated.</li>
                      <li>Hazardous waste disposal manifests ready for review.</li>
                      <li>Ambient air quality monitoring report (last 3 months).</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-orange-700 flex items-center gap-2 mb-2"><Building2 className="w-4 h-4"/> Fire Dept Requirements</h4>
                    <ul className="text-sm space-y-2 text-slate-600 ml-6 list-disc">
                      <li>Fire extinguishers unblocked and recently serviced.</li>
                      <li>Evacuation map prominently displayed on all floors.</li>
                      <li>Hydrant pump system test logs available.</li>
                    </ul>
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={() => setReqOpen(false)} className="w-full">Understood</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardFooter>
        </Card>

        {/* Section 2: Remote/Video Verification */}
        <Card className="flex flex-col h-full">
          <CardHeader>
             <div className="flex items-center justify-between">
              <div className="space-y-1">
                <CardTitle className="text-xl flex items-center gap-2 text-slate-900">
                  <Video className="h-5 w-5 text-blue-600" />
                  Remote/Video Verification
                </CardTitle>
                <CardDescription>
                  Pending verifications requiring online presence
                </CardDescription>
              </div>
              <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                Action Required
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 flex-grow">
             <div className="rounded-lg border bg-slate-50 p-4">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-semibold text-slate-900">Low-Risk Self-Certification</h3>
                  <p className="text-sm text-slate-600 mt-1 flex items-center gap-1">
                    <Building2 className="h-4 w-4" /> MIDC
                  </p>
                  <p className="text-sm text-slate-600 mt-1 flex items-center gap-1">
                    <Clock className="h-4 w-4" /> {schedule.formatted}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                 <h4 className="text-sm font-medium text-slate-900">Preparation Checklist:</h4>
                 <ul className="space-y-2">
                   <li className="flex items-start gap-2 text-sm text-slate-600">
                     <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 min-w-4" />
                     <span>Ensure stable internet connection and working camera/microphone.</span>
                   </li>
                   <li className="flex items-start gap-2 text-sm text-slate-600">
                     <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 min-w-4" />
                     <span>Keep self-certification documents ready for screen sharing.</span>
                   </li>
                    <li className="flex items-start gap-2 text-sm text-slate-600">
                     <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 min-w-4" />
                     <span>Be at the registered office premises during the call.</span>
                   </li>
                 </ul>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row gap-3 pt-4">
            <Dialog open={rescheduleOpen} onOpenChange={setRescheduleOpen}>
              <DialogTrigger className={buttonVariants({ variant: "outline", className: "w-full sm:flex-1 cursor-pointer" })}>
                Reschedule
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Propose New Date</DialogTitle>
                  <DialogDescription>
                    Select a new preferred date and time for the remote video verification. The officer will review your request.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="date" className="text-right">
                      Date
                    </Label>
                    <Input id="date" type="date" className="col-span-3" value={date} onChange={e => setDate(e.target.value)} />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="time" className="text-right">
                      Time
                    </Label>
                    <Input id="time" type="time" className="col-span-3" value={time} onChange={e => setTime(e.target.value)} />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="reason" className="text-right">
                      Reason
                    </Label>
                    <Input id="reason" placeholder="Brief reason for rescheduling" className="col-span-3" value={reason} onChange={e => setReason(e.target.value)} />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setRescheduleOpen(false)} disabled={isSubmitting}>
                    Cancel
                  </Button>
                  <Button type="button" onClick={handleRescheduleSubmit} disabled={isSubmitting}>
                    {isSubmitting ? "Submitting..." : "Submit Request"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Button 
              disabled
              className="w-full sm:flex-1 bg-slate-200 text-slate-500 cursor-not-allowed flex gap-2 justify-center"
            >
              <Clock className="h-4 w-4" />
              Waiting for Officer to Call...
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
