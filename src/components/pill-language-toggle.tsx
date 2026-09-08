"use client";

import { useEffect, useState } from "react";

export default function PillLanguageToggle({
  variant = "light",
}: {
  /** "light" for cream/white chrome, "dark" for ashoka/navy chrome */
  variant?: "light" | "dark";
}) {
  const [lang, setLang] = useState<"en" | "mr">("en");

  useEffect(() => {
    // Always render "en" on the server to match first paint, then sync from
    // the cookie once mounted — reading document.cookie during render would
    // cause a hydration mismatch when the cookie is already set to "mr".
    const match = document.cookie.match(/(?:^|;)\s*googtrans=([^;]*)/);
    if (match && match[1] && match[1].includes("/mr")) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLang("mr");
    }
  }, []);

  const handleChange = (val: "en" | "mr") => {
    if (val === lang) return;
    setLang(val);

    if (val === "mr") {
      document.cookie = `googtrans=/en/mr; path=/`;
      document.cookie = `googtrans=/en/mr; domain=${window.location.hostname}; path=/`;
    } else {
      document.cookie = `googtrans=/en/en; path=/`;
      document.cookie = `googtrans=/en/en; domain=${window.location.hostname}; path=/`;
      document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; domain=${window.location.hostname}; path=/;`;
    }

    window.location.reload();
  };

  const borderColor = variant === "dark" ? "var(--cream)" : "var(--ashoka)";
  const idleColor = variant === "dark" ? "var(--cream)" : "var(--ashoka)";
  const activeBg = variant === "dark" ? "var(--cream)" : "var(--ashoka)";
  const activeColor = variant === "dark" ? "var(--ashoka)" : "var(--cream)";

  return (
    <div
      className="inline-flex items-center rounded-[20px] border p-0.5 text-sm font-medium"
      style={{ borderColor }}
    >
      <button
        type="button"
        onClick={() => handleChange("en")}
        className="rounded-[16px] px-3 py-1 transition-colors"
        style={
          lang === "en"
            ? { backgroundColor: activeBg, color: activeColor }
            : { color: idleColor }
        }
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => handleChange("mr")}
        className="rounded-[16px] px-3 py-1 transition-colors"
        style={
          lang === "mr"
            ? { backgroundColor: activeBg, color: activeColor }
            : { color: idleColor }
        }
      >
        मराठी
      </button>
    </div>
  );
}
