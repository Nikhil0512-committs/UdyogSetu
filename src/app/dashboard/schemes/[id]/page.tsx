"use client";

import { useState, useRef, use } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, ChevronLeft, FileText, UploadCloud, Zap, Loader2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function SchemeApplicationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  
  const [fileUploaded, setFileUploaded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Mock scheme details
  const schemeName = id === "1" ? "Package Scheme of Incentives (PSI - 2019)" :
                     id === "2" ? "Chief Minister Employment Generation Programme (CMEGP)" :
                     id === "3" ? "Green Industrial Initiative" : "Women Entrepreneurship Subsidy";

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <Link href="/dashboard/schemes">
        <Button variant="ghost" size="sm" className="-ml-3 text-slate-500 hover:text-slate-900">
          <ChevronLeft className="w-4 h-4 mr-1" /> Back to Schemes
        </Button>
      </Link>

      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Apply for {schemeName}</h1>
        <p className="text-slate-500 mt-2">
          Through the UdyogSetu single-window portal, your enterprise profile and verified documents are automatically linked to this scheme application.
        </p>
      </div>

      <Card className="border-emerald-200 bg-emerald-50/50">
        <CardHeader>
          <CardTitle className="text-emerald-800 flex items-center gap-2">
            <Zap className="w-5 h-5 text-emerald-600" />
            Smart Auto-Fill Active
          </CardTitle>
          <CardDescription className="text-emerald-700">
            We have pre-filled 80% of this application using your Udyam Registration and previously uploaded documents.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-white p-4 rounded-lg border border-emerald-100 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
            <div>
              <p className="font-medium text-slate-900">Enterprise Profile Linked</p>
              <p className="text-sm text-slate-500">M/S Rahul Sharma Industries • Micro Scale • Manufacturing</p>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-emerald-100 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
            <div>
              <p className="font-medium text-slate-900">Document Wallet Linked</p>
              <p className="text-sm text-slate-500">PAN Card, GST Certificate, and Udyam Aadhaar automatically attached.</p>
            </div>
          </div>
          
          <div className={`bg-white p-4 rounded-lg border flex items-start gap-3 transition-colors ${fileUploaded ? 'border-emerald-200' : 'border-amber-200'}`}>
            {fileUploaded ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
            ) : (
              <UploadCloud className="w-5 h-5 text-amber-500 flex-shrink-0" />
            )}
            <div className="w-full">
              <p className="font-medium text-slate-900">
                {fileUploaded ? "Project Report Uploaded" : "1 Additional Document Required"}
              </p>
              <p className="text-sm text-slate-500 mb-3">Project Report / Detailed Business Plan (DBP)</p>
              
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept=".pdf,.doc,.docx"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    setFileUploaded(true);
                  }
                }}
              />
              {!fileUploaded && (
                <Button size="sm" variant="outline" className="w-full sm:w-auto" onClick={() => fileInputRef.current?.click()}>
                  <FileText className="w-4 h-4 mr-2" /> Upload Project Report
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4 mt-8">
        <Button variant="outline" size="lg">Save Draft</Button>
        <Button 
          className="bg-blue-600 hover:bg-blue-700 text-white" 
          size="lg"
          disabled={!fileUploaded || isSubmitting}
          onClick={async () => {
            setIsSubmitting(true);
            const res = await fetch("/api/applicant/submit-scheme", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ schemeId: id, schemeName })
            });
            const data = await res.json();
            toast.success(`Application ${data.appId} submitted successfully to Directorate of Industries!`);
            router.push(`/dashboard/track/${data.appId}`);
          }}
        >
          {isSubmitting ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : null}
          {isSubmitting ? "Submitting..." : "Submit Application to Directorate"}
        </Button>
      </div>

    </div>
  );
}
