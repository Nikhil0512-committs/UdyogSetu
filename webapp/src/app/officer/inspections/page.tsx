"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Video, CheckCircle2, Clock, Building2, User } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { useStreamVideoClient } from "@stream-io/video-react-sdk";

export default function OfficerInspectionsPage() {
  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [date, setDate] = useState("2026-08-30");
  const [time, setTime] = useState("15:00");
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const client = useStreamVideoClient();
  
  const handleRescheduleSubmit = async () => {
    setIsSubmitting(true);
    // Mocking API call
    await new Promise(r => setTimeout(r, 1000));
    setIsSubmitting(false);
    toast.success("Reschedule request submitted successfully! The applicant has been notified to confirm the new date.");
    setRescheduleOpen(false);
  };

  const handleCallApplicant = async () => {
    if (!client) return toast.error("Video client not initialized");
    
    // Determine if it is exactly the scheduled time (mock validation)
    // For demo purposes, we will allow it, but we can add a check here.
    toast.info("Ringing the applicant...");

    try {
      const callId = "inspection-123";
      const call = client.call("default", callId);
      
      await call.getOrCreate({
        ring: true,
        data: {
          members: [
            { user_id: client.state?.connectedUser?.id || "", role: "admin" },
            { user_id: "app-user-1", role: "user" }
          ],
        },
      });

      router.push(`/meeting/${callId}`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to ring the applicant.");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Remote Verifications Queue
        </h1>
        <p className="text-slate-600 mt-2">
          Manage your video meetings and inspection scheduling with applicants.
        </p>
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
                <CardDescription>
                  Applicant: Acme Corp Ltd.
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
                  <h3 className="font-semibold text-slate-900">Low-Risk Self-Certification Review</h3>
                  <p className="text-sm text-slate-600 mt-1 flex items-center gap-1">
                    <User className="h-4 w-4" /> Applicant Rep: Ramesh Patel
                  </p>
                  <p className="text-sm text-slate-600 mt-1 flex items-center gap-1">
                    <Clock className="h-4 w-4" /> 28 Aug 2026, 03:00 PM
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                 <h4 className="text-sm font-medium text-slate-900">Officer Guidelines:</h4>
                 <ul className="space-y-2">
                   <li className="flex items-start gap-2 text-sm text-slate-600">
                     <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 min-w-4" />
                     <span>Verify the applicant is at the registered office premises.</span>
                   </li>
                   <li className="flex items-start gap-2 text-sm text-slate-600">
                     <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 min-w-4" />
                     <span>Ask them to show the original documents matching the uploaded self-certification.</span>
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
                    Select a new preferred date and time for the remote video verification. The applicant will review your request.
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
              onClick={handleCallApplicant}
              className="w-full sm:flex-1 bg-blue-600 hover:bg-blue-700 text-white flex gap-2 justify-center"
            >
              <Video className="h-4 w-4" />
              Call Applicant
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
