// ─── Admin-Specific Mock Data ────────────────────────────────────────────────
// Entirely separate from mock-data.ts so existing Applicant/Officer flows
// are never affected. This is used exclusively by the /admin/* pages.

export interface DepartmentStats {
  name: string;
  code: string;
  totalApplications: number;
  pending: number;
  approved: number;
  rejected: number;
  queried: number;
  avgProcessingDays: number;
  slaDays: number;
  slaCompliancePercent: number;
  activeOfficers: number;
  bottleneckCount: number; // how many apps are past SLA
}

export interface AdminApplication {
  id: string;
  applicantName: string;
  companyName: string;
  sector: string;
  district: string;
  scale: string;
  riskCategory: "Red" | "Orange" | "Green" | "White";
  submittedAt: string;
  status: "SUBMITTED" | "IN_REVIEW" | "APPROVED" | "REJECTED" | "QUERIED";
  currentDepartment: string;
  assignedOfficer: string;
  daysInQueue: number;
  slaDays: number;
  isDelayed: boolean;
  delayReason?: string;
  approvals: AdminApprovalItem[];
}

export interface AdminApprovalItem {
  department: string;
  approvalName: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "QUERIED";
  assignedOfficer: string;
  receivedAt: string;
  reviewedAt?: string;
  daysElapsed: number;
  slaDays: number;
  isOverdue: boolean;
}

export interface OfficerActivity {
  id: string;
  name: string;
  department: string;
  totalReviews: number;
  approved: number;
  rejected: number;
  queried: number;
  avgReviewTimeDays: number;
  lastActiveAt: string;
  currentWorkload: number; // pending items
  performanceScore: number; // 0-100
  recentActions: OfficerAction[];
}

export interface OfficerAction {
  applicationId: string;
  companyName: string;
  approvalName: string;
  decision: "APPROVED" | "REJECTED" | "QUERIED";
  timestamp: string;
  timeTakenDays: number;
}

export interface DelayedApplication {
  id: string;
  companyName: string;
  applicantName: string;
  sector: string;
  district: string;
  riskCategory: string;
  bottleneckDepartment: string;
  assignedOfficer: string;
  daysOverdue: number;
  slaDays: number;
  totalDaysInSystem: number;
  severity: "CRITICAL" | "HIGH" | "MEDIUM";
  lastAction: string;
  lastActionDate: string;
}

export interface AdminKPIs {
  totalApplications: number;
  totalInReview: number;
  totalApproved: number;
  totalDelayed: number;
  avgClearanceTimeDays: number;
  slaCompliancePercent: number;
  totalOfficers: number;
  totalDepartments: number;
  applicationsThisMonth: number;
  applicationsLastMonth: number;
}

export interface RecentActivityItem {
  id: string;
  type: "APPROVAL" | "REJECTION" | "QUERY" | "SUBMISSION" | "DELAY_ALERT";
  title: string;
  description: string;
  department: string;
  timestamp: string;
  applicationId: string;
}

// ─── Static Data ────────────────────────────────────────────────────────────

export const ADMIN_KPIS: AdminKPIs = {
  totalApplications: 1847,
  totalInReview: 342,
  totalApproved: 1289,
  totalDelayed: 68,
  avgClearanceTimeDays: 14,
  slaCompliancePercent: 92.4,
  totalOfficers: 47,
  totalDepartments: 11,
  applicationsThisMonth: 186,
  applicationsLastMonth: 154,
};

