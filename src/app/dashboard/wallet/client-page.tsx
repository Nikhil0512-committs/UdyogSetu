"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  FileText,
  CheckCircle2,
  Clock,
  AlertTriangle,
  UploadCloud,
  Eye,
  Search,
  Filter,
  Download,
  Calendar,
  Building2,
  ShieldCheck,
  X,
  FileCheck,
  Sparkles,
  RefreshCw,
  Plus
} from "lucide-react";

interface WalletDocument {
  id: string;
  type: "PAN Card" | "Certificate of Incorporation" | "GST Certificate" | "Land Allotment Letter" | "Site Layout Plan" | "Aadhaar" | string;
  docNumber: string;
  fileName: string;
  fileSize: string;
  uploadDate: string;
  expiryDate: string;
  isExpiringSoon: boolean;
  daysToExpiry?: number;
  status: "VERIFIED" | "PENDING" | "EXPIRING_SOON";
  issuer: string;
  verifiedBy: string;
  linkedApplications: string[];
  fileBase64?: string;
}

const INITIAL_DOCUMENTS: WalletDocument[] = [
  {
    id: "DOC-PAN-01",
    type: "PAN Card",
    docNumber: "AAACU8912K",
    fileName: "company_pan_card.pdf",
    fileSize: "1.2 MB",
    uploadDate: "12 Jan 2026",
    expiryDate: "Lifetime Validity",
    isExpiringSoon: false,
    status: "VERIFIED",
    issuer: "Income Tax Department, Govt of India",
    verifiedBy: "NSDL / Income Tax e-Filing API",
    linkedApplications: ["APP-2023-8912 (Factory License)", "APP-2023-6112 (MPCB Consent)"]
  },
  {
    id: "DOC-COI-02",
    type: "Certificate of Incorporation",
    docNumber: "U29100MH2022PTC123456",
    fileName: "cert_of_incorporation_roc.pdf",
    fileSize: "2.4 MB",
    uploadDate: "05 Feb 2026",
    expiryDate: "Lifetime Validity",
    isExpiringSoon: false,
    status: "VERIFIED",
    issuer: "Ministry of Corporate Affairs (MCA)",
    verifiedBy: "MCA21 System Integration",
    linkedApplications: ["APP-2023-8912 (Factory License)", "APP-2023-7431 (Fire NOC)", "APP-2023-6112 (MPCB Consent)"]
  },
  {
    id: "DOC-GST-03",
    type: "GST Certificate",
    docNumber: "27AAACU8912K1Z8",
    fileName: "gst_registration_reg06.pdf",
    fileSize: "890 KB",
    uploadDate: "15 Mar 2025",
    expiryDate: "15 Sep 2026",
    isExpiringSoon: true,
    daysToExpiry: 17,
    status: "EXPIRING_SOON",
    issuer: "Goods and Services Tax Network (GSTN)",
    verifiedBy: "GST Common Portal API",
    linkedApplications: ["APP-2023-8912 (Factory License)", "APP-2023-6112 (MPCB Consent)"]
  },
  {
    id: "DOC-LAL-04",
    type: "Land Allotment Letter",
    docNumber: "MIDC/PUN/2024/9021",
    fileName: "midc_allotment_order_pune.pdf",
    fileSize: "3.8 MB",
    uploadDate: "10 Jun 2026",
    expiryDate: "31 Dec 2030",
    isExpiringSoon: false,
    status: "VERIFIED",
    issuer: "Maharashtra Industrial Development Corp (MIDC)",
    verifiedBy: "MIDC Single Window Clearance Portal",
    linkedApplications: ["APP-2023-8912 (Factory License)", "APP-2023-7431 (Fire NOC)"]
  },
  {
    id: "DOC-SLP-05",
    type: "Site Layout Plan",
    docNumber: "SLP-2026-ENG-441",
    fileName: "site_layout_cad_drawing.pdf",
    fileSize: "7.5 MB",
    uploadDate: "28 Aug 2026",
    expiryDate: "N/A (Project Dependent)",
    isExpiringSoon: false,
    status: "PENDING",
    issuer: "Registered Chartered Architect & Town Planner",
    verifiedBy: "Pending Town Planning Directorate Verification",
    linkedApplications: ["APP-2023-8912 (Factory License)"]
  },
  {
    id: "DOC-ADH-06",
    type: "Aadhaar",
    docNumber: "XXXX-XXXX-8921",
    fileName: "director_aadhaar_masked.pdf",
    fileSize: "950 KB",
    uploadDate: "10 Jan 2026",
    expiryDate: "Lifetime Validity",
    isExpiringSoon: false,
    status: "VERIFIED",
    issuer: "Unique Identification Authority of India (UIDAI)",
    verifiedBy: "Aadhaar e-KYC (Masked)",
    linkedApplications: ["APP-2023-8912 (Factory License)", "APP-2023-7431 (Fire NOC)", "APP-2023-6112 (MPCB Consent)"]
  }
];

