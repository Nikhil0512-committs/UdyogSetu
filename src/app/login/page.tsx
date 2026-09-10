"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Link from "next/link";

const DEPARTMENTS = [
  { value: "MIDC", label: "MIDC (Building Plan)", id: "OFF-MIDC-001" },
  { value: "MPCB", label: "MPCB (Pollution Control)", id: "OFF-MPCB-001" },
  { value: "Fire Services Department", label: "Fire Services Department", id: "OFF-FIRE-001" },
  { value: "DISH / Labour Department", label: "DISH / Labour Department", id: "OFF-DISH-001" },
  { value: "Electrical Inspectorate", label: "Electrical Inspectorate", id: "OFF-ELEC-001" },
  { value: "PESO / DISH", label: "PESO (Explosives Safety)", id: "OFF-PESO-001" },
  { value: "GSDA", label: "GSDA (Groundwater)", id: "OFF-GSDA-001" },
  { value: "Labour Department", label: "Labour Dept (Shops & Est.)", id: "OFF-LAB-001" },
  { value: "Boiler Inspectorate", label: "Boiler Inspectorate", id: "OFF-BOIL-001" },
  { value: "Directorate of Industries", label: "Directorate of Industries (Schemes)", id: "OFF-DOI-001" },
  { value: "MSME Department", label: "MSME Department (Schemes)", id: "OFF-MSME-001" },
];

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState<"APPLICANT" | "OFFICER">("APPLICANT");
  const [department, setDepartment] = useState("");
  const [error, setError] = useState("");
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    // get id from the form
    const form = e.target as HTMLFormElement;
    const idInput = form.querySelector('input[required]') as HTMLInputElement;
    const idValue = idInput.value;
    
    const deptInfo = DEPARTMENTS.find(d => d.value === department);

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: idValue,
        role,
        name: role === "OFFICER" ? `Officer (${deptInfo?.label || "Admin"})` : undefined,
        department: role === "OFFICER" ? department : undefined,
      }),
    });
    
    const data = await res.json();
    if (!data.success) {
      setError(data.error || "Login failed");
      return;
    }
    
    router.push(role === "APPLICANT" ? "/dashboard" : "/officer/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="text-center mb-8">
          <img src="/UdyogSetu_Logo.png" alt="UdyogSetu Logo" className="h-16 w-auto object-contain mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-900">Sign In</h1>
          <p className="text-slate-600 mt-2">Maharashtra Industrial Approvals Platform</p>
        </div>
        
        <form onSubmit={handleLogin} className="space-y-6">
          <div className="flex gap-2 p-1 bg-slate-100 rounded-lg">
            <button
              type="button"
              onClick={() => { setRole("APPLICANT"); setDepartment(""); }}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-md transition-colors ${role === "APPLICANT" ? "bg-white shadow text-blue-700" : "text-slate-600 hover:text-slate-900"}`}
            >
              Applicant
            </button>
            <button
              type="button"
              onClick={() => setRole("OFFICER")}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-md transition-colors ${role === "OFFICER" ? "bg-white shadow text-blue-700" : "text-slate-600 hover:text-slate-900"}`}
            >
              Department Officer
            </button>
          </div>
          
          {role === "OFFICER" && (
            <div className="space-y-2">
              <Label className="text-slate-800 font-medium">Select Your Department</Label>
              <Select onValueChange={(v) => v && setDepartment(v)} value={department}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose department..." />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {DEPARTMENTS.map((d) => (
                    <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-slate-800 font-medium">
                {role === "APPLICANT" ? "Email Address" : "Employee ID"}
              </Label>
              <Input
                key={`login-id-${role}`}
                type={role === "APPLICANT" ? "email" : "text"}
                placeholder={role === "APPLICANT" ? "admin@company.com" : DEPARTMENTS.find(d => d.value === department)?.id || "OFF-XXX-001"}
                required
                defaultValue={role === "APPLICANT" ? "admin@company.com" : ""}
                className="text-slate-900"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-800 font-medium">Password</Label>
              <Input type="password" placeholder="••••••••" required defaultValue="password123" />
            </div>
            
            {error && (
              <div className="p-3 bg-red-50 text-red-700 text-sm rounded-md border border-red-200">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-6 mt-4 shadow-sm" disabled={role === "OFFICER" && !department}>
              {role === "APPLICANT" ? "Sign In as Applicant" : `Sign In to ${department || "..."}`}
            </Button>
            
            {role === "APPLICANT" && (
              <p className="text-center text-sm text-slate-500 mt-4">
                Don't have an account? <Link href="/signup" className="text-blue-600 font-semibold hover:underline">Register your business</Link>
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
