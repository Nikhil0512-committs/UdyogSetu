import { requireAuth } from "@/lib/auth";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShieldCheck } from "lucide-react";

export default async function OfficerLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAuth("OFFICER");
  
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center justify-between sticky top-0 z-10 text-white">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 bg-amber-500 rounded-md flex items-center justify-center text-slate-900 font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-lg font-bold block">Officer Portal</span>
            {session.department && <span className="text-xs text-amber-400 font-medium">{session.department}</span>}
          </div>
        </div>
        <div className="flex items-center gap-6">
          <nav className="hidden md:flex gap-4">
            <Link href="/officer/dashboard" className="text-sm font-medium text-slate-300 hover:text-white">Queue Dashboard</Link>
          </nav>
          <div className="flex items-center gap-4 border-l pl-4 border-slate-700">
            <div className="text-sm text-right">
              <p className="font-medium text-white">{session.name}</p>
              <p className="text-slate-400 text-xs">{session.department || "Admin"}</p>
            </div>
            <Link href="/">
              <Button variant="secondary" size="sm" className="bg-slate-800 text-white hover:bg-slate-700 border-none">Logout</Button>
            </Link>
          </div>
        </div>
      </header>
      
      <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
}
