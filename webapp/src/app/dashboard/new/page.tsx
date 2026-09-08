"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Sparkles, Building, Info, Settings2 } from "lucide-react";

export default function NewApplicationPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [scale, setScale] = useState("");
  const [sector, setSector] = useState("");
  const [district, setDistrict] = useState("");
  const [midc, setMidc] = useState("");
  const [employees, setEmployees] = useState("");
  
  // Advanced Toggles
  const [groundwater, setGroundwater] = useState("no");
  const [power, setPower] = useState("no");
  const [hazardous, setHazardous] = useState("no");

  const SECTORS = [
    "Agro processing", "Food and fruit processing", "Textile", "Plastic", 
    "Chemical & fertilizer", "Pharmaceutical", "Engineering", "Electronics & electrical", 
    "Automobile", "Cement", "Paper & paper-based products", "Steel", 
    "IT / ITES", "Sugar", "Distillery", "Mineral based", 
    "Conventional & non-conventional energy", "Other"
  ];

  const getRiskCategory = () => {
    if (["Chemical & fertilizer", "Pharmaceutical", "Cement", "Steel", "Sugar", "Distillery"].includes(sector)) return "Red";
    if (["Agro processing", "Food and fruit processing", "Textile", "Engineering", "Automobile", "Mineral based"].includes(sector)) return "Orange";
    if (["Plastic", "Paper & paper-based products", "Electronics & electrical"].includes(sector)) return "Green";
    if (["IT / ITES"].includes(sector)) return "White";
    return "Orange"; 
  };

  const getChecklist = () => {
    const checklist = [];
    const risk = getRiskCategory();

    if (midc === "yes") {
      checklist.push({ id: 1, dept: "MIDC", name: "Factory Building Plan Approval", doc: "Machinery layout & safety officer details" });
    } else {
      checklist.push({ id: 1, dept: "Urban Local Body", name: "Building Plan Approval", doc: "Machinery layout & safety officer details" });
    }

    if (risk !== "White") {
      checklist.push({ id: 2, dept: "MPCB", name: "Consent to Establish (Water & Air)", doc: "Pollution control equipment details" });
    }

    if (sector !== "IT / ITES") {
      checklist.push({ id: 3, dept: "Fire Services Department", name: "Provisional Fire NOC", doc: "Site plan showing fire exits & hydrant layout" });
    }

    if (["10 to 19", "20 to 49", "50 and above"].includes(employees) && sector !== "IT / ITES") {
      checklist.push({ id: 4, dept: "DISH / Labour Department", name: "Registration under Factories Act", doc: "Worker safety & health policy" });
    }
    
    if (groundwater === "yes") {
      checklist.push({ id: 5, dept: "GSDA", name: "Groundwater Extraction NOC", doc: "Hydrogeological survey report" });
    }
    
    if (power === "yes") {
      checklist.push({ id: 6, dept: "Electrical Inspectorate", name: "High-Tension Power Approval", doc: "Electrical installation plan" });
    }
    
    if (hazardous === "yes" || risk === "Red") {
      checklist.push({ id: 7, dept: "PESO / DISH", name: "Hazardous Substance / Explosives License", doc: "Hazardous-substance inventory and safety report" });
    }

    // District-specific local conditions
    const coastalDistricts = ["ratnagiri", "sindhudurg", "raigad", "thane", "palghar", "mumbai city", "mumbai suburban"];
    const tribalDistricts = ["gadchiroli", "nandurbar", "palghar", "chandrapur", "gondia"];
    const industrialZoneDistricts = ["pune", "thane", "nashik", "nagpur", "aurangabad (chhatrapati sambhajinagar)", "kolhapur"];

    if (coastalDistricts.includes(district)) {
      checklist.push({ id: 8, dept: "MoEFCC / MCZMA", name: "CRZ (Coastal Regulation Zone) Clearance", doc: "CRZ mapping and site demarcation report" });
    }

    if (tribalDistricts.includes(district)) {
      checklist.push({ id: 9, dept: "Tribal Development Dept", name: "Scheduled Area / Forest Clearance", doc: "Forest land diversion proposal & tribal welfare plan" });
    }

    // Shops & Establishment for all
    if (sector !== "IT / ITES") {
      checklist.push({ id: 10, dept: "Labour Department", name: "Shops & Establishment Registration", doc: "Employer details and worker roster" });
    }

    // Boiler Inspectorate for sectors that commonly use boilers
    if (["Sugar", "Distillery", "Textile", "Pharmaceutical", "Chemical & fertilizer", "Paper & paper-based products"].includes(sector)) {
      checklist.push({ id: 11, dept: "Boiler Inspectorate", name: "Boiler Installation & Operation License", doc: "Boiler design drawings and safety certificate" });
    }

    return checklist;
  };

  const generatedChecklist = getChecklist();
  const riskCategory = getRiskCategory();

  const handleProceed = () => {
    // Save the full checklist to localStorage so the apply page can display it
    localStorage.setItem("generatedChecklist", JSON.stringify(generatedChecklist));
    localStorage.setItem("riskCategory", riskCategory);
    router.push('/dashboard/apply');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-10">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Start New Application</h1>
        <p className="text-slate-500">Answer a few questions to generate your customized approval checklist.</p>
      </div>

      <div className="flex items-center gap-2 mb-8">
        <div className={`h-2 flex-1 rounded-full ${step >= 1 ? 'bg-blue-600' : 'bg-slate-200'}`}></div>
        <div className={`h-2 flex-1 rounded-full ${step >= 2 ? 'bg-blue-600' : 'bg-slate-200'}`}></div>
        <div className={`h-2 flex-1 rounded-full ${step >= 3 ? 'bg-blue-600' : 'bg-slate-200'}`}></div>
      </div>

      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Business Profile</CardTitle>
            <CardDescription>Tell us about your manufacturing unit (Based on MAITRI parameters)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Investment Scale (MSME)</Label>
                <Select onValueChange={(v) => v && setScale(v)} value={scale}>
                  <SelectTrigger><SelectValue placeholder="Select scale" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="micro">Micro (Up to ₹2.5 Cr Inv)</SelectItem>
                    <SelectItem value="small">Small (Up to ₹25 Cr Inv)</SelectItem>
                    <SelectItem value="medium">Medium (Up to ₹125 Cr Inv)</SelectItem>
                    <SelectItem value="large">Large / Mega (Above ₹125 Cr Inv)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Industry Sector</Label>
                <Select onValueChange={(v) => v && setSector(v)} value={sector}>
                  <SelectTrigger><SelectValue placeholder="Select sector" /></SelectTrigger>
                  <SelectContent className="max-h-60">
                    {SECTORS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Location District</Label>
                <Select onValueChange={(v) => v && setDistrict(v)} value={district}>
                  <SelectTrigger><SelectValue placeholder="Select district" /></SelectTrigger>
                  <SelectContent className="max-h-60">
                    {[
                      "Ahmednagar", "Akola", "Amravati", "Aurangabad (Chhatrapati Sambhajinagar)",
                      "Beed", "Bhandara", "Buldhana",
                      "Chandrapur", "Dhule",
                      "Gadchiroli", "Gondia",
                      "Hingoli",
                      "Jalgaon", "Jalna",
                      "Kolhapur",
                      "Latur",
                      "Mumbai City", "Mumbai Suburban",
                      "Nagpur", "Nanded", "Nandurbar", "Nashik",
                      "Osmanabad (Dharashiv)",
                      "Palghar", "Parbhani", "Pune",
                      "Raigad", "Ratnagiri",
                      "Sangli", "Satara", "Sindhudurg", "Solapur",
                      "Thane",
                      "Wardha", "Washim",
                      "Yavatmal"
                    ].map(d => <SelectItem key={d} value={d.toLowerCase()}>{d}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Is the plot inside MIDC?</Label>
                <Select onValueChange={(v) => v && setMidc(v)} value={midc}>
                  <SelectTrigger><SelectValue placeholder="Yes / No" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">Yes</SelectItem>
                    <SelectItem value="no">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 col-span-1 md:col-span-2">
                <Label>Total Employees / Labour Band</Label>
                <Select onValueChange={(v) => v && setEmployees(v)} value={employees}>
                  <SelectTrigger><SelectValue placeholder="Select workforce size" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Zero</SelectItem>
                    <SelectItem value="1 to 4">1 to 4</SelectItem>
                    <SelectItem value="5 to 9">5 to 9</SelectItem>
                    <SelectItem value="10 to 19">10 to 19 (Factories Act threshold w/ power)</SelectItem>
                    <SelectItem value="20 to 49">20 to 49</SelectItem>
                    <SelectItem value="50 and above">50 and above</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-200 space-y-4">
              <h3 className="text-sm font-semibold flex items-center gap-2 text-slate-800">
                <Settings2 className="w-4 h-4" /> Advanced Triggers (Conditional)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-100">
                <div className="space-y-2">
                  <Label className="text-xs">Draws Groundwater?</Label>
                  <Select onValueChange={(v) => v && setGroundwater(v)} value={groundwater}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="No" /></SelectTrigger>
                    <SelectContent><SelectItem value="yes">Yes</SelectItem><SelectItem value="no">No</SelectItem></SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">High-Tension Power?</Label>
                  <Select onValueChange={(v) => v && setPower(v)} value={power}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="No" /></SelectTrigger>
                    <SelectContent><SelectItem value="yes">Yes</SelectItem><SelectItem value="no">No</SelectItem></SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Hazardous Substances?</Label>
                  <Select onValueChange={(v) => v && setHazardous(v)} value={hazardous}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="No" /></SelectTrigger>
                    <SelectContent><SelectItem value="yes">Yes</SelectItem><SelectItem value="no">No</SelectItem></SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end pt-4">
              <Button onClick={() => setStep(2)} disabled={!scale || !sector || !midc || !employees}>
                Generate Checklist <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <Card>
          <CardHeader className="bg-slate-50 border-b border-slate-100">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-blue-600" />
                  Customized Approval Checklist
                </CardTitle>
                <CardDescription className="mt-1">
                  Based on Regulatory Knowledge Engine: {sector}, {midc === 'yes' ? 'MIDC' : 'Non-MIDC'}, {employees} workers.
                </CardDescription>
              </div>
              <div className="flex flex-col gap-2 items-end">
                {riskCategory === 'Red' && <Badge variant="destructive">Red Category (High Pollution)</Badge>}
                {riskCategory === 'Orange' && <Badge className="bg-orange-100 text-orange-800 border-none">Orange Category</Badge>}
                {riskCategory === 'Green' && <Badge className="bg-emerald-100 text-emerald-800 border-none">Green Category</Badge>}
                {riskCategory === 'White' && <Badge className="bg-slate-100 text-slate-800 border-slate-200">White Category</Badge>}
                <Badge className="bg-blue-100 text-blue-800 border-none">{generatedChecklist.length} Approvals Required</Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="space-y-3">
              {generatedChecklist.length === 0 && (
                <div className="p-6 text-center text-slate-500 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                  No statutory approvals required based on current parameters.
                </div>
              )}
              {generatedChecklist.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded bg-blue-50 flex items-center justify-center">
                      <Building className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-slate-900">{item.name}</h4>
                      <p className="text-sm text-slate-500 font-medium">{item.dept}</p>
                      <p className="text-xs text-blue-600 mt-1 flex items-center gap-1">
                        <Info className="w-3 h-3"/> Required document: {item.doc}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline">Required</Badge>
                </div>
              ))}
            </div>
            
            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => setStep(1)}>Back to Profile</Button>
              <Button onClick={handleProceed}>
                Proceed to Common Application
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
