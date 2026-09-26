const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const userEmail = "admin@acme.com";
  const resolvedName = "Rahul Sharma";
  let dbUser = await prisma.user.upsert({
    where: { email: userEmail },
    update: { name: resolvedName },
    create: {
      name: resolvedName,
      email: userEmail,
      companyName: "Acme Steel Industries",
      panNumber: "DEFAULT_PAN",
      role: "APPLICANT",
    }
  });

  console.log("DB User ID:", dbUser.id);
  
  const seedApps = [
    {
      id: `APP-SEED-${dbUser.id}-1`,
      status: "IN_REVIEW",
      riskScore: 25,
      submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      approvals: [
        { department: "MIDC", approvalName: "Consent to Establish", status: "PENDING" },
        { department: "MPCB", approvalName: "Consent to Operate (Water)", status: "PENDING" }
      ]
    },
    {
      id: `APP-SEED-${dbUser.id}-2`,
      status: "IN_REVIEW",
      riskScore: 65,
      submittedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      approvals: [
        { department: "MIDC", approvalName: "Factory Building Plan Approval", status: "APPROVED" },
        { department: "Fire Services Department", approvalName: "Provisional Fire NOC", status: "PENDING" }
      ]
    },
    {
      id: `APP-SEED-${dbUser.id}-3`,
      status: "SUBMITTED",
      riskScore: 20,
      submittedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      approvals: [
        { department: "MIDC", approvalName: "Land Allotment Verification", status: "PENDING" }
      ]
    }
  ];

  for (const app of seedApps) {
    const existingApp = await prisma.application.findUnique({ where: { id: app.id } });
    if (!existingApp) {
      await prisma.application.create({
        data: {
          id: app.id,
          applicantId: dbUser.id,
          status: app.status,
          riskScore: app.riskScore,
          submittedAt: app.submittedAt,
          approvals: {
            create: app.approvals
          }
        }
      });
      console.log("Created app", app.id);
    } else {
      console.log("App already exists", app.id);
    }
  }
  
  const existingApps = await prisma.application.findMany({
    where: { applicantId: dbUser.id }
  });
  console.log("Total apps for user:", existingApps.length);
}
main().catch(console.error).finally(() => prisma.$disconnect());