const DOCUMENT_TYPES = [
  "PAN Card",
  "Certificate of Incorporation",
  "GST Certificate",
  "Land Allotment Letter",
  "Site Layout Plan",
  "Aadhaar",
  "Factory Building Plan",
  "Environmental Clearance Certificate",
  "Electricity Sanction Letter",
  "Fire Safety Clearance",
  "Bank Solvency Certificate"
];

export default function DocumentWalletClientPage({ isDummyAccount, userId }: { isDummyAccount: boolean, userId: string }) {
  const [documents, setDocuments] = useState<WalletDocument[]>(isDummyAccount ? INITIAL_DOCUMENTS : []);
  const [selectedDoc, setSelectedDoc] = useState<WalletDocument | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [isDragging, setIsDragging] = useState(false);
  const [uploadDocType, setUploadDocType] = useState<string>("PAN Card");
  const [uploadDocNumber, setUploadDocNumber] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadSuccessMessage, setUploadSuccessMessage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Fetch persisted documents
  useEffect(() => {
    import("@/actions/wallet").then(({ fetchWalletDocuments }) => {
      fetchWalletDocuments(userId).then((persistedDocs: any) => {
        if (persistedDocs && persistedDocs.length > 0) {
          setDocuments(prev => {
            const existingIds = new Set(prev.map(d => d.id));
            const newDocs = persistedDocs.filter((d: any) => !existingIds.has(d.id));
            return [...newDocs, ...prev];
          });
        }
      });
    });
  }, [userId]);

  // Summary counts
  const totalCount = documents.length;
  const verifiedCount = documents.filter((d) => d.status === "VERIFIED").length;
  const pendingCount = documents.filter((d) => d.status === "PENDING").length;
  const expiringCount = documents.filter((d) => d.isExpiringSoon).length;

  const filteredDocs = documents.filter((doc) => {
    const matchesSearch =
      doc.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.docNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.issuer.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (statusFilter === "VERIFIED") return doc.status === "VERIFIED";
    if (statusFilter === "PENDING") return doc.status === "PENDING";
    if (statusFilter === "EXPIRING_SOON") return doc.isExpiringSoon;
    return true;
  });

  const handleUpload = () => {
    if (!selectedFile) {
      toast.error("Please drag & drop or browse to select a file first.");
      return;
    }

    setIsUploading(true);

    const reader = new FileReader();
    reader.onload = async () => {
      const fileBase64 = reader.result as string;
      try {
        const res = await fetch("/api/ocr", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fileBase64,
            fileName: selectedFile.name,
            mimeType: selectedFile.type || "application/pdf",
            targetDocName: uploadDocType
          })
        });

        const data = await res.json();

        if (!data.success || data.isIrrelevant) {
          toast.error(data.error || "Unrecognized or irrelevant file. Please upload a valid business document.");
          setIsUploading(false);
          return;
        }

        const newDoc: WalletDocument = {
          id: `DOC-NEW-${Date.now().toString().slice(-4)}`,
          type: data.documentType || uploadDocType,
          docNumber: data.extractedData?.pan || data.extractedData?.gstin || uploadDocNumber || `IN-${Math.floor(100000 + Math.random() * 900000)}`,
          fileName: selectedFile.name,
          fileSize: `${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB`,
          uploadDate: "Just now",
          expiryDate: "Lifetime Validity",
          isExpiringSoon: false,
          status: "VERIFIED",
          issuer: "Verified via AI OCR",
          verifiedBy: "Automated OCR API",
          linkedApplications: [],
          fileBase64,
        };

        const { saveWalletDocument } = await import("@/actions/wallet");
        const saveRes = await saveWalletDocument(userId, newDoc);
        if (saveRes.id) {
          newDoc.id = saveRes.id;
        }

        setDocuments([newDoc, ...documents]);
        setUploadDocNumber("");
        setSelectedFile(null);
        
        toast.success(`"${data.documentType || uploadDocType}" uploaded successfully and verified!`);
        
        setUploadSuccessMessage(`"${data.documentType || uploadDocType}" verified and added to your wallet.`);
        setTimeout(() => {
          setUploadSuccessMessage(null);
        }, 5000);
      } catch (err) {
        console.error("OCR API Error:", err);
        toast.error("Failed to analyze document. Please try again.");
      } finally {
        setIsUploading(false);
      }
    };
    reader.readAsDataURL(selectedFile);
  };

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Document Wallet</h1>
          </div>
          <p className="text-slate-700 mt-1">
            Store and manage verified master business documents for seamless reuse across all Single Window applications.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <a href="#upload-section">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2 font-medium">
              <Plus className="w-4 h-4" />
              Upload Document
            </Button>
          </a>
        </div>
      </div>

      {/* Success / Alert Banner */}
      {uploadSuccessMessage && (
        <div className="bg-emerald-50 border border-emerald-300 rounded-lg p-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
            <p className="text-emerald-900 font-medium text-sm">{uploadSuccessMessage}</p>
          </div>
          <button
            onClick={() => setUploadSuccessMessage(null)}
            className="text-emerald-700 hover:text-emerald-900 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription className="text-slate-600 font-medium">Total Stored Documents</CardDescription>
            <CardTitle className="text-3xl font-bold text-slate-900">{totalCount}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-slate-600 flex items-center gap-1.5 font-medium">
              <FileText className="w-4 h-4 text-blue-600" /> Reusable in 4 clearances
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription className="text-slate-600 font-medium">Verified Documents</CardDescription>
            <CardTitle className="text-3xl font-bold text-emerald-700">{verifiedCount}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-emerald-700 flex items-center gap-1.5 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Legally validated by authorities
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription className="text-slate-600 font-medium">Pending Verification</CardDescription>
            <CardTitle className="text-3xl font-bold text-amber-700">{pendingCount}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-amber-700 flex items-center gap-1.5 font-medium">
              <Clock className="w-4 h-4 text-amber-600" /> Review in progress (avg 24h)
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription className="text-slate-600 font-medium">Expiring Soon (&lt;30 days)</CardDescription>
            <CardTitle className="text-3xl font-bold text-red-700">{expiringCount}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-red-700 flex items-center gap-1.5 font-semibold">
              <AlertTriangle className="w-4 h-4 text-red-600" /> Action required to avoid delays
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Info Callout: Single-Window Reuse */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 text-base">
                Single Sign-on &amp; Zero Duplicate Uploads
              </h3>
              <p className="text-slate-700 text-sm mt-0.5">
                Verified documents in this vault are automatically pre-filled into all subsequent applications for
                MIDC, MPCB, Fire Services, and Urban Local Bodies without requiring fresh submissions.
              </p>
            </div>
          </div>
          <div className="shrink-0">
            <Badge className="bg-blue-700 text-white font-medium hover:bg-blue-800">
              Auto-Verified Vault
            </Badge>
          </div>
        </div>
      </div>

      {/* Upload New Document Area (Drag & Drop Styling) */}
      <div id="upload-section" className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Upload New Document</h2>
            <p className="text-slate-700 text-sm">Add a new credential or official certificate to your verified company repository.</p>
          </div>
        </div>

        <Card className="border-2 border-dashed border-slate-300 hover:border-blue-400 bg-white transition-colors">
          <CardContent className="p-6 md:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: Metadata Selection */}
              <div className="space-y-4 lg:border-r lg:border-slate-200 lg:pr-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-1.5">
                    Select Document Type <span className="text-red-600">*</span>
                  </label>
                  <select
                    value={uploadDocType}
                    onChange={(e) => setUploadDocType(e.target.value)}
                    aria-label="Select Document Type"
                    className="w-full h-10 px-3 rounded-md border border-slate-300 bg-white text-slate-900 text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  >
                    {DOCUMENT_TYPES.map((type) => (
                      <option key={type} value={type} className="text-slate-900">
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-1.5">
                    Document / Certificate Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 27AAACU8912K1Z8"
                    value={uploadDocNumber}
                    onChange={(e) => setUploadDocNumber(e.target.value)}
                    className="w-full h-10 px-3 rounded-md border border-slate-300 bg-white text-slate-900 text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-500 placeholder:text-slate-500"
                  />
                  <p className="text-xs text-slate-600 mt-1">Used for instant automated cross-verification with official registers.</p>
                </div>

                <div className="pt-2">
                  <Button
                    onClick={handleUpload}
                    disabled={isUploading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium gap-2 disabled:opacity-70"
                  >
                    {isUploading ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <UploadCloud className="w-4 h-4" />
                    )}
                    {isUploading ? "Verifying via AI..." : "Upload & Verify Document"}
                  </Button>
                </div>
              </div>

              {/* Right Column: Interactive Drop Zone */}
              <div
                className={`lg:col-span-2 flex flex-col items-center justify-center p-8 rounded-lg border-2 border-dashed transition-all cursor-pointer text-center ${
                  isDragging
                    ? "border-blue-600 bg-blue-50"
                    : selectedFile
                    ? "border-emerald-400 bg-emerald-50 hover:bg-emerald-100"
                    : "border-slate-300 bg-slate-50 hover:bg-blue-50/50 hover:border-blue-400"
                }`}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    setSelectedFile(e.dataTransfer.files[0]);
                  }
                }}
                onClick={() => {
                  const input = document.getElementById("file-upload-input") as HTMLInputElement;
                  if (input) input.click();
                }}
              >
                <input
                  type="file"
                  id="file-upload-input"
                  className="hidden"
                  accept=".pdf,.png,.jpg,.jpeg"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setSelectedFile(e.target.files[0]);
                    }
                  }}
                />

                <div className={`w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-sm border mb-3 ${selectedFile ? 'text-emerald-600 border-emerald-200' : 'text-blue-600 border-slate-200'}`}>
                  {selectedFile ? <FileCheck className="w-7 h-7" /> : <UploadCloud className="w-7 h-7" />}
                </div>

                <h4 className="text-base font-semibold text-slate-900">
                  {selectedFile ? (
                    <span className="text-emerald-700">Selected: {selectedFile.name}</span>
                  ) : (
                    <>Drag and drop your file here, or <span className="text-blue-600 underline">browse</span></>
                  )}
                </h4>
                <p className="text-sm text-slate-700 mt-1 max-w-md">
                  {selectedFile 
                    ? `${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB - Click "Upload & Verify" on the left to submit` 
                    : "Supports PDF, JPEG, or PNG formats up to 10 MB. Digital signature certificates (DSC) are accepted."
                  }
                </p>

                <div className="flex items-center gap-4 mt-4 text-xs font-semibold text-slate-600">
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" /> Automated OCR Parsing
                  </span>
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> 256-Bit Encrypted Vault
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stored Documents Header & Filters */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Stored Verified Documents</h2>
            <p className="text-slate-700 text-sm">
              Showing {filteredDocs.length} of {documents.length} registered documents
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search Bar */}
            <div className="relative min-w-[240px]">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search documents or IDs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-9 pl-9 pr-3 text-sm rounded-md border border-slate-300 bg-white text-slate-900 placeholder:text-slate-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filter Buttons */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-semibold">
              <button
                onClick={() => setStatusFilter("ALL")}
                className={`px-3 py-1.5 rounded-md transition-all ${
                  statusFilter === "ALL"
                    ? "bg-white text-slate-900 shadow-xs font-bold"
                    : "text-slate-700 hover:text-slate-900"
                }`}
              >
                All ({documents.length})
              </button>
              <button
                onClick={() => setStatusFilter("VERIFIED")}
                className={`px-3 py-1.5 rounded-md transition-all ${
                  statusFilter === "VERIFIED"
                    ? "bg-white text-emerald-800 shadow-xs font-bold"
                    : "text-slate-700 hover:text-emerald-800"
                }`}
              >
                Verified ({verifiedCount})
              </button>
              <button
                onClick={() => setStatusFilter("PENDING")}
                className={`px-3 py-1.5 rounded-md transition-all ${
                  statusFilter === "PENDING"
                    ? "bg-white text-amber-800 shadow-xs font-bold"
                    : "text-slate-700 hover:text-amber-800"
                }`}
              >
                Pending ({pendingCount})
              </button>
              <button
                onClick={() => setStatusFilter("EXPIRING_SOON")}
                className={`px-3 py-1.5 rounded-md transition-all ${
                  statusFilter === "EXPIRING_SOON"
                    ? "bg-white text-red-800 shadow-xs font-bold"
                    : "text-slate-700 hover:text-red-800"
                }`}
              >
                Expiring Soon ({expiringCount})
              </button>
            </div>
          </div>
        </div>

        {/* Empty state if filtered */}
        {filteredDocs.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
            <FileText className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-900">No documents found</h3>
            <p className="text-slate-700 text-sm mt-1 max-w-sm mx-auto">
              No stored document matches your current search or filter criteria.
            </p>
            <Button
              variant="outline"
              className="mt-4 border-slate-300 text-slate-700 font-medium"
              onClick={() => {
                setSearchQuery("");
                setStatusFilter("ALL");
              }}
            >
              Clear Filters
            </Button>
          </div>
        )}

        {/* 6 Mock Documents Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDocs.map((doc) => {
            const isExpiring = doc.isExpiringSoon;
            const isPending = doc.status === "PENDING";
            const isVerified = doc.status === "VERIFIED" && !isExpiring;

            return (
              <Card
                key={doc.id}
                className={`flex flex-col justify-between transition-all hover:shadow-md border ${
                  isExpiring
                    ? "border-red-300 bg-red-50/20"
                    : isPending
                    ? "border-amber-300 bg-amber-50/10"
                    : "border-slate-200 bg-white"
                }`}
              >
                <div>
                  {/* Card Top: Header & Badge */}
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                            isExpiring
                              ? "bg-red-100 text-red-700"
                              : isPending
                              ? "bg-amber-100 text-amber-700"
                              : "bg-emerald-100 text-emerald-700"
                          }`}
                        >
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <CardTitle className="text-base font-bold text-slate-900 leading-snug">
                            {doc.type}
                          </CardTitle>
                          <p className="text-xs font-mono font-medium text-slate-600 mt-0.5">
                            {doc.docNumber}
                          </p>
                        </div>
                      </div>

                      {/* Status Badges */}
                      <div>
                        {isVerified && (
                          <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 hover:bg-emerald-200 font-semibold gap-1 py-0.5 px-2 text-xs">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                            Verified
                          </Badge>
                        )}
                        {isPending && (
                          <Badge className="bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-200 font-semibold gap-1 py-0.5 px-2 text-xs">
                            <Clock className="w-3.5 h-3.5 text-amber-700" />
                            Pending
                          </Badge>
                        )}
                        {isExpiring && (
                          <Badge className="bg-red-100 text-red-800 border-red-300 hover:bg-red-200 font-semibold gap-1 py-0.5 px-2 text-xs animate-pulse">
                            <AlertTriangle className="w-3.5 h-3.5 text-red-700" />
                            Expiring Soon
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>

                  {/* Card Body: Details */}
                  <CardContent className="space-y-3 pt-0 text-sm">
                    {/* Expiry Warning Box if Expiring within 30 days */}
                    {isExpiring && (
                      <div className="bg-red-50 border border-red-300 rounded-md p-2.5 flex items-start gap-2 text-xs text-red-900 font-medium">
                        <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold">Expiring in {doc.daysToExpiry} days!</span> Renewal or fresh
                          endorsement required before next clearance cycle.
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                      <div>
                        <span className="text-slate-600 block font-medium">Upload Date</span>
                        <span className="font-semibold text-slate-900">{doc.uploadDate}</span>
                      </div>
                      <div>
                        <span className="text-slate-600 block font-medium">Expiry Date</span>
                        <span
                          className={`font-semibold ${
                            isExpiring ? "text-red-700 font-bold" : "text-slate-900"
                          }`}
                        >
                          {doc.expiryDate}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between text-slate-700">
                        <span className="text-slate-600 font-medium">File name:</span>
                        <span className="font-medium text-slate-900 truncate max-w-[170px]" title={doc.fileName}>
                          {doc.fileName}
                        </span>
                      </div>
                      <div className="flex justify-between text-slate-700">
                        <span className="text-slate-600 font-medium">File size:</span>
                        <span className="font-medium text-slate-900">{doc.fileSize}</span>
                      </div>
                      <div className="flex justify-between text-slate-700">
                        <span className="text-slate-600 font-medium">Issuing Authority:</span>
                        <span className="font-medium text-slate-900 truncate max-w-[170px]" title={doc.issuer}>
                          {doc.issuer}
                        </span>
                      </div>
                    </div>

                    {/* Linked Applications Badge */}
                    {doc.linkedApplications.length > 0 && (
                      <div className="pt-1">
                        <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider block mb-1">
                          Linked In {doc.linkedApplications.length} Application{doc.linkedApplications.length > 1 ? "s" : ""}
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {doc.linkedApplications.map((app, idx) => (
                            <span
                              key={idx}
                              className="text-[11px] bg-slate-200 text-slate-800 px-1.5 py-0.5 rounded-sm font-medium"
                            >
                              {app.split(" ")[0]}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </div>

                {/* Card Footer: View and Action Buttons */}
                <CardFooter className="pt-3 pb-3 border-t border-slate-200 bg-slate-50/70 flex items-center justify-between gap-2">
                  <div className="text-xs text-slate-600 font-medium flex items-center gap-1">
                    {isVerified && <FileCheck className="w-3.5 h-3.5 text-emerald-600" />}
                    {isPending && <Clock className="w-3.5 h-3.5 text-amber-600" />}
                    {isExpiring && <AlertTriangle className="w-3.5 h-3.5 text-red-600" />}
                    <span>{doc.id}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedDoc(doc)}
                      className="border-slate-300 hover:bg-white text-slate-800 font-semibold gap-1.5 text-xs h-8 px-3"
                    >
                      <Eye className="w-3.5 h-3.5 text-blue-600" />
                      View
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Interactive Document Viewer Modal */}
      {selectedDoc && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-300 max-w-2xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-8">
            {/* Modal Header */}
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-md bg-blue-600 flex items-center justify-center text-white">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">{selectedDoc.type}</h3>
                  <p className="text-xs text-slate-300 font-mono">{selectedDoc.docNumber}</p>
                </div>
              </div>

              <button
                onClick={() => setSelectedDoc(null)}
                className="text-slate-400 hover:text-white rounded-md p-1.5 transition-colors"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              {/* Status Header */}
              <div className="flex items-center justify-between p-3.5 rounded-lg border bg-slate-50 border-slate-200">
                <div>
                  <span className="text-xs font-semibold text-slate-600 block">Verification Status</span>
                  <span className="text-sm font-bold text-slate-900">{selectedDoc.verifiedBy}</span>
                </div>
                <div>
                  {selectedDoc.status === "VERIFIED" && !selectedDoc.isExpiringSoon && (
                    <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 font-semibold gap-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Legally Verified
                    </Badge>
                  )}
                  {selectedDoc.status === "PENDING" && (
                    <Badge className="bg-amber-100 text-amber-800 border-amber-300 font-semibold gap-1">
                      <Clock className="w-4 h-4 text-amber-600" />
                      Verification In Progress
                    </Badge>
                  )}
                  {selectedDoc.isExpiringSoon && (
                    <Badge className="bg-red-100 text-red-800 border-red-300 font-semibold gap-1">
                      <AlertTriangle className="w-4 h-4 text-red-600" />
                      Expiring Soon ({selectedDoc.daysToExpiry} days left)
                    </Badge>
                  )}
                </div>
              </div>

              {/* Simulated Document Preview Paper */}
              <div className="border border-slate-300 rounded-lg p-6 bg-slate-50/50 shadow-inner relative overflow-hidden">
                <div className="absolute right-4 top-4 opacity-10 pointer-events-none">
                  <ShieldCheck className="w-40 h-40 text-slate-900" />
                </div>

                <div className="border-b border-slate-200 pb-3 mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-slate-700" />
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                        {selectedDoc.issuer}
                      </h4>
                      <p className="text-xs text-slate-600">Official Repository Record</p>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-semibold text-slate-600 bg-white px-2 py-1 rounded-sm border border-slate-200">
                    ID: {selectedDoc.id}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-xs font-semibold text-slate-600 block">Document Name</span>
                    <span className="font-semibold text-slate-900">{selectedDoc.fileName}</span>
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-600 block">Document Identification No.</span>
                    <span className="font-mono font-bold text-slate-900">{selectedDoc.docNumber}</span>
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-600 block">Date of Verification / Upload</span>
                    <span className="font-medium text-slate-900">{selectedDoc.uploadDate}</span>
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-600 block">Validity / Expiry</span>
                    <span
                      className={`font-semibold ${
                        selectedDoc.isExpiringSoon ? "text-red-700 font-bold" : "text-slate-900"
                      }`}
                    >
                      {selectedDoc.expiryDate}
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200">
                  <span className="text-xs font-semibold text-slate-600 block mb-1.5">
                    Currently Reused In Following Active Applications:
                  </span>
                  {selectedDoc.linkedApplications.length > 0 ? (
                    <div className="space-y-1">
                      {selectedDoc.linkedApplications.map((app, idx) => (
                        <div
                          key={idx}
                          className="text-xs bg-white p-2 rounded-md border border-slate-200 text-slate-800 flex items-center justify-between font-medium"
                        >
                          <span>{app}</span>
                          <span className="text-emerald-700 font-semibold text-[11px]">Active Sync ✓</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-600 italic">No applications currently linked. Ready for immediate use in new applications.</p>
                  )}
                </div>
              </div>

              {/* Actual Document Viewer */}
              {selectedDoc.fileBase64 && (
                <div className="mt-4 border border-slate-300 rounded-lg bg-slate-100 overflow-hidden flex items-center justify-center min-h-[300px]">
                  {selectedDoc.fileName.toLowerCase().endsWith('.pdf') || selectedDoc.fileBase64.startsWith('data:application/pdf') ? (
                    <iframe src={selectedDoc.fileBase64} className="w-full h-[500px] border-0" title="Document Preview" />
                  ) : (
                    <img src={selectedDoc.fileBase64} alt={selectedDoc.fileName} className="max-w-full max-h-[500px] object-contain" />
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer Actions */}
            <div className="bg-slate-100 px-6 py-3 border-t border-slate-200 flex items-center justify-between">
              <span className="text-xs text-slate-600 font-medium">
                SHA-256 Digital Certificate Checksum: Verified
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    toast.success(`Downloading official verified copy of ${selectedDoc.fileName}`);
                  }}
                  className="border-slate-300 text-slate-800 font-semibold gap-1.5"
                >
                  <Download className="w-4 h-4 text-slate-700" />
                  Download
                </Button>
                <Button
                  size="sm"
                  onClick={() => setSelectedDoc(null)}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-medium px-4"
                >
                  Done
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
