# UdyogSetu

A prototype for **SIH Problem Statement 26130** — a unified single-window web platform for Maharashtra industrial approvals, aimed at replacing the manual, department-by-department workflow currently handled through MAITRI 2.0.

The core idea: an applicant answers a few questions about their business (sector, scale, location, MIDC status), the platform's regulatory engine works out exactly which approvals and documents they need, and the same application is routed straight into the correct department officers' queues — instead of the applicant having to know the rules themselves or file separately with each department.

## Status

This is a **working frontend prototype** built for a hackathon, currently running against **in-memory mock data**, not a live database. The Prisma schema exists but the app does not yet read/write through it — application state lives in a module-level in-memory store (`webapp/src/lib/mock-data.ts`) that resets whenever the dev server restarts. Authentication is a mock cookie-based session (no real Aadhaar/OAuth integration yet).

Everything described below reflects what is actually implemented in `webapp/src`, not just what's planned.

## Repository layout

```
UdyogSetu/
├── webapp/                        # The Next.js application (see below)
├── PROJECT_STATUS.md              # Running log of what's been built, in narrative form
├── brief.txt                      # Research brief: regulatory fields, documents, departments, MPCB risk tiers
├── features.txt                   # Full feature spec + intended system architecture
├── flow.txt                       # Backend flow → frontend page mapping, build-order plan
└── SIH26130_*.docx                # Source design docs the above .txt files were derived from
```

The `.txt` files are plain-text extracts of the accompanying `.docx` design documents and describe the **target** feature set and architecture (multi-layer services, Postgres, DigiLocker/Aadhaar integration, etc.) — most of that is not built yet. This README describes what currently runs.

## What's actually built

### Tech stack (`webapp/`)
- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS 4** with `shadcn/ui` components (Radix primitives: Select, Dialog, Sheet, Popover, etc.)
- **Prisma** with a SQLite datasource (schema modeled, not yet wired into the app logic)
- **Vercel AI SDK** (`ai`, `@ai-sdk/google`, `@ai-sdk/react`) for a Gemini-backed chat assistant
- **Recharts** for the analytics dashboard
- `sonner` for toasts, `react-markdown` for rendering AI chat responses

### Two portals, one login screen
`/login` presents an Applicant/Officer toggle. Officers additionally pick a department (MIDC, MPCB, Fire Services, DISH/Labour, Electrical Inspectorate, PESO, GSDA, Boiler Inspectorate, etc.) from a dropdown mapped to a mock employee ID. A mock session cookie (`mock_session`, set in `POST /api/auth/login`) stores role, name, and department, and `requireAuth()` (`src/lib/auth.ts`) gates every protected route.

### Applicant side (`/dashboard/*`)
- **Dashboard** (`/dashboard`) — overview of applications, in-review counts, queries, approved licenses.
- **Regulatory Knowledge Engine** (`/dashboard/new`) — a multi-step form (Udyam scale, 18 official industry sectors, all 36 Maharashtra districts, MIDC/non-MIDC toggle, employee-count band, plus advanced toggles for groundwater use, high-tension power, and hazardous substances). Rule logic (`getChecklist()` / `getRiskCategory()`) computes:
  - an **MPCB Red/Orange/Green/White pollution category** per sector,
  - a **dynamic approval checklist** (MIDC or Urban Local Body building plan, MPCB Consent to Establish, Fire NOC, Factories Act registration, GSDA groundwater NOC, Electrical Inspectorate approval, PESO/hazardous licensing, Shops & Establishment registration, Boiler Inspectorate license),
  - **location-aware rules**: coastal districts trigger CRZ clearance, tribal/forest districts trigger Scheduled Area/Forest clearance,
  - IT/ITES businesses are routed straight to the White-category "Green Channel" with no MPCB or Fire NOC requirement.
