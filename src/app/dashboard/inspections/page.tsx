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
import { Calendar, Video, CheckCircle2, Clock, MapPin, Building2, Users, Check, ChevronLeft, ChevronRight, VideoIcon } from "lucide-react";
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

export default function InspectionsPage() {
  const [rescheduleOpen, setRescheduleOpen] = React.useState(false);
  const [reqOpen, setReqOpen] = React.useState(false);
  
  const [schedule, setSchedule] = React.useState<any>({
    date: "2026-09-20",
    time: "15:00",
    formatted: "20 Sep 2026, 03:00 PM",
    status: "SCHEDULED"
  });
  const [date, setDate] = React.useState(schedule.date);
  const [time, setTime] = React.useState(schedule.time);

  const [reason, setReason] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  
  // Custom Calendar state (Defaulting to September 2026)
  const [calMonth, setCalMonth] = React.useState(8); // 0-indexed (8 = September)
  const [calYear, setCalYear] = React.useState(2026);

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
    if (!date || !time) {
      toast.error("Please select both a date and a time slot.");
      return;
    }
    
    setIsSubmitting(true);
    try {
      const { requestReschedule } = await import("@/actions/inspections");
      await requestReschedule({
        newDate: date,
        newTime: time,
        reason: reason || "No reason provided",
        initiator: "APPLICANT",
      });
      toast.success("Reschedule request sent to officer for approval.");
      setRescheduleOpen(false);
      setReason("");
      
      const { fetchInspectionSchedule } = await import("@/actions/inspections");
      const s = await fetchInspectionSchedule();
      setSchedule(s);
    } catch (err) {
      toast.error("Failed to send reschedule request.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calendar generation helpers
  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();
  
  const handlePrevMonth = () => {
    if (calMonth === 0) {
      setCalMonth(11);
      setCalYear(calYear - 1);
    } else {
      setCalMonth(calMonth - 1);
    }
  };
  
  const handleNextMonth = () => {
    if (calMonth === 11) {
      setCalMonth(0);
      setCalYear(calYear + 1);
    } else {
      setCalMonth(calMonth + 1);
    }
  };

  const daysInMonth = getDaysInMonth(calYear, calMonth);
  const firstDay = getFirstDayOfMonth(calYear, calMonth);
  const calendarDays = Array(firstDay).fill(null).concat(Array.from({ length: daysInMonth }, (_, i) => i + 1));
  
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  
  // Available time slots (strictly 10 AM to 5 PM, meaning last start is 4:00 PM)
  const availableSlots = ["10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00"];
  
  const formatTimeSlot = (timeStr: string) => {
    const [h, m] = timeStr.split(':');
    const hh = parseInt(h);
    const ampm = hh >= 12 ? 'PM' : 'AM';
    const h12 = hh % 12 || 12;
    return `${h12}:${m} ${ampm}`;
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
        {/* Section 1: Coordinated Inspections (Untouched structure) */}
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

        {/* Section 2: Remote/Video Verification (Upgraded) */}
        <Card className="flex flex-col h-full border-blue-200 shadow-sm">
          <CardHeader className="pb-3 border-b border-slate-100">
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
              <Badge variant="outline" className={schedule.status === "SCHEDULED" ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-blue-50 text-blue-700 border-blue-200"}>
                {schedule.status === "SCHEDULED" ? "Action Required" : "Update Pending"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 flex-grow pt-4">
             <div className="rounded-lg border bg-white shadow-sm p-5 border-slate-200">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">Low-Risk Self-Certification</h3>
                  <p className="text-sm text-slate-600 mt-1 flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-slate-400" /> MIDC Department
                  </p>
                  <p className="text-sm font-medium text-slate-800 mt-2 flex items-center gap-2 bg-slate-50 border border-slate-100 p-2 rounded-md">
                    <Clock className="h-4 w-4 text-blue-600" /> {schedule.status === "RESCHEDULE_REQUESTED" ? "Currently Scheduled: " : ""}{schedule.formatted}
                  </p>
                </div>
              </div>

              <div className="space-y-3 mt-5 pt-5 border-t border-slate-100">
                 <h4 className="text-sm font-semibold text-slate-900">Preparation Checklist</h4>
                 <ul className="space-y-2.5">
                   <li className="flex items-start gap-2.5 text-sm text-slate-600">
                     <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 min-w-4" />
                     <span>Ensure stable internet connection and working camera/microphone.</span>
                   </li>
                   <li className="flex items-start gap-2.5 text-sm text-slate-600">
                     <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 min-w-4" />
                     <span>Keep self-certification documents ready for screen sharing.</span>
                   </li>
                    <li className="flex items-start gap-2.5 text-sm text-slate-600">
                     <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 min-w-4" />
                     <span>Be at the registered office premises during the call.</span>
                   </li>
                 </ul>
              </div>

              {schedule.status === "RESCHEDULE_REQUESTED" && (
                <div className="mt-6 p-4 bg-slate-50 border border-slate-200 rounded-lg shadow-inner">
                  <h4 className="text-sm font-bold text-slate-900 mb-4">Reschedule Request Timeline</h4>
                  
                  {/* Animated Stepper for Pending Request */}
                  <div className="flex items-center justify-between relative px-2">
                    <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-slate-200 -z-10 -translate-y-1/2"></div>
                    
                    {/* Step 1: Requested */}
                    <div className="flex flex-col items-center gap-2 z-10">
                       <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-sm">
                         <Check className="w-4 h-4"/>
                       </div>
                       <span className="text-emerald-700 font-medium text-xs text-center w-20">Requested<br/><span className="font-normal">{schedule.proposedFormatted?.split(',')[0]}</span></span>
                    </div>
                    
                    {/* Step 2: Pending Officer */}
                    <div className="flex flex-col items-center gap-2 z-10">
                       <div className="w-8 h-8 rounded-full bg-amber-400 text-white flex items-center justify-center shadow-md ring-4 ring-amber-100 animate-pulse">
                         <Clock className="w-4 h-4"/>
                       </div>
                       <span className="text-amber-700 font-bold text-xs animate-pulse text-center w-24">Pending Officer<br/>Approval</span>
                    </div>
                    
                    {/* Step 3: Confirmed (Future) */}
                    <div className="flex flex-col items-center gap-2 z-10">
                       <div className="w-8 h-8 rounded-full bg-slate-100 border-2 border-slate-200 text-slate-400 flex items-center justify-center">
                         <CheckCircle2 className="w-4 h-4"/>
                       </div>
                       <span className="text-slate-500 font-medium text-xs text-center w-20">Confirmed</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-100 bg-slate-50/50">
            <Dialog open={rescheduleOpen} onOpenChange={setRescheduleOpen}>
              <DialogTrigger className={buttonVariants({ variant: "outline", className: "w-full sm:flex-1 cursor-pointer bg-white" })}>
                Reschedule
              </DialogTrigger>
              <DialogContent className="sm:max-w-[700px] p-0 overflow-hidden">
                <div className="p-6 pb-4 border-b border-slate-100 bg-slate-50">
                  <DialogTitle className="text-xl">Select a Date & Time</DialogTitle>
                  <DialogDescription className="mt-1">
                    Propose a new remote video verification slot. Government working hours are strictly between 10:00 AM and 5:00 PM.
                  </DialogDescription>
                </div>
                
                <div className="flex flex-col sm:flex-row min-h-[350px]">
                  {/* Left Pane: Custom Calendar */}
                  <div className="flex-1 p-6 border-r border-slate-100">
                    <div className="flex items-center justify-between mb-4">
                      <Button variant="ghost" size="icon" onClick={handlePrevMonth} className="h-8 w-8"><ChevronLeft className="w-4 h-4" /></Button>
                      <h4 className="font-semibold text-slate-900">{monthNames[calMonth]} {calYear}</h4>
                      <Button variant="ghost" size="icon" onClick={handleNextMonth} className="h-8 w-8"><ChevronRight className="w-4 h-4" /></Button>
                    </div>
                    
                    <div className="grid grid-cols-7 gap-1 text-center mb-2">
                      {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                        <div key={day} className="text-xs font-semibold text-slate-500 py-1">{day}</div>
                      ))}
                    </div>
                    
                    <div className="grid grid-cols-7 gap-1">
                      {calendarDays.map((dayNum, i) => {
                        if (!dayNum) return <div key={`empty-${i}`} className="p-2"></div>;
                        
                        const dateString = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                        const isSelected = date === dateString;
                        const isPast = new Date(dateString) < new Date(new Date().setHours(0,0,0,0));
                        const isSunday = new Date(dateString).getDay() === 0;
                        const disabled = isPast || isSunday;
                        
                        return (
                          <button
                            key={i}
                            disabled={disabled}
                            onClick={() => { setDate(dateString); setTime(""); }}
                            className={`w-10 h-10 rounded-full flex items-center justify-center text-sm transition-all
                              ${isSelected ? "bg-blue-600 text-white font-bold shadow-md hover:bg-blue-700" : 
                                disabled ? "text-slate-300 cursor-not-allowed" : 
                                "text-slate-700 hover:bg-slate-100 font-medium"
                              }
                            `}
                          >
                            {dayNum}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  
                  {/* Right Pane: Time Slots */}
                  <div className="w-full sm:w-[280px] bg-slate-50 p-6 flex flex-col">
                    <h4 className="font-medium text-slate-900 mb-4 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-slate-500" />
                      {date ? new Date(date).toLocaleDateString('en-IN', { weekday: 'long', month: 'short', day: 'numeric' }) : "Select a date"}
                    </h4>
                    
                    <div className="flex-1 overflow-y-auto pr-2 space-y-2">
                      {date ? (
                        availableSlots.map((slot) => {
                          const isSelected = time === slot;
                          return (
                            <button
                              key={slot}
                              onClick={() => setTime(slot)}
                              className={`w-full py-2.5 rounded-md border text-sm font-medium transition-all ${
                                isSelected 
                                  ? "bg-blue-600 border-blue-600 text-white shadow-sm" 
                                  : "bg-white border-slate-200 text-slate-700 hover:border-blue-300 hover:text-blue-700"
                              }`}
                            >
                              {formatTimeSlot(slot)}
                            </button>
                          );
                        })
                      ) : (
                        <div className="h-full flex items-center justify-center text-sm text-slate-400 pb-10">
                          Choose a valid date first
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {date && time && (
                  <div className="px-6 py-4 border-t border-slate-100 bg-white">
                    <Label htmlFor="reason" className="mb-2 block">Optional Reason for Rescheduling</Label>
                    <Input id="reason" placeholder="e.g. Traveling out of station" value={reason} onChange={e => setReason(e.target.value)} />
                  </div>
                )}
                
                <div className="p-4 border-t border-slate-200 flex justify-end gap-2 bg-slate-50">
                  <Button type="button" variant="outline" onClick={() => setRescheduleOpen(false)} disabled={isSubmitting}>
                    Cancel
                  </Button>
                  <Button type="button" onClick={handleRescheduleSubmit} disabled={isSubmitting || !date || !time} className="min-w-[140px]">
                    {isSubmitting ? "Submitting..." : "Confirm Request"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            
            {/* Upgraded Active Standby Button */}
            {schedule.status === "RESCHEDULE_REQUESTED" ? (
               <Button 
                disabled
                className="w-full sm:flex-1 bg-slate-100 border border-slate-200 text-slate-400 cursor-not-allowed flex gap-2 justify-center"
              >
                <Clock className="h-4 w-4" />
                Locked for Review
              </Button>
            ) : (
              <Button 
                variant="outline"
                className="w-full sm:flex-1 border-blue-300 bg-blue-50 hover:bg-blue-100 text-blue-700 flex gap-2 justify-center relative overflow-hidden group"
              >
                {/* Animated pulsing dot */}
                <span className="relative flex h-3 w-3 mr-1">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-600"></span>
                </span>
                
                System Online: Awaiting Officer's Call
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
