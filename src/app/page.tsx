import Link from "next/link";
import PillLanguageToggle from "@/components/pill-language-toggle";

const heading = "font-[family-name:var(--font-fraunces)]";

function WarliFigures() {
  return (
    <svg
      viewBox="0 0 300 190"
      fill="none"
      className="w-full h-auto"
      aria-hidden="true"
    >
      <line x1="20" y1="150" x2="280" y2="150" stroke="var(--cream)" strokeWidth="2" strokeLinecap="round" />
      {[60, 150, 240].map((x, i) => (
        <g key={x} stroke="var(--cream)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <circle cx={x} cy="58" r="9" />
          <line x1={x} y1="67" x2={x} y2="112" />
          <line x1={x} y1="82" x2={x - 16} y2={i === 1 ? 62 : 68} />
          <line x1={x} y1="82" x2={x + 16} y2={i === 1 ? 68 : 62} />
          <line x1={x} y1="112" x2={x - 13} y2="150" />
          <line x1={x} y1="112" x2={x + 13} y2="150" />
        </g>
      ))}
      <circle cx="256" cy="34" r="5" fill="var(--marigold)" />
    </svg>
  );
}

export default function Home() {
  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "var(--cream)", color: "var(--ink-muted)" }}
    >
      {/* Nav */}
      <header className="sticky top-0 z-10" style={{ backgroundColor: "var(--cream)" }}>
        <div className="max-w-[1080px] mx-auto px-8 py-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/UdyogSetu_Logo.png" alt="UdyogSetu Logo" className="h-10 w-auto object-contain" />
          </div>

          <nav className="hidden md:flex items-center gap-8">
            <a href="#how-it-works" className="text-sm text-slate-500 hover:text-slate-700" style={{ color: "var(--ink-muted)" }}>
              How it works
            </a>
            <Link href="/login?role=officer" className="text-sm" style={{ color: "var(--ink-muted)" }}>
              For officers
            </Link>
            <Link href="/login" className="text-sm" style={{ color: "var(--ink-muted)" }}>
              Track application
            </Link>
          </nav>

          <PillLanguageToggle />
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-[1080px] mx-auto px-8 pt-10 pb-20">
        <div className="grid md:grid-cols-[1.1fr_0.9fr] gap-10 items-center">
          <div>
            <p
              className="text-xs font-semibold uppercase tracking-[0.12em] mb-4"
              style={{ color: "var(--terracotta)" }}
            >
              Government of Maharashtra · Single Window
            </p>
            <h1
              className={`${heading} font-medium mb-6`}
              style={{ color: "var(--ashoka)", fontSize: "48px", lineHeight: 1.15 }}
            >
              Ek arj, <span className="not-italic" style={{ color: "var(--terracotta)" }}>saglya</span> manjuri.
              <br />
              One form, every approval.
            </h1>
            <p className="mb-8" style={{ fontSize: "17px", color: "var(--ink-muted)", maxWidth: "42ch" }}>
              Tell UdyogSetu about your unit and it draws up your exact approval checklist, fills a single form
              from the documents you upload, and sends it to every department that needs it — in English or
              Marathi.
            </p>
            <div className="flex flex-wrap items-center gap-6">
              <Link
                href="/login"
                className="inline-flex items-center px-6 py-3 rounded-md font-medium transition-opacity hover:opacity-90"
                style={{ backgroundColor: "var(--terracotta)", color: "var(--cream)" }}
              >
                Start new application
              </Link>
              <Link
                href="/login"
                className="text-sm font-medium underline underline-offset-4"
                style={{ color: "var(--ashoka)", textDecorationColor: "var(--marigold)" }}
              >
                Track application
              </Link>
            </div>
          </div>

          <div className="rounded-2xl p-10" style={{ backgroundColor: "var(--forest)" }}>
            <WarliFigures />
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <section style={{ backgroundColor: "var(--ashoka)" }}>
        <div className="max-w-[1080px] mx-auto px-8 py-10 flex flex-wrap justify-around gap-8 text-center">
          {[
            { n: "15", l: "departments unified" },
            { n: "18", l: "sectors recognised" },
            { n: "2", l: "languages, equally supported" },
            { n: "30d", l: "grievance SLA" },
          ].map((s) => (
            <div key={s.l}>
              <div className={`${heading} font-semibold text-3xl`} style={{ color: "var(--marigold)" }}>
                {s.n}
              </div>
              <div className="text-sm mt-1" style={{ color: "var(--cream)" }}>
                {s.l}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" style={{ backgroundColor: "var(--cream-soft)" }}>
        <div className="max-w-[1080px] mx-auto px-8 py-20">
          <p
            className="text-xs font-semibold uppercase tracking-[0.12em] mb-3"
            style={{ color: "var(--terracotta)" }}
          >
            How it works
          </p>
          <h2 className={`${heading} font-medium mb-3`} style={{ color: "var(--ashoka)", fontSize: "32px" }}>
            Three steps, in your language.
          </h2>
          <p className="mb-12" style={{ maxWidth: "60ch", color: "var(--ink-muted)" }}>
            No more guessing which department to approach first, or filing the same details six times over.
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                title: "1. Tell us about your unit",
                body: "Sector, scale, district, and MIDC status — the same filters Maharashtra's own approval rules already use.",
              },
              {
                title: "2. Get your checklist",
                body: "The regulatory knowledge engine works out only the approvals your unit actually needs, and nothing it doesn't.",
              },
              {
                title: "3. One form, sent everywhere",
                body: "Upload each document once — it's auto-filled, verified, and dispatched to every relevant department at once.",
              },
            ].map((c) => (
              <div
                key={c.title}
                className="bg-white rounded-xl p-[26px]"
                style={{ border: "1px solid #e4dcc8" }}
              >
                <h3 className={`${heading} font-medium mb-2`} style={{ color: "var(--ashoka)", fontSize: "18px" }}>
                  {c.title}
                </h3>
                <p className="text-sm" style={{ color: "var(--ink-muted)" }}>
                  {c.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ backgroundColor: "var(--terracotta)" }}>
        <div className="max-w-[1080px] mx-auto px-8 py-20">
          <p
            className="text-xs font-semibold uppercase tracking-[0.12em] mb-3"
            style={{ color: "var(--marigold)" }}
          >
            Built for the gaps that are left
          </p>
          <h2
            className={`${heading} font-medium mb-12`}
            style={{ color: "var(--cream)", fontSize: "32px", maxWidth: "24ch" }}
          >
            Closing what the state&apos;s own reforms haven&apos;t reached yet.
          </h2>

          <div className="grid md:grid-cols-2 gap-x-10 gap-y-8">
            {[
              {
                title: "Risk-based scrutiny",
                body: "Low-risk units go straight to self-certification instead of waiting on a full manual review.",
              },
              {
                title: "Schemes & incentives matcher",
                body: "Surfaces the government schemes a unit already qualifies for, automatically.",
              },
              {
                title: "Coordinated inspections",
                body: "Bundles every department's site visit into one coordinated inspection instead of three.",
              },
              {
                title: "Predictive timelines",
                body: "A realistic ETA per approval, grounded in real department data instead of a fixed SLA.",
              },
            ].map((f) => (
              <div key={f.title} className="pl-4" style={{ borderLeft: "2px solid var(--marigold)" }}>
                <h3 className="font-semibold mb-1" style={{ color: "var(--cream)" }}>
                  {f.title}
                </h3>
                <p className="text-sm" style={{ color: "var(--cream)", opacity: 0.85 }}>
                  {f.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ backgroundColor: "var(--cream)" }}>
        <div className="max-w-[1080px] mx-auto px-8 py-8 text-center text-sm" style={{ color: "var(--ink-muted)" }}>
          UdyogSetu · उद्योगसेतू · A single window for Maharashtra&apos;s industrial approvals
        </div>
      </footer>
    </div>
  );
}
