import { requireAuth } from "@/lib/auth";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DashboardNav, MobileNav } from "@/components/dashboard-nav";
import NotificationsMenu from "@/components/notifications-menu";
import PillLanguageToggle from "@/components/pill-language-toggle";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { AgentChatPanel } from "@/components/agent-chat-panel";
import { Sparkles } from "lucide-react";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAuth("APPLICANT");
  
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b border-slate-200 px-3 md:px-6 py-3 md:py-4 flex items-center justify-between sticky top-0 z-10 gap-2">
        <div className="flex items-center gap-2 md:gap-4">
          <MobileNav />
          <Link href="/dashboard" className="transition-opacity hover:opacity-80">
            <img src="/UdyogSetu_Logo.png" alt="UdyogSetu Logo" className="h-7 md:h-8 w-auto object-contain" />
          </Link>
        </div>
        <div className="flex items-center gap-2 md:gap-6 min-w-0">
          <DashboardNav />
          <div className="flex items-center gap-1.5 md:gap-3 md:border-l md:pl-4 border-slate-200">
            
            {/* Language & Agent Mode Mocks */}
            <div className="hidden sm:block">
              <PillLanguageToggle />
            </div>
            
            <Sheet>
              <SheetTrigger className="text-[10px] bg-indigo-100 text-indigo-800 px-2 py-1 rounded font-bold cursor-pointer hover:bg-indigo-200 flex items-center gap-1 whitespace-nowrap">
                <Sparkles className="w-3 h-3" /> <span className="hidden sm:inline">Agent Mode</span>
              </SheetTrigger>
              {/* Full-width on phones (with a small margin) so buttons/text inside
                  the panel never get clipped off-screen; scales up on larger
                  viewports the same way it did before. */}
              <SheetContent className="w-[92vw] sm:w-[400px] md:w-[540px] p-0 flex flex-col">
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
            <div className="hidden md:block text-sm text-right">
              <p className="font-medium text-slate-900">{session.name}</p>
              <p className="text-slate-500 text-xs">M/S {session.companyName || `${session.name} Industries`}</p>
            </div>
            <Link href="/api/auth/logout" prefetch={false}>
              <Button variant="outline" size="sm">Logout</Button>
            </Link>
          </div>
        </div>
      </header>
      
      <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
}
