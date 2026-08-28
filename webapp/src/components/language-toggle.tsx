"use client";

import { useEffect, useState } from "react";
import { Globe } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useRouter } from "next/navigation";

export default function LanguageToggle() {
  const [lang, setLang] = useState("en");
  const router = useRouter();

  useEffect(() => {
    // Check if googtrans cookie is set to Marathi
    const match = document.cookie.match(/(?:^|;)\s*googtrans=([^;]*)/);
    if (match && match[1] && match[1].includes("/mr")) {
      setLang("mr");
    } else {
      setLang("en");
    }
  }, []);

  const handleChange = (val: string) => {
    setLang(val);
    
    // Set the cookie for both the root domain and current host
    if (val === "mr") {
      document.cookie = `googtrans=/en/mr; path=/`;
      document.cookie = `googtrans=/en/mr; domain=${window.location.hostname}; path=/`;
    } else {
      // Clear cookies to revert to English
      document.cookie = `googtrans=/en/en; path=/`;
      document.cookie = `googtrans=/en/en; domain=${window.location.hostname}; path=/`;
      document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; domain=${window.location.hostname}; path=/;`;
    }
    
    // Reload the page so the Google Translate script picks up the new cookie
    window.location.reload();
  };

  return (
    <Popover>
      <PopoverTrigger className="flex items-center gap-1.5 h-8 px-2.5 text-xs font-medium border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-md transition-colors cursor-pointer outline-none">
        <Globe className="w-3.5 h-3.5 text-blue-600" />
        {lang === "en" ? "English" : "मराठी"}
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[140px] p-1 shadow-md border-slate-200">
        <button 
          onClick={() => handleChange("en")}
          className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${lang === "en" ? "bg-blue-50 text-blue-700 font-medium" : "hover:bg-slate-100 text-slate-700"}`}
        >
          English
        </button>
        <button 
          onClick={() => handleChange("mr")}
          className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors mt-0.5 ${lang === "mr" ? "bg-blue-50 text-blue-700 font-medium" : "hover:bg-slate-100 text-slate-700"}`}
        >
          मराठी (Marathi)
        </button>
      </PopoverContent>
    </Popover>
  );
}