export const DEPARTMENT_STATS: DepartmentStats[] = [
  {
    name: "Maharashtra Industrial Development Corporation",
    code: "MIDC",
    totalApplications: 412,
    pending: 58,
    approved: 320,
    rejected: 12,
    queried: 22,
    avgProcessingDays: 8,
    slaDays: 15,
    slaCompliancePercent: 96.2,
    activeOfficers: 8,
    bottleneckCount: 4,
  },
  {
    name: "Maharashtra Pollution Control Board",
    code: "MPCB",
    totalApplications: 389,
    pending: 72,
    approved: 278,
    rejected: 18,
    queried: 21,
    avgProcessingDays: 18,
    slaDays: 21,
    slaCompliancePercent: 84.6,
    activeOfficers: 6,
    bottleneckCount: 14,
  },
  {
    name: "Fire Services Department",
    code: "Fire Services",
    totalApplications: 298,
    pending: 41,
    approved: 235,
    rejected: 8,
    queried: 14,
    avgProcessingDays: 11,
    slaDays: 14,
    slaCompliancePercent: 91.3,
    activeOfficers: 5,
    bottleneckCount: 6,
  },
  {
    name: "DISH / Labour Department",
    code: "DISH / Labour",
    totalApplications: 267,
    pending: 38,
    approved: 208,
    rejected: 6,
    queried: 15,
    avgProcessingDays: 9,
    slaDays: 14,
    slaCompliancePercent: 94.7,
    activeOfficers: 4,
    bottleneckCount: 3,
  },
  {
    name: "Electrical Inspectorate",
    code: "Electrical",
    totalApplications: 142,
    pending: 22,
    approved: 110,
    rejected: 3,
    queried: 7,
    avgProcessingDays: 7,
    slaDays: 10,
    slaCompliancePercent: 97.1,
    activeOfficers: 3,
    bottleneckCount: 1,
  },
  {
    name: "PESO (Explosives Safety)",
    code: "PESO",
    totalApplications: 56,
    pending: 12,
    approved: 38,
    rejected: 2,
    queried: 4,
    avgProcessingDays: 22,
    slaDays: 21,
    slaCompliancePercent: 78.4,
    activeOfficers: 2,
    bottleneckCount: 8,
  },
  {
    name: "Groundwater Survey & Dev. Agency",
    code: "GSDA",
    totalApplications: 89,
    pending: 18,
    approved: 64,
    rejected: 2,
    queried: 5,
    avgProcessingDays: 13,
    slaDays: 14,
    slaCompliancePercent: 89.9,
    activeOfficers: 2,
    bottleneckCount: 4,
  },
  {
    name: "Labour Department (Shops & Est.)",
    code: "Labour",
    totalApplications: 320,
    pending: 28,
    approved: 275,
    rejected: 5,
    queried: 12,
    avgProcessingDays: 5,
    slaDays: 7,
    slaCompliancePercent: 98.1,
    activeOfficers: 4,
    bottleneckCount: 1,
  },
  {
    name: "Boiler Inspectorate",
    code: "Boiler",
    totalApplications: 74,
    pending: 14,
    approved: 52,
    rejected: 3,
    queried: 5,
    avgProcessingDays: 16,
    slaDays: 14,
    slaCompliancePercent: 81.2,
    activeOfficers: 2,
    bottleneckCount: 5,
  },
  {
    name: "Directorate of Industries",
    code: "DOI",
    totalApplications: 198,
    pending: 25,
    approved: 158,
    rejected: 4,
    queried: 11,
    avgProcessingDays: 10,
    slaDays: 14,
    slaCompliancePercent: 93.5,
    activeOfficers: 5,
    bottleneckCount: 3,
  },
  {
    name: "MSME Department",
    code: "MSME",
    totalApplications: 156,
    pending: 14,
    approved: 132,
    rejected: 2,
    queried: 8,
    avgProcessingDays: 6,
    slaDays: 10,
    slaCompliancePercent: 97.8,
    activeOfficers: 3,
    bottleneckCount: 1,
  },
];

