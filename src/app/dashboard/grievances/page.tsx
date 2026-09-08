"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Ticket, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

// Mock Data
const initialTickets = [
  {
    id: "TKT-2023-0891",
    applicationId: "APP-UDY-5092",
    department: "MSME Registration",
    status: "Open",
    slaTracker: "Delayed by 2 Days",
    createdDate: "2026-08-25",
  },
  {
    id: "TKT-2023-0892",
    applicationId: "APP-LIC-1024",
    department: "Fire Department",
    status: "Open",
    slaTracker: "Within SLA (3 Days left)",
    createdDate: "2026-08-28",
  },
  {
    id: "TKT-2023-0845",
    applicationId: "APP-POL-9932",
    department: "Pollution Control Board",
    status: "Resolved",
    slaTracker: "Resolved on time",
    createdDate: "2026-08-10",
  },
];

export default function GrievanceRedressalPage() {
  const [tickets, setTickets] = useState(initialTickets);
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form State
  const [appId, setAppId] = useState("");
  const [department, setDepartment] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!appId || !department || !description) {
      toast.error("Please fill in all fields");
      return;
    }
    
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      const newTicket = {
        id: `TKT-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000) + 1000}`,
        applicationId: appId,
        department: department,
        status: "Open",
        slaTracker: "Just Raised",
        createdDate: new Date().toISOString().split("T")[0],
      };
      
      setTickets([newTicket, ...tickets]);
      setIsOpen(false);
      setAppId("");
      setDepartment("");
      setDescription("");
      setIsSubmitting(false);
      toast.success("New ticket raised successfully!");
    }, 600);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Grievance Redressal & Support</h1>
          <p className="text-slate-600 mt-2">
            Raise and track support tickets for SLA delays and other application issues.
          </p>
        </div>
        
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger className="flex items-center gap-2 bg-slate-900 text-slate-50 hover:bg-slate-900/90 h-9 px-4 py-2 rounded-md text-sm font-medium transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-slate-950 disabled:pointer-events-none disabled:opacity-50">
            <Plus className="w-4 h-4" />
            Raise New Ticket
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>Raise New Ticket</DialogTitle>
                <DialogDescription>
                  Submit a new grievance regarding your application delay or other issues.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="appId">Application ID</Label>
                  <Input 
                    id="appId" 
                    placeholder="e.g. APP-2026-0042" 
                    value={appId}
                    onChange={(e) => setAppId(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Input 
                    id="department" 
                    placeholder="e.g. MIDC or Fire Department" 
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <textarea 
                    id="description" 
                    placeholder="Briefly describe your issue..." 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="flex min-h-[80px] w-full rounded-md border border-slate-200 bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-slate-500 focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Submitting..." : "Submit Ticket"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl text-slate-900 flex items-center gap-2">
            <Ticket className="w-5 h-5 text-slate-500" />
            Your Tickets
          </CardTitle>
          <CardDescription className="text-slate-600">
            View the status of your raised grievances and support requests.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-slate-900 font-medium">Ticket ID</TableHead>
                  <TableHead className="text-slate-900 font-medium">Application ID</TableHead>
                  <TableHead className="text-slate-900 font-medium">Department</TableHead>
                  <TableHead className="text-slate-900 font-medium">Status</TableHead>
                  <TableHead className="text-slate-900 font-medium">SLA Tracker</TableHead>
                  <TableHead className="text-slate-900 font-medium">Created Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tickets.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                      No tickets found.
                    </TableCell>
                  </TableRow>
                ) : (
                  tickets.map((ticket) => (
                    <TableRow key={ticket.id}>
                      <TableCell className="font-medium text-slate-900">{ticket.id}</TableCell>
                      <TableCell className="text-slate-600">{ticket.applicationId}</TableCell>
                      <TableCell className="text-slate-600">{ticket.department}</TableCell>
                      <TableCell>
                        <Badge
                          variant={ticket.status === "Open" ? "destructive" : "secondary"}
                          className={`flex w-fit items-center gap-1 ${
                            ticket.status === "Open"
                              ? "bg-amber-100 text-amber-800 hover:bg-amber-100 border-amber-200"
                              : "bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-emerald-200"
                          }`}
                        >
                          {ticket.status === "Open" ? (
                            <Clock className="w-3 h-3" />
                          ) : (
                            <CheckCircle2 className="w-3 h-3" />
                          )}
                          {ticket.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {ticket.slaTracker.includes("Delayed") && (
                            <AlertCircle className="w-4 h-4 text-red-500" />
                          )}
                          <span
                            className={
                              ticket.slaTracker.includes("Delayed")
                                ? "text-red-600 font-medium"
                                : "text-slate-600"
                            }
                          >
                            {ticket.slaTracker}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-600">{ticket.createdDate}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
