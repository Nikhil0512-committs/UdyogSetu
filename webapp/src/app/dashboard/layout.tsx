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
          <nav className="hidden md:flex gap-6">
            <div className="relative group flex items-center">
              <Link href="/dashboard" className="text-sm font-medium text-slate-600 hover:text-slate-900 py-2">Dashboard</Link>
              <div className="absolute left-1/2 -translate-x-1/2 top-full mt-1 hidden group-hover:block w-48 p-2 bg-slate-900 text-white text-xs rounded shadow-lg z-50 text-center pointer-events-none">
                Overview of your business profile and recent activity.
              </div>
            </div>
            <div className="relative group flex items-center">
              <Link href="/dashboard/applications" className="text-sm font-medium text-slate-600 hover:text-slate-900 py-2">Applications</Link>
              <div className="absolute left-1/2 -translate-x-1/2 top-full mt-1 hidden group-hover:block w-56 p-2 bg-slate-900 text-white text-xs rounded shadow-lg z-50 text-center pointer-events-none">
                Track and manage your permits, licenses, and NOC requests.
              </div>
            </div>
            <div className="relative group flex items-center">
              <Link href="/dashboard/wallet" className="text-sm font-medium text-slate-600 hover:text-slate-900 py-2">Document Wallet</Link>
              <div className="absolute left-1/2 -translate-x-1/2 top-full mt-1 hidden group-hover:block w-56 p-2 bg-slate-900 text-white text-xs rounded shadow-lg z-50 text-center pointer-events-none">
                Securely store and share your verified business documents.
              </div>
            </div>
            <div className="relative group flex items-center">
              <Link href="/dashboard/schemes" className="text-sm font-medium text-slate-600 hover:text-slate-900 py-2">Schemes</Link>
              <div className="absolute left-1/2 -translate-x-1/2 top-full mt-1 hidden group-hover:block w-56 p-2 bg-slate-900 text-white text-xs rounded shadow-lg z-50 text-center pointer-events-none">
                Discover and apply for government subsidies and incentive programs.
              </div>
            </div>
            <div className="relative group flex items-center">
              <Link href="/dashboard/inspections" className="text-sm font-medium text-slate-600 hover:text-slate-900 py-2">Inspections</Link>
              <div className="absolute left-1/2 -translate-x-1/2 top-full mt-1 hidden group-hover:block w-56 p-2 bg-slate-900 text-white text-xs rounded shadow-lg z-50 text-center pointer-events-none">
                Schedule and manage video or physical site verifications.
              </div>
            </div>
            <div className="relative group flex items-center">
              <Link href="/dashboard/grievances" className="text-sm font-medium text-slate-600 hover:text-slate-900 py-2">Grievances</Link>
              <div className="absolute left-1/2 -translate-x-1/2 top-full mt-1 hidden group-hover:block w-56 p-2 bg-slate-900 text-white text-xs rounded shadow-lg z-50 text-center pointer-events-none">
                Raise and track complaints regarding delays or issues.
              </div>
            </div>
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
