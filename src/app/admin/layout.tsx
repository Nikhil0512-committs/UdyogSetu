import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import PillLanguageToggle from "@/components/pill-language-toggle";
import { LayoutDashboard, FileStack, Building2, AlertTriangle, Users, LogOut } from "lucide-react";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  if (session.role !== "ADMIN") {
    redirect(session.role === "APPLICANT" ? "/dashboard" : "/officer/dashboard");
  }

  const navItems = [
    { href: "/admin/dashboard", label: "Overview", icon: LayoutDashboard, tooltip: "KPIs, heatmap, and system-wide activity feed" },
    { href: "/admin/applications", label: "All Applications", icon: FileStack, tooltip: "Cross-department application tracker with delay flags" },
    { href: "/admin/departments", label: "Departments", icon: Building2, tooltip: "Per-department SLA performance and bottleneck alerts" },
    { href: "/admin/delays", label: "Delays", icon: AlertTriangle, tooltip: "SLA breaches and overdue applications by severity" },
    { href: "/admin/officers", label: "Officers", icon: Users, tooltip: "Officer workload, review stats, and activity log" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-indigo-950 border-b border-indigo-900 px-6 py-4 flex items-center justify-between sticky top-0 z-10 text-white">
        <div className="flex items-center gap-4">
          <Link href="/admin/dashboard" className="transition-opacity hover:opacity-80">
            <Image src="/UdyogSetu_Logo.png" alt="UdyogSetu Logo" width={128} height={32} className="h-8 w-auto object-contain bg-white rounded p-1" priority />
          </Link>
          <div>
            <span className="text-lg font-bold block">Administrator Portal</span>
            <span className="text-xs text-indigo-300 font-medium">Full System Oversight</span>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <nav className="hidden md:flex gap-1">
            {navItems.map((item) => (
              <div key={item.href} className="relative group">
                <Link
                  href={item.href}
                  className="flex items-center gap-2 text-sm font-medium text-indigo-200 hover:text-white hover:bg-indigo-800/50 px-3 py-2 rounded-md transition-colors"
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Link>
                <div className="absolute left-1/2 -translate-x-1/2 top-full mt-1 hidden group-hover:block w-56 p-2 bg-indigo-800 text-white text-xs rounded shadow-lg z-50 text-center pointer-events-none">
                  {item.tooltip}
                </div>
              </div>
            ))}
          </nav>
          <div className="flex items-center gap-4 border-l pl-4 border-indigo-700">
            <PillLanguageToggle variant="dark" />
            <div className="text-sm text-right">
              <p className="font-medium text-white">{session.name}</p>
              <p className="text-indigo-300 text-xs">System Administrator</p>
            </div>
            <Link href="/api/auth/logout" prefetch={false}>
              <Button variant="secondary" size="sm" className="bg-indigo-800 text-white hover:bg-indigo-700 border-none">
                <LogOut className="w-4 h-4 mr-1" /> Logout
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 p-6 md:p-8 max-w-[1440px] mx-auto w-full">
        {children}
      </main>
    </div>
  );
}
