import { requireAuth } from "@/lib/auth";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import NotificationsMenu from "@/components/notifications-menu";
import PillLanguageToggle from "@/components/pill-language-toggle";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { AgentChatPanel } from "@/components/agent-chat-panel";
import { Sparkles } from "lucide-react";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAuth("APPLICANT");
  
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 bg-blue-600 rounded-md flex items-center justify-center text-white font-bold">U</div>
          <span className="text-xl font-bold text-slate-800">Applicant Portal</span>
        </div>
        <div className="flex items-center gap-6">
          <nav className="hidden md:flex gap-4">
            <Link href="/dashboard" className="text-sm font-medium text-slate-600 hover:text-slate-900">Dashboard</Link>
            <Link href="/dashboard/applications" className="text-sm font-medium text-slate-600 hover:text-slate-900">Applications</Link>
            <Link href="/dashboard/wallet" className="text-sm font-medium text-slate-600 hover:text-slate-900">Document Wallet</Link>
            <Link href="/dashboard/schemes" className="text-sm font-medium text-slate-600 hover:text-slate-900">Schemes</Link>
            <Link href="/dashboard/inspections" className="text-sm font-medium text-slate-600 hover:text-slate-900">Inspections</Link>
            <Link href="/dashboard/grievances" className="text-sm font-medium text-slate-600 hover:text-slate-900">Grievances</Link>
          </nav>
          <div className="flex items-center gap-3 border-l pl-4 border-slate-200">
            
            {/* Language & Agent Mode Mocks */}
            <PillLanguageToggle />
            
            <Sheet>
              <SheetTrigger className="text-[10px] bg-indigo-100 text-indigo-800 px-2 py-1 rounded font-bold cursor-pointer hover:bg-indigo-200 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Agent Mode
              </SheetTrigger>
              <SheetContent className="w-[400px] sm:w-[540px] p-0 flex flex-col">
                <SheetHeader className="p-4 border-b border-slate-200 bg-white">
                  <SheetTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-indigo-600" /> UdyogSetu AI Co-pilot
                  </SheetTitle>
                  <SheetDescription>
                    Your conversational assistant for finding schemes and resolving queries in Marathi or English.
                  </SheetDescription>
                </SheetHeader>
                <div className="flex-1 overflow-hidden">
                  <AgentChatPanel />
                </div>
              </SheetContent>
            </Sheet>

            <NotificationsMenu />
            <div className="text-sm text-right">
              <p className="font-medium text-slate-900">{session.name}</p>
              <p className="text-slate-500 text-xs">M/S {session.name} Industries</p>
            </div>
            <Link href="/">
              <Button variant="outline" size="sm">Logout</Button>
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
