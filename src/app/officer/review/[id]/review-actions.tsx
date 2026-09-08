"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, HelpCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function ReviewActions({ appId, approvalId, currentStatus, currentComment }: {
  appId: string;
  approvalId: number;
  currentStatus: string;
  currentComment?: string;
}) {
  const router = useRouter();
  const [comment, setComment] = useState(currentComment || "");
  const [status, setStatus] = useState(currentStatus);
  const [saving, setSaving] = useState(false);

  const handleDecision = async (decision: "APPROVED" | "REJECTED" | "QUERIED") => {
    if (!comment.trim() && decision !== "APPROVED") {
      toast.error("Please add a comment before querying or rejecting.");
      return;
    }
    setSaving(true);
    
    await fetch("/api/officer/review", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ appId, approvalId, status: decision, comment }),
    });

    setStatus(decision);
    setSaving(false);
    router.refresh();
  };

  if (status === "APPROVED" || status === "REJECTED") {
    return (
      <div className="space-y-3">
        <Badge className={status === "APPROVED" ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"}>
          {status}
        </Badge>
        {currentComment && <p className="text-sm text-slate-700 italic">&ldquo;{currentComment}&rdquo;</p>}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <textarea
        className="w-full border border-slate-200 rounded-lg p-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        rows={3}
        placeholder="Add review comments..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />
      <Button className="w-full justify-start bg-emerald-600 hover:bg-emerald-700" onClick={() => handleDecision("APPROVED")} disabled={saving}>
        <CheckCircle2 className="w-4 h-4 mr-2" /> Approve
      </Button>
      <Button className="w-full justify-start bg-amber-600 hover:bg-amber-700" onClick={() => handleDecision("QUERIED")} disabled={saving}>
        <HelpCircle className="w-4 h-4 mr-2" /> Raise Query
      </Button>
      <Button className="w-full justify-start" variant="destructive" onClick={() => handleDecision("REJECTED")} disabled={saving}>
        <XCircle className="w-4 h-4 mr-2" /> Reject
      </Button>
    </div>
  );
}
