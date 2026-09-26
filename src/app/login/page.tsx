"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Link from "next/link";
import { Globe, ChevronDown, User, Users, Shield, Mail, Lock, Eye, ArrowRight, ShieldCheck, FileText, Zap, BarChart3, Landmark } from "lucide-react";
import PillLanguageToggle from "@/components/pill-language-toggle";

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
  const [role, setRole] = useState<"APPLICANT" | "OFFICER" | "ADMIN">("APPLICANT");
  const [department, setDepartment] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
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
        name: role === "OFFICER" ? `Officer (${deptInfo?.label || "Admin"})` : role === "ADMIN" ? "Administrator" : undefined,
        department: role === "OFFICER" ? department : role === "ADMIN" ? "Administration" : undefined,
      }),
    });
    
    const data = await res.json();
    if (!data.success) {
      setError(data.error || "Login failed");
      return;
    }
    
    router.push(role === "APPLICANT" ? "/dashboard" : role === "ADMIN" ? "/admin/dashboard" : "/officer/dashboard");
  };

  return (
    <div className="min-h-screen flex font-sans">
      {/* Left Column */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-[#E2E8F0] via-[#CBD5E1] to-[#94A3B8] overflow-hidden flex-col justify-between p-12 lg:p-16 xl:p-20">
        {/* Abstract shapes/map simulation in background */}
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://images.unsplash.com/photo-1570168007204-dfb528c6958f?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-30 mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#64748B]/90 via-[#94A3B8]/50 to-[#E2E8F0]/30"></div>
        
        <div className="relative z-10 flex flex-col h-full justify-between">
          <div>
            <div className="flex items-center gap-3 mb-20">
              <Landmark className="w-12 h-12 text-[#1C2C4A]" />
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-[#1C2C4A]">महाराष्ट्र शासन</span>
                <span className="text-xs font-semibold text-[#1C2C4A] tracking-widest mt-0.5">सत्यमेव जयते</span>
              </div>
            </div>

            <h1 className="text-[3.5rem] xl:text-[4rem] leading-[1.1] font-bold text-[#1C2C4A] mb-6">
              One gateway for <br />
              <span className="text-[#B44218]">Maharashtra's</span> <br />
              industrial approvals.
            </h1>
            
            <p className="text-[#334155] text-xl xl:text-2xl font-medium mb-16 max-w-xl leading-snug">
              Simpler approvals. Faster clearances. <br />
              A stronger Maharashtra for a brighter tomorrow.
            </p>

            <div className="flex flex-col gap-6 sm:flex-row sm:gap-8">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-12 h-12 xl:w-14 xl:h-14 rounded-full bg-[#B44218]/10 text-[#B44218]">
                  <FileText className="w-6 h-6 xl:w-7 xl:h-7" />
                </div>
                <span className="font-semibold text-[#1C2C4A] text-sm xl:text-base leading-tight max-w-[100px]">Transparent Processes</span>
              </div>
              <div className="hidden sm:block w-px h-14 bg-slate-400/50"></div>
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-12 h-12 xl:w-14 xl:h-14 rounded-full bg-[#B44218]/10 text-[#B44218]">
                  <Zap className="w-6 h-6 xl:w-7 xl:h-7" />
                </div>
                <span className="font-semibold text-[#1C2C4A] text-sm xl:text-base leading-tight max-w-[80px]">Faster Approvals</span>
              </div>
              <div className="hidden sm:block w-px h-14 bg-slate-400/50"></div>
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-12 h-12 xl:w-14 xl:h-14 rounded-full bg-[#B44218]/10 text-[#B44218]">
                  <BarChart3 className="w-6 h-6 xl:w-7 xl:h-7" />
                </div>
                <span className="font-semibold text-[#1C2C4A] text-sm xl:text-base leading-tight max-w-[100px]">Empowering Businesses</span>
              </div>
            </div>
          </div>
          
          <div className="mt-auto">
            <div className="w-12 h-1.5 bg-[#B44218] mb-6"></div>
            <p className="text-white text-3xl xl:text-4xl font-semibold leading-[1.2] drop-shadow-md">
              Building <br />
              A Prosperous <br />
              Maharashtra
            </p>
          </div>
        </div>
      </div>

      {/* Right Column */}
      <div className="w-full lg:w-1/2 flex flex-col relative bg-[#F8FAFC]">
        {/* Language Selector */}
        <div className="absolute top-6 right-8 z-10">
          <PillLanguageToggle variant="light" />
        </div>

        <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 mt-12 lg:mt-0">
          <div className="w-full max-w-[480px] bg-white rounded-[1.25rem] shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-slate-100 p-8 sm:p-10 relative">
            <div className="text-center mb-10">
              <Image src="/UdyogSetu_Logo.png" alt="UdyogSetu Logo" width={220} height={70} className="h-14 w-auto object-contain mx-auto mb-3" priority />
              <p className="text-slate-500 text-[15px] font-medium">Maharashtra Industrial Approvals Platform</p>
              <div className="w-10 h-[2px] bg-[#B44218] mx-auto mt-6"></div>
            </div>
            
            <div className="mb-8">
              <h1 className="text-[1.75rem] font-bold text-[#1C2C4A] mb-1">Sign In</h1>
              <p className="text-slate-500 text-[15px]">Access your account to continue</p>
            </div>
            
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="flex bg-[#F1F5F9] rounded-lg p-1 border border-slate-200">
                <button
                  type="button"
                  onClick={() => { setRole("APPLICANT"); setDepartment(""); }}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold rounded-md transition-all duration-200 ${role === "APPLICANT" ? "bg-[#B44218] text-white shadow-sm" : "text-slate-600 hover:text-slate-900"}`}
                >
                  <User className="w-4 h-4" /> Applicant
                </button>
                <button
                  type="button"
                  onClick={() => setRole("OFFICER")}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold rounded-md transition-all duration-200 ${role === "OFFICER" ? "bg-[#B44218] text-white shadow-sm" : "text-slate-600 hover:text-slate-900"}`}
                >
                  <Users className="w-4 h-4" /> Officer
                </button>
                <button
                  type="button"
                  onClick={() => { setRole("ADMIN"); setDepartment(""); }}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold rounded-md transition-all duration-200 ${role === "ADMIN" ? "bg-[#B44218] text-white shadow-sm" : "text-slate-600 hover:text-slate-900"}`}
                >
                  <Shield className="w-4 h-4" /> Administrator
                </button>
              </div>
              
              {role === "OFFICER" && (
                <div className="space-y-2">
                  <Label className="text-slate-700 font-semibold text-[15px]">Department</Label>
                  <Select onValueChange={(v) => v && setDepartment(v)} value={department}>
                    <SelectTrigger className="h-12 border-slate-200">
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

              {role === "ADMIN" && (
                <div className="p-3 bg-slate-50 text-slate-700 text-sm rounded-md border border-slate-200">
                  <p className="font-semibold">🛡️ Administrator Access</p>
                  <p className="mt-1 text-slate-500 text-xs">Full oversight of all departments, officers, and applications. Use credentials provided by the IT department.</p>
                </div>
              )}

              <div className="space-y-5">
                <div className="space-y-2.5">
                  <Label className="text-slate-700 font-semibold text-[15px]">
                    {role === "APPLICANT" ? "Email Address" : role === "ADMIN" ? "Admin ID" : "Employee ID"}
                  </Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Mail className="h-[18px] w-[18px] text-slate-400" />
                    </div>
                    <Input
                      key={`login-id-${role}`}
                      type={role === "APPLICANT" ? "email" : "text"}
                      placeholder={role === "APPLICANT" ? "admin@company.com" : role === "ADMIN" ? "ADMIN-001" : DEPARTMENTS.find(d => d.value === department)?.id || "OFF-XXX-001"}
                      required
                      defaultValue={role === "APPLICANT" ? "admin@company.com" : role === "ADMIN" ? "ADMIN-001" : ""}
                      className="pl-[42px] h-12 border-slate-200 focus-visible:ring-[#B44218] text-slate-900 placeholder:text-slate-400 text-[15px]"
                    />
                  </div>
                </div>
                
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <Label className="text-slate-700 font-semibold text-[15px]">Password</Label>
                    <Link href="#" className="text-[13px] font-semibold text-[#B44218] hover:underline">Need help?</Link>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Lock className="h-[18px] w-[18px] text-slate-400" />
                    </div>
                    <Input 
                      type={showPassword ? "text" : "password"} 
                      placeholder="••••••••" 
                      required 
                      defaultValue="password123" 
                      className="pl-[42px] pr-10 h-12 border-slate-200 focus-visible:ring-[#B44218] text-slate-900 placeholder:text-slate-400 text-[15px] tracking-widest"
                    />
                    <button 
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      <Eye className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                
                {error && (
                  <div className="p-3 bg-red-50 text-red-700 text-sm rounded-md border border-red-200">
                    {error}
                  </div>
                )}

                <Button 
                  type="submit" 
                  className="w-full h-[52px] text-base font-semibold bg-[#B44218] hover:bg-[#963713] text-white shadow-sm flex items-center justify-center gap-2 transition-colors mt-3"
                  disabled={role === "OFFICER" && !department}
                >
                  {role === "APPLICANT" ? "Sign In as Applicant" : role === "ADMIN" ? "Sign In as Administrator" : `Sign In to ${department || "Department"}`}
                  <ArrowRight className="w-[18px] h-[18px]" />
                </Button>
                
                <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-center gap-2 text-[13px] font-medium text-slate-500">
                  <ShieldCheck className="w-[18px] h-[18px] text-slate-400" />
                  Secure access • Government of Maharashtra
                </div>
              </div>
            </form>
          </div>
          
          {role === "APPLICANT" && (
            <p className="text-center text-[15px] text-slate-500 mt-8">
              Don't have an account? <Link href="/signup" className="text-[#B44218] font-bold hover:underline">Register your business</Link>
            </p>
          )}
        </div>
        
        {/* Footer */}
        <div className="w-full px-8 py-6 flex flex-col md:flex-row justify-between items-center text-[13px] text-slate-500 gap-4">
          <div className="flex gap-4 font-medium">
            <Link href="#" className="hover:text-slate-800">Terms of Use</Link>
            <span className="text-slate-300">|</span>
            <Link href="#" className="hover:text-slate-800">Privacy Policy</Link>
            <span className="text-slate-300">|</span>
            <Link href="#" className="hover:text-slate-800">Help & Support</Link>
          </div>
          <div>
            © 2026 UdyogSetu. Government of Maharashtra.
          </div>
        </div>
      </div>
    </div>
  );
}
