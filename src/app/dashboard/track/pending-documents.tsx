"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UploadCloud, Check, FileText, Building, Loader2, ScanFace, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface MissingDoc {
  docType: string;
  department: string;
  approvalName: string;
}

export default function PendingDocuments({
  applicationId,
  missingDocs: initialMissingDocs,
}: {
  applicationId: string;
  missingDocs: MissingDoc[];
}) {
  const [missingDocs, setMissingDocs] = useState<MissingDoc[]>(initialMissingDocs);
  const [uploadedDocs, setUploadedDocs] = useState<Record<string, { fileName: string }>>({});
  const [uploadingDoc, setUploadingDoc] = useState<string | null>(null);
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  if (initialMissingDocs.length === 0) return null;

  const allUploaded = missingDocs.every((d) => uploadedDocs[d.docType]);

  const handleFileSelected = async (docType: string, department: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingDoc(docType);

    const reader = new FileReader();
    reader.onload = async () => {
      const fileBase64 = reader.result as string;

      try {
        // Step 1: Run through the OCR pipeline for AI verification
        const ocrRes = await fetch("/api/ocr", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fileBase64,
            fileName: file.name,
            mimeType: file.type || "application/pdf",
            targetDocName: docType,
          }),
        });

        const ocrData = await ocrRes.json();

        if (!ocrData.success && ocrData.isIrrelevant) {
          toast.error(ocrData.error || `The uploaded file doesn't appear to be a valid document.`);
          setUploadingDoc(null);
          return;
        }

        // Step 2: Save to database via upload-document API
        const uploadRes = await fetch("/api/applicant/upload-document", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            applicationId,
            docType,
            fileBase64,
            fileName: file.name,
          }),
        });

        const uploadData = await uploadRes.json();

        if (!uploadData.success) {
          toast.error(uploadData.error || "Failed to save document.");
          setUploadingDoc(null);
          return;
        }

        // Success
        setUploadedDocs((prev) => ({
          ...prev,
          [docType]: { fileName: file.name },
        }));

        toast.success(`✓ ${docType} uploaded and verified for ${department}`);
      } catch (err) {
        console.error("Upload error:", err);
        toast.error("Failed to upload document. Please try again.");
      } finally {
        setUploadingDoc(null);
      }
    };
    reader.readAsDataURL(file);

    // Reset the input so the same file can be re-selected
    if (fileRefs.current[docType]) fileRefs.current[docType]!.value = "";
  };

  return (
    <Card className={`shadow-sm ${allUploaded ? "border-emerald-300 bg-emerald-50/30" : "border-amber-300 bg-amber-50/30"}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2 text-slate-900">
              {allUploaded ? (
                <Check className="w-5 h-5 text-emerald-600" />
              ) : (
                <AlertCircle className="w-5 h-5 text-amber-600" />
              )}
              {allUploaded ? "All Documents Uploaded" : "Pending Department Documents"}
            </CardTitle>
            <CardDescription className="text-slate-600 mt-1">
              {allUploaded
                ? "All required department-specific documents have been uploaded. Officers can now review them."
                : "These approval-specific documents are needed by the respective departments. Upload them here to speed up your approval."}
            </CardDescription>
          </div>
          <Badge
            variant="outline"
            className={
              allUploaded
                ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                : "bg-amber-100 text-amber-800 border-amber-300"
            }
          >
            {missingDocs.filter((d) => uploadedDocs[d.docType]).length} / {missingDocs.length} uploaded
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {missingDocs.map((doc) => {
          const isUploaded = !!uploadedDocs[doc.docType];
          const isUploading = uploadingDoc === doc.docType;

          return (
            <div
              key={doc.docType}
              className={`p-4 rounded-lg border transition-colors ${
                isUploaded
                  ? "bg-emerald-50 border-emerald-200"
                  : "bg-white border-slate-200 hover:border-blue-200"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center ${
                      isUploaded ? "bg-emerald-500" : "bg-amber-100"
                    }`}
                  >
                    {isUploaded ? (
                      <Check className="w-5 h-5 text-white" />
                    ) : (
                      <Building className="w-4 h-4 text-amber-700" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-semibold text-slate-900">
                        {doc.approvalName}
                      </h4>
                      {isUploaded && (
                        <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 text-[10px] px-1.5 py-0">
                          Verified
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 font-medium">
                      → Required by:{" "}
                      <span className="text-blue-700 font-semibold">{doc.department}</span>
                    </p>
                    <p className="text-xs text-blue-700 font-medium flex items-center gap-1 mt-0.5">
                      <FileText className="w-3 h-3" /> {doc.docType}
                    </p>
                    {isUploaded && (
                      <p className="text-xs text-emerald-700 mt-0.5">
                        ✓ {uploadedDocs[doc.docType].fileName}
                      </p>
                    )}
                  </div>
                </div>
                <div>
                  {isUploaded ? (
                    <Badge className="bg-emerald-100 text-emerald-800 border-none text-xs">
                      <Check className="w-3 h-3 mr-1" /> Done
                    </Badge>
                  ) : (
                    <>
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        className="hidden"
                        ref={(el) => {
                          fileRefs.current[doc.docType] = el;
                        }}
                        onChange={(e) => handleFileSelected(doc.docType, doc.department, e)}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs gap-1.5"
                        disabled={isUploading}
                        onClick={() => fileRefs.current[doc.docType]?.click()}
                      >
                        {isUploading ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            Verifying...
                          </>
                        ) : (
                          <>
                            <UploadCloud className="w-3.5 h-3.5" />
                            Upload
                          </>
                        )}
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {!allUploaded && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-3 mt-2">
            <ScanFace className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
            <div className="text-sm">
              <p className="font-semibold text-blue-900">AI OCR Verification Active</p>
              <p className="text-blue-800 text-xs mt-0.5">
                Each uploaded document passes through Gemini Vision AI + Regex verification before being saved. Irrelevant or unrecognizable files will be rejected.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