export const ADMIN_APPLICATIONS: AdminApplication[] = [
  {
    id: "APP-2026-0042",
    applicantName: "Rahul Sharma",
    companyName: "Acme Steel Industries Pvt Ltd",
    sector: "Steel",
    district: "Pune",
    scale: "Small",
    riskCategory: "Green",
    submittedAt: "2026-08-27T14:30:00+05:30",
    status: "IN_REVIEW",
    currentDepartment: "MPCB",
    assignedOfficer: "Dr. Meena Kulkarni",
    daysInQueue: 30,
    slaDays: 21,
    isDelayed: true,
    delayReason: "Pending pollution control equipment verification from MPCB",
    approvals: [
      { department: "MIDC", approvalName: "Factory Building Plan Approval", status: "APPROVED", assignedOfficer: "Shri Amit Deshmukh", receivedAt: "2026-08-28T09:00:00+05:30", reviewedAt: "2026-09-02T11:30:00+05:30", daysElapsed: 5, slaDays: 15, isOverdue: false },
      { department: "MPCB", approvalName: "Consent to Establish (Water & Air)", status: "PENDING", assignedOfficer: "Dr. Meena Kulkarni", receivedAt: "2026-08-28T09:00:00+05:30", daysElapsed: 30, slaDays: 21, isOverdue: true },
      { department: "Fire Services Department", approvalName: "Provisional Fire NOC", status: "PENDING", assignedOfficer: "Shri Rajesh Patil", receivedAt: "2026-08-28T09:00:00+05:30", daysElapsed: 30, slaDays: 14, isOverdue: true },
      { department: "DISH / Labour Department", approvalName: "Registration under Factories Act", status: "PENDING", assignedOfficer: "Smt. Sunita Jadhav", receivedAt: "2026-08-28T09:00:00+05:30", daysElapsed: 30, slaDays: 14, isOverdue: true },
    ],
  },
  {
    id: "APP-2026-0038",
    applicantName: "Priya Patil",
    companyName: "GreenLeaf Food Processing LLP",
    sector: "Food Processing",
    district: "Nashik",
    scale: "Micro",
    riskCategory: "Orange",
    submittedAt: "2026-08-25T10:15:00+05:30",
    status: "IN_REVIEW",
    currentDepartment: "Fire Services Department",
    assignedOfficer: "Shri Rajesh Patil",
    daysInQueue: 32,
    slaDays: 14,
    isDelayed: true,
    delayReason: "Fire safety inspection pending — officer on leave",
    approvals: [
      { department: "MIDC", approvalName: "Factory Building Plan Approval", status: "APPROVED", assignedOfficer: "Shri Amit Deshmukh", receivedAt: "2026-08-26T09:00:00+05:30", reviewedAt: "2026-08-28T14:00:00+05:30", daysElapsed: 2, slaDays: 15, isOverdue: false },
      { department: "MPCB", approvalName: "Consent to Establish (Water & Air)", status: "QUERIED", assignedOfficer: "Dr. Meena Kulkarni", receivedAt: "2026-08-26T09:00:00+05:30", reviewedAt: "2026-09-05T10:00:00+05:30", daysElapsed: 10, slaDays: 21, isOverdue: false },
      { department: "Fire Services Department", approvalName: "Provisional Fire NOC", status: "PENDING", assignedOfficer: "Shri Rajesh Patil", receivedAt: "2026-08-26T09:00:00+05:30", daysElapsed: 32, slaDays: 14, isOverdue: true },
    ],
  },
  {
    id: "APP-2026-0051",
    applicantName: "Vikram Mehta",
    companyName: "Mehta Pharma Solutions",
    sector: "Pharma",
    district: "Thane",
    scale: "Medium",
    riskCategory: "Red",
    submittedAt: "2026-09-01T08:45:00+05:30",
    status: "IN_REVIEW",
    currentDepartment: "MPCB",
    assignedOfficer: "Dr. Meena Kulkarni",
    daysInQueue: 25,
    slaDays: 21,
    isDelayed: true,
    delayReason: "Hazardous substance handling clearance requires additional documentation",
    approvals: [
      { department: "MIDC", approvalName: "Factory Building Plan Approval", status: "APPROVED", assignedOfficer: "Shri Sandeep Joshi", receivedAt: "2026-09-02T09:00:00+05:30", reviewedAt: "2026-09-06T16:00:00+05:30", daysElapsed: 4, slaDays: 15, isOverdue: false },
      { department: "MPCB", approvalName: "Consent to Establish (Water & Air)", status: "PENDING", assignedOfficer: "Dr. Meena Kulkarni", receivedAt: "2026-09-02T09:00:00+05:30", daysElapsed: 24, slaDays: 21, isOverdue: true },
      { department: "PESO / DISH", approvalName: "Hazardous Substance Storage License", status: "PENDING", assignedOfficer: "Shri Arun Gaikwad", receivedAt: "2026-09-02T09:00:00+05:30", daysElapsed: 24, slaDays: 21, isOverdue: true },
      { department: "Fire Services Department", approvalName: "Provisional Fire NOC", status: "APPROVED", assignedOfficer: "Shri Rajesh Patil", receivedAt: "2026-09-02T09:00:00+05:30", reviewedAt: "2026-09-10T10:00:00+05:30", daysElapsed: 8, slaDays: 14, isOverdue: false },
      { department: "Boiler Inspectorate", approvalName: "Boiler Registration Certificate", status: "PENDING", assignedOfficer: "Shri Kiran Bhosle", receivedAt: "2026-09-02T09:00:00+05:30", daysElapsed: 24, slaDays: 14, isOverdue: true },
    ],
  },
  {
    id: "APP-2026-0055",
    applicantName: "Ananya Desai",
    companyName: "TechNova IT Services Pvt Ltd",
    sector: "IT & ITES",
    district: "Pune",
    scale: "Small",
    riskCategory: "White",
    submittedAt: "2026-09-10T11:20:00+05:30",
    status: "APPROVED",
    currentDepartment: "—",
    assignedOfficer: "Auto-Approved (Green Channel)",
    daysInQueue: 2,
    slaDays: 7,
    isDelayed: false,
    approvals: [
      { department: "Labour Department", approvalName: "Shops & Establishment Registration", status: "APPROVED", assignedOfficer: "Auto-Approved", receivedAt: "2026-09-10T11:20:00+05:30", reviewedAt: "2026-09-12T09:00:00+05:30", daysElapsed: 2, slaDays: 7, isOverdue: false },
    ],
  },
  {
    id: "APP-2026-0060",
    applicantName: "Suresh Wagh",
    companyName: "Wagh Textiles & Dyeing Works",
    sector: "Textiles",
    district: "Solapur",
    scale: "Small",
    riskCategory: "Orange",
    submittedAt: "2026-09-05T09:30:00+05:30",
    status: "IN_REVIEW",
    currentDepartment: "MPCB",
    assignedOfficer: "Dr. Prashant Deshpande",
    daysInQueue: 21,
    slaDays: 21,
    isDelayed: false,
    approvals: [
      { department: "MIDC", approvalName: "Factory Building Plan Approval", status: "APPROVED", assignedOfficer: "Shri Amit Deshmukh", receivedAt: "2026-09-05T09:30:00+05:30", reviewedAt: "2026-09-10T14:00:00+05:30", daysElapsed: 5, slaDays: 15, isOverdue: false },
      { department: "MPCB", approvalName: "Consent to Establish (Water & Air)", status: "PENDING", assignedOfficer: "Dr. Prashant Deshpande", receivedAt: "2026-09-05T09:30:00+05:30", daysElapsed: 21, slaDays: 21, isOverdue: false },
      { department: "Boiler Inspectorate", approvalName: "Boiler Registration Certificate", status: "PENDING", assignedOfficer: "Shri Kiran Bhosle", receivedAt: "2026-09-05T09:30:00+05:30", daysElapsed: 21, slaDays: 14, isOverdue: true },
    ],
  },
  {
    id: "APP-2026-0063",
    applicantName: "Neha Joshi",
    companyName: "Joshi Auto Components Pvt Ltd",
    sector: "Automobile",
    district: "Chhatrapati Sambhajinagar",
    scale: "Medium",
    riskCategory: "Green",
    submittedAt: "2026-09-12T14:00:00+05:30",
    status: "IN_REVIEW",
    currentDepartment: "MIDC",
    assignedOfficer: "Shri Sandeep Joshi",
    daysInQueue: 14,
    slaDays: 15,
    isDelayed: false,
    approvals: [
      { department: "MIDC", approvalName: "Factory Building Plan Approval", status: "PENDING", assignedOfficer: "Shri Sandeep Joshi", receivedAt: "2026-09-12T14:00:00+05:30", daysElapsed: 14, slaDays: 15, isOverdue: false },
      { department: "MPCB", approvalName: "Consent to Establish (Air)", status: "PENDING", assignedOfficer: "Dr. Meena Kulkarni", receivedAt: "2026-09-12T14:00:00+05:30", daysElapsed: 14, slaDays: 21, isOverdue: false },
      { department: "Electrical Inspectorate", approvalName: "HT Power Connection Approval", status: "PENDING", assignedOfficer: "Shri Vijay Thombare", receivedAt: "2026-09-12T14:00:00+05:30", daysElapsed: 14, slaDays: 10, isOverdue: true },
    ],
  },
  {
    id: "APP-2026-0070",
    applicantName: "Manoj Kulkarni",
    companyName: "Kulkarni Sugar Industries",
    sector: "Sugar",
    district: "Kolhapur",
    scale: "Large",
    riskCategory: "Red",
    submittedAt: "2026-09-15T10:00:00+05:30",
    status: "IN_REVIEW",
    currentDepartment: "MPCB",
    assignedOfficer: "Dr. Prashant Deshpande",
    daysInQueue: 11,
    slaDays: 21,
    isDelayed: false,
    approvals: [
      { department: "MIDC", approvalName: "Factory Building Plan Approval", status: "PENDING", assignedOfficer: "Shri Amit Deshmukh", receivedAt: "2026-09-15T10:00:00+05:30", daysElapsed: 11, slaDays: 15, isOverdue: false },
      { department: "MPCB", approvalName: "Consent to Establish (Water & Air)", status: "PENDING", assignedOfficer: "Dr. Prashant Deshpande", receivedAt: "2026-09-15T10:00:00+05:30", daysElapsed: 11, slaDays: 21, isOverdue: false },
      { department: "Boiler Inspectorate", approvalName: "Boiler Registration Certificate", status: "PENDING", assignedOfficer: "Shri Kiran Bhosle", receivedAt: "2026-09-15T10:00:00+05:30", daysElapsed: 11, slaDays: 14, isOverdue: false },
      { department: "GSDA", approvalName: "Groundwater Extraction NOC", status: "PENDING", assignedOfficer: "Smt. Anjali More", receivedAt: "2026-09-15T10:00:00+05:30", daysElapsed: 11, slaDays: 14, isOverdue: false },
    ],
  },
  {
    id: "APP-2026-0075",
    applicantName: "Deepak Chavan",
    companyName: "Chavan Chemicals Pvt Ltd",
    sector: "Chemicals",
    district: "Raigad",
    scale: "Medium",
    riskCategory: "Red",
    submittedAt: "2026-09-08T13:15:00+05:30",
    status: "QUERIED",
    currentDepartment: "PESO / DISH",
    assignedOfficer: "Shri Arun Gaikwad",
    daysInQueue: 18,
    slaDays: 21,
    isDelayed: false,
    approvals: [
      { department: "MIDC", approvalName: "Factory Building Plan Approval", status: "APPROVED", assignedOfficer: "Shri Sandeep Joshi", receivedAt: "2026-09-08T13:15:00+05:30", reviewedAt: "2026-09-12T09:00:00+05:30", daysElapsed: 4, slaDays: 15, isOverdue: false },
      { department: "MPCB", approvalName: "Consent to Establish (Water & Air)", status: "QUERIED", assignedOfficer: "Dr. Meena Kulkarni", receivedAt: "2026-09-08T13:15:00+05:30", reviewedAt: "2026-09-18T11:30:00+05:30", daysElapsed: 10, slaDays: 21, isOverdue: false },
      { department: "PESO / DISH", approvalName: "Hazardous Substance Storage License", status: "QUERIED", assignedOfficer: "Shri Arun Gaikwad", receivedAt: "2026-09-08T13:15:00+05:30", reviewedAt: "2026-09-20T15:00:00+05:30", daysElapsed: 12, slaDays: 21, isOverdue: false },
      { department: "Fire Services Department", approvalName: "Provisional Fire NOC", status: "PENDING", assignedOfficer: "Shri Rajesh Patil", receivedAt: "2026-09-08T13:15:00+05:30", daysElapsed: 18, slaDays: 14, isOverdue: true },
    ],
  },
  {
    id: "APP-2026-0080",
    applicantName: "Sanjay Mane",
    companyName: "Mane Paper Mills",
    sector: "Paper & Pulp",
    district: "Chandrapur",
    scale: "Medium",
    riskCategory: "Orange",
    submittedAt: "2026-09-18T08:00:00+05:30",
    status: "SUBMITTED",
    currentDepartment: "MIDC",
    assignedOfficer: "Shri Amit Deshmukh",
    daysInQueue: 8,
    slaDays: 15,
    isDelayed: false,
    approvals: [
      { department: "MIDC", approvalName: "Factory Building Plan Approval", status: "PENDING", assignedOfficer: "Shri Amit Deshmukh", receivedAt: "2026-09-18T08:00:00+05:30", daysElapsed: 8, slaDays: 15, isOverdue: false },
      { department: "MPCB", approvalName: "Consent to Establish (Water & Air)", status: "PENDING", assignedOfficer: "Dr. Prashant Deshpande", receivedAt: "2026-09-18T08:00:00+05:30", daysElapsed: 8, slaDays: 21, isOverdue: false },
    ],
  },
  {
    id: "APP-2026-0082",
    applicantName: "Kavita Rao",
    companyName: "Rao Electronics Assembly",
    sector: "Electronics",
    district: "Nagpur",
    scale: "Micro",
    riskCategory: "Green",
    submittedAt: "2026-09-20T16:45:00+05:30",
    status: "IN_REVIEW",
    currentDepartment: "Electrical Inspectorate",
    assignedOfficer: "Shri Vijay Thombare",
    daysInQueue: 6,
    slaDays: 10,
    isDelayed: false,
    approvals: [
      { department: "MIDC", approvalName: "Factory Building Plan Approval", status: "APPROVED", assignedOfficer: "Shri Amit Deshmukh", receivedAt: "2026-09-20T16:45:00+05:30", reviewedAt: "2026-09-22T10:00:00+05:30", daysElapsed: 2, slaDays: 15, isOverdue: false },
      { department: "Electrical Inspectorate", approvalName: "HT Power Connection Approval", status: "PENDING", assignedOfficer: "Shri Vijay Thombare", receivedAt: "2026-09-20T16:45:00+05:30", daysElapsed: 6, slaDays: 10, isOverdue: false },
    ],
  },
];

