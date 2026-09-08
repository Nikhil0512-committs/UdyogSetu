"use client";

import React from "react";
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
import { Plus, Ticket, Clock, CheckCircle2, AlertCircle } from "lucide-react";

// Mock Data
const mockTickets = [
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
  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Grievance Redressal & Support</h1>
          <p className="text-slate-600 mt-2">
            Raise and track support tickets for SLA delays and other application issues.
          </p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Raise New Ticket
        </Button>
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
                {mockTickets.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                      No tickets found.
                    </TableCell>
                  </TableRow>
                ) : (
                  mockTickets.map((ticket) => (
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
