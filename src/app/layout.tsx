import type { Metadata } from "next";
import { Fraunces, Noto_Sans } from "next/font/google";
import "./globals.css";
import Script from "next/script";
import { Toaster } from "sonner";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: "variable",
  axes: ["opsz"],
});

const notoSans = Noto_Sans({
  variable: "--font-noto-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "UdyogSetu | Single Window Portal",
  description: "Maharashtra Industrial Approvals Platform",
};

import { getSession } from "@/lib/auth";
import StreamClientProvider from "@/components/StreamClientProvider";

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  const safeUserId = session?.userId 
    ? session.userId 
    : (session?.name ? session.name.replace(/[^a-zA-Z0-9]/g, "_").toLowerCase() : "unknown-user");
  const userName = session?.role === "OFFICER" && session?.department 
    ? session.department 
    : (session?.name || "");

  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${notoSans.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        {session ? (
          <StreamClientProvider userId={safeUserId} userName={userName}>
            {children}
          </StreamClientProvider>
        ) : (
          children
        )}
        <Toaster position="bottom-right" richColors />
        
        <div id="google_translate_element" style={{ display: 'none' }}></div>
        <Script
          id="gtranslate-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              function googleTranslateElementInit() {
                new google.translate.TranslateElement({
                  pageLanguage: 'en',
                  includedLanguages: 'en,mr',
                  autoDisplay: false
                }, 'google_translate_element');
              }
            `,
          }}
        />
        <Script
          id="gtranslate-script"
          strategy="afterInteractive"
          src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
        />
      </body>
    </html>
  );
}
