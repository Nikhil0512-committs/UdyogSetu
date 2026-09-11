// Shared mock data store — simulates what would be in the database
// This is an in-memory store for the prototype; in production this would be Prisma/Postgres

export interface SubmittedDoc {
  id: string;
  name: string;       // e.g. "PAN card (Company/Proprietor)"
  fileName: string;   // e.g. "pan_card.pdf"
  fileBase64?: string; // base64 string
  fileSize: string;
  uploadedAt: string;  // ISO date string
  ocrExtracted: Record<string, string> | null;
  verified: boolean;
  rejected?: boolean;
  rejectReason?: string;
}

export interface ApprovalItem {
  id: number;
  dept: string;
  name: string;
  doc: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "QUERIED";
  officerComment?: string;
  reviewedAt?: string;
}

export interface SubmittedApplication {
  id: string;
  applicantName: string;
  companyName: string;
  pan: string;
  gstin: string;
  address: string;
  sector: string;
  scale: string;
  district: string;
  riskCategory: string;
  submittedAt: string;
  status: "SUBMITTED" | "IN_REVIEW" | "APPROVED" | "REJECTED" | "QUERIED";
  documents: SubmittedDoc[];
  approvals: ApprovalItem[];
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  date: string;
  read: boolean;
  type: "INFO" | "WARNING" | "ERROR" | "SUCCESS";
  link?: string;
}