export const OFFICER_ACTIVITIES: OfficerActivity[] = [
  {
    id: "off-midc-deshmukh",
    name: "Shri Amit Deshmukh",
    department: "MIDC",
    totalReviews: 145,
    approved: 122,
    rejected: 8,
    queried: 15,
    avgReviewTimeDays: 4.2,
    lastActiveAt: "2026-09-26T10:30:00+05:30",
    currentWorkload: 12,
    performanceScore: 94,
    recentActions: [
      { applicationId: "APP-2026-0082", companyName: "Rao Electronics Assembly", approvalName: "Factory Building Plan Approval", decision: "APPROVED", timestamp: "2026-09-22T10:00:00+05:30", timeTakenDays: 2 },
      { applicationId: "APP-2026-0060", companyName: "Wagh Textiles & Dyeing Works", approvalName: "Factory Building Plan Approval", decision: "APPROVED", timestamp: "2026-09-10T14:00:00+05:30", timeTakenDays: 5 },
      { applicationId: "APP-2026-0051", companyName: "Mehta Pharma Solutions", approvalName: "Factory Building Plan Approval", decision: "APPROVED", timestamp: "2026-09-06T16:00:00+05:30", timeTakenDays: 4 },
    ],
  },
  {
    id: "off-midc-joshi",
    name: "Shri Sandeep Joshi",
    department: "MIDC",
    totalReviews: 98,
    approved: 82,
    rejected: 5,
    queried: 11,
    avgReviewTimeDays: 5.1,
    lastActiveAt: "2026-09-26T09:15:00+05:30",
    currentWorkload: 8,
    performanceScore: 88,
    recentActions: [
      { applicationId: "APP-2026-0075", companyName: "Chavan Chemicals Pvt Ltd", approvalName: "Factory Building Plan Approval", decision: "APPROVED", timestamp: "2026-09-12T09:00:00+05:30", timeTakenDays: 4 },
      { applicationId: "APP-2026-0063", companyName: "Joshi Auto Components Pvt Ltd", approvalName: "Factory Building Plan Approval", decision: "APPROVED", timestamp: "2026-09-14T11:00:00+05:30", timeTakenDays: 2 },
    ],
  },
  {
    id: "off-mpcb-kulkarni",
    name: "Dr. Meena Kulkarni",
    department: "MPCB",
    totalReviews: 112,
    approved: 78,
    rejected: 14,
    queried: 20,
    avgReviewTimeDays: 12.8,
    lastActiveAt: "2026-09-25T16:45:00+05:30",
    currentWorkload: 18,
    performanceScore: 72,
    recentActions: [
      { applicationId: "APP-2026-0075", companyName: "Chavan Chemicals Pvt Ltd", approvalName: "Consent to Establish", decision: "QUERIED", timestamp: "2026-09-18T11:30:00+05:30", timeTakenDays: 10 },
      { applicationId: "APP-2026-0038", companyName: "GreenLeaf Food Processing LLP", approvalName: "Consent to Establish", decision: "QUERIED", timestamp: "2026-09-05T10:00:00+05:30", timeTakenDays: 10 },
    ],
  },
  {
    id: "off-mpcb-deshpande",
    name: "Dr. Prashant Deshpande",
    department: "MPCB",
    totalReviews: 86,
    approved: 64,
    rejected: 8,
    queried: 14,
    avgReviewTimeDays: 14.5,
    lastActiveAt: "2026-09-26T11:00:00+05:30",
    currentWorkload: 15,
    performanceScore: 68,
    recentActions: [
      { applicationId: "APP-2026-0060", companyName: "Wagh Textiles & Dyeing Works", approvalName: "Consent to Establish", decision: "QUERIED", timestamp: "2026-09-20T09:00:00+05:30", timeTakenDays: 15 },
    ],
  },
  {
    id: "off-fire-patil",
    name: "Shri Rajesh Patil",
    department: "Fire Services Department",
    totalReviews: 104,
    approved: 89,
    rejected: 5,
    queried: 10,
    avgReviewTimeDays: 8.3,
    lastActiveAt: "2026-09-24T14:00:00+05:30",
    currentWorkload: 9,
    performanceScore: 82,
    recentActions: [
      { applicationId: "APP-2026-0051", companyName: "Mehta Pharma Solutions", approvalName: "Provisional Fire NOC", decision: "APPROVED", timestamp: "2026-09-10T10:00:00+05:30", timeTakenDays: 8 },
    ],
  },
  {
    id: "off-dish-jadhav",
    name: "Smt. Sunita Jadhav",
    department: "DISH / Labour Department",
    totalReviews: 92,
    approved: 80,
    rejected: 3,
    queried: 9,
    avgReviewTimeDays: 6.7,
    lastActiveAt: "2026-09-26T12:30:00+05:30",
    currentWorkload: 7,
    performanceScore: 91,
    recentActions: [
      { applicationId: "APP-2026-0055", companyName: "TechNova IT Services Pvt Ltd", approvalName: "Shops & Establishment Registration", decision: "APPROVED", timestamp: "2026-09-12T09:00:00+05:30", timeTakenDays: 2 },
    ],
  },
  {
    id: "off-peso-gaikwad",
    name: "Shri Arun Gaikwad",
    department: "PESO / DISH",
    totalReviews: 38,
    approved: 26,
    rejected: 4,
    queried: 8,
    avgReviewTimeDays: 15.2,
    lastActiveAt: "2026-09-25T09:30:00+05:30",
    currentWorkload: 6,
    performanceScore: 65,
    recentActions: [
      { applicationId: "APP-2026-0075", companyName: "Chavan Chemicals Pvt Ltd", approvalName: "Hazardous Substance Storage License", decision: "QUERIED", timestamp: "2026-09-20T15:00:00+05:30", timeTakenDays: 12 },
    ],
  },
  {
    id: "off-elec-thombare",
    name: "Shri Vijay Thombare",
    department: "Electrical Inspectorate",
    totalReviews: 62,
    approved: 54,
    rejected: 2,
    queried: 6,
    avgReviewTimeDays: 5.8,
    lastActiveAt: "2026-09-26T08:45:00+05:30",
    currentWorkload: 5,
    performanceScore: 93,
    recentActions: [
      { applicationId: "APP-2026-0082", companyName: "Rao Electronics Assembly", approvalName: "HT Power Connection Approval", decision: "APPROVED", timestamp: "2026-09-24T14:00:00+05:30", timeTakenDays: 4 },
    ],
  },
  {
    id: "off-boiler-bhosle",
    name: "Shri Kiran Bhosle",
    department: "Boiler Inspectorate",
    totalReviews: 42,
    approved: 30,
    rejected: 5,
    queried: 7,
    avgReviewTimeDays: 11.4,
    lastActiveAt: "2026-09-25T15:00:00+05:30",
    currentWorkload: 8,
    performanceScore: 71,
    recentActions: [],
  },
  {
    id: "off-gsda-more",
    name: "Smt. Anjali More",
    department: "GSDA",
    totalReviews: 34,
    approved: 28,
    rejected: 2,
    queried: 4,
    avgReviewTimeDays: 9.6,
    lastActiveAt: "2026-09-26T10:00:00+05:30",
    currentWorkload: 4,
    performanceScore: 86,
    recentActions: [],
  },
];