- **Unified Application Form / Document Wallet** (`/dashboard/apply`) — carries the generated checklist over from the engine (via `localStorage`) and splits document requirements into **Universal Documents** (PAN, incorporation/Udyam, GSTIN, land ownership, site plan, Aadhaar) and **Approval-Specific Documents** (one per triggered approval). Uploading a file simulates OCR extraction and auto-fills business details; a submission-readiness progress bar tracks completion. Submission posts to `/api/applicant/submit`.
- **Document Wallet (persistent)** (`/dashboard/wallet`) — a separate, longer-lived view of stored documents with expiry tracking, "expiring soon" flags, verification status, and which applications each document is linked to.
- **Applications list** (`/dashboard/applications`) — search, status/department filters, sorting, and KPI summary cards over all of the applicant's submissions.
- **Predictive Tracking** (`/dashboard/track/[id]`) — per-application timeline showing a predicted ETA, the current bottleneck department, and a risk score, with per-approval status.
- **Schemes & Incentives Matcher** (`/dashboard/schemes`, `/dashboard/schemes/[id]`) — matches the applicant's saved profile (scale, sector, district) against schemes such as the Package Scheme of Incentives and CMEGP, showing a match score, benefits, and eligibility; applying posts to `/api/applicant/submit-scheme`.
- **Grievances** (`/dashboard/grievances`) — ticketed complaints against stuck/mishandled applications with an SLA tracker (currently mock ticket data).
- **Inspections** (`/dashboard/inspections`) — view and reschedule video/on-site inspection slots (`POST /api/applicant/reschedule`).
- **Notifications** — a bell menu (`notifications-menu.tsx`) polling `/api/applicant/notifications`, populated whenever an officer rejects a document or updates an approval's status.
- **Agent Mode** — a slide-out AI chat panel (`agent-chat-panel.tsx`) backed by `POST /api/chat`, which streams responses from Gemini (`@ai-sdk/google`) grounded in a hardcoded scheme database, answering in English or Marathi, plus optional browser speech-to-text input.
- **Language toggle** — a UI affordance for English/Marathi (`language-toggle.tsx`).

### Officer side (`/officer/*`)
- **Officer login** routes through the same `/login` page with department selection.
- **Priority Queue Dashboard** (`/officer/dashboard`) — lists only applications routed to the signed-in officer's department, using the MPCB Red/Orange/Green/White tiering for prioritization (White/Green auto-approval candidates are highlighted).
- **Application Review Panel** (`/officer/review/[id]`) — shows applicant-submitted business details, AI-extracted OCR metadata, and each document with upload timestamp/size. Officers can **Approve**, **Raise Query**, or **Reject** an approval item (`POST /api/officer/review`), and can independently **verify** (`POST /api/officer/verify-document`) or **reject/unverify** (`POST /api/officer/reject-document`) individual documents — even ones already marked AI-verified — with a required rejection reason. Every decision is timestamped and stamped with the officer's department, and rejecting a document fires a real-time notification to the applicant.

### Public / shared
- **Landing page** (`/`) — static marketing/entry page explaining the platform, with separate Applicant/Officer login CTAs.
- **Public Analytics & District Leaderboard** (`/analytics`) — state-wide KPIs (total investment, average clearance time, SLA compliance) and a leaderboard ranking all 36 districts by an "Ease of Doing Business" score, with Recharts line/bar charts for monthly trends and sector growth. No login required.
- **Signup** (`/signup`) — registers a new applicant (Aadhaar-style ID, name, company name) into the mock user store.

### Data model
`webapp/prisma/schema.prisma` defines the intended relational shape — `User` (with role), `BusinessUnit`, `Application` (with `riskScore`, `predictedETA`, `bottleneckDept`), `ApprovalRequirement`, `Document` (with OCR data and expiry), `ApplicationReview`, and `Scheme`. The running app does not yet call Prisma; `src/lib/mock-data.ts` implements the equivalent shapes as an in-memory array-based store (applications, notifications, users) with helper functions (`getApplicationById`, `updateApprovalStatus`, `rejectDocument`, `addNotification`, etc.) that the API routes call directly.

## Known gaps vs. the design docs

- No real database persistence — everything resets on server restart (`global` object holds the mock arrays).
- No real authentication (no Aadhaar/OAuth), no encryption, no audit-log store separate from application data.
- No OCR, document-authenticity, duplicate-detection, or department backend integration — these are all simulated in the UI.
- No coordinated multi-department inspection scheduling, multi-unit enterprise dashboard, or officer smart-search yet.
- `features.txt` / `flow.txt` describe a multi-service architecture (API gateway, intelligence layer, integration layer, separate analytics store) that hasn't been built — the current app is a single Next.js monolith with mock data.

## Running it locally

```bash
cd webapp
npm install
npm run dev
```

Open `http://localhost:3000`. Log in as an applicant (any Aadhaar-style number) or as an officer (pick a department from the dropdown) — any password/OTP value is accepted by the mock auth.

To use the AI chat assistant (`/api/chat`), a Google Generative AI API key needs to be available to `@ai-sdk/google` (e.g. `GOOGLE_GENERATIVE_AI_API_KEY` in the environment) — without it, Agent Mode will fail to respond.