// Pre-seeded applications so officers have something to review
const MOCK_APPLICATIONS: SubmittedApplication[] = [
  {
    id: "APP-2026-0042",
    applicantName: "Rahul Sharma",
    companyName: "Acme Steel Industries Pvt Ltd",
    pan: "ABCDE1234F",
    gstin: "27ABCDE1234F1Z5",
    address: "Plot 42, MIDC Hinjewadi Phase-III, Pune 411057",
    sector: "Steel",
    scale: "small",
    district: "Pune",
    riskCategory: "Red",
    submittedAt: "2026-08-27T14:30:00+05:30",
    status: "IN_REVIEW",
    documents: [
      { id: "doc-1", name: "PAN card (Company/Proprietor)", fileName: "acme_pan.pdf", fileSize: "245 KB", uploadedAt: "2026-08-27T14:25:00+05:30", ocrExtracted: { "PAN": "ABCDE1234F", "Name": "Acme Steel Industries Pvt Ltd", "DOI": "15/03/2018" }, verified: true },
      { id: "doc-2", name: "Certificate of Incorporation / Udyam", fileName: "incorporation_cert.pdf", fileSize: "1.2 MB", uploadedAt: "2026-08-27T14:26:00+05:30", ocrExtracted: { "CIN": "U27100MH2018PTC123456", "Date": "15/03/2018" }, verified: true },
      { id: "doc-3", name: "GST Registration Certificate", fileName: "gst_cert.pdf", fileSize: "180 KB", uploadedAt: "2026-08-27T14:26:30+05:30", ocrExtracted: { "GSTIN": "27ABCDE1234F1Z5", "State": "Maharashtra" }, verified: true },
      { id: "doc-4", name: "Land Ownership / Lease Allotment", fileName: "midc_allotment.pdf", fileSize: "3.4 MB", uploadedAt: "2026-08-27T14:27:00+05:30", ocrExtracted: { "Plot": "42", "Area": "MIDC Hinjewadi Phase-III", "Allotment Date": "01/06/2025" }, verified: true },
      { id: "doc-5", name: "Machinery layout & safety officer details", fileName: "machinery_layout.pdf", fileSize: "5.1 MB", uploadedAt: "2026-08-27T14:28:00+05:30", ocrExtracted: null, verified: false },
      { id: "doc-6", name: "Pollution control equipment details", fileName: "pollution_control.pdf", fileSize: "2.8 MB", uploadedAt: "2026-08-27T14:28:30+05:30", ocrExtracted: null, verified: false },
      { id: "doc-7", name: "Site plan showing fire exits & hydrant layout", fileName: "fire_safety_plan.pdf", fileSize: "4.2 MB", uploadedAt: "2026-08-27T14:29:00+05:30", ocrExtracted: null, verified: false },
      { id: "doc-8", name: "Worker safety & health policy", fileName: "worker_safety.pdf", fileSize: "890 KB", uploadedAt: "2026-08-27T14:29:30+05:30", ocrExtracted: null, verified: false },
    ],
    approvals: [
      { id: 1, dept: "MIDC", name: "Factory Building Plan Approval", doc: "Machinery layout & safety officer details", status: "PENDING" },
      { id: 2, dept: "MPCB", name: "Consent to Establish (Water & Air)", doc: "Pollution control equipment details", status: "PENDING" },
      { id: 3, dept: "Fire Services Department", name: "Provisional Fire NOC", doc: "Site plan showing fire exits & hydrant layout", status: "PENDING" },
      { id: 4, dept: "DISH / Labour Department", name: "Registration under Factories Act", doc: "Worker safety & health policy", status: "PENDING" },
    ],
  },
  {
    id: "APP-2026-0038",
    applicantName: "Priya Patil",
    companyName: "GreenLeaf Food Processing LLP",
    pan: "FGHIJ5678K",
    gstin: "27FGHIJ5678K2Z8",
    address: "Survey No. 115, Ambad MIDC, Nashik 422010",
    sector: "Food and fruit processing",
    scale: "micro",
    district: "Nashik",
    riskCategory: "Orange",
    submittedAt: "2026-08-25T10:15:00+05:30",
    status: "IN_REVIEW",
    documents: [
      { id: "doc-9", name: "PAN card (Company/Proprietor)", fileName: "greenleaf_pan.pdf", fileSize: "210 KB", uploadedAt: "2026-08-25T10:10:00+05:30", ocrExtracted: { "PAN": "FGHIJ5678K", "Name": "GreenLeaf Food Processing LLP" }, verified: true },
      { id: "doc-10", name: "Pollution control equipment details", fileName: "effluent_treatment.pdf", fileSize: "1.5 MB", uploadedAt: "2026-08-25T10:12:00+05:30", ocrExtracted: null, verified: false },
      { id: "doc-11", name: "Site plan showing fire exits & hydrant layout", fileName: "fire_plan_gl.pdf", fileSize: "2.1 MB", uploadedAt: "2026-08-25T10:13:00+05:30", ocrExtracted: null, verified: false },
    ],
    approvals: [
      { id: 1, dept: "MIDC", name: "Factory Building Plan Approval", doc: "Machinery layout & safety officer details", status: "APPROVED", officerComment: "Plan meets MIDC specifications.", reviewedAt: "2026-08-26T11:00:00+05:30" },
      { id: 2, dept: "MPCB", name: "Consent to Establish (Water & Air)", doc: "Pollution control equipment details", status: "PENDING" },
      { id: 3, dept: "Fire Services Department", name: "Provisional Fire NOC", doc: "Site plan showing fire exits & hydrant layout", status: "PENDING" },
    ],
  },
];

// In-memory store — acts as a simple "database"
export const globalAny = global as any;
if (!globalAny.mockApplications) {
  globalAny.mockApplications = [...MOCK_APPLICATIONS];
}
if (!globalAny.mockNotifications) {
  globalAny.mockNotifications = [
    { id: "notif-1", title: "Welcome to UdyogSetu", message: "Your unified dashboard is ready. Start your application.", date: new Date().toISOString(), read: false, type: "INFO" }
  ];
}
if (!globalAny.mockUsers) {
  globalAny.mockUsers = [
    { id: "123456789012", name: "Rahul Sharma", companyName: "Acme Steel Industries Pvt Ltd", role: "APPLICANT" }
  ];
}

export function getAllApplications(): SubmittedApplication[] {
  return globalAny.mockApplications;
}

export function getApplicationById(id: string): SubmittedApplication | undefined {
  return globalAny.mockApplications.find((a: any) => a.id === id);
}

export function getApplicationsForDepartment(dept: string): SubmittedApplication[] {
  return globalAny.mockApplications.filter((app: any) =>
    app.approvals.some((a: any) => a.dept === dept)
  );
}

