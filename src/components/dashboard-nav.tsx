"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";

const navItems = [
  { href: "/dashboard", label: "Dashboard", desc: "Overview of your business profile and recent activity." },
  { href: "/dashboard/applications", label: "Applications", desc: "Track and manage your permits, licenses, and NOC requests." },
  { href: "/dashboard/wallet", label: "Document Wallet", desc: "Securely store and share your verified business documents." },
  { href: "/dashboard/schemes", label: "Schemes", desc: "Discover and apply for government subsidies and incentive programs." },
  { href: "/dashboard/inspections", label: "Inspections", desc: "Schedule and manage video or physical site verifications." },
  { href: "/dashboard/grievances", label: "Grievances", desc: "Raise and track complaints regarding delays or issues." },
];

function isItemActive(pathname: string, href: string) {
  // Exact match for dashboard, prefix match for others to keep them active when viewing details
  return href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(href);
}

export function DashboardNav() {
  const pathname = usePathname();

  return (
    <nav className="hidden md:flex gap-6">
      {navItems.map((item) => {
        const isActive = isItemActive(pathname, item.href);

        return (
          <div key={item.href} className="relative group flex items-center">
            <Link 
              href={item.href} 
              className={`text-sm font-medium py-2 transition-colors ${
                isActive 
                  ? "text-blue-700" 
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {item.label}
            </Link>
            <div className="absolute left-1/2 -translate-x-1/2 top-full mt-1 hidden group-hover:block w-48 p-2 bg-slate-900 text-white text-xs rounded shadow-lg z-50 text-center pointer-events-none">
              {item.desc}
            </div>
          </div>
        );
      })}
    </nav>
  );
}

// Mobile equivalent of DashboardNav: below md, the desktop nav is hidden
// entirely with nothing standing in for it, so pages other than the
// dashboard root become unreachable on a phone. This renders a hamburger
// button that opens a slide-out sheet with the same links.
export function MobileNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger
          render={
            <Button variant="ghost" size="icon" aria-label="Open navigation menu" />
          }
        >
          <Menu className="w-5 h-5" />
        </SheetTrigger>
        <SheetContent side="left" className="w-[85vw] max-w-xs p-0 flex flex-col">
          <SheetHeader className="p-4 border-b border-slate-200">
            <SheetTitle>Menu</SheetTitle>
          </SheetHeader>
          <div className="flex flex-col p-2">
            {navItems.map((item) => {
              const isActive = isItemActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`text-sm font-medium px-3 py-3 rounded-md transition-colors ${
                    isActive
                      ? "bg-blue-50 text-blue-700"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
