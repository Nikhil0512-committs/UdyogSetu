import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Shield, FileText, Globe, ChevronRight } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <header className="px-6 py-4 bg-white border-b border-slate-200 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-md flex items-center justify-center text-white font-bold">U</div>
          <span className="text-xl font-bold text-slate-800">UdyogSetu</span>
        </div>
        <div className="flex gap-4">
          <Link href="/login?role=applicant">
            <Button variant="outline">Applicant Login</Button>
          </Link>
          <Link href="/login?role=officer">
            <Button>Officer Login</Button>
          </Link>
        </div>
      </header>
      
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 max-w-4xl mx-auto py-20">
        <h1 className="text-5xl font-extrabold text-slate-900 tracking-tight mb-6">
          Maharashtra Industrial Approvals Platform
        </h1>
        <p className="text-xl text-slate-600 mb-10 max-w-2xl">
          A unified single-window portal for all industrial approvals, replacing department-by-department portals with smart routing, intelligent document wallets, and automated checklists.
        </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-in slide-in-from-bottom-4 duration-700 delay-150">
            <Link href="/login">
              <Button size="lg" className="text-lg px-8 py-6 h-auto w-full sm:w-auto">
                Login to Portal <ChevronRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="/analytics">
              <Button variant="outline" size="lg" className="text-lg px-8 py-6 h-auto w-full sm:w-auto">
                View State Analytics
              </Button>
            </Link>
          </div>
      </main>
      
      <footer className="py-6 text-center text-slate-500 border-t border-slate-200 bg-white">
        &copy; {new Date().getFullYear()} Government of Maharashtra. All rights reserved.
      </footer>
    </div>
  );
}
