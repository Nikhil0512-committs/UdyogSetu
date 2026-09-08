"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function DashboardNav() {
  const pathname = usePathname();

  const navItems = [
    { href: "/dashboard", label: "Dashboard", desc: "Overview of your business profile and recent activity." },
    { href: "/dashboard/applications", label: "Applications", desc: "Track and manage your permits, licenses, and NOC requests." },
    { href: "/dashboard/wallet", label: "Document Wallet", desc: "Securely store and share your verified business documents." },
    { href: "/dashboard/schemes", label: "Schemes", desc: "Discover and apply for government subsidies and incentive programs." },
    { href: "/dashboard/inspections", label: "Inspections", desc: "Schedule and manage video or physical site verifications." },
    { href: "/dashboard/grievances", label: "Grievances", desc: "Raise and track complaints regarding delays or issues." },
  ];

  return (
    <nav className="hidden md:flex gap-6">
      {navItems.map((item) => {
        // Exact match for dashboard, prefix match for others to keep them active when viewing details
        const isActive = item.href === "/dashboard" 
          ? pathname === "/dashboard" 
          : pathname.startsWith(item.href);

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