export function addApplication(app: SubmittedApplication): void {
  globalAny.mockApplications.push(app);
}

export function updateApprovalStatus(
  appId: string,
  approvalId: number,
  status: "APPROVED" | "REJECTED" | "QUERIED",
  comment: string
): void {
  const app = globalAny.mockApplications.find((a: any) => a.id === appId);
  if (!app) return;
  const approval = app.approvals.find((a: any) => a.id === approvalId);
  if (!approval) return;
  approval.status = status;
  approval.officerComment = comment;
  approval.reviewedAt = new Date().toISOString();

  // Send notification to applicant
  addNotification({
    title: `Approval Update: ${approval.name}`,
    message: `The ${approval.dept} has marked your approval as ${status}. ${comment ? 'Reason: ' + comment : ''}`,
    type: status === "APPROVED" ? "SUCCESS" : status === "REJECTED" ? "ERROR" : "WARNING",
    link: `/dashboard/track/${appId}`
  });

  // Update overall app status
  const allApproved = app.approvals.every((a: any) => a.status === "APPROVED");
  const anyRejected = app.approvals.some((a: any) => a.status === "REJECTED");
  const anyQueried = app.approvals.some((a: any) => a.status === "QUERIED");
  if (allApproved) app.status = "APPROVED";
  else if (anyRejected) app.status = "REJECTED";
  else if (anyQueried) app.status = "QUERIED";
  else app.status = "IN_REVIEW";
}

export function rejectDocument(appId: string, docId: string, reason: string, officerDept: string): void {
  const app = globalAny.mockApplications.find((a: any) => a.id === appId);
  if (!app) return;
  const doc = app.documents.find((d: any) => d.id === docId);
  if (!doc) return;
  
  doc.verified = false;
  doc.rejected = true;
  doc.rejectReason = reason;

  // Send notification to applicant
  addNotification({
    title: `Document Rejected by ${officerDept}`,
    message: `Your document "${doc.name}" was rejected. Reason: ${reason}. Please re-upload it.`,
    type: "ERROR",
    link: `/dashboard/apply?id=${appId}` // link to re-upload page
  });
}

export function acceptDocument(appId: string, docId: string): void {
  const app = globalAny.mockApplications.find((a: any) => a.id === appId);
  if (!app) return;
  const doc = app.documents.find((d: any) => d.id === docId);
  if (!doc) return;
  
  doc.verified = true;
  doc.rejected = false;
  doc.rejectReason = undefined;
}

export function getNotifications(): AppNotification[] {
  return globalAny.mockNotifications.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function addNotification(notif: Omit<AppNotification, "id" | "date" | "read">) {
  globalAny.mockNotifications.push({
    ...notif,
    id: `notif-${Date.now()}`,
    date: new Date().toISOString(),
    read: false
  });
}

export function markNotificationRead(id: string) {
  const n = globalAny.mockNotifications.find((x: any) => x.id === id);
  if (n) n.read = true;
}

export function getUserById(id: string) {
  // Strip spaces from id (e.g. "1234 5678 9012" -> "123456789012")
  const cleanId = id.replace(/\s+/g, '');
  return globalAny.mockUsers.find((u: any) => u.id === cleanId);
}

export function addUser(user: { id: string, name: string, companyName: string, role: string }) {
  const cleanId = user.id.replace(/\s+/g, '');
  globalAny.mockUsers.push({ ...user, id: cleanId });
}

if (!globalAny.mockMeetingSchedule) {
  globalAny.mockMeetingSchedule = {
    date: "2026-09-20",
    time: "15:00",
    formatted: "20 Sep 2026, 03:00 PM"
  };
}

export function getMeetingSchedule() {
  return globalAny.mockMeetingSchedule;
}

export function updateMeetingSchedule(date: string, time: string) {
  const formatted = new Date(`${date}T${time}`).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  globalAny.mockMeetingSchedule = { date, time, formatted };
  return globalAny.mockMeetingSchedule;
}
