"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { Loader2 } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = e.target as HTMLFormElement;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;
    const name = (form.elements.namedItem("name") as HTMLInputElement).value;
    const company = (form.elements.namedItem("company") as HTMLInputElement).value;

    if (!email.includes("@")) {
      setError("Please enter a valid email address.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name, companyName: company, role: "APPLICANT" }),
      });

      const data = await res.json();
      if (!data.success) {
        setError(data.error || "Failed to register.");
        setLoading(false);
        return;
      }
      
      // Auto login
      await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: email, role: "APPLICANT" })
      });

      router.push("/dashboard");
    } catch (err) {
      setError("An unexpected error occurred.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
      <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-bold text-xl mx-auto mb-3">U</div>
          <h1 className="text-2xl font-bold text-slate-900">Register Business</h1>
          <p className="text-slate-500 mt-2">Create your single-window profile</p>
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          <div className="space-y-2">
            <Label>Applicant Name</Label>
            <Input name="name" placeholder="John Doe" required />
          </div>
          <div className="space-y-2">
            <Label>Company Name</Label>
            <Input name="company" placeholder="Acme Industries" required />
          </div>
          <div className="space-y-2">
            <Label>Email Address</Label>
            <Input type="email" name="email" placeholder="admin@company.com" required />
          </div>
          <div className="space-y-2">
            <Label>Create Password</Label>
            <Input type="password" name="password" placeholder="••••••••" required />
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-red-700 text-sm rounded-md border border-red-200">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-lg py-6 mt-6" disabled={loading}>
            {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
            Create Profile & Login
          </Button>

          <p className="text-center text-sm text-slate-500 mt-6">
            Already have an account? <Link href="/login" className="text-emerald-600 font-semibold hover:underline">Sign In</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