export const DELAYED_APPLICATIONS: DelayedApplication[] = [
  {
    id: "APP-2026-0038",
    companyName: "GreenLeaf Food Processing LLP",
    applicantName: "Priya Patil",
    sector: "Food Processing",
    district: "Nashik",
    riskCategory: "Orange",
    bottleneckDepartment: "Fire Services Department",
    assignedOfficer: "Shri Rajesh Patil",
    daysOverdue: 18,
    slaDays: 14,
    totalDaysInSystem: 32,
    severity: "CRITICAL",
    lastAction: "MIDC Approved; MPCB Queried; Fire NOC still pending",
    lastActionDate: "2026-09-05T10:00:00+05:30",
  },
  {
    id: "APP-2026-0042",
    companyName: "Acme Steel Industries Pvt Ltd",
    applicantName: "Rahul Sharma",
    sector: "Steel",
    district: "Pune",
    riskCategory: "Green",
    bottleneckDepartment: "MPCB",
    assignedOfficer: "Dr. Meena Kulkarni",
    daysOverdue: 9,
    slaDays: 21,
    totalDaysInSystem: 30,
    severity: "HIGH",
    lastAction: "MIDC Approved; awaiting MPCB consent",
    lastActionDate: "2026-09-02T11:30:00+05:30",
  },
  {
    id: "APP-2026-0051",
    companyName: "Mehta Pharma Solutions",
    applicantName: "Vikram Mehta",
    sector: "Pharma",
    district: "Thane",
    riskCategory: "Red",
    bottleneckDepartment: "MPCB",
    assignedOfficer: "Dr. Meena Kulkarni",
    daysOverdue: 3,
    slaDays: 21,
    totalDaysInSystem: 25,
    severity: "HIGH",
    lastAction: "MIDC & Fire approved; MPCB and PESO pending",
    lastActionDate: "2026-09-10T10:00:00+05:30",
  },
  {
    id: "APP-2026-0060",
    companyName: "Wagh Textiles & Dyeing Works",
    applicantName: "Suresh Wagh",
    sector: "Textiles",
    district: "Solapur",
    riskCategory: "Orange",
    bottleneckDepartment: "Boiler Inspectorate",
    assignedOfficer: "Shri Kiran Bhosle",
    daysOverdue: 7,
    slaDays: 14,
    totalDaysInSystem: 21,
    severity: "MEDIUM",
    lastAction: "MIDC Approved; MPCB & Boiler pending",
    lastActionDate: "2026-09-10T14:00:00+05:30",
  },
  {
    id: "APP-2026-0063",
    companyName: "Joshi Auto Components Pvt Ltd",
    applicantName: "Neha Joshi",
    sector: "Automobile",
    district: "Chhatrapati Sambhajinagar",
    riskCategory: "Green",
    bottleneckDepartment: "Electrical Inspectorate",
    assignedOfficer: "Shri Vijay Thombare",
    daysOverdue: 4,
    slaDays: 10,
    totalDaysInSystem: 14,
    severity: "MEDIUM",
    lastAction: "Electrical approval overdue by 4 days",
    lastActionDate: "2026-09-12T14:00:00+05:30",
  },
  {
    id: "APP-2026-0075",
    companyName: "Chavan Chemicals Pvt Ltd",
    applicantName: "Deepak Chavan",
    sector: "Chemicals",
    district: "Raigad",
    riskCategory: "Red",
    bottleneckDepartment: "Fire Services Department",
    assignedOfficer: "Shri Rajesh Patil",
    daysOverdue: 4,
    slaDays: 14,
    totalDaysInSystem: 18,
    severity: "MEDIUM",
    lastAction: "MIDC Approved; MPCB & PESO Queried; Fire NOC overdue",
    lastActionDate: "2026-09-20T15:00:00+05:30",
  },
];

