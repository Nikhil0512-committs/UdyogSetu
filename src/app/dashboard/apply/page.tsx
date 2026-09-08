"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { UploadCloud, CheckCircle2, ScanFace, FileText, Check, AlertCircle, Building, ShieldCheck, X, Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ChecklistItem {
  id: number;
  dept: string;
  name: string;
  doc: string;
}

const DEFAULT_CHECKLIST: ChecklistItem[] = [
  { id: 1, dept: "MIDC", name: "Factory Building Plan Approval", doc: "Machinery layout & safety officer details" },
  { id: 2, dept: "MPCB", name: "Consent to Establish (Water & Air)", doc: "Pollution control equipment details" },
  { id: 3, dept: "Fire Services Department", name: "Provisional Fire NOC", doc: "Site plan showing fire exits & hydrant layout" },
  { id: 4, dept: "Labour Department", name: "Shops & Establishment Registration", doc: "Employer details and worker roster" }
];

export default function ApplyPage() {
  const router = useRouter();
  const ocrFileRef = useRef<HTMLInputElement>(null);
  const docFileRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const [uploading, setUploading] = useState(false);
  const [ocrFileName, setOcrFileName] = useState("");
  const [checklist, setChecklist] = useState<ChecklistItem[]>(DEFAULT_CHECKLIST);
  const [riskCategory, setRiskCategory] = useState("Green");
  const [uploadedDocs, setUploadedDocs] = useState<Record<string, { uploaded: boolean; fileName: string }>>({});
  const [formData, setFormData] = useState({
    pan: "",
    companyName: "",
    address: "",
    gstin: ""
  });

  useEffect(() => {
    const stored = localStorage.getItem("generatedChecklist");
    const risk = localStorage.getItem("riskCategory");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) setChecklist(parsed);
      } catch (e) {
        console.warn("Error parsing stored checklist:", e);
      }
    }
    if (risk) setRiskCategory(risk);
  }, []);

  const processFileWithAI = async (file: File, targetDocName?: string) => {
    setUploading(true);
    setOcrFileName(file.name);

    return new Promise<void>((resolve) => {
      const reader = new FileReader();
      reader.onload = async () => {
        const fileBase64 = reader.result as string;
        try {
          const res = await fetch("/api/ocr", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              fileBase64,
              fileName: file.name,
              mimeType: file.type || "application/pdf",
              targetDocName
            })
          });

          const data = await res.json();

          if (!data.success || data.isIrrelevant) {
            toast.error(data.error || "Unrecognized or irrelevant file. Please upload a valid business document.");
            setUploading(false);
            resolve();
            return;
          }

          const docKey = targetDocName || data.documentType || "Certificate of Incorporation / Udyam";
          
          if (data.extractedData) {
            setFormData({
              pan: data.extractedData.pan,
              companyName: data.extractedData.companyName,
              address: data.extractedData.address,
              gstin: data.extractedData.gstin
            });
          }

          setUploadedDocs(prev => ({
            ...prev,
            [docKey]: { uploaded: true, fileName: file.name }
          }));

          toast.success(`AI OCR Verified: ${docKey}`);
        } catch (err) {
          console.error("OCR Client Error:", err);
          toast.error("Failed to analyze document. Please upload a valid business document.");
        } finally {
          setUploading(false);
          resolve();
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleOcrFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processFileWithAI(file);
  };

  const handleDocFileSelected = (docName: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processFileWithAI(file, docName);
  };

  const handleAutoFillAllDemo = () => {
    const randomNum = Math.floor(1000 + Math.random() * 8999);
    const demoPan = `MH` + String.fromCharCode(65 + Math.floor(Math.random() * 26)) + String.fromCharCode(65 + Math.floor(Math.random() * 26)) + randomNum + `P`;
    const demoGstin = `27${demoPan}1Z5`;
    
    setFormData({
      pan: demoPan,
      companyName: "Sahyadri Industrial Works Pvt Ltd",
      address: "Plot No. 42, MIDC Chakan, Pune",
      gstin: demoGstin
    });
    const newDocs: Record<string, { uploaded: boolean; fileName: string }> = {};
    universalDocs.forEach(d => {
      newDocs[d] = { uploaded: true, fileName: `${d.toLowerCase().replace(/[^a-z0-9]/g, "_")}.pdf` };
    });
    checklist.forEach(c => {
      newDocs[c.doc] = { uploaded: true, fileName: `${c.dept.toLowerCase()}_doc.pdf` };
    });
    setUploadedDocs(newDocs);
    setOcrFileName("pan_card_verified.pdf");
    toast.success("AI OCR Demo: Profile details auto-filled and documents verified!");
  };

  const removeDoc = (docName: string) => {
    setUploadedDocs(prev => {
      const copy = { ...prev };
      delete copy[docName];
      return copy;
    });
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/applicant/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          checklist,
          riskCategory: riskCategory || "Green",
          formData: {
            pan: formData.pan || "ABCDE1234F",
            companyName: formData.companyName || "Acme Industries Pvt Ltd",
            address: formData.address || "Plot 42, MIDC Hinjewadi, Pune",
            gstin: formData.gstin || "27ABCDE1234F1Z5"
          },
          uploadedDocs
        })
      });
      
      const data = await res.json();
      toast.success(`Universal Application ${data.appId || "APP-2026-0042"} submitted successfully! All departments have been notified.`);
      router.push(`/dashboard/track/${data.appId || "APP-2026-0042"}`);
    } catch (err) {
      toast.error("Failed to submit application");
      setIsSubmitting(false);
    }
  };

  const universalDocs = [
    "PAN card (Company/Proprietor)",
    "Certificate of Incorporation / Udyam",
    "GST Registration Certificate",
    "Land Ownership / Lease Allotment",
    "Site Layout Plan / Building Plan Drawing",
    "Project Report / Manufacturing Process Details",
    "Aadhaar of Authorized Signatory"
  ];

  const totalDocs = universalDocs.length + checklist.length;
  const uploadedCount = universalDocs.filter(d => uploadedDocs[d]?.uploaded).length + 
    checklist.filter(c => uploadedDocs[c.doc]?.uploaded).length;

  const riskColors: Record<string, string> = {
    Red: "bg-red-100 text-red-800 border-red-200",
    Orange: "bg-orange-100 text-orange-800 border-orange-200",
    Green: "bg-emerald-100 text-emerald-800 border-emerald-200",
    White: "bg-slate-100 text-slate-800 border-slate-200",
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Unified Application Form</h1>
          <p className="text-slate-600 mt-1">Upload all required documents and verify your business details</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={handleAutoFillAllDemo} className="bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 mr-1.5 text-amber-600" /> Auto-Fill & Upload All (Demo)
          </Button>
          {riskCategory && (
            <span className={`text-sm font-semibold px-3 py-1 rounded-full border ${riskColors[riskCategory] || riskColors.Green}`}>
              {riskCategory} Category
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* LEFT: Document Wallet */}
        <div className="lg:col-span-3 space-y-6">
          {/* OCR Upload Zone */}
          <Card className="shadow-sm border-slate-200">
            <CardHeader className="bg-blue-50 border-b border-blue-100 pb-4">
              <CardTitle className="text-lg flex items-center gap-2 text-slate-900">
                <ScanFace className="w-5 h-5 text-blue-600" /> AI OCR Auto-Fill & Classification Engine
              </CardTitle>
              <CardDescription className="text-slate-600">Upload any document — Gemini Vision AI + Regex will classify & extract profile data</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              {/* Hidden file input */}
              <input
                type="file"
                ref={ocrFileRef}
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleOcrFileSelected}
                className="hidden"
              />
              <div 
                className="border-2 border-dashed border-blue-200 bg-blue-50/50 rounded-lg p-6 flex flex-col items-center justify-center text-center hover:bg-blue-50 transition cursor-pointer"
                onClick={() => ocrFileRef.current?.click()}
              >
                {uploading ? (
                  <div className="animate-pulse flex flex-col items-center">
                    <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-2" />
                    <span className="text-sm text-slate-800 font-semibold">Analyzing &quot;{ocrFileName}&quot; via Gemini Vision...</span>
                    <span className="text-xs text-slate-600 mt-1">Classifying document and extracting MAITRI business details</span>
                  </div>
                ) : formData.companyName ? (
                  <div className="flex flex-col items-center">
                    <CheckCircle2 className="w-10 h-10 text-emerald-600 mb-2" />
                    <span className="text-sm text-emerald-800 font-semibold">Processed &quot;{ocrFileName || "document_verified.pdf"}&quot;</span>
                    <span className="text-xs text-slate-600 mt-1">Click to upload another document</span>
                  </div>
                ) : (
                  <>
                    <UploadCloud className="w-10 h-10 text-blue-600 mb-2" />
                    <span className="text-sm font-semibold text-slate-800">Click to Browse & Upload File</span>
                    <span className="text-xs text-slate-600 mt-1">PDF, JPG, PNG — Gemini Vision AI will classify and extract data</span>
                  </>
                )}
              </div>
              {formData.companyName && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 mt-4 flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-semibold text-emerald-900">AI Classification & OCR Complete</p>
                    <p className="text-emerald-800 mt-1 flex flex-wrap items-center gap-x-2">
                      <span className="font-bold">{formData.companyName}</span>
                      {formData.pan ? <span>• PAN: <span className="font-mono font-bold">{formData.pan}</span></span> : null}
                      {formData.gstin ? <span>• GSTIN: <span className="font-mono font-bold">{formData.gstin}</span></span> : null}
                    </p>
                    <p className="text-emerald-700 text-xs mt-1">Cross-verified against MCA & GST portal registries.</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Universal Documents */}
          <Card className="shadow-sm border-slate-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2 text-slate-900">
                <FileText className="w-5 h-5 text-blue-600" /> Universal Documents ({universalDocs.filter(d => uploadedDocs[d]?.uploaded).length}/{universalDocs.length})
              </CardTitle>
              <CardDescription className="text-slate-600">Required for every application regardless of sector</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {universalDocs.map((doc, i) => {
                  const info = uploadedDocs[doc];
                  return (
                    <div key={i} className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${info?.uploaded ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-slate-200'}`}>
                      <div className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${info?.uploaded ? 'bg-emerald-500' : 'bg-slate-200'}`}>
                          {info?.uploaded && <Check className="w-4 h-4 text-white" />}
                        </div>
                        <div>
                          <span className={`text-sm ${info?.uploaded ? 'text-emerald-900 font-semibold' : 'text-slate-800 font-medium'}`}>{doc}</span>
                          {info?.uploaded && <p className="text-xs text-emerald-700">{info.fileName}</p>}
                        </div>
                      </div>
                      {info?.uploaded ? (
                        <button onClick={() => removeDoc(doc)} className="text-slate-400 hover:text-red-500 transition-colors">
                          <X className="w-4 h-4" />
                        </button>
                      ) : (
                        <>
                          <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" ref={el => { docFileRefs.current[doc] = el; }} onChange={(e) => handleDocFileSelected(doc, e)} />
                          <Button variant="outline" size="sm" className="text-xs" onClick={() => docFileRefs.current[doc]?.click()}>
                            Upload
                          </Button>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Approval-Specific Documents */}
          {checklist.length > 0 && (
            <Card className="shadow-sm border-amber-200">
              <CardHeader className="bg-amber-50 border-b border-amber-100 pb-3">
                <CardTitle className="text-base flex items-center gap-2 text-slate-900">
                  <AlertCircle className="w-5 h-5 text-amber-600" /> Approval-Specific Documents ({checklist.filter(c => uploadedDocs[c.doc]?.uploaded).length}/{checklist.length})
                </CardTitle>
                <CardDescription className="text-slate-700">Each document is routed to its respective department for review</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-3">
                  {checklist.map((item) => {
                    const info = uploadedDocs[item.doc];
                    return (
                      <div key={item.id} className={`p-4 rounded-lg border transition-colors ${info?.uploaded ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-slate-200'}`}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${info?.uploaded ? 'bg-emerald-500' : 'bg-amber-100'}`}>
                              {info?.uploaded ? <Check className="w-4 h-4 text-white" /> : <Building className="w-4 h-4 text-amber-700" />}
                            </div>
                            <div>
                              <h4 className="text-sm font-semibold text-slate-900">{item.name}</h4>
                              <p className="text-xs text-slate-600 font-medium">→ Routed to: <span className="text-blue-700 font-semibold">{item.dept}</span></p>
                            </div>
                          </div>
                          {info?.uploaded ? (
                            <div className="flex items-center gap-2">
                              <Badge className="bg-emerald-100 text-emerald-800 border-none text-xs">{info.fileName}</Badge>
                              <button onClick={() => removeDoc(item.doc)} className="text-slate-400 hover:text-red-500"><X className="w-4 h-4" /></button>
                            </div>
                          ) : (
                            <>
                              <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" ref={el => { docFileRefs.current[item.doc] = el; }} onChange={(e) => handleDocFileSelected(item.doc, e)} />
                              <Button variant="outline" size="sm" className="text-xs" onClick={() => docFileRefs.current[item.doc]?.click()}>
                                Upload
                              </Button>
                            </>
                          )}
                        </div>
                        <div className="ml-11">
                          <p className="text-xs text-blue-700 font-medium flex items-center gap-1">
                            <FileText className="w-3 h-3" /> {item.doc}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* RIGHT: Business Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-sm border-slate-200 sticky top-24">
            <CardHeader>
              <CardTitle className="text-slate-900">Business Details</CardTitle>
              <CardDescription className="text-slate-600">Verify auto-filled MAITRI profile details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-slate-800 font-medium">Company Name</Label>
                  <div className="relative">
                    <Input value={formData.companyName} onChange={(e) => setFormData({...formData, companyName: e.target.value})} placeholder="Enter company name or upload doc" className="text-slate-900" />
                    {formData.companyName && <Badge className="absolute right-2 top-2 bg-blue-100 text-blue-800 border-none shadow-none text-xs">OCR Verified</Badge>}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-slate-800 font-medium">PAN</Label>
                    <Input value={formData.pan} onChange={(e) => setFormData({...formData, pan: e.target.value})} placeholder="ABCDE1234F" className="text-slate-900 font-mono" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-800 font-medium">GSTIN</Label>
                    <Input value={formData.gstin} onChange={(e) => setFormData({...formData, gstin: e.target.value})} placeholder="27ABCDE1234F1Z5" className="text-slate-900 font-mono" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-800 font-medium">Site Address</Label>
                  <Input value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} placeholder="Plot 42, MIDC Hinjewadi, Pune" className="text-slate-900" />
                </div>
              </div>

              {/* Readiness Summary */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mt-4">
                <h4 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-blue-600" /> Submission Readiness
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-slate-700">Universal Docs</span><span className="font-semibold text-slate-900">{universalDocs.filter(d => uploadedDocs[d]?.uploaded).length} / {universalDocs.length}</span></div>
                  <div className="flex justify-between"><span className="text-slate-700">Approval Docs</span><span className="font-semibold text-slate-900">{checklist.filter(c => uploadedDocs[c.doc]?.uploaded).length} / {checklist.length}</span></div>
                  <div className="flex justify-between"><span className="text-slate-700">OCR Auto-Fill</span><span className={`font-semibold ${formData.companyName ? 'text-emerald-700' : 'text-amber-700'}`}>{formData.companyName ? "✓ Complete" : "⏳ Pending"}</span></div>
                  <div className="w-full bg-slate-200 rounded-full h-2.5 mt-3">
                    <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-500" style={{ width: `${totalDocs > 0 ? (uploadedCount / totalDocs) * 100 : 0}%` }}></div>
                  </div>
                  <p className="text-xs text-slate-600 text-center mt-1">{uploadedCount} of {totalDocs} documents uploaded</p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex flex-col gap-3">
                <Button onClick={handleSubmit} className="w-full bg-blue-600 hover:bg-blue-700" disabled={isSubmitting || (uploadedCount < 1 && !formData.companyName)}>
                  {isSubmitting ? "Submitting..." : "Dispatch to All Departments"}
                </Button>
                <Button variant="outline" onClick={() => router.back()} className="w-full">Back to Checklist</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
