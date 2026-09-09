"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Calendar, FileText, CheckCircle2, Search } from "lucide-react";
import type { SubmittedDoc } from "@/lib/mock-data";

export default function DocumentList({ documents, appId }: { documents: SubmittedDoc[], appId: string }) {
  const [selectedDoc, setSelectedDoc] = useState<SubmittedDoc | null>(null);

  return (
    <>
      <div className="space-y-3">
        {documents.map((doc) => (
          <div key={doc.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg bg-slate-50">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded flex items-center justify-center ${doc.verified ? 'bg-emerald-100' : 'bg-amber-100'}`}>
                <FileText className={`w-4 h-4 ${doc.verified ? 'text-emerald-600' : 'text-amber-600'}`} />
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 text-sm">{doc.name}</h4>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="text-xs text-slate-600">{doc.fileName} • {doc.fileSize}</span>
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> {new Date(doc.uploadedAt).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
                {doc.ocrExtracted && (
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {Object.entries(doc.ocrExtracted).map(([key, val]) => (
                      <span key={key} className="text-xs bg-blue-50 text-blue-800 px-2 py-0.5 rounded font-mono">
                        {key}: {val}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {doc.rejected ? (
                <Badge className="bg-red-100 text-red-800 border-none">Rejected</Badge>
              ) : doc.verified ? (
                <Badge className="bg-emerald-100 text-emerald-800 border-none">AI Verified</Badge>
              ) : (
                <Badge className="bg-amber-100 text-amber-800 border-none">Needs Review</Badge>
              )}
              <Button variant="outline" size="sm" className="text-xs" onClick={() => setSelectedDoc(doc)}>
                <Search className="w-3 h-3 mr-1" /> View
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={!!selectedDoc} onOpenChange={(open) => !open && setSelectedDoc(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              {selectedDoc?.name}
            </DialogTitle>
            <DialogDescription>
              {selectedDoc?.fileName} • {selectedDoc?.fileSize} • Uploaded on {selectedDoc ? new Date(selectedDoc.uploadedAt).toLocaleString("en-IN") : ""}
            </DialogDescription>
          </DialogHeader>
          
          {selectedDoc?.fileBase64 ? (
            <div className="rounded-lg overflow-hidden border border-slate-200 bg-slate-100 flex items-center justify-center" style={{ minHeight: '500px' }}>
              {selectedDoc.fileBase64.startsWith("data:image/") ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={selectedDoc.fileBase64} alt="Document Preview" className="max-w-full max-h-[600px] object-contain" />
              ) : (
                <iframe src={selectedDoc.fileBase64} className="w-full min-h-[600px]" title="Document Preview" />
              )}
            </div>
          ) : (
            <div className="bg-slate-100 rounded-lg p-8 flex flex-col items-center justify-center min-h-[400px] border border-slate-200">
              <FileText className="w-16 h-16 text-slate-300 mb-4" />
              <p className="text-slate-500 font-medium">Document Preview</p>
              <p className="text-slate-400 text-sm mt-2 max-w-sm text-center">
                (This is a secure mock preview. The actual document was not uploaded as a valid file format.)
              </p>
            </div>
          )}
          
          <div className="mt-4 p-4 rounded-lg border bg-slate-50 border-slate-200">
            <h4 className="font-semibold text-slate-900 text-sm mb-3 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Document Metadata & Verification
            </h4>
            {selectedDoc?.ocrExtracted ? (
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(selectedDoc.ocrExtracted).map(([key, val]) => (
                  <div key={key}>
                    <p className="text-xs text-slate-500">{key}</p>
                    <p className="font-mono font-medium text-slate-900 text-sm">{val}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500 italic">No structured metadata extracted for this document type.</p>
            )}
          </div>

          {selectedDoc?.rejected && (
            <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm font-semibold text-red-900">Document Rejected</p>
              <p className="text-sm text-red-800">Reason: {selectedDoc.rejectReason}</p>
            </div>
          )}
          
          <div className="flex justify-between items-center mt-4 pt-2 border-t border-slate-100">
            <div className="flex gap-2">
              {!selectedDoc?.verified && (
                <Button 
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-9"
                  onClick={async () => {
                    await fetch("/api/officer/verify-document", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ appId, docId: selectedDoc?.id })
                    });
                    window.location.reload();
                  }}
                >
                  <CheckCircle2 className="w-4 h-4 mr-1.5" /> Verify
                </Button>
              )}
              
              {!selectedDoc?.rejected && (
                <Button 
                  variant="destructive" 
                  className="text-xs h-9"
                  onClick={async () => {
                    const reason = prompt("Enter rejection reason:");
                    if (!reason) return;
                    await fetch("/api/officer/reject-document", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ appId, docId: selectedDoc?.id, reason, dept: "Reviewing Officer" })
                    });
                    window.location.reload();
                  }}
                >
                  Reject
                </Button>
              )}
            </div>
            <Button variant="outline" size="sm" onClick={() => setSelectedDoc(null)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