export const RECENT_ACTIVITY: RecentActivityItem[] = [
  {
    id: "act-1",
    type: "APPROVAL",
    title: "Factory Plan Approved",
    description: "Shri Amit Deshmukh (MIDC) approved building plan for Rao Electronics Assembly",
    department: "MIDC",
    timestamp: "2026-09-22T10:00:00+05:30",
    applicationId: "APP-2026-0082",
  },
  {
    id: "act-2",
    type: "QUERY",
    title: "Query Raised on Chemicals Application",
    description: "Shri Arun Gaikwad (PESO) requested additional hazardous substance documentation from Chavan Chemicals",
    department: "PESO / DISH",
    timestamp: "2026-09-20T15:00:00+05:30",
    applicationId: "APP-2026-0075",
  },
  {
    id: "act-3",
    type: "DELAY_ALERT",
    title: "SLA Breach — Fire NOC",
    description: "GreenLeaf Food Processing LLP has been waiting 32 days for Fire NOC (SLA: 14 days). Officer Rajesh Patil reported on leave.",
    department: "Fire Services Department",
    timestamp: "2026-09-26T08:00:00+05:30",
    applicationId: "APP-2026-0038",
  },
  {
    id: "act-4",
    type: "SUBMISSION",
    title: "New Application Received",
    description: "Mane Paper Mills (Chandrapur) submitted application for Factory Building Plan + MPCB Consent",
    department: "MIDC",
    timestamp: "2026-09-18T08:00:00+05:30",
    applicationId: "APP-2026-0080",
  },
  {
    id: "act-5",
    type: "APPROVAL",
    title: "Green Channel Auto-Approval",
    description: "TechNova IT Services (White category, IT/ITES) was auto-approved via Green Channel in 2 days",
    department: "Labour Department",
    timestamp: "2026-09-12T09:00:00+05:30",
    applicationId: "APP-2026-0055",
  },
  {
    id: "act-6",
    type: "DELAY_ALERT",
    title: "MPCB Backlog Alert",
    description: "Dr. Meena Kulkarni (MPCB) has 18 pending reviews. Avg review time is 12.8 days — department SLA compliance at 84.6%",
    department: "MPCB",
    timestamp: "2026-09-26T07:00:00+05:30",
    applicationId: "APP-2026-0042",
  },
  {
    id: "act-7",
    type: "REJECTION",
    title: "Boiler Certificate Rejected",
    description: "Shri Kiran Bhosle (Boiler Inspectorate) rejected boiler certificate for an application due to outdated safety specs",
    department: "Boiler Inspectorate",
    timestamp: "2026-09-15T11:00:00+05:30",
    applicationId: "APP-2026-0060",
  },
  {
    id: "act-8",
    type: "APPROVAL",
    title: "Fire NOC Cleared",
    description: "Shri Rajesh Patil (Fire Services) approved Fire NOC for Mehta Pharma Solutions",
    department: "Fire Services Department",
    timestamp: "2026-09-10T10:00:00+05:30",
    applicationId: "APP-2026-0051",
  },
];

// ─── Helpers used by admin pages ────────────────────────────────────────────

export function getAdminKPIs(): AdminKPIs {
  return ADMIN_KPIS;
}

export function getDepartmentStats(): DepartmentStats[] {
  return DEPARTMENT_STATS;
}

export function getAdminApplications(): AdminApplication[] {
  return ADMIN_APPLICATIONS;
}

export function getOfficerActivities(): OfficerActivity[] {
  return OFFICER_ACTIVITIES;
}

export function getDelayedApplications(): DelayedApplication[] {
  return DELAYED_APPLICATIONS;
}

export function getRecentActivity(): RecentActivityItem[] {
  return RECENT_ACTIVITY;
}

// Department-level monthly trend data for charts
export const DEPT_MONTHLY_TRENDS = [
  { month: "Apr", MIDC: 38, MPCB: 32, Fire: 25, DISH: 22, Other: 18 },
  { month: "May", MIDC: 42, MPCB: 35, Fire: 28, DISH: 24, Other: 20 },
  { month: "Jun", MIDC: 45, MPCB: 38, Fire: 30, DISH: 26, Other: 22 },
  { month: "Jul", MIDC: 50, MPCB: 40, Fire: 32, DISH: 28, Other: 24 },
  { month: "Aug", MIDC: 55, MPCB: 42, Fire: 35, DISH: 30, Other: 26 },
  { month: "Sep", MIDC: 48, MPCB: 44, Fire: 33, DISH: 28, Other: 25 },
];

export const SLA_COMPLIANCE_TRENDS = [
  { month: "Apr", compliance: 88.2, target: 95 },
  { month: "May", compliance: 89.5, target: 95 },
  { month: "Jun", compliance: 90.8, target: 95 },
  { month: "Jul", compliance: 91.2, target: 95 },
  { month: "Aug", compliance: 92.0, target: 95 },
  { month: "Sep", compliance: 92.4, target: 95 },
];
